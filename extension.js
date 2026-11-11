// Pore Theme 런타임: 테마별 배경 이미지 (리로드 없이 즉시 전환)
//
// 컬러 테마 JSON은 이미지를 못 넣는다. 그래서 VS Code 워크벤치 HTML에 <style> 하나를 한 번만 주입하고,
// "현재 테마 클래스 → 배경 이미지" 규칙을 CSS로 전부 넣어 둔다.
// VS Code는 테마가 바뀌면 .monaco-workbench 의 클래스를 바꾸므로 CSS :has() 가 즉시 반응한다.
// → 테마 전환 시 설정 쓰기 0회, 리로드 0회. 이미지 목록이 바뀔 때만 한 번 리로드.
//
// 주입 방식은 shalldie/vscode-background (MIT) 의 HTML 패치 방식을 참고했다.
'use strict';

const vscode = require('vscode');
const fs = require('fs');
const os = require('os');
const path = require('path');

const SECTION = 'poreTheme';
const PORE_DIR = path.join(os.homedir(), '.pore-theme');
// 설치 스크립트가 남기는 1회용 설정 파일
const SETUP_FILE = path.join(PORE_DIR, 'setup.json');
// 패치한 HTML 경로 기록. 확장 제거 시 uninstall.js 가 이걸 보고 원상복구한다
const PATCH_RECORD = path.join(PORE_DIR, 'patched.json');
const MARK_START = '<!-- pore-theme-bg-start -->';
const MARK_END = '<!-- pore-theme-bg-end -->';
const DEFAULT_OPACITY = 0.08;
// v2.1.x 에서 shalldie.background 를 켰는지 기록하던 키. 마이그레이션에만 사용
const LEGACY_MANAGED_KEY = 'poreTheme.backgroundManaged';

// ---------------------------------------------------------------- 경로/URL

function expandHome(p) {
	return p.startsWith('~') ? path.join(os.homedir(), p.slice(1)) : p;
}

function fileExists(p) {
	try {
		return fs.statSync(expandHome(p)).isFile();
	} catch {
		return false;
	}
}

/**
 * 로컬 경로 → 워크벤치에서 읽을 수 있는 URL.
 * 워크벤치 페이지 origin 이 vscode-file://vscode-app 이라 같은 스킴이어야 CSP('self')를 통과한다.
 */
