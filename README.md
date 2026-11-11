# Pore Theme

캐릭터 Pore와 Malkuth 일러스트의 색감으로 만든 고딕 파스텔 VS Code 테마 모음입니다. 6종이 들어 있고, 테마마다 배경 이미지를 따로 지정할 수 있습니다.

눈 피로를 줄이기 위해 다크 테마는 본문 대비를 11:1 이하, 문법 색은 9.5:1 이하로 제한하고, 라이트 테마는 배경 밝기를 순백보다 낮췄습니다. 모든 색은 WCAG AA(4.5:1) 이상입니다.

| 버전 | 에디터 배경 | 포인트 색 |
|------|------|------|
| Pore Dark | `#1C1222` | `#DC82AD` |
| Pore Light | `#F0E7ED` | `#963565` |
| Pore Snow Dark | `#1F1019` | `#DF88B2` |
| Pore Snow Light | `#F2E5EC` | `#A0305F` |
| Malkuth Dark | `#181526` | `#A68AE6` |
| Malkuth Light | `#EAE6F3` | `#6847B5` |

![Pore Dark](preview/dark.png)

![Pore Light](preview/light.png)

![Pore Snow Dark](preview/snow-dark.png)

![Pore Snow Light](preview/snow-light.png)

![Malkuth Dark](preview/malkuth-dark.png)

![Malkuth Light](preview/malkuth-light.png)

## 설치

### 한 줄 설치 (Windows PowerShell)

```powershell
& ([scriptblock]::Create((irm https://raw.githubusercontent.com/FTVOT-STUDIO/pore-theme/main/install.ps1)))
```

최신 릴리스를 받아 설치합니다. VS Code를 다시 열면 테마가 `Pore Snow Dark`로 바뀝니다. 다른 테마로 시작하려면 끝에 `-Theme "Malkuth Dark"`처럼 붙이시면 됩니다.

### 수동 설치

1. [Releases](https://github.com/FTVOT-STUDIO/pore-theme/releases/latest)에서 `pore-theme-2.1.1.vsix` 다운로드
2. VS Code에서 `Ctrl+Shift+P` 누르고 `Extensions: Install from VSIX...` 선택한 뒤 파일 지정
3. `Ctrl+K Ctrl+T`에서 `Pore` 계열 테마 선택

CLI로 설치할 수도 있습니다.

```bash
code --install-extension pore-theme-2.1.1.vsix
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

`build/generate.py`의 팔레트(`DARK`, `LIGHT`, `SNOW_DARK`, `SNOW_LIGHT`, `MALKUTH_DARK`, `MALKUTH_LIGHT`)를 수정한 뒤 [개발](#개발) 항목의 명령을 순서대로 실행하시면 됩니다.

## 접근성

모든 문법 색상은 에디터, 사이드바, 위젯 배경 대비 WCAG AA 4.5:1 이상으로 맞췄습니다.

## License

MIT. 자세한 내용은 [CREDITS.md](CREDITS.md)를 참고해 주세요.

## 배경 이미지 (선택)

테마마다 배경 이미지를 따로 지정할 수 있습니다. 지정한 테마로 바꾸면 배경이 켜지고, 지정하지 않은 테마로 바꾸면 자동으로 꺼집니다. 실제 배경 표시는 [shalldie.background](https://github.com/shalldie/vscode-background) 확장이 담당하며, 처음 지정할 때 설치를 안내합니다. 이미지는 직접 준비해 주세요.

**설치하면서 한 번에 지정**

```powershell
& ([scriptblock]::Create((irm https://raw.githubusercontent.com/FTVOT-STUDIO/pore-theme/main/install.ps1))) -SnowBackground "$env:USERPROFILE\Pictures\pore-snow-bg.png" -MalkuthBackground "$env:USERPROFILE\Pictures\malkuth-bg.png"
```

| 인자 | 적용되는 테마 |
|------|------|
| `-SnowBackground` | Pore Snow Dark, Pore Snow Light |
| `-MalkuthBackground` | Malkuth Dark, Malkuth Light |
| `-Opacity` | 배경 불투명도 (기본 0.08) |

설치 스크립트는 `settings.json`을 직접 고치지 않습니다. `~/.pore-theme/setup.json`을 남겨 두면 VS Code가 켜질 때 확장이 VS Code 설정 API로 적용하므로, 기존 설정의 주석이 그대로 유지됩니다.

**나중에 VS Code 안에서 지정**

- `Ctrl+Shift+P` → `Pore Theme: 현재 테마에 배경 이미지 지정` → 이미지 선택
- `Pore Theme: 현재 테마의 배경 이미지 제거`

**설정 직접 편집**

```jsonc
"poreTheme.backgrounds": {
  "Pore Snow Dark": "C:/Users/me/Pictures/pore-snow-bg.png",
  "Malkuth Dark": "C:/Users/me/Pictures/malkuth-bg.png"
},
"poreTheme.background.opacity": 0.08
```

**참고**

- 배경 확장은 VS Code 내부 HTML을 수정하는 방식이라 "설치가 손상되었습니다" 경고가 뜹니다. 정상 동작입니다.
- 배경이 바뀔 때마다 배경 확장이 창 다시 로드를 요구합니다. 같은 배경 그대로라면 설정을 다시 쓰지 않으므로 재시작 안내가 뜨지 않습니다.
- 원래 쓰던 배경 설정은 Pore Theme가 켠 것이 아니면 건드리지 않습니다.
- 완전히 제거하려면 먼저 `"background.enabled": false`로 바꾸고 재시작한 뒤에 확장을 삭제해 주세요.

## 개발

```bash
python3 build/generate.py        # 팔레트 → 테마 JSON
python3 build/check_contrast.py  # 대비 하한/상한 검사
node test/extension.test.js      # 배경 전환 로직 테스트
python3 build/package_vsix.py    # dist/*.vsix
```
