# Sakura Gothic

플럼, 라일락, 체리블라썸 핑크로 만든 고딕 파스텔 VS Code 테마입니다. 다크와 라이트 두 가지 버전이 있습니다.

| 버전 | 에디터 배경 | 포인트 색 |
|------|------|------|
| Sakura Gothic Dark | `#1C1222` | `#FF6FAE` |
| Sakura Gothic Light | `#FDF8FB` | `#C2186B` |

![Sakura Gothic Dark](preview/dark.png)

![Sakura Gothic Light](preview/light.png)

## 설치

1. [Releases](https://github.com/FTVOT-STUDIO/sakura-gothic-theme/releases)에서 `sakura-gothic-theme-1.0.0.vsix` 다운로드
2. VS Code에서 `Ctrl+Shift+P` 누르고 `Extensions: Install from VSIX...` 선택한 뒤 파일 지정
3. `Ctrl+K Ctrl+T`에서 `Sakura Gothic Dark` 또는 `Sakura Gothic Light` 선택

CLI로 설치할 수도 있습니다.

```bash
code --install-extension sakura-gothic-theme-1.0.0.vsix
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

`build/generate.py`의 `DARK` / `LIGHT` 팔레트만 수정하고 아래 명령을 실행하면 됩니다. 두 JSON이 함께 다시 생성됩니다.

```bash
python3 build/generate.py
python3 build/package_vsix.py
```

## 접근성

모든 문법 색상은 에디터, 사이드바, 위젯 배경 대비 WCAG AA 4.5:1 이상으로 맞췄습니다.

## License

MIT. 자세한 내용은 [CREDITS.md](CREDITS.md)를 참고해 주세요.
