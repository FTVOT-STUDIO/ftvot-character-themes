// extension.js 동작 테스트. 진짜 VS Code 없이 vscode 모듈을 가짜로 끼워서 설정 쓰기 흐름만 검증한다.
// 실행: node test/extension.test.js
'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const Module = require('module');

// SETUP_FILE이 require 시점에 홈 경로로 고정되므로 HOME을 먼저 바꾼다
const HOME = fs.mkdtempSync(path.join(os.tmpdir(), 'pore-home-'));
process.env.HOME = HOME;
process.env.USERPROFILE = HOME;

// ---- 가짜 vscode ----
function makeVscode() {
	const store = {}; // 'section.key' -> value
	const listeners = [];
	const messages = [];
	const executed = [];
	const installed = new Set();
	let dialogResult = undefined;
	let infoAnswer = undefined;

	const getConfiguration = (section) => ({
		get(key, def) {
			const full = `${section}.${key}`;
			if (full in store) return store[full];
			// 'background' 섹션 전체를 객체로 읽는 경우(fullscreen 등)
			return def;
		},
		async update(key, value) {
			const full = `${section}.${key}`;
			store[full] = value;
			const e = { affectsConfiguration: (s) => full === s || full.startsWith(s + '.') };
			for (const l of listeners) l(e);
		},
	});

	return {
		store, messages, executed, installed,
		setDialog: (v) => (dialogResult = v),
		setInfoAnswer: (v) => (infoAnswer = v),
		api: {
			ConfigurationTarget: { Global: 1 },
			workspace: {
				getConfiguration,
				onDidChangeConfiguration: (fn) => { listeners.push(fn); return { dispose() {} }; },
			},
			window: {
				showWarningMessage: (m) => messages.push(['warn', m]),
				showErrorMessage: (m) => messages.push(['error', m]),
				showInformationMessage: async (m) => { messages.push(['info', m]); return infoAnswer; },
				showOpenDialog: async () => dialogResult,
			},
			extensions: { getExtension: (id) => (installed.has(id) ? { id } : undefined) },
			commands: {
				registerCommand: (id, fn) => ({ id, fn, dispose() {} }),
				executeCommand: async (id, arg) => { executed.push([id, arg]); if (id === 'workbench.extensions.installExtension') installed.add(arg); },
			},
		},
	};
}

function loadExtension(fake) {
	const origResolve = Module._resolveFilename;
	Module._resolveFilename = function (req, ...rest) {
		if (req === 'vscode') return 'vscode';
		return origResolve.call(this, req, ...rest);
	};
	require.cache.vscode = { id: 'vscode', filename: 'vscode', loaded: true, exports: fake.api };
	const p = require.resolve('../extension.js');
	delete require.cache[p];
	const ext = require(p);
	Module._resolveFilename = origResolve;
	return ext;
}

function makeContext() {
	const state = {};
	return {
		subscriptions: [],
		globalState: { get: (k, d) => (k in state ? state[k] : d), update: async (k, v) => { state[k] = v; } },
		state,
	};
}

const tick = () => new Promise((r) => setImmediate(r));

