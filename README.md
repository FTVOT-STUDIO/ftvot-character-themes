# Sakura Gothic

플럼, 라일락, 체리블라썸 핑크로 만든 고딕 파스텔 VS Code 테마입니다. 다크, 라이트에 겨울 버전(Snow)까지 네 가지 테마가 들어 있습니다.

| 버전 | 에디터 배경 | 포인트 색 |
|------|------|------|
| Sakura Gothic Dark | `#1C1222` | `#FF6FAE` |
| Sakura Gothic Light | `#FDF8FB` | `#C2186B` |
| Sakura Gothic Snow Dark | `#1F1019` | `#FF8AC8` |
| Sakura Gothic Snow Light | `#FFF4F9` | `#B3125A` |

![Sakura Gothic Dark](preview/dark.png)

![Sakura Gothic Light](preview/light.png)

![Sakura Gothic Snow Dark](preview/snow-dark.png)

![Sakura Gothic Snow Light](preview/snow-light.png)

## 설치

1. [`vsix/sakura-gothic-theme-1.1.0.vsix`](vsix/sakura-gothic-theme-1.1.0.vsix) 다운로드 (파일 페이지에서 Download raw file)
2. VS Code에서 `Ctrl+Shift+P` 누르고 `Extensions: Install from VSIX...` 선택한 뒤 파일 지정
3. `Ctrl+K Ctrl+T`에서 `Sakura Gothic` 계열 테마 선택

CLI로 설치할 수도 있습니다.

```bash
code --install-extension sakura-gothic-theme-1.1.0.vsix
```

## OS 다크/라이트 모드에 맞춰 자동 전환

`settings.json`:

```json
{
  "window.autoDetectColorScheme": true,
  "workbench.preferredDarkColorTheme": "Sakura Gothic Dark",
  "workbench.preferredLightColorTheme": "Sakura Gothic Light"
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
