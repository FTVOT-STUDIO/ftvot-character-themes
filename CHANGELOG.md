# Changelog

## 2.2.1 - 2026-11-11
- 버그 수정: v2.1에서 업데이트한 경우 예전 Background 확장의 배경이 남아, 다른 테마에서도 이전 배경이 보이거나 Snow 테마에서 두 배경이 겹치던 문제. v2.1이 켠 설정을 더 정확히 찾아 끄고, 그 확장이 VS Code에 넣은 코드도 직접 제거
- Pore Dark / Light 에 Pore 나들이 일러스트 배경 추가 (외곽 흰 여백 투명 처리, 오른쪽 아래 배치)
- 배경마다 크기·위치 지정 가능 (`{ path, size, position }`), 값 검증으로 CSS 주입 차단
- 새 버전에서 동봉 배경이 늘면 기존 사용자에게도 자동 추가. 직접 지정하거나 지운 테마는 그대로 유지

## 2.2.0 - 2026-11-11
- **테마 전환 시 리로드 없음**: 배경을 CSS로 테마별로 미리 넣어 두고, 현재 테마 클래스에 따라 즉시 전환. 이미지 목록이 바뀔 때만 한 번 다시 로드
- shalldie.background 확장 의존 제거. 기존 v2.1에서 켰던 Background 설정은 자동으로 끔
- Pore 겨울, Malkuth 일러스트를 기본 배경으로 동봉 (권리자 허락). 새로 설치해도 Snow/Malkuth 테마에 배경이 바로 적용
- 배경 이미지는 `~/.pore-theme`에 복사해서 사용 (원본 삭제에 영향 없음)
- VS Code 업데이트 후 자동 재적용, 확장 제거 시 원본 자동 복구, `배경 기능 끄기` 명령 추가
- VS Code 내장 테마와 다른 확장 테마에도 배경 지정 가능

## 2.1.1 - 2026-11-11
- settings.json이 편집기에서 저장 안 된 상태일 때 테마를 바꿀 때마다 "사용자 설정에 쓸 수 없습니다" 에러가 뜨던 문제 수정. 이제 쓰기를 보류하고 상태바에 한 번만 안내한 뒤, 저장하는 순간 자동 적용
- install.ps1: scriptblock 실행 시 배경 맵이 null이 되던 문제 수정, 이미지 확장자가 달라도 같은 이름 파일을 찾아 사용

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
