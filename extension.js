// Pore Theme 런타임: 테마별 배경 이미지 자동 전환 + 설치 후 자동 설정
// 컬러 테마 자체는 JSON이라 이미지를 못 넣는다. 그래서 배경은 shalldie.background 확장에 위임하고,
// 이 파일은 "지금 테마가 뭐냐"에 따라 그 확장의 설정만 켜고 끈다.
// settings.json은 VS Code Configuration API로만 건드린다. 직접 파일을 쓰면 사용자 주석이 날아간다.
'use strict';

const vscode = require('vscode');
const fs = require('fs');
const os = require('os');
const path = require('path');

const BG_EXT_ID = 'shalldie.background';
const SECTION = 'poreTheme';
// 설치 스크립트가 남기는 1회용 설정 파일. 읽고 나면 지운다
const SETUP_FILE = path.join(os.homedir(), '.pore-theme', 'setup.json');
// 배경을 우리가 켰는지 기억해서, 사용자가 원래 쓰던 background 설정은 건드리지 않는다
const MANAGED_KEY = 'poreTheme.backgroundManaged';
const DEFAULT_OPACITY = 0.08;

/** 경로 → file:/// URI. Windows 역슬래시와 ~ 를 처리 */
function toFileUri(p) {
	let full = p.startsWith('~') ? path.join(os.homedir(), p.slice(1)) : p;
	full = path.resolve(full);
	return 'file:///' + full.replace(/\\/g, '/').replace(/^\/+/, '');
}

function fileExists(p) {
	try {
		const full = p.startsWith('~') ? path.join(os.homedir(), p.slice(1)) : p;
		return fs.statSync(full).isFile();
	} catch {
		return false;
	}
}

function currentThemeLabel() {
	return vscode.workspace.getConfiguration('workbench').get('colorTheme', '');
}

function backgroundsMap() {
	const map = vscode.workspace.getConfiguration(SECTION).get('backgrounds', {});
	return map && typeof map === 'object' ? map : {};
}

function bgExtensionInstalled() {
	return !!vscode.extensions.getExtension(BG_EXT_ID);
}

/**
 * 현재 테마에 맞춰 background 확장 설정을 맞춘다.
 * 값이 이미 같으면 아무것도 쓰지 않는다. background 확장은 설정이 바뀔 때마다 재시작을 요구하므로
 * 불필요한 쓰기는 곧 불필요한 재시작 팝업이다.
 */
async function syncBackground(context) {
	const cfg = vscode.workspace.getConfiguration(SECTION);
	if (!cfg.get('background.enabled', true)) return 'disabled';
	if (!bgExtensionInstalled()) return 'no-extension';

	const theme = currentThemeLabel();
	const image = backgroundsMap()[theme];
	const bg = vscode.workspace.getConfiguration('background');
	const managed = context.globalState.get(MANAGED_KEY, false);

	if (image && fileExists(image)) {
		const opacity = cfg.get('background.opacity', DEFAULT_OPACITY);
		const want = {
			images: [toFileUri(image)],
			opacity,
			size: 'cover',
			position: 'center',
			interval: 0,
			random: false,
		};
		const have = bg.get('fullscreen');
		const same = bg.get('enabled') === true && JSON.stringify(have) === JSON.stringify(want);
		if (!same) {
			await bg.update('fullscreen', want, vscode.ConfigurationTarget.Global);
			await bg.update('enabled', true, vscode.ConfigurationTarget.Global);
		}
		await context.globalState.update(MANAGED_KEY, true);
		return same ? 'unchanged' : 'on';
	}

	if (image && !fileExists(image)) {
		vscode.window.showWarningMessage(`Pore Theme: 배경 이미지를 찾을 수 없습니다. ${image}`);
	}
	// 이미지가 없는 테마로 바뀌었고, 배경을 켠 게 우리일 때만 끈다
	if (managed && bg.get('enabled') === true) {
		await bg.update('enabled', false, vscode.ConfigurationTarget.Global);
		await context.globalState.update(MANAGED_KEY, false);
		return 'off';
	}
	return 'none';
}