function toWorkbenchUrl(p) {
	const full = path.resolve(expandHome(p)).replace(/\\/g, '/');
	const withSlash = full.startsWith('/') ? full : '/' + full;
	return 'vscode-file://vscode-app' + encodeURI(withSlash).replace(/'/g, '%27').replace(/\(/g, '%28').replace(/\)/g, '%29');
}

function workbenchHtmlPath() {
	const root = vscode.env.appRoot;
	const candidates = [
		path.join(root, 'out/vs/code/electron-browser/workbench/workbench.html'),
		path.join(root, 'out/vs/code/electron-sandbox/workbench/workbench.html'),
	];
	return candidates.find((c) => fs.existsSync(c)) || candidates[0];
}

// ---------------------------------------------------------------- 테마 → CSS 클래스

/**
 * VS Code가 테마를 적용할 때 .monaco-workbench 에 붙이는 클래스 이름.
 * colorThemeData.ts 의 toCSSSelector(extensionId, path) 와 같은 규칙.
 */
function themeCssClass(extensionId, themePath) {
	let p = themePath.startsWith('./') ? themePath.slice(2) : themePath;
	let str = `${extensionId}-${p}`.replace(/[^_a-zA-Z0-9-]/g, '-');
	if (/^[0-9-]/.test(str)) str = '_' + str;
	return str;
}

/** 테마 라벨(또는 id) → CSS 클래스. 설치된 모든 확장(내장 테마 포함)에서 찾는다 */
function findThemeClass(label) {
	for (const ext of vscode.extensions.all) {
		const themes = (ext.packageJSON && ext.packageJSON.contributes && ext.packageJSON.contributes.themes) || [];
		for (const t of themes) {
			if (t.label === label || t.id === label) return themeCssClass(ext.id, t.path);
		}
	}
	return null;
}

// ---------------------------------------------------------------- 패치 생성/적용

function backgroundsMap() {
	const map = vscode.workspace.getConfiguration(SECTION).get('backgrounds', {});
	return map && typeof map === 'object' ? map : {};
}

function cssString(s) {
	return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

/**
 * 주입할 <style> 내용. 이미지가 하나도 없으면 빈 문자열 → 패치 제거.
 * 반환값의 missing 은 경로에 파일이 없는 테마, unknown 은 설치 안 된 테마 라벨.
 */
function buildPatch() {
	const cfg = vscode.workspace.getConfiguration(SECTION);
	if (!cfg.get('background.enabled', true)) return { css: '', missing: [], unknown: [] };
	let opacity = Number(cfg.get('background.opacity', DEFAULT_OPACITY));
	if (!(opacity >= 0 && opacity <= 0.6)) opacity = DEFAULT_OPACITY;

	const rules = [];
	const missing = [];
	const unknown = [];
	// 라벨 정렬: 같은 설정이면 같은 CSS → 불필요한 재패치 방지
	for (const label of Object.keys(backgroundsMap()).sort()) {
		const img = backgroundsMap()[label];
		if (!img) continue;
		if (!fileExists(img)) { missing.push(label); continue; }
		const cls = findThemeClass(label);
		if (!cls) { unknown.push(label); continue; }
		rules.push(`body:has(> .monaco-workbench.${cls})::before{background-image:url("${cssString(toWorkbenchUrl(img))}")}`);
	}
	if (!rules.length) return { css: '', missing, unknown };

	const css = [
		// shalldie.background 의 body::after 와 겹치지 않도록 ::before 사용
		`body::before{content:'';position:absolute;inset:0;z-index:1000;pointer-events:none;background-size:cover;background-repeat:no-repeat;background-position:center;opacity:${opacity};transition:background-image .35s ease}`,
		// 다크 테마에서는 screen 합성이 덜 탁하게 보인다
		`body:has(> .monaco-workbench.vs-dark)::before{mix-blend-mode:screen}`,
		...rules,
		// HTML 수정으로 뜨는 "설치가 손상된 것 같습니다" 토스트 숨김 (영어/한국어)
		`.notification-toast-container:has([aria-label*='installation appears to be corrupt']),.notification-toast-container:has([aria-label*='설치가 손상된 것 같습니다']){display:none}`,
	].join('\n');
	return { css, missing, unknown };
}

function stripPatch(html) {
	const re = new RegExp(`${MARK_START}[\\s\\S]*?${MARK_END}\\n?`, 'g');
	return html.replace(re, '');
}

function injectPatch(html, css) {
	const clean = stripPatch(html);
	if (!css) return clean;
	return clean.replace('</html>', `${MARK_START}\n<style>\n${css}\n</style>\n${MARK_END}\n</html>`);
}

/** HTML에 패치 반영. 바뀌었으면 true (= 리로드 필요) */
function writePatch(css) {
	const file = workbenchHtmlPath();
	const html = fs.readFileSync(file, 'utf8');
	const next = injectPatch(html, css);
	if (next === html) return false;
	fs.writeFileSync(file, next, 'utf8');
	fs.mkdirSync(PORE_DIR, { recursive: true });
	fs.writeFileSync(PATCH_RECORD, JSON.stringify({ html: file }, null, 2));
	return true;
}

async function promptReload(message) {
	const pick = await vscode.window.showInformationMessage(message, '다시 로드');
	if (pick === '다시 로드') await vscode.commands.executeCommand('workbench.action.reloadWindow');
}

let applyChain = Promise.resolve();

/** 설정 → CSS → HTML. 이미지 목록이 실제로 바뀐 경우에만 리로드 안내. 호출은 직렬화된다 */
function applyBackgrounds(opts) {
	const run = applyChain.then(() => applyBackgroundsNow(opts));
	applyChain = run.catch(() => {});
	return run;
}

async function applyBackgroundsNow({ quiet = false } = {}) {
	const { css, missing, unknown } = buildPatch();
	if (missing.length && !quiet) {
		vscode.window.showWarningMessage(`Pore Theme: 배경 이미지를 찾을 수 없습니다 (${missing.join(', ')})`);
	}
	if (unknown.length && !quiet) {
		vscode.window.showWarningMessage(`Pore Theme: 설치되지 않은 테마입니다 (${unknown.join(', ')})`);
	}
	let changed;
	try {
		changed = writePatch(css);
	} catch (err) {
		vscode.window.showErrorMessage(`Pore Theme: VS Code 파일을 수정하지 못했습니다. 관리자 권한이 필요한 위치에 설치된 경우 사용자용 VS Code를 쓰거나 관리자 권한으로 한 번 실행해 주세요. (${err.message})`);
		return 'error';
	}
	if (changed) {
		await promptReload(css ? 'Pore Theme: 배경 이미지 목록이 바뀌었습니다. 한 번만 다시 로드하면 이후 테마 전환은 즉시 반영됩니다.' : 'Pore Theme: 배경을 제거했습니다. 다시 로드하면 적용됩니다.');
		return 'reload';
	}
	return 'unchanged';
}

// ---------------------------------------------------------------- settings.json 보호

/** 사용자 settings.json 이 편집기에서 저장 안 된 상태면 Configuration API 쓰기가 거부된다 */
function userSettingsDirty() {
	return vscode.workspace.textDocuments.some((d) => {
		if (!d.isDirty) return false;
		const f = d.uri.fsPath.replace(/\\/g, '/').toLowerCase();
		return f.endsWith('/user/settings.json') || /\/user\/profiles\/[^/]+\/settings\.json$/.test(f);
	});
}

let pendingSetup = false;
// 시작/설치 설정 중에는 여러 설정을 연달아 쓴다. 그때마다 재패치하면 리로드 안내가 여러 번 뜨므로 막아 두고 마지막에 한 번만 적용
let suspendConfigEvents = false;

// ---------------------------------------------------------------- 설치 직후 1회 설정

/** 설치 스크립트가 남긴 setup.json 적용: 시작 테마, 테마별 배경, 투명도 */
async function applySetupFile() {
	if (!fs.existsSync(SETUP_FILE)) return false;
	if (userSettingsDirty()) {
		pendingSetup = true;
		vscode.window.setStatusBarMessage('Pore Theme: settings.json을 저장하면 설정이 적용됩니다', 8000);
		return false;
	}
	let setup;
	try {
		setup = JSON.parse(fs.readFileSync(SETUP_FILE, 'utf8').replace(/^﻿/, ''));
	} catch (e) {
		vscode.window.showErrorMessage(`Pore Theme: 설치 설정 파일을 읽지 못했습니다. ${e.message}`);
		return false;
	}
	const cfg = vscode.workspace.getConfiguration(SECTION);
	const G = vscode.ConfigurationTarget.Global;
	if (setup.backgrounds && typeof setup.backgrounds === 'object' && Object.keys(setup.backgrounds).length) {
		await cfg.update('backgrounds', { ...backgroundsMap(), ...setup.backgrounds }, G);
	}
	if (typeof setup.opacity === 'number') await cfg.update('background.opacity', setup.opacity, G);
	if (typeof setup.theme === 'string' && setup.theme) {
		await vscode.workspace.getConfiguration('workbench').update('colorTheme', setup.theme, G);
	}
	try { fs.unlinkSync(SETUP_FILE); } catch { /* 다음 실행에 같은 값을 다시 쓸 뿐 */ }
	return true;
}

/** 확장에 동봉된 기본 배경(media/backgrounds.json)이 있으면, 사용자가 아직 아무것도 지정 안 했을 때 채워 넣는다 */
async function applyBundledDefaults(context) {
	const manifest = path.join(context.extensionPath, 'media', 'backgrounds.json');
	if (!fs.existsSync(manifest)) return false;
	if (Object.keys(backgroundsMap()).length) return false;
	if (context.globalState.get('poreTheme.bundledApplied', false)) return false;
	let list;
	try {
		list = JSON.parse(fs.readFileSync(manifest, 'utf8'));
	} catch {
		return false;
	}
	// 확장 폴더는 업데이트마다 경로(버전)가 바뀌므로 ~/.pore-theme 로 복사해 두고 그 경로를 쓴다
	fs.mkdirSync(PORE_DIR, { recursive: true });
	const map = {};
	for (const [label, file] of Object.entries(list)) {
		const src = path.join(context.extensionPath, 'media', file);
		if (!fs.existsSync(src)) continue;
		const dst = path.join(PORE_DIR, file);
		if (!fs.existsSync(dst)) fs.copyFileSync(src, dst);
		map[label] = dst.replace(/\\/g, '/');
	}
	if (!Object.keys(map).length) return false;
	await vscode.workspace.getConfiguration(SECTION).update('backgrounds', map, vscode.ConfigurationTarget.Global);
	await context.globalState.update('poreTheme.bundledApplied', true);
	return true;
}

/** v2.1.x 는 shalldie.background 의 설정을 켜고 껐다. 우리가 켠 것이면 꺼서 이중 배경을 막는다 */
async function migrateFromShalldie(context) {
	if (!context.globalState.get(LEGACY_MANAGED_KEY, false)) return;
	const bg = vscode.workspace.getConfiguration('background');
	if (bg.get('enabled') === true) await bg.update('enabled', false, vscode.ConfigurationTarget.Global);
	await context.globalState.update(LEGACY_MANAGED_KEY, false);
}

// ---------------------------------------------------------------- 명령

function currentThemeLabel() {
	return vscode.workspace.getConfiguration('workbench').get('colorTheme', '');
}

async function setBackgroundForCurrentTheme() {
	const theme = currentThemeLabel();
	const files = await vscode.window.showOpenDialog({
		canSelectMany: false,
		openLabel: `${theme} 배경으로 사용`,
		filters: { Images: ['png', 'jpg', 'jpeg', 'webp', 'gif'] },
	});
	if (!files || !files.length) return;
	// 원본을 지우거나 옮겨도 유지되도록 ~/.pore-theme 로 복사
	fs.mkdirSync(PORE_DIR, { recursive: true });
	const safe = theme.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'theme';
	const dst = path.join(PORE_DIR, `${safe}${path.extname(files[0].fsPath).toLowerCase()}`);
	fs.copyFileSync(files[0].fsPath, dst);
	const map = { ...backgroundsMap(), [theme]: dst.replace(/\\/g, '/') };
	await vscode.workspace.getConfiguration(SECTION).update('backgrounds', map, vscode.ConfigurationTarget.Global);
}

async function clearBackgroundForCurrentTheme() {
	const theme = currentThemeLabel();
	const map = { ...backgroundsMap() };
	if (!(theme in map)) {
		vscode.window.showInformationMessage(`Pore Theme: ${theme}에는 지정된 배경이 없습니다.`);
		return;
	}
	delete map[theme];
	await vscode.workspace.getConfiguration(SECTION).update('backgrounds', map, vscode.ConfigurationTarget.Global);
}

async function removePatch() {
	try {
		if (writePatch('')) await promptReload('Pore Theme: 배경 패치를 제거했습니다. 다시 로드하면 적용됩니다.');
		else vscode.window.showInformationMessage('Pore Theme: 제거할 배경 패치가 없습니다.');
	} catch (err) {
		vscode.window.showErrorMessage(`Pore Theme: ${err.message}`);
	}
}

// ---------------------------------------------------------------- 진입점

async function startup(context) {
	suspendConfigEvents = true;
	try {
		await migrateFromShalldie(context);
		await applySetupFile();
		await applyBundledDefaults(context);
	} finally {
		suspendConfigEvents = false;
	}
	// 시작 시 패치 확인: VS Code 업데이트로 HTML이 새로 깔렸으면 여기서 다시 넣는다
	await applyBackgrounds();
}

async function activate(context) {
	context.subscriptions.push(
		vscode.commands.registerCommand('poreTheme.setBackground', setBackgroundForCurrentTheme),
		vscode.commands.registerCommand('poreTheme.clearBackground', clearBackgroundForCurrentTheme),
		vscode.commands.registerCommand('poreTheme.removePatch', removePatch),
		// 테마 전환은 CSS가 처리하므로 여기서 아무것도 안 한다. 배경 매핑이 바뀔 때만 재패치
		vscode.workspace.onDidChangeConfiguration((e) => {
			if (suspendConfigEvents) return;
			if (e.affectsConfiguration(SECTION)) applyBackgrounds().catch((err) => console.error('[pore-theme]', err));
		}),
		vscode.workspace.onDidSaveTextDocument(() => {
			if (!pendingSetup || userSettingsDirty()) return;
			pendingSetup = false;
			(async () => {
				suspendConfigEvents = true;
				try { await applySetupFile(); } finally { suspendConfigEvents = false; }
				await applyBackgrounds();
			})().catch((err) => console.error('[pore-theme]', err));
		})
	);
	await startup(context);
}

function deactivate() {}

module.exports = {
	activate,
	deactivate,
	_internal: { themeCssClass, toWorkbenchUrl, buildPatch, injectPatch, stripPatch, applyBackgrounds, applySetupFile, userSettingsDirty, SETUP_FILE, PATCH_RECORD, MARK_START, MARK_END },
};
