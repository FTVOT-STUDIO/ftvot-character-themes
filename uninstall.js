// VS Code가 확장을 제거할 때 실행하는 훅 (package.json scripts."vscode:uninstall").
// vscode API 없이 node로만 돈다. 패치할 때 기록해 둔 workbench.html 경로에서 Pore 블록만 지운다.
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const record = path.join(os.homedir(), '.pore-theme', 'patched.json');
try {
	const { html } = JSON.parse(fs.readFileSync(record, 'utf8'));
	const content = fs.readFileSync(html, 'utf8');
	const clean = content.replace(/<!-- pore-theme-bg-start -->[\s\S]*?<!-- pore-theme-bg-end -->\n?/g, '');
	if (clean !== content) fs.writeFileSync(html, clean, 'utf8');
	fs.unlinkSync(record);
} catch {
	// 기록이 없거나 이미 지워졌으면 할 일 없음
}
