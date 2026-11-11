# Pore Theme 설치 스크립트 (Windows PowerShell 5.1 / PowerShell 7)
#
# 테마만 설치:
#   irm https://raw.githubusercontent.com/FTVOT-STUDIO/pore-theme/main/install.ps1 | iex
#
# 테마 + 배경 이미지 (shalldie.background 확장 사용):
#   & ([scriptblock]::Create((irm https://raw.githubusercontent.com/FTVOT-STUDIO/pore-theme/main/install.ps1))) -Background "$env:USERPROFILE\Pictures\pore-snow-bg.png"
param(
[string]$Theme = "Pore Snow Dark",
[string]$Background = "",
# 다크 기준 0.06~0.10이 코드 가독성을 해치지 않는 구간
[double]$Opacity = 0.08
)

$ErrorActionPreference = "Stop"
$Repo = "FTVOT-STUDIO/pore-theme"

# code CLI가 없으면 아무것도 못 하니 제일 먼저 확인
$code = Get-Command code -ErrorAction SilentlyContinue
if (-not $code) {
Write-Host "VS Code 'code' 명령을 찾을 수 없습니다. VS Code에서 Ctrl+Shift+P > 'Shell Command: Install code command in PATH' 실행 후 다시 시도해 주세요." -ForegroundColor Red
exit 1
}

# 1) 최신 릴리스의 .vsix 다운로드 후 설치
Write-Host "[1/3] 최신 릴리스 확인" -ForegroundColor Magenta
$release = Invoke-RestMethod "https://api.github.com/repos/$Repo/releases/latest" -Headers @{ "User-Agent" = "pore-theme-installer" }
$asset = $release.assets | Where-Object { $_.name -like "*.vsix" } | Select-Object -First 1
if (-not $asset) { throw "릴리스에 .vsix 파일이 없습니다." }
$vsix = Join-Path $env:TEMP $asset.name
Invoke-WebRequest $asset.browser_download_url -OutFile $vsix -UseBasicParsing
& code --install-extension $vsix --force | Out-Host
Remove-Item $vsix -ErrorAction SilentlyContinue

# 2) 배경 확장 (이미지 경로를 줬을 때만)
$useBg = $false
if ($Background) {
if (-not (Test-Path $Background)) { throw "배경 이미지를 찾을 수 없습니다: $Background" }
Write-Host "[2/3] 배경 확장 설치 (shalldie.background)" -ForegroundColor Magenta
& code --install-extension shalldie.background --force | Out-Host
$useBg = $true
} else {
Write-Host "[2/3] 배경 이미지 생략 (-Background 미지정)" -ForegroundColor DarkGray
}

# 3) settings.json 갱신. 파싱 실패 시 원본을 건드리지 않고 붙여넣을 내용만 출력
Write-Host "[3/3] settings.json 갱신" -ForegroundColor Magenta
$settingsPath = Join-Path $env:APPDATA "Code\User\settings.json"
$bgUri = if ($useBg) { "file:///" + ((Resolve-Path $Background).Path -replace "\\", "/") } else { "" }

$patch = [ordered]@{ "workbench.colorTheme" = $Theme }
if ($useBg) {
$patch["background.enabled"] = $true
$patch["background.fullscreen"] = [ordered]@{
images = @($bgUri)
opacity = $Opacity
size = "cover"
position = "center"
interval = 0
random = $false
}
}

$settings = $null
if (Test-Path $settingsPath) {
Copy-Item $settingsPath "$settingsPath.bak-pore" -Force
try {
$raw = Get-Content $settingsPath -Raw -Encoding UTF8
$settings = if ([string]::IsNullOrWhiteSpace($raw)) { [pscustomobject]@{} } else { $raw | ConvertFrom-Json }
} catch {
$settings = $null
}
} else {
New-Item -ItemType Directory -Force -Path (Split-Path $settingsPath) | Out-Null
$settings = [pscustomobject]@{}
}

if ($null -eq $settings) {
# 주석이나 trailing comma가 있으면 PowerShell 5.1 파서가 실패한다. 남의 설정 파일을 망가뜨리느니 수동 안내가 낫다
Write-Host "settings.json에 주석 등이 있어서 자동 수정하지 않았습니다. 아래 내용을 직접 붙여넣어 주세요." -ForegroundColor Yellow
$patch | ConvertTo-Json -Depth 10 | Out-Host
} else {
foreach ($k in $patch.Keys) {
$settings | Add-Member -NotePropertyName $k -NotePropertyValue $patch[$k] -Force
}
$json = $settings | ConvertTo-Json -Depth 32
[System.IO.File]::WriteAllText($settingsPath, $json, (New-Object System.Text.UTF8Encoding($false)))
Write-Host "적용 완료. 백업: $settingsPath.bak-pore" -ForegroundColor Green
}

Write-Host ""
Write-Host "VS Code를 완전히 종료했다가 다시 열어 주세요." -ForegroundColor Green
if ($useBg) {
Write-Host "배경 확장이 '설치가 손상되었습니다' 경고를 띄울 수 있습니다. 정상 동작이니 '다시 표시 안 함'을 누르시면 됩니다." -ForegroundColor DarkGray
}
