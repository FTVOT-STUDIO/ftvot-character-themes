# Pore Theme 설치 스크립트 (Windows PowerShell 5.1 / PowerShell 7)
#
# 테마만 설치:
#   & ([scriptblock]::Create((irm https://raw.githubusercontent.com/FTVOT-STUDIO/pore-theme/main/install.ps1)))
#
# 테마 + 테마별 배경 이미지:
#   & ([scriptblock]::Create((irm https://raw.githubusercontent.com/FTVOT-STUDIO/pore-theme/main/install.ps1))) -SnowBackground "$env:USERPROFILE\Pictures\pore-snow-bg.png" -MalkuthBackground "$env:USERPROFILE\Pictures\malkuth-bg.png"
#
# settings.json은 이 스크립트가 직접 건드리지 않는다. ~/.pore-theme/setup.json만 남기고,
# VS Code가 켜질 때 확장이 Configuration API로 적용한다. 그래서 주석이 있어도 안전하다.
param(
[string]$Theme = "Pore Snow Dark",
[string]$SnowBackground = "",
[string]$MalkuthBackground = "",
# 다크 기준 0.06~0.12가 코드 가독성을 해치지 않는 구간
[double]$Opacity = 0.08
)

$ErrorActionPreference = "Stop"
# PowerShell 5.1 기본 TLS 설정으로는 GitHub API 접속이 거절된다
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$Repo = "FTVOT-STUDIO/pore-theme"
$PoreDir = Join-Path $env:USERPROFILE ".pore-theme"

$code = Get-Command code -ErrorAction SilentlyContinue
if (-not $code) {
Write-Host "VS Code 'code' 명령을 찾을 수 없습니다. VS Code에서 Ctrl+Shift+P > 'Shell Command: Install code command in PATH' 실행 후 다시 시도해 주세요." -ForegroundColor Red
exit 1
}

# 1) 최신 릴리스 .vsix 설치
Write-Host "[1/3] 최신 릴리스 설치" -ForegroundColor Magenta
$release = Invoke-RestMethod "https://api.github.com/repos/$Repo/releases/latest" -Headers @{ "User-Agent" = "pore-theme-installer" }
$asset = $release.assets | Where-Object { $_.name -like "*.vsix" } | Select-Object -First 1
if (-not $asset) { throw "릴리스에 .vsix 파일이 없습니다." }
$vsix = Join-Path $env:TEMP $asset.name
Invoke-WebRequest $asset.browser_download_url -OutFile $vsix -UseBasicParsing
& code --install-extension $vsix --force | Out-Host
Remove-Item $vsix -ErrorAction SilentlyContinue
Write-Host ("  버전 " + $release.tag_name) -ForegroundColor DarkGray

# 2) 배경 이미지를 ~/.pore-theme 로 복사 (원본을 옮기거나 지워도 배경이 유지되도록)
New-Item -ItemType Directory -Force -Path $PoreDir | Out-Null
$backgrounds = [ordered]@{}
function Add-Background([string]$src, [string]$name, [string[]]$themes) {
if (-not $src) { return }
if (-not (Test-Path $src)) { throw "배경 이미지를 찾을 수 없습니다: $src" }
$ext = [System.IO.Path]::GetExtension($src)
$dst = Join-Path $PoreDir ($name + $ext)
Copy-Item $src $dst -Force
foreach ($t in $themes) { $script:backgrounds[$t] = ($dst -replace "\\", "/") }
Write-Host "  $name -> $($themes -join ', ')" -ForegroundColor DarkGray
}
Write-Host "[2/3] 배경 이미지 준비" -ForegroundColor Magenta
Add-Background $SnowBackground "snow" @("Pore Snow Dark", "Pore Snow Light")
Add-Background $MalkuthBackground "malkuth" @("Malkuth Dark", "Malkuth Light")
if ($backgrounds.Count -gt 0) {
& code --install-extension shalldie.background | Out-Host
} else {
Write-Host "  배경 이미지 생략" -ForegroundColor DarkGray
}

# 3) 확장이 다음 실행 때 읽어갈 1회용 설정
Write-Host "[3/3] 설정 예약" -ForegroundColor Magenta
$setup = [ordered]@{ theme = $Theme; opacity = $Opacity; backgrounds = $backgrounds }
$json = $setup | ConvertTo-Json -Depth 5
[System.IO.File]::WriteAllText((Join-Path $PoreDir "setup.json"), $json, (New-Object System.Text.UTF8Encoding($false)))

Write-Host ""
Write-Host "완료. VS Code를 완전히 종료했다가 다시 열면 테마와 배경이 적용됩니다." -ForegroundColor Green
if ($backgrounds.Count -gt 0) {
Write-Host "배경 확장이 '설치가 손상되었습니다' 경고나 재시작 안내를 띄울 수 있습니다. 정상 동작입니다." -ForegroundColor DarkGray
}
