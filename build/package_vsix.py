#!/usr/bin/env python3
"""
vsce 없이 .vsix를 만드는 패키저.
.vsix는 결국 정해진 매니페스트 2개 + extension/ 폴더를 담은 zip이다.
테마 전용 확장은 빌드할 코드가 없으니 Node 툴체인을 끌어올 이유가 없다.

사용법: python3 build/package_vsix.py
"""
import json
import zipfile
from pathlib import Path
from xml.sax.saxutils import escape

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / "dist"

# 패키지에 넣을 파일 (빌드 스크립트, 미리보기는 제외)
INCLUDE = ["package.json", "extension.js", "uninstall.js", "README.md", "CHANGELOG.md", "LICENSE", "CREDITS.md", "themes", "media"]

CONTENT_TYPES = """<?xml version="1.0" encoding="utf-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension=".json" ContentType="application/json"/>
<Default Extension=".md" ContentType="text/markdown"/>
<Default Extension=".js" ContentType="application/javascript"/>
<Default Extension=".jpg" ContentType="image/jpeg"/>
<Default Extension=".png" ContentType="image/png"/>
<Default Extension=".txt" ContentType="text/plain"/>
<Default Extension=".vsixmanifest" ContentType="text/xml"/>
<Default Extension="" ContentType="application/octet-stream"/>
</Types>
"""


def manifest(pkg: dict) -> str:
    e = lambda s: escape(str(s), {'"': "&quot;"})
    return f"""<?xml version="1.0" encoding="utf-8"?>
<PackageManifest Version="2.0.0" xmlns="http://schemas.microsoft.com/developer/vsx-schema/2011" xmlns:d="http://schemas.microsoft.com/developer/vsx-schema-design/2011">
<Metadata>
<Identity Language="en-US" Id="{e(pkg['name'])}" Version="{e(pkg['version'])}" Publisher="{e(pkg['publisher'])}"/>
<DisplayName>{e(pkg['displayName'])}</DisplayName>
<Description xml:space="preserve">{e(pkg['description'])}</Description>
<Tags>{e(','.join(pkg.get('keywords', [])))},theme,color-theme</Tags>
<Categories>{e(','.join(pkg['categories']))}</Categories>
<GalleryFlags>Public</GalleryFlags>
<Properties>
<Property Id="Microsoft.VisualStudio.Code.Engine" Value="{e(pkg['engines']['vscode'])}"/>
<Property Id="Microsoft.VisualStudio.Code.ExtensionKind" Value="{e(','.join(pkg.get('extensionKind', ['ui', 'workspace'])))}"/>
<Property Id="Microsoft.VisualStudio.Services.Links.Source" Value="{e(pkg['repository']['url'])}"/>
<Property Id="Microsoft.VisualStudio.Services.Branding.Color" Value="{e(pkg['galleryBanner']['color'])}"/>
<Property Id="Microsoft.VisualStudio.Services.Branding.Theme" Value="{e(pkg['galleryBanner']['theme'])}"/>
</Properties>
<License>extension/LICENSE</License>
</Metadata>
<Installation>
<InstallationTarget Id="Microsoft.VisualStudio.Code"/>
</Installation>
<Dependencies/>
<Assets>
<Asset Type="Microsoft.VisualStudio.Code.Manifest" Path="extension/package.json" Addressable="true"/>
<Asset Type="Microsoft.VisualStudio.Services.Content.Details" Path="extension/README.md" Addressable="true"/>
<Asset Type="Microsoft.VisualStudio.Services.Content.Changelog" Path="extension/CHANGELOG.md" Addressable="true"/>
<Asset Type="Microsoft.VisualStudio.Services.Content.License" Path="extension/LICENSE" Addressable="true"/>
</Assets>
</PackageManifest>
"""


def main() -> None:
    pkg = json.loads((ROOT / "package.json").read_text(encoding="utf-8"))
    # 테마 JSON이 깨져 있으면 설치 후에야 알게 되므로 패키징 단계에서 막는다
    for t in pkg["contributes"]["themes"]:
        json.loads((ROOT / t["path"]).read_text(encoding="utf-8"))

    DIST.mkdir(exist_ok=True)
    out = DIST / f"{pkg['name']}-{pkg['version']}.vsix"
    with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("[Content_Types].xml", CONTENT_TYPES)
        z.writestr("extension.vsixmanifest", manifest(pkg))
        for item in INCLUDE:
            path = ROOT / item
            files = sorted(path.rglob("*")) if path.is_dir() else [path]
            for f in files:
                if f.is_file():
                    z.write(f, "extension/" + f.relative_to(ROOT).as_posix())
    print(f"wrote {out.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
