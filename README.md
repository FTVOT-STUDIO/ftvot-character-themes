# Pore Theme

캐릭터 Pore의 색감으로 만든 고딕 파스텔 VS Code 테마입니다. 플럼, 라일락, 체리블라썸 핑크를 썼습니다. 다크, 라이트에 겨울 버전(Snow)까지 네 가지 테마가 들어 있습니다.

| 버전 | 에디터 배경 | 포인트 색 |
|------|------|------|
| Pore Dark | `#1C1222` | `#FF6FAE` |
| Pore Light | `#FDF8FB` | `#C2186B` |
| Pore Snow Dark | `#1F1019` | `#FF8AC8` |
| Pore Snow Light | `#FFF4F9` | `#B3125A` |

![Pore Dark](preview/dark.png)

![Pore Light](preview/light.png)

![Pore Snow Dark](preview/snow-dark.png)

![Pore Snow Light](preview/snow-light.png)

## 설치

### 한 줄 설치 (Windows PowerShell)

```powershell
irm https://raw.githubusercontent.com/FTVOT-STUDIO/pore-theme/main/install.ps1 | iex
```

최신 릴리스를 받아 설치하고 테마를 `Pore Snow Dark`로 바꿉니다. 배경 이미지를 같이 깔려면 [배경 이미지](#배경-이미지-선택) 항목을 참고해 주세요.

### 수동 설치


1. [Releases](https://github.com/FTVOT-STUDIO/pore-theme/releases/latest)에서 `pore-theme-2.0.0.vsix` 다운로드
2. VS Code에서 `Ctrl+Shift+P` 누르고 `Extensions: Install from VSIX...` 선택한 뒤 파일 지정
3. `Ctrl+K Ctrl+T`에서 `Pore` 계열 테마 선택

CLI로 설치할 수도 있습니다.

```bash
code --install-extension pore-theme-2.0.0.vsix
```

## OS 다크/라이트 모드에 맞춰 자동 전환

`settings.json`:

```json
{
  "window.autoDetectColorScheme": true,
  "workbench.preferredDarkColorTheme": "Pore Dark",
  "workbench.preferredLightColorTheme": "Pore Light"
}
```

## 색 바꾸기

`build/generate.py`의 팔레트(`DARK`, `LIGHT`, `SNOW_DARK`, `SNOW_LIGHT`)만 수정하고 아래 명령을 실행하면 됩니다. 두 JSON이 함께 다시 생성됩니다.

```bash
python3 build/generate.py
python3 build/check_contrast.py   # WCAG AA 검사, 미달이면 실패
python3 build/package_vsix.py
```

## 접근성

모든 문법 색상은 에디터, 사이드바, 위젯 배경 대비 WCAG AA 4.5:1 이상으로 맞췄습니다.

## License

MIT. 자세한 내용은 [CREDITS.md](CREDITS.md)를 참고해 주세요.

## 배경 이미지 (선택)

테마 파일에는 배경 이미지를 넣을 수 없어서 [shalldie.background](https://github.com/shalldie/vscode-background) 확장을 함께 씁니다. 이미지는 직접 준비해 주세요.

```powershell
& ([scriptblock]::Create((irm https://raw.githubusercontent.com/FTVOT-STUDIO/pore-theme/main/install.ps1))) -Background "$env:USERPROFILE\Pictures\pore-snow-bg.png" -Opacity 0.08
```

- 이 확장은 VS Code 내부 HTML을 수정하는 방식이라 "설치가 손상되었습니다" 경고가 뜹니다. 정상 동작입니다.
- 제거할 때는 먼저 `"background.enabled": false`로 바꾸고 재시작한 뒤에 확장을 삭제해 주세요.