(async () => {
	const img = path.join(HOME, 'snow.png');
	const img2 = path.join(HOME, 'malkuth.png');
	fs.writeFileSync(img, 'x');
	fs.writeFileSync(img2, 'x');

	// 1) setup.json 적용: 테마, 배경 맵, 투명도가 Configuration API로 들어가고 파일은 삭제
	{
		const fake = makeVscode();
		fake.installed.add('shalldie.background');
		const ext = loadExtension(fake);
		fs.mkdirSync(path.dirname(ext._internal.SETUP_FILE), { recursive: true });
		fs.writeFileSync(ext._internal.SETUP_FILE, '﻿' + JSON.stringify({ theme: 'Pore Snow Dark', opacity: 0.1, backgrounds: { 'Pore Snow Dark': img, 'Malkuth Dark': img2 } }));
		const ctx = makeContext();
		await ext.activate(ctx);
		await tick();
		assert.strictEqual(fake.store['workbench.colorTheme'], 'Pore Snow Dark');
		assert.deepStrictEqual(Object.keys(fake.store['poreTheme.backgrounds']), ['Pore Snow Dark', 'Malkuth Dark']);
		assert.strictEqual(fake.store['background.enabled'], true);
		assert.strictEqual(fake.store['background.fullscreen'].opacity, 0.1);
		assert.ok(fake.store['background.fullscreen'].images[0].startsWith('file:///'));
		assert.ok(fake.store['background.fullscreen'].images[0].endsWith('/snow.png'));
		assert.ok(!fs.existsSync(ext._internal.SETUP_FILE), 'setup.json은 적용 후 삭제돼야 함');
		console.log('ok 1 setup.json 적용');

		// 2) 다른 Pore 테마로 바꾸면 그 테마 이미지로 교체
		await fake.api.workspace.getConfiguration('workbench').update('colorTheme', 'Malkuth Dark');
		await tick(); await tick();
		assert.ok(fake.store['background.fullscreen'].images[0].endsWith('/malkuth.png'));
		assert.strictEqual(fake.store['background.enabled'], true);
		console.log('ok 2 테마 전환 시 이미지 교체');

		// 3) 배경 없는 테마로 바꾸면 꺼짐
		await fake.api.workspace.getConfiguration('workbench').update('colorTheme', 'Default Dark Modern');
		await tick(); await tick();
		assert.strictEqual(fake.store['background.enabled'], false);
		assert.strictEqual(ctx.state[ext._internal.MANAGED_KEY], false);
		console.log('ok 3 다른 테마에서는 배경 꺼짐');

		// 4) 다시 Snow로 오면 켜짐
		await fake.api.workspace.getConfiguration('workbench').update('colorTheme', 'Pore Snow Dark');
		await tick(); await tick();
		assert.strictEqual(fake.store['background.enabled'], true);
		assert.ok(fake.store['background.fullscreen'].images[0].endsWith('/snow.png'));
		console.log('ok 4 복귀 시 다시 켜짐');

		// 5) 같은 상태면 다시 쓰지 않음 (background 확장 재시작 팝업 방지)
		let writes = 0;
		const origUpdate = fake.api.workspace.getConfiguration;
		fake.api.workspace.getConfiguration = (s) => { const c = origUpdate(s); const u = c.update; c.update = async (...a) => { if (s === 'background') writes++; return u.apply(c, a); }; return c; };
		const r = await ext._internal.syncBackground(ctx);
		assert.strictEqual(r, 'unchanged');
		assert.strictEqual(writes, 0);
		fake.api.workspace.getConfiguration = origUpdate;
		console.log('ok 5 변화 없으면 쓰기 생략');
	}

	// 6) 사용자가 원래 쓰던 background 설정은 Pore가 켠 게 아니면 건드리지 않음
	{
		const fake = makeVscode();
		fake.installed.add('shalldie.background');
		fake.store['background.enabled'] = true;
		fake.store['workbench.colorTheme'] = 'One Dark Pro';
		const ext = loadExtension(fake);
		const ctx = makeContext();
		await ext.activate(ctx);
		assert.strictEqual(fake.store['background.enabled'], true);
		console.log('ok 6 남의 배경 설정은 유지');
	}

	// 7) 배경 확장이 없으면 설치 제안, '설치' 선택 시 설치 명령 실행
	{
		const fake = makeVscode();
		const ext = loadExtension(fake);
		fs.writeFileSync(ext._internal.SETUP_FILE, JSON.stringify({ theme: 'Pore Snow Dark', backgrounds: { 'Pore Snow Dark': img } }));
		fake.setInfoAnswer('설치');
		await ext.activate(makeContext());
		assert.deepStrictEqual(fake.executed[0], ['workbench.extensions.installExtension', 'shalldie.background']);
		assert.strictEqual(fake.store['background.enabled'], true);
		console.log('ok 7 배경 확장 자동 설치 제안');
	}

	// 8) 이미지 파일이 없으면 경고만 띄우고 켜지 않음
	{
		const fake = makeVscode();
		fake.installed.add('shalldie.background');
		fake.store['workbench.colorTheme'] = 'Pore Snow Dark';
		fake.store['poreTheme.backgrounds'] = { 'Pore Snow Dark': path.join(HOME, 'missing.png') };
		const ext = loadExtension(fake);
		await ext.activate(makeContext());
		assert.notStrictEqual(fake.store['background.enabled'], true);
		assert.ok(fake.messages.some(([t]) => t === 'warn'));
		console.log('ok 8 없는 이미지는 경고');
	}

	// 9) 명령: 파일 선택 → 현재 테마에 매핑
	{
		const fake = makeVscode();
		fake.installed.add('shalldie.background');
		fake.store['workbench.colorTheme'] = 'Malkuth Light';
		const ext = loadExtension(fake);
		const ctx = makeContext();
		await ext.activate(ctx);
		fake.setDialog([{ fsPath: img2 }]);
		const cmd = ctx.subscriptions.find((s) => s.id === 'poreTheme.setBackground');
		await cmd.fn();
		await tick();
		assert.strictEqual(fake.store['poreTheme.backgrounds']['Malkuth Light'], img2);
		assert.strictEqual(fake.store['background.enabled'], true);
		console.log('ok 9 배경 지정 명령');
	}

	// 10) Windows 경로 → file URI
	{
		const fake = makeVscode();
		const ext = loadExtension(fake);
		const uri = ext._internal.toFileUri('/home/x/a b.png');
		assert.strictEqual(uri, 'file:///home/x/a b.png');
		console.log('ok 10 file URI 변환');
	}

	fs.rmSync(HOME, { recursive: true, force: true });
	console.log('\nall passed');
})().catch((e) => { console.error(e); process.exit(1); });
