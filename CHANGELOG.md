# Changelog

## 2.1.0 - 2026-11-11
- Malkuth Dark / Malkuth Light 추가 (보라빛 교실 일러스트 팔레트)
- 눈 피로 개선: 다크 본문 대비 15:1 → 11:1 이하, 문법 색 9.5:1 이하, 채도 하향. 라이트 배경을 순백에서 라벤더 회색 톤으로 낮춤
- 버그 수정: 팔레트의 `type` 키가 테마 모드와 문법 색에 중복으로 쓰여, 다크 테마의 입력창 배경이 흰색(`#FFFFFF`)으로 나오던 문제
- 지정하지 않아 VS Code 기본색으로 남던 워크벤치 키 약 290개 추가 (확장 탭, 설정 화면, 디버그, 테스트, 노트북, 인라인 채팅, 심볼 아이콘 등)
- 테마별 배경 이미지 자동 전환 (`poreTheme.backgrounds`), 배경 지정/제거 명령
- 설치 스크립트가 settings.json을 직접 고치지 않고, 확장이 설정 API로 적용 (주석 보존)
- `check_contrast.py`에 밝기 상한 검사 추가, `test/extension.test.js` 추가

## 2.0.0 - 2026-11-11
- 이름 변경: Sakura Gothic → Pore Theme (확장 ID `ftvot-studio.pore-theme`)
- 테마 라벨: Pore Dark, Pore Light, Pore Snow Dark, Pore Snow Light
- 설치 파일은 GitHub Releases로 배포, 저장소의 `vsix/` 폴더 제거

## 1.1.0 - 2026-11-11
- Sakura Gothic Snow Dark, Snow Light 추가 (겨울 일러스트 팔레트: 핑크 설경, 마룬, 라벤더, 가로등 앰버)
- `build/check_contrast.py` 추가: 전 팔레트 WCAG AA 자동 검사
- `.vsix`를 저장소 `vsix/` 폴더에 포함

## 1.0.0 - 2026-11-11
- Sakura Gothic Dark, Sakura Gothic Light 최초 릴리스
- 워크벤치 색상 291개, TextMate 규칙 43개, Semantic Token 지원
- 모든 문법 색상 WCAG AA 4.5:1 이상 (에디터, 사이드바, 위젯 배경 기준)
