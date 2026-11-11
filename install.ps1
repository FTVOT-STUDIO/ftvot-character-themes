# Pore Theme 설치 스크립트 (Windows PowerShell 5.1 / PowerShell 7)
#
# 테마만 설치:
#   & ([scriptblock]::Create((irm https://raw.githubusercontent.com/FTVOT-STUDIO/pore-theme/main/install.ps1)))
#
# Snow/Malkuth 테마 배경은 확장에 동봉되어 자동 적용된다. 다른 그림을 쓰고 싶을 때만:
#   ... -SnowBackground "C:\path\snow.png" -MalkuthBackground "C:\path\malkuth.png"
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
# 결과 맵을 인자로 받는다. scriptblock으로 실행되면 $script: 스코프가 호출자 세션을 가리켜서
# 함수 밖 변수를 $script:로 고치면 엉뚱한(빈) 변수에 쓰게 된다
function Add-Background($map, [string]$src, [string]$name, [string[]]$themes) {
if (-not $src) { return }
if (-not (Test-Path $src)) {
# 확장자만 다르게 저장된 경우(.png로 적었는데 실제는 .jpg 등)를 구제
$base = [System.IO.Path]::ChangeExtension($src, $null).TrimEnd(".")
$alt = @(".png", ".jpg", ".jpeg", ".webp") | ForEach-Object { $base + $_ } | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $alt) { throw "배경 이미지를 찾을 수 없습니다: $src" }
Write-Host "  $src 대신 $alt 사용" -ForegroundColor Yellow
$src = $alt
}
$ext = [System.IO.Path]::GetExtension($src)
$dst = Join-Path $PoreDir ($name + $ext)
Copy-Item $src $dst -Force
foreach ($t in $themes) { $map[$t] = ($dst -replace "\\", "/") }
Write-Host "  $name -> $($themes -join ', ')" -ForegroundColor DarkGray
}
Write-Host "[2/3] 배경 이미지 준비" -ForegroundColor Magenta
Add-Background $backgrounds $SnowBackground "snow" @("Pore Snow Dark", "Pore Snow Light")
Add-Background $backgrounds $MalkuthBackground "malkuth" @("Malkuth Dark", "Malkuth Light")
if ($backgrounds.Count -eq 0) {
Write-Host "  동봉 배경 사용" -ForegroundColor DarkGray
}

# 3) 확장이 다음 실행 때 읽어갈 1회용 설정
Write-Host "[3/3] 설정 예약" -ForegroundColor Magenta
$setup = [ordered]@{ theme = $Theme; opacity = $Opacity; backgrounds = $backgrounds }
$json = $setup | ConvertTo-Json -Depth 5
[System.IO.File]::WriteAllText((Join-Path $PoreDir "setup.json"), $json, (New-Object System.Text.UTF8Encoding($false)))

Write-Host ""
Write-Host "완료. VS Code를 다시 열고, 오른쪽 아래 '다시 로드' 안내를 한 번 누르면 배경까지 적용됩니다." -ForegroundColor Green
Write-Host "그 뒤로는 테마를 바꿀 때 배경이 리로드 없이 즉시 바뀝니다." -ForegroundColor DarkGray