/** 설치 스크립트가 남긴 setup.json 적용. 테마 선택, 테마별 배경 경로, 투명도 */
async function applySetupFile() {
	if (!fs.existsSync(SETUP_FILE)) return false;
	let setup;
	try {
		setup = JSON.parse(fs.readFileSync(SETUP_FILE, 'utf8').replace(/^﻿/, ''));
	} catch (e) {
		vscode.window.showErrorMessage(`Pore Theme: 설치 설정 파일을 읽지 못했습니다. ${e.message}`);
		return false;
	}
	const cfg = vscode.workspace.getConfiguration(SECTION);
	if (setup.backgrounds && typeof setup.backgrounds === 'object') {
		const merged = { ...backgroundsMap(), ...setup.backgrounds };
		await cfg.update('backgrounds', merged, vscode.ConfigurationTarget.Global);
	}
	if (typeof setup.opacity === 'number') {
		await cfg.update('background.opacity', setup.opacity, vscode.ConfigurationTarget.Global);
	}
	if (typeof setup.theme === 'string' && setup.theme) {
		await vscode.workspace.getConfiguration('workbench').update('colorTheme', setup.theme, vscode.ConfigurationTarget.Global);
	}
	try {
		fs.unlinkSync(SETUP_FILE);
	} catch {
		// 지우기 실패해도 다음 실행 때 같은 값을 다시 쓸 뿐이라 치명적이지 않다
	}
	return true;
}

/** 배경 확장이 없으면 설치를 제안. 테마만 쓰려는 사람도 있으니 강제하지 않는다 */
async function ensureBgExtension() {
	if (bgExtensionInstalled()) return true;
	const pick = await vscode.window.showInformationMessage(
		'Pore Theme: 테마별 배경 이미지를 쓰려면 Background 확장(shalldie.background)이 필요합니다.',
		'설치',
		'나중에'
	);
	if (pick !== '설치') return false;
	await vscode.commands.executeCommand('workbench.extensions.installExtension', BG_EXT_ID);
	return true;
}

/** 명령: 현재 테마에 배경 이미지 지정 */
async function pickBackgroundForCurrentTheme(context) {
	const theme = currentThemeLabel();
	const files = await vscode.window.showOpenDialog({
		canSelectMany: false,
		openLabel: `${theme} 배경으로 사용`,
		filters: { Images: ['png', 'jpg', 'jpeg', 'webp', 'gif'] },
	});
	if (!files || !files.length) return;
	const map = { ...backgroundsMap(), [theme]: files[0].fsPath };
	await vscode.workspace.getConfiguration(SECTION).update('backgrounds', map, vscode.ConfigurationTarget.Global);
	if (await ensureBgExtension()) await syncBackground(context);
}

/** 명령: 현재 테마의 배경 제거 */
async function clearBackgroundForCurrentTheme(context) {
	const theme = currentThemeLabel();
	const map = { ...backgroundsMap() };
	if (!(theme in map)) {
		vscode.window.showInformationMessage(`Pore Theme: ${theme}에는 지정된 배경이 없습니다.`);
		return;
	}
	delete map[theme];
	await vscode.workspace.getConfiguration(SECTION).update('backgrounds', map, vscode.ConfigurationTarget.Global);
	await syncBackground(context);
}

async function activate(context) {
	context.subscriptions.push(
		vscode.commands.registerCommand('poreTheme.setBackground', () => pickBackgroundForCurrentTheme(context)),
		vscode.commands.registerCommand('poreTheme.clearBackground', () => clearBackgroundForCurrentTheme(context)),
		// 테마 전환, 배경 매핑 변경 둘 다 같은 동기화로 처리
		vscode.workspace.onDidChangeConfiguration((e) => {
			if (e.affectsConfiguration('workbench.colorTheme') || e.affectsConfiguration(SECTION)) {
				syncBackground(context).catch((err) => console.error('[pore-theme]', err));
			}
		})
	);

	const hadSetup = await applySetupFile();
	if (hadSetup && Object.keys(backgroundsMap()).length) await ensureBgExtension();
	await syncBackground(context);
}

function deactivate() {}

module.exports = { activate, deactivate, _internal: { toFileUri, syncBackground, applySetupFile, SETUP_FILE, MANAGED_KEY } };
