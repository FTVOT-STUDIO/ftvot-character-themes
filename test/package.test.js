// 패키지 일관성 테스트: package.json, 테마 JSON, 동봉 배경이 서로 맞는지
// 실행: node test/package.test.js
'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const themes = pkg.contributes.themes;

// 1) 모든 테마 파일이 존재하고 JSON으로 파싱되며, name/type이 package.json과 일치
const labels = new Set();
for (const t of themes) {
	const file = path.join(root, t.path);
	assert.ok(fs.existsSync(file), `테마 파일 없음: ${t.path}`);
	const json = JSON.parse(fs.readFileSync(file, 'utf8'));
	assert.strictEqual(json.name, t.label, `name 불일치: ${t.path}`);
	assert.strictEqual(json.type, t.uiTheme === 'vs' ? 'light' : 'dark', `type 불일치(${json.type}): ${t.path}`);
	assert.ok(Object.keys(json.colors).length > 500, `워크벤치 색이 너무 적음: ${t.path}`);
	// 다크 테마에 흰 배경 입력창 같은 사고가 다시 나지 않도록
	if (json.type === 'dark') assert.notStrictEqual(json.colors['input.background'].toUpperCase(), '#FFFFFF', `다크 테마 입력창 흰색: ${t.path}`);
	for (const [k, v] of Object.entries(json.colors)) assert.match(v, /^#[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$/, `잘못된 색 ${k}=${v} in ${t.path}`);
	assert.ok(!labels.has(t.label), `라벨 중복: ${t.label}`);
	labels.add(t.label);
}
console.log(`ok 테마 ${themes.length}종 파일/이름/타입/색 형식`);

// 2) 동봉 배경 매핑: 모든 라벨이 실제 테마이고, 파일이 존재
const bgs = JSON.parse(fs.readFileSync(path.join(root, 'media', 'backgrounds.json'), 'utf8'));
for (const [label, spec] of Object.entries(bgs)) {
	assert.ok(labels.has(label), `배경 매핑의 테마가 없음: ${label}`);
	const file = typeof spec === 'string' ? spec : spec.file;
	assert.ok(fs.existsSync(path.join(root, 'media', file)), `배경 파일 없음: ${file}`);
}
console.log(`ok 동봉 배경 ${Object.keys(bgs).length}개 매핑`);

// 3) package.json 필수 항목
assert.strictEqual(pkg.main, './extension.js');
assert.ok(fs.existsSync(path.join(root, 'uninstall.js')));
assert.strictEqual(pkg.scripts['vscode:uninstall'], 'node ./uninstall.js');
for (const c of pkg.contributes.commands) assert.ok(fs.readFileSync(path.join(root, 'extension.js'), 'utf8').includes(`'${c.command}'`), `명령 미등록: ${c.command}`);
console.log('ok package.json 진입점/제거 훅/명령');
console.log('\nall passed');
