// extension.js 동작 테스트. 진짜 VS Code 대신 가짜 vscode 모듈과 임시 workbench.html 로 검증한다.
// 실행: node test/extension.test.js
'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const Module = require('module');

// ~/.pore-theme 경로가 require 시점에 고정되므로 HOME을 먼저 바꾼다
const HOME = fs.mkdtempSync(path.join(os.tmpdir(), 'pore-home-'));
process.env.HOME = HOME;
process.env.USERPROFILE = HOME;

const APP_ROOT = path.join(HOME, 'vscode-app');
const HTML = path.join(APP_ROOT, 'out/vs/code/electron-browser/workbench/workbench.html');
const ORIGINAL_HTML = '<!DOCTYPE html>\n<html>\n<head><meta http-equiv="Content-Security-Policy" content="style-src \'self\' \'unsafe-inline\';"></head>\n<body></body>\n</html>\n';

const PORE_EXT = {
	id: 'ftvot-studio.pore-theme',
	packageJSON: { contributes: { themes: [
		{ label: 'Pore Snow Dark', path: './themes/pore-snow-dark-color-theme.json' },
		{ label: 'Malkuth Dark', path: './themes/malkuth-dark-color-theme.json' },
		{ label: 'Pore Dark', path: './themes/pore-dark-color-theme.json' },
	] } },
};
const BUILTIN = { id: 'vscode.theme-defaults', packageJSON: { contributes: { themes: [{ id: 'Default Dark Modern', label: 'Dark Modern', path: './themes/dark_modern.json' }] } } };

function makeVscode() {
	const store = {};
	const listeners = [];
	const saveListeners = [];
	const textDocuments = [];
	const messages = [];
	const executed = [];
	let infoAnswer;
	let dialogResult;
	const getConfiguration = (section) => ({
		get(key, def) { const k = `${section}.${key}`; return k in store ? store[k] : def; },
		async update(key, value) {
			const full = `${section}.${key}`;
			store[full] = value;
			const e = { affectsConfiguration: (s) => full === s || full.startsWith(s + '.') };
			for (const l of listeners) l(e);
		},
	});
	return {
		store, messages, executed, textDocuments,
		setInfoAnswer: (v) => (infoAnswer = v),
		setDialog: (v) => (dialogResult = v),
		save: () => { for (const d of textDocuments) d.isDirty = false; for (const l of saveListeners) l(); },
		api: {
			ConfigurationTarget: { Global: 1 },
			env: { appRoot: APP_ROOT },
			workspace: {
				getConfiguration,
				textDocuments,
				onDidChangeConfiguration: (fn) => { listeners.push(fn); return { dispose() {} }; },
				onDidSaveTextDocument: (fn) => { saveListeners.push(fn); return { dispose() {} }; },
			},
			window: {
				showWarningMessage: (m) => messages.push(['warn', m]),
				showErrorMessage: (m) => messages.push(['error', m]),
				showInformationMessage: async (m) => { messages.push(['info', m]); return infoAnswer; },
				showOpenDialog: async () => dialogResult,
				setStatusBarMessage: (m) => messages.push(['status', m]),
			},
			extensions: { all: [PORE_EXT, BUILTIN] },
			commands: {
				registerCommand: (id, fn) => ({ id, fn, dispose() {} }),
				executeCommand: async (id) => { executed.push(id); },
			},
		},
	};
}

function loadExtension(fake) {
	const orig = Module._resolveFilename;
	Module._resolveFilename = function (req, ...rest) { return req === 'vscode' ? 'vscode' : orig.call(this, req, ...rest); };
	require.cache.vscode = { id: 'vscode', filename: 'vscode', loaded: true, exports: fake.api };
	const p = require.resolve('../extension.js');
	delete require.cache[p];
	const ext = require(p);
	Module._resolveFilename = orig;
	return ext;
}

function makeContext(extensionPath = path.join(HOME, 'ext')) {
	const state = {};
	return { subscriptions: [], extensionPath, globalState: { get: (k, d) => (k in state ? state[k] : d), update: async (k, v) => { state[k] = v; } }, state };
}

function resetHtml() {
	fs.mkdirSync(path.dirname(HTML), { recursive: true });
	fs.writeFileSync(HTML, ORIGINAL_HTML);
}

const settle = async () => { for (let i = 0; i < 8; i++) await new Promise((r) => setImmediate(r)); };
const count = (s, needle) => s.split(needle).length - 1;

(async () => {
	const snow = path.join(HOME, 'snow.png');
	const malkuth = path.join(HOME, 'malkuth (1).png');
	fs.writeFileSync(snow, 'x');
	fs.writeFileSync(malkuth, 'x');

	// 1) 테마 → CSS 클래스 규칙 (VS Code colorThemeData.toCSSSelector 와 동일)
	{
		const ext = loadExtension(makeVscode());
		const { themeCssClass } = ext._internal;
		assert.strictEqual(themeCssClass('ftvot-studio.pore-theme', './themes/pore-snow-dark-color-theme.json'), 'ftvot-studio-pore-theme-themes-pore-snow-dark-color-theme-json');
		assert.strictEqual(themeCssClass('vscode.theme-defaults', './themes/dark_modern.json'), 'vscode-theme-defaults-themes-dark_modern-json');
		console.log('ok 1 테마 CSS 클래스');
	}

	// 2) setup.json → 설정 적용 → HTML 패치 1회 → 리로드 안내 1회
	{
		resetHtml();
		const fake = makeVscode();
		const ext = loadExtension(fake);
		fs.mkdirSync(path.dirname(ext._internal.SETUP_FILE), { recursive: true });
		fs.writeFileSync(ext._internal.SETUP_FILE, '\uFEFF' + JSON.stringify({ theme: 'Pore Snow Dark', opacity: 0.1, backgrounds: { 'Pore Snow Dark': snow, 'Malkuth Dark': malkuth } }));
		await ext.activate(makeContext());
		await settle();
		assert.strictEqual(fake.store['workbench.colorTheme'], 'Pore Snow Dark');
		const html = fs.readFileSync(HTML, 'utf8');
		assert.ok(html.includes(ext._internal.MARK_START));
		assert.ok(html.includes('.monaco-workbench.ftvot-studio-pore-theme-themes-pore-snow-dark-color-theme-json)::before'));
		assert.ok(html.includes('.monaco-workbench.ftvot-studio-pore-theme-themes-malkuth-dark-color-theme-json)::before'));
		assert.ok(html.includes('vscode-file://vscode-app/'));
		assert.ok(html.includes('malkuth%20%281%29.png'), '공백/괄호 인코딩');
		assert.ok(html.includes('opacity:0.1'));
		assert.strictEqual(count(html, 'pore-theme-bg-start'), 1, '패치는 한 번만');
		assert.strictEqual(fake.messages.filter(([t, m]) => t === 'info' && m.includes('다시 로드')).length, 1, '리로드 안내 1회');
		assert.ok(!fs.existsSync(ext._internal.SETUP_FILE));
		assert.ok(fs.existsSync(ext._internal.PATCH_RECORD));
		console.log('ok 2 설치 직후 1회 패치');

		// 3) 테마 전환은 설정/HTML 아무것도 안 건드림 (= 리로드 없음)
		const before = fs.readFileSync(HTML, 'utf8');
		const msgCount = fake.messages.length;
		await fake.api.workspace.getConfiguration('workbench').update('colorTheme', 'Malkuth Dark');
		await fake.api.workspace.getConfiguration('workbench').update('colorTheme', 'Pore Dark');
		await settle();
		assert.strictEqual(fs.readFileSync(HTML, 'utf8'), before);
		assert.strictEqual(fake.messages.length, msgCount);
		console.log('ok 3 테마 전환 시 리로드 없음');

		// 4) 같은 설정 재적용 → 변화 없음
		assert.strictEqual(await ext._internal.applyBackgrounds(), 'unchanged');
		console.log('ok 4 동일 설정이면 재패치 안 함');

		// 5) 배경 매핑 변경 → 재패치
		await fake.api.workspace.getConfiguration('poreTheme').update('backgrounds', { 'Pore Snow Dark': snow });
		await settle();
		const after = fs.readFileSync(HTML, 'utf8');
		assert.ok(!after.includes('malkuth-dark-color-theme-json'));
		assert.strictEqual(count(after, 'pore-theme-bg-start'), 1);
		console.log('ok 5 매핑 변경 시 재패치');

		// 6) 매핑 비우면 패치 완전 제거 → 원본 HTML 복원
		await fake.api.workspace.getConfiguration('poreTheme').update('backgrounds', {});
		await settle();
		assert.strictEqual(fs.readFileSync(HTML, 'utf8'), ORIGINAL_HTML);
		console.log('ok 6 매핑 비우면 원본 복원');
	}

	// 7) VS Code 업데이트로 HTML이 새로 깔리면 시작 시 다시 패치
	{
		resetHtml();
		const fake = makeVscode();
		fake.store['poreTheme.backgrounds'] = { 'Pore Snow Dark': snow };
		const ext = loadExtension(fake);
		await ext.activate(makeContext());
		await settle();
		assert.ok(fs.readFileSync(HTML, 'utf8').includes('pore-snow-dark-color-theme-json'));
		console.log('ok 7 업데이트 후 자동 재패치');
	}

	// 8) 내장 테마도 라벨/ID로 지정 가능, 없는 테마·없는 파일은 경고
	{
		resetHtml();
		const fake = makeVscode();
		fake.store['poreTheme.backgrounds'] = { 'Default Dark Modern': snow, 'Nope Theme': snow, 'Pore Dark': path.join(HOME, 'missing.png') };
		const ext = loadExtension(fake);
		await ext.activate(makeContext());
		await settle();
		assert.ok(fs.readFileSync(HTML, 'utf8').includes('vscode-theme-defaults-themes-dark_modern-json'));
		const warns = fake.messages.filter(([t]) => t === 'warn').map(([, m]) => m).join('|');
		assert.ok(warns.includes('Nope Theme'));
		assert.ok(warns.includes('Pore Dark'));
		console.log('ok 8 내장 테마 지원, 잘못된 항목 경고');
	}

	// 9) settings.json 이 dirty 면 setup 보류, 저장하면 적용
	{
		resetHtml();
		const fake = makeVscode();
		fake.textDocuments.push({ isDirty: true, uri: { fsPath: 'C:\\Users\\me\\AppData\\Roaming\\Code\\User\\settings.json' } });
		const ext = loadExtension(fake);
		fs.writeFileSync(ext._internal.SETUP_FILE, JSON.stringify({ theme: 'Malkuth Dark', backgrounds: { 'Malkuth Dark': malkuth } }));
		await ext.activate(makeContext());
		await settle();
		assert.strictEqual(fake.store['workbench.colorTheme'], undefined);
		assert.ok(fs.existsSync(ext._internal.SETUP_FILE));
		assert.strictEqual(fake.messages.filter(([t]) => t === 'error').length, 0);
		fake.save();
		await settle();
		assert.strictEqual(fake.store['workbench.colorTheme'], 'Malkuth Dark');
		assert.ok(fs.readFileSync(HTML, 'utf8').includes('malkuth-dark-color-theme-json'));
		console.log('ok 9 dirty settings.json 보류 후 저장 시 적용');
	}

	// 10) v2.1 마이그레이션: 우리가 켰던 shalldie background 는 끈다, 남이 켠 건 유지
	{
		resetHtml();
		const fake = makeVscode();
		fake.store['background.enabled'] = true;
		const ext = loadExtension(fake);
		const ctx = makeContext();
		ctx.state['poreTheme.backgroundManaged'] = true;
		await ext.activate(ctx);
		assert.strictEqual(fake.store['background.enabled'], false);

		const fake2 = makeVscode();
		fake2.store['background.enabled'] = true;
		const ext2 = loadExtension(fake2);
		await ext2.activate(makeContext());
		assert.strictEqual(fake2.store['background.enabled'], true);
		console.log('ok 10 shalldie 마이그레이션');
	}

	// 11) 동봉 이미지(media/backgrounds.json)가 있으면 첫 실행에 자동 지정, ~/.pore-theme 로 복사
	{
		resetHtml();
		const extPath = path.join(HOME, 'ext-bundled');
		fs.mkdirSync(path.join(extPath, 'media'), { recursive: true });
		fs.writeFileSync(path.join(extPath, 'media', 'snow.jpg'), 'img');
		fs.writeFileSync(path.join(extPath, 'media', 'backgrounds.json'), JSON.stringify({ 'Pore Snow Dark': 'snow.jpg' }));
		const fake = makeVscode();
		const ext = loadExtension(fake);
		const ctx = makeContext(extPath);
		await ext.activate(ctx);
		await settle();
		const map = fake.store['poreTheme.backgrounds'];
		assert.ok(map['Pore Snow Dark'].endsWith('/.pore-theme/snow.jpg'));
		assert.ok(fs.existsSync(path.join(HOME, '.pore-theme', 'snow.jpg')));
		assert.ok(fs.readFileSync(HTML, 'utf8').includes('pore-snow-dark-color-theme-json'));
		// 사용자가 지운 뒤에는 다시 채우지 않음
		await fake.api.workspace.getConfiguration('poreTheme').update('backgrounds', {});
		await ext.activate(ctx);
		await settle();
		assert.deepStrictEqual(fake.store['poreTheme.backgrounds'], {});
		console.log('ok 11 동봉 기본 배경');
	}

	// 12) 명령: 이미지 선택 → ~/.pore-theme 로 복사 후 현재 테마에 매핑
	{
		resetHtml();
		const fake = makeVscode();
		fake.store['workbench.colorTheme'] = 'Malkuth Dark';
		const ext = loadExtension(fake);
		const ctx = makeContext();
		await ext.activate(ctx);
		fake.setDialog([{ fsPath: malkuth }]);
		await ctx.subscriptions.find((s) => s.id === 'poreTheme.setBackground').fn();
		await settle();
		const p = fake.store['poreTheme.backgrounds']['Malkuth Dark'];
		assert.ok(p.endsWith('/.pore-theme/malkuth-dark.png'));
		assert.ok(fs.existsSync(p));
		console.log('ok 12 배경 지정 명령 (복사본 사용)');
	}

	// 13) uninstall.js 가 패치 블록만 정확히 제거
	{
		resetHtml();
		const fake = makeVscode();
		fake.store['poreTheme.backgrounds'] = { 'Pore Snow Dark': snow };
		const ext = loadExtension(fake);
		await ext.activate(makeContext());
		await settle();
		assert.ok(fs.readFileSync(HTML, 'utf8').includes('pore-theme-bg-start'));
		delete require.cache[require.resolve('../uninstall.js')];
		require('../uninstall.js');
		assert.strictEqual(fs.readFileSync(HTML, 'utf8'), ORIGINAL_HTML);
		console.log('ok 13 제거 훅이 원본 복원');
	}

	fs.rmSync(HOME, { recursive: true, force: true });
	console.log('\nall passed');
})().catch((e) => { console.error(e); process.exit(1); });
