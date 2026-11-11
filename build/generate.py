#!/usr/bin/env python3
"""
Sakura Gothic 테마 생성기.
팔레트 하나만 고치면 다크/라이트 JSON이 동시에 재생성된다.
손으로 JSON 두 개를 따로 관리하면 반드시 한쪽만 고치는 사고가 난다.

사용법: python3 build/generate.py
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "themes"

# ---------------------------------------------------------------
# 팔레트: 캐릭터 일러스트에서 추출 (외곽선 플럼, 니삭스, 가디건 핑크,
# 셔츠 라벤더, 별 핫핑크, 배경 라일락)
# ---------------------------------------------------------------
DARK = {
    "name": "Sakura Gothic Dark",
    "type": "dark",
    # 레이어: 깊을수록 어둡게 (액티비티바 < 사이드바 < 에디터 < 위젯)
    "bg0": "#120A16",       # 액티비티바, 타이틀바
    "bg1": "#170E1C",       # 사이드바, 패널
    "bg2": "#1C1222",       # 에디터
    "bg3": "#26182E",       # 위젯, 드롭다운, 호버
    "bg4": "#33223D",       # 선택된 리스트, 활성 요소
    "line": "#2E1F37",      # 경계선
    "fg": "#EEDFF2",        # 기본 텍스트 (가디건 하이라이트)
    "fg2": "#B9A3C2",       # 보조 텍스트
    "fg3": "#9783A1",       # 비활성, 줄번호 (4.5:1 이상 확인)
    "accent": "#FF6FAE",    # 핫핑크 (별, 하트)
    "accent_fg": "#1C1222", # accent 위 텍스트
    "selection": "#5A3A6A",
    "find": "#FF6FAE",
    # 문법 색
    "comment": "#9783A1",
    "keyword": "#FF6FAE",   # 핫핑크
    "storage": "#F48FC0",   # 연한 핫핑크
    "string": "#F7C1DC",    # 가디건 핑크
    "escape": "#FFA3CD",
    "number": "#FF9FB4",    # 코랄 로즈
    "constant": "#E4A6F0",  # 라일락 핑크
    "function": "#BFA8FF",  # 셔츠 라벤더
    "type": "#9FB0FF",      # 눈동자 블루바이올렛
    "class": "#C9B6FF",
    "variable": "#EEDFF2",
    "param": "#E2C7EC",
    "property": "#D7B8E8",
    "tag": "#FF6FAE",
    "attr": "#C9A4E8",
    "operator": "#C796D6",
    "punct": "#A28CAE",
    "namespace": "#D3BCDD",
    "decorator": "#F4A6CF",
    # 상태색
    "error": "#FF5C7A",
    "warning": "#F2C46D",
    "info": "#9FB0FF",
    "added": "#8CCFB0",
    "modified": "#BFA8FF",
    "deleted": "#FF5C7A",
}

LIGHT = {
    "name": "Sakura Gothic Light",
    "type": "light",
    # 라이트는 밝기 대신 미세한 톤 차이 + 경계선으로 깊이 표현
    "bg0": "#F1E5EE",
    "bg1": "#F6ECF3",
    "bg2": "#FDF8FB",
    "bg3": "#EFE0EA",
    "bg4": "#E6D0E0",
    "line": "#E3D1DE",
    "fg": "#2A1430",        # 외곽선 플럼
    "fg2": "#5E4466",
    "fg3": "#6C5474",
    "accent": "#C2186B",    # 진한 마젠타 (핫핑크를 라이트용으로 내림)
    "accent_fg": "#FFFFFF",
    "selection": "#F2C6DE",
    "find": "#C2186B",
    "comment": "#6C5474",
    "keyword": "#C2186B",
    "storage": "#B0306F",
    "string": "#9B3A6B",
    "escape": "#C2186B",
    "number": "#B4235A",
    "constant": "#8E3A9E",
    "function": "#5B3FB5",
    "type": "#3F51B5",
    "class": "#6A3FB0",
    "variable": "#2A1430",
    "param": "#5E3468",
    "property": "#6E3C7E",
    "tag": "#C2186B",
    "attr": "#7A3FA0",
    "operator": "#8A3E8E",
    "punct": "#6F5878",
    "namespace": "#5E4466",
    "decorator": "#A8326E",
    "error": "#B81D42",
    "warning": "#835200",
    "info": "#3F51B5",
    "added": "#256A4C",
    "modified": "#5B3FB5",
    "deleted": "#B81D42",
}

# ---------------------------------------------------------------
# Snow 변형: 겨울 일러스트 (핑크 설경, 마룬 외곽선, 라벤더 눈동자, 가로등 앰버)
# ---------------------------------------------------------------
SNOW_DARK = {
    "name": "Sakura Gothic Snow Dark",
    "type": "dark",
    "bg0": "#160A12", "bg1": "#1A0D15", "bg2": "#1F1019", "bg3": "#2B1723", "bg4": "#3B1F2F",
    "line": "#34192A",
    "fg": "#F8E1EE", "fg2": "#CFA5BD", "fg3": "#A6829A",
    "accent": "#FF8AC8", "accent_fg": "#1F1019",
    "selection": "#6A2F52", "find": "#FF8AC8",
    "comment": "#A6829A",
    "keyword": "#FF8AC8", "storage": "#F7A6D2", "string": "#FFD0E6", "escape": "#FFB3D9",
    "number": "#FFB4A8", "constant": "#F5D49A",   # 가로등 앰버
    "function": "#C9B8F5",                        # 눈동자 라벤더
    "type": "#AEABF2", "class": "#DCCBFA",
    "variable": "#F8E1EE", "param": "#EBC4DB", "property": "#E4B8D1",
    "tag": "#FF8AC8", "attr": "#DDA8D3", "operator": "#D99EC4", "punct": "#B28EA4",
    "namespace": "#DDBFD0", "decorator": "#F7A6D2",
    "error": "#FF6B82", "warning": "#F5D49A", "info": "#AEABF2",
    "added": "#9AD6BC", "modified": "#C9B8F5", "deleted": "#FF6B82",
}

SNOW_LIGHT = {
    "name": "Sakura Gothic Snow Light",
    "type": "light",
    # 일러스트 자체가 핑크 설경이라 라이트는 배경에 핑크 톤을 더 싣는다
    "bg0": "#F5D8E8", "bg1": "#FAE5F0", "bg2": "#FFF4F9", "bg3": "#F7DCEB", "bg4": "#F0C6DD",
    "line": "#EBCADC",
    "fg": "#4A0F2A", "fg2": "#74365A", "fg3": "#7E4466",
    "accent": "#B3125A", "accent_fg": "#FFFFFF",
    "selection": "#F5BBD8", "find": "#B3125A",
    "comment": "#7E4466",
    "keyword": "#B3125A", "storage": "#9E2C66", "string": "#9A3D67", "escape": "#B3125A",
    "number": "#B0263F", "constant": "#7E5000",
    "function": "#5A44B8", "type": "#3F48A8", "class": "#6A3CA6",
    "variable": "#4A0F2A", "param": "#6A2C55", "property": "#7A3466",
    "tag": "#B3125A", "attr": "#80338A", "operator": "#8E3570", "punct": "#734A62",
    "namespace": "#6A3A58", "decorator": "#A0306A",
    "error": "#B81D42", "warning": "#7E5000", "info": "#3F48A8",
    "added": "#236446", "modified": "#5A44B8", "deleted": "#B81D42",
}

# (팔레트, 출력 파일명). 새 변형은 여기에 한 줄 추가하면 끝
PALETTES = [
    (DARK, "sakura-gothic-dark-color-theme.json"),
    (LIGHT, "sakura-gothic-light-color-theme.json"),
    (SNOW_DARK, "sakura-gothic-snow-dark-color-theme.json"),
    (SNOW_LIGHT, "sakura-gothic-snow-light-color-theme.json"),
]


def a(hex_color: str, alpha: str) -> str:
    """#RRGGBB + 알파(hex 2자리). VS Code는 #RRGGBBAA를 지원한다."""
    return f"{hex_color}{alpha}"


def workbench(p: dict) -> dict:
    dark = p["type"] == "dark"
    return {
        # 기본
        "foreground": p["fg"],
        "descriptionForeground": p["fg2"],
        "disabledForeground": p["fg3"],
        "errorForeground": p["error"],
        "focusBorder": a(p["accent"], "99"),
        "contrastBorder": "#00000000",
        "widget.shadow": "#00000066" if dark else "#2A143018",
        "selection.background": a(p["accent"], "55"),
        "icon.foreground": p["fg2"],
        "textLink.foreground": p["accent"],
        "textLink.activeForeground": p["storage"],
        "textBlockQuote.background": p["bg1"],
        "textBlockQuote.border": p["accent"],
        "textCodeBlock.background": p["bg1"],
        "textPreformat.foreground": p["string"],
        "textSeparator.foreground": p["line"],
        "sash.hoverBorder": p["accent"],

        # 타이틀바
        "titleBar.activeBackground": p["bg0"],
        "titleBar.activeForeground": p["fg"],
        "titleBar.inactiveBackground": p["bg0"],
        "titleBar.inactiveForeground": p["fg3"],
        "titleBar.border": p["line"],
        "menubar.selectionBackground": p["bg3"],
        "menu.background": p["bg3"],
        "menu.foreground": p["fg"],
        "menu.selectionBackground": p["bg4"],
        "menu.selectionForeground": p["fg"],
        "menu.separatorBackground": p["line"],
        "menu.border": p["line"],
        "commandCenter.background": p["bg1"],
        "commandCenter.foreground": p["fg2"],
        "commandCenter.border": p["line"],
        "commandCenter.activeBackground": p["bg3"],

        # 액티비티바
        "activityBar.background": p["bg0"],
        "activityBar.foreground": p["accent"],
        "activityBar.inactiveForeground": p["fg3"],
        "activityBar.border": p["line"],
        "activityBar.activeBorder": p["accent"],
        "activityBar.activeBackground": "#00000000",
        "activityBarBadge.background": p["accent"],
        "activityBarBadge.foreground": p["accent_fg"],

        # 사이드바
        "sideBar.background": p["bg1"],
        "sideBar.foreground": p["fg2"],
        "sideBar.border": p["line"],
        "sideBarTitle.foreground": p["fg"],
        "sideBarSectionHeader.background": p["bg1"],
        "sideBarSectionHeader.foreground": p["fg"],
        "sideBarSectionHeader.border": p["line"],

        # 리스트, 트리
        "list.activeSelectionBackground": p["bg4"],
        "list.activeSelectionForeground": p["fg"],
        "list.inactiveSelectionBackground": p["bg3"],
        "list.inactiveSelectionForeground": p["fg"],
        "list.hoverBackground": p["bg3"],
        "list.hoverForeground": p["fg"],
        "list.focusBackground": p["bg4"],
        "list.focusOutline": a(p["accent"], "88"),
        "list.highlightForeground": p["accent"],
        "list.focusHighlightForeground": p["accent"],
        "list.errorForeground": p["error"],
        "list.warningForeground": p["warning"],
        "list.dropBackground": a(p["accent"], "22"),
        "tree.indentGuidesStroke": p["line"],
        "tree.inactiveIndentGuidesStroke": a(p["line"], "88"),

        # 에디터 그룹, 탭
        "editorGroup.border": p["line"],
        "editorGroupHeader.tabsBackground": p["bg1"],
        "editorGroupHeader.tabsBorder": p["line"],
        "editorGroupHeader.noTabsBackground": p["bg1"],
        "editorGroup.dropBackground": a(p["accent"], "18"),
        "tab.activeBackground": p["bg2"],
        "tab.activeForeground": p["fg"],
        "tab.activeBorderTop": p["accent"],
        "tab.activeBorder": p["bg2"],
        "tab.inactiveBackground": p["bg1"],
        "tab.inactiveForeground": p["fg3"],
        "tab.hoverBackground": p["bg3"],
        "tab.hoverForeground": p["fg"],
        "tab.border": p["line"],
        "tab.unfocusedActiveForeground": p["fg2"],
        "tab.unfocusedActiveBorderTop": a(p["accent"], "66"),
        "tab.activeModifiedBorder": p["accent"],
        "tab.inactiveModifiedBorder": a(p["accent"], "77"),
        "breadcrumb.foreground": p["fg3"],
        "breadcrumb.focusForeground": p["fg"],
        "breadcrumb.activeSelectionForeground": p["accent"],
        "breadcrumb.background": p["bg2"],
        "breadcrumbPicker.background": p["bg3"],

        # 에디터 본문
        "editor.background": p["bg2"],
        "editor.foreground": p["fg"],
        "editorLineNumber.foreground": p["fg3"] + ("99" if dark else "AA"),
        "editorLineNumber.activeForeground": p["accent"],
        "editorCursor.foreground": p["accent"],
        "editor.selectionBackground": a(p["selection"], "AA" if dark else "CC"),
        "editor.inactiveSelectionBackground": a(p["selection"], "55"),
        "editor.selectionHighlightBackground": a(p["selection"], "66"),
        "editor.wordHighlightBackground": a(p["function"], "22"),
        "editor.wordHighlightStrongBackground": a(p["accent"], "26"),
        "editor.findMatchBackground": a(p["find"], "55"),
        "editor.findMatchBorder": p["find"],
        "editor.findMatchHighlightBackground": a(p["find"], "26"),
        "editor.findRangeHighlightBackground": a(p["function"], "14"),
        "editor.lineHighlightBackground": a(p["bg3"], "88" if dark else "99"),
        "editor.lineHighlightBorder": "#00000000",
        "editor.rangeHighlightBackground": a(p["function"], "14"),
        "editor.hoverHighlightBackground": a(p["function"], "1C"),
        "editorLink.activeForeground": p["accent"],
        "editorWhitespace.foreground": a(p["fg3"], "40"),
        "editorIndentGuide.background1": a(p["line"], "CC"),
        "editorIndentGuide.activeBackground1": a(p["fg3"], "88"),
        "editorRuler.foreground": p["line"],
        "editorCodeLens.foreground": p["fg3"],
        "editorBracketMatch.background": a(p["accent"], "22"),
        "editorBracketMatch.border": a(p["accent"], "88"),
        # 괄호 페어 색: 캐릭터 팔레트 순환
        "editorBracketHighlight.foreground1": p["accent"],
        "editorBracketHighlight.foreground2": p["function"],
        "editorBracketHighlight.foreground3": p["type"],
        "editorBracketHighlight.foreground4": p["constant"],
        "editorBracketHighlight.foreground5": p["string"],
        "editorBracketHighlight.foreground6": p["number"],
        "editorBracketHighlight.unexpectedBracket.foreground": p["error"],
        "editorOverviewRuler.border": "#00000000",
        "editorOverviewRuler.errorForeground": p["error"],
        "editorOverviewRuler.warningForeground": p["warning"],
        "editorOverviewRuler.infoForeground": p["info"],
        "editorOverviewRuler.findMatchForeground": p["accent"],
        "editorOverviewRuler.addedForeground": p["added"],
        "editorOverviewRuler.modifiedForeground": p["modified"],
        "editorOverviewRuler.deletedForeground": p["deleted"],
        "editorError.foreground": p["error"],
        "editorWarning.foreground": p["warning"],
        "editorInfo.foreground": p["info"],
        "editorHint.foreground": p["fg3"],
        "editorGutter.background": p["bg2"],
        "editorGutter.addedBackground": p["added"],
        "editorGutter.modifiedBackground": p["modified"],
        "editorGutter.deletedBackground": p["deleted"],
        "editorGutter.foldingControlForeground": p["fg3"],
        "editorInlayHint.background": a(p["bg3"], "CC"),
        "editorInlayHint.foreground": p["fg3"],
        "editorGhostText.foreground": a(p["fg3"], "BB"),
        "editorStickyScroll.background": p["bg2"],
        "editorStickyScrollHover.background": p["bg3"],
        "editorUnnecessaryCode.opacity": "#000000AA",

        # 에디터 위젯
        "editorWidget.background": p["bg3"],
        "editorWidget.foreground": p["fg"],
        "editorWidget.border": p["line"],
        "editorSuggestWidget.background": p["bg3"],
        "editorSuggestWidget.border": p["line"],
        "editorSuggestWidget.foreground": p["fg"],
        "editorSuggestWidget.selectedBackground": p["bg4"],
        "editorSuggestWidget.highlightForeground": p["accent"],
        "editorSuggestWidget.focusHighlightForeground": p["accent"],
        "editorHoverWidget.background": p["bg3"],
        "editorHoverWidget.border": p["line"],
        "peekView.border": p["accent"],
        "peekViewEditor.background": p["bg1"],
        "peekViewEditor.matchHighlightBackground": a(p["accent"], "33"),
        "peekViewResult.background": p["bg1"],
        "peekViewResult.selectionBackground": p["bg4"],
        "peekViewResult.matchHighlightBackground": a(p["accent"], "33"),
        "peekViewTitle.background": p["bg3"],
        "peekViewTitleLabel.foreground": p["fg"],
        "peekViewTitleDescription.foreground": p["fg2"],
        "minimap.background": p["bg2"],
        "minimap.selectionHighlight": a(p["selection"], "CC"),
        "minimap.findMatchHighlight": p["accent"],
        "minimapSlider.background": a(p["fg3"], "22"),
        "minimapSlider.hoverBackground": a(p["fg3"], "33"),
        "minimapSlider.activeBackground": a(p["fg3"], "44"),
        "scrollbar.shadow": "#00000000",
        "scrollbarSlider.background": a(p["fg3"], "33"),
        "scrollbarSlider.hoverBackground": a(p["fg3"], "55"),
        "scrollbarSlider.activeBackground": a(p["accent"], "66"),

        # 입력, 버튼, 드롭다운
        "input.background": p["bg2"] if dark else "#FFFFFF",
        "input.foreground": p["fg"],
        "input.border": p["line"],
        "input.placeholderForeground": p["fg3"],
        "inputOption.activeBackground": a(p["accent"], "33"),
        "inputOption.activeBorder": p["accent"],
        "inputOption.activeForeground": p["fg"],
        "inputValidation.errorBackground": p["bg3"],
        "inputValidation.errorBorder": p["error"],
        "inputValidation.warningBackground": p["bg3"],
        "inputValidation.warningBorder": p["warning"],
        "inputValidation.infoBackground": p["bg3"],
        "inputValidation.infoBorder": p["info"],
        "dropdown.background": p["bg3"],
        "dropdown.foreground": p["fg"],
        "dropdown.border": p["line"],
        "dropdown.listBackground": p["bg3"],
        "button.background": p["accent"],
        "button.foreground": p["accent_fg"],
        "button.hoverBackground": p["storage"],
        "button.secondaryBackground": p["bg4"],
        "button.secondaryForeground": p["fg"],
        "button.secondaryHoverBackground": p["bg3"],
        "button.border": "#00000000",
        "checkbox.background": p["bg3"],
        "checkbox.border": p["line"],
        "checkbox.foreground": p["accent"],
        "badge.background": p["bg4"],
        "badge.foreground": p["fg"],
        "progressBar.background": p["accent"],
        "keybindingLabel.background": p["bg3"],
        "keybindingLabel.foreground": p["fg"],
        "keybindingLabel.border": p["line"],
        "keybindingLabel.bottomBorder": p["line"],

        # 퀵 인풋 (Ctrl+P)
        "quickInput.background": p["bg3"],
        "quickInput.foreground": p["fg"],
        "quickInputTitle.background": p["bg3"],
        "quickInputList.focusBackground": p["bg4"],
        "quickInputList.focusForeground": p["fg"],
        "pickerGroup.foreground": p["accent"],
        "pickerGroup.border": p["line"],

        # 패널, 터미널
        "panel.background": p["bg1"],
        "panel.border": p["line"],
        "panelTitle.activeForeground": p["fg"],
        "panelTitle.activeBorder": p["accent"],
        "panelTitle.inactiveForeground": p["fg3"],
        "panelSectionHeader.background": p["bg1"],
        "terminal.background": p["bg1"],
        "terminal.foreground": p["fg"],
        "terminalCursor.foreground": p["accent"],
        "terminal.selectionBackground": a(p["selection"], "AA"),
        "terminal.border": p["line"],
        "terminal.ansiBlack": "#2A1430" if dark else "#2A1430",
        "terminal.ansiRed": p["error"],
        "terminal.ansiGreen": p["added"],
        "terminal.ansiYellow": p["warning"],
        "terminal.ansiBlue": p["type"],
        "terminal.ansiMagenta": p["accent"],
        "terminal.ansiCyan": "#9ED8E6" if dark else "#1E7A8C",
        "terminal.ansiWhite": p["fg2"],
        "terminal.ansiBrightBlack": p["fg3"],
        "terminal.ansiBrightRed": "#FF8A9F" if dark else "#B01E40",
        "terminal.ansiBrightGreen": "#ADE3CA" if dark else "#246649",
        "terminal.ansiBrightYellow": "#F7D894" if dark else "#7A4E00",
        "terminal.ansiBrightBlue": p["function"],
        "terminal.ansiBrightMagenta": p["string"],
        "terminal.ansiBrightCyan": "#C2E9F2" if dark else "#155F6E",
        "terminal.ansiBrightWhite": p["fg"],

        # 상태바
        "statusBar.background": p["bg0"],
        "statusBar.foreground": p["fg2"],
        "statusBar.border": p["line"],
        "statusBar.noFolderBackground": p["bg0"],
        "statusBar.debuggingBackground": p["accent"],
        "statusBar.debuggingForeground": p["accent_fg"],
        "statusBarItem.hoverBackground": p["bg3"],
        "statusBarItem.remoteBackground": p["accent"],
        "statusBarItem.remoteForeground": p["accent_fg"],
        "statusBarItem.errorBackground": p["error"],
        "statusBarItem.errorForeground": "#FFFFFF",
        "statusBarItem.warningBackground": p["warning"],
        "statusBarItem.warningForeground": "#1C1222",
        "statusBarItem.prominentBackground": p["bg4"],

        # 알림
        "notifications.background": p["bg3"],
        "notifications.foreground": p["fg"],
        "notifications.border": p["line"],
        "notificationCenterHeader.background": p["bg3"],
        "notificationToast.border": p["line"],
        "notificationsErrorIcon.foreground": p["error"],
        "notificationsWarningIcon.foreground": p["warning"],
        "notificationsInfoIcon.foreground": p["info"],
        "notificationLink.foreground": p["accent"],

        # Git, SCM
        "gitDecoration.addedResourceForeground": p["added"],
        "gitDecoration.modifiedResourceForeground": p["modified"],
        "gitDecoration.deletedResourceForeground": p["deleted"],
        "gitDecoration.untrackedResourceForeground": p["added"],
        "gitDecoration.ignoredResourceForeground": a(p["fg3"], "99"),
        "gitDecoration.conflictingResourceForeground": p["warning"],
        "gitDecoration.renamedResourceForeground": p["type"],
        "diffEditor.insertedTextBackground": a(p["added"], "22"),
        "diffEditor.removedTextBackground": a(p["deleted"], "22"),
        "diffEditor.insertedLineBackground": a(p["added"], "14"),
        "diffEditor.removedLineBackground": a(p["deleted"], "14"),
        "diffEditor.diagonalFill": p["line"],
        "merge.currentHeaderBackground": a(p["added"], "44"),
        "merge.currentContentBackground": a(p["added"], "18"),
        "merge.incomingHeaderBackground": a(p["type"], "44"),
        "merge.incomingContentBackground": a(p["type"], "18"),

        # 디버그
        "debugToolBar.background": p["bg3"],
        "debugIcon.breakpointForeground": p["accent"],
        "editor.stackFrameHighlightBackground": a(p["warning"], "22"),
        "editor.focusedStackFrameHighlightBackground": a(p["added"], "22"),

        # 기타
        "welcomePage.tileBackground": p["bg1"],
        "welcomePage.tileHoverBackground": p["bg3"],
        "walkThrough.embeddedEditorBackground": p["bg1"],
        "settings.headerForeground": p["fg"],
        "settings.modifiedItemIndicator": p["accent"],
        "editorMarkerNavigation.background": p["bg3"],
        "chat.requestBackground": p["bg2"],
        "chat.slashCommandForeground": p["accent"],
    }


def tokens(p: dict) -> list:
    def r(name, scope, fg, style=None):
        s = {"foreground": fg}
        if style is not None:
            s["fontStyle"] = style
        return {"name": name, "scope": scope, "settings": s}

    return [
        r("Comment", ["comment", "punctuation.definition.comment", "string.comment"], p["comment"], "italic"),
        r("Doc comment tag", ["storage.type.class.jsdoc", "keyword.other.documentation", "comment.block.documentation keyword"], p["storage"], "italic"),
        r("String", ["string", "string.quoted", "string.template", "punctuation.definition.string"], p["string"]),
        r("String escape", ["constant.character.escape", "constant.character.format", "constant.other.placeholder"], p["escape"]),
        r("Regex", ["string.regexp"], p["constant"]),
        r("Number", ["constant.numeric"], p["number"]),
        r("Language constant", ["constant.language", "support.constant", "constant.other", "variable.other.constant", "variable.other.enummember"], p["constant"]),
        r("Keyword", ["keyword", "keyword.control", "keyword.other.using", "keyword.other.import", "keyword.other.package"], p["keyword"]),
        r("Operator", ["keyword.operator", "punctuation.accessor", "punctuation.separator.key-value"], p["operator"], ""),
        r("Keyword operator words", ["keyword.operator.new", "keyword.operator.expression", "keyword.operator.logical.python", "keyword.operator.sizeof", "keyword.operator.wordlike"], p["keyword"]),
        r("Storage", ["storage", "storage.type", "storage.modifier"], p["storage"]),
        r("Function", ["entity.name.function", "support.function", "meta.function-call entity.name.function", "variable.function"], p["function"]),
        r("Type", ["entity.name.type", "support.type", "storage.type.primitive", "storage.type.built-in", "keyword.type", "storage.type.cs", "storage.type.kotlin"], p["type"]),
        r("Class", ["entity.name.class", "entity.name.struct", "entity.name.interface", "entity.name.enum", "support.class", "entity.other.inherited-class"], p["class"]),
        r("Namespace", ["entity.name.namespace", "entity.name.package", "entity.name.module", "storage.modifier.import", "storage.modifier.package"], p["namespace"]),
        r("Variable", ["variable", "variable.other", "meta.definition.variable"], p["variable"]),
        r("Parameter", ["variable.parameter", "meta.parameter"], p["param"], "italic"),
        r("Language variable", ["variable.language", "variable.language.this", "variable.language.self", "variable.language.super"], p["keyword"], "italic"),
        r("Property", ["variable.other.property", "variable.other.object.property", "support.variable.property", "meta.object-literal.key", "variable.other.member", "entity.name.variable.field", "support.type.property-name"], p["property"]),
        r("Decorator / Attribute", ["meta.decorator", "entity.name.function.decorator", "punctuation.decorator", "meta.attribute", "storage.type.annotation", "entity.name.type.annotation", "punctuation.definition.annotation"], p["decorator"]),
        r("Preprocessor", ["meta.preprocessor", "keyword.control.directive", "punctuation.definition.directive", "keyword.preprocessor"], p["decorator"]),
        r("Macro", ["entity.name.function.preprocessor", "entity.name.macro"], p["constant"]),
        r("Punctuation", ["punctuation", "meta.brace", "punctuation.terminator", "punctuation.separator"], p["punct"]),
        r("Tag", ["entity.name.tag", "punctuation.definition.tag"], p["tag"]),
        r("Tag attribute", ["entity.other.attribute-name"], p["attr"], "italic"),
        r("CSS selector", ["entity.other.attribute-name.class.css", "entity.other.attribute-name.id.css", "entity.name.tag.css"], p["function"], ""),
        r("CSS property value", ["support.constant.property-value", "meta.property-value"], p["string"]),
        r("CSS unit", ["keyword.other.unit"], p["number"]),
        r("JSON key 1", ["source.json meta.structure.dictionary.json support.type.property-name.json"], p["accent"]),
        r("JSON key 2", ["source.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json support.type.property-name.json"], p["function"]),
        r("JSON key 3", ["source.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json support.type.property-name.json"], p["type"]),
        r("Markdown heading", ["markup.heading", "entity.name.section.markdown", "punctuation.definition.heading.markdown"], p["accent"], "bold"),
        r("Markdown bold", ["markup.bold"], p["storage"], "bold"),
        r("Markdown italic", ["markup.italic"], p["constant"], "italic"),
        r("Markdown code", ["markup.inline.raw", "markup.fenced_code.block"], p["string"]),
        r("Markdown link", ["markup.underline.link", "string.other.link"], p["function"]),
        r("Markdown quote", ["markup.quote"], p["fg2"], "italic"),
        r("Markdown list", ["punctuation.definition.list"], p["accent"]),
        r("Diff inserted", ["markup.inserted"], p["added"]),
        r("Diff deleted", ["markup.deleted"], p["deleted"]),
        r("Diff changed", ["markup.changed"], p["modified"]),
        r("Invalid", ["invalid", "invalid.illegal"], p["error"]),
        r("Deprecated", ["invalid.deprecated"], p["warning"], "strikethrough"),
    ]


def semantic(p: dict) -> dict:
    return {
        "namespace": p["namespace"],
        "class": p["class"],
        "struct": p["class"],
        "interface": {"foreground": p["class"], "italic": True},
        "enum": p["class"],
        "enumMember": p["constant"],
        "typeParameter": {"foreground": p["type"], "italic": True},
        "type": p["type"],
        "function": p["function"],
        "method": p["function"],
        "macro": p["constant"],
        "property": p["property"],
        "field": p["property"],
        "event": p["decorator"],
        "parameter": {"foreground": p["param"], "italic": True},
        "variable": p["variable"],
        "variable.readonly": p["constant"],
        "property.readonly": p["constant"],
        "variable.defaultLibrary": p["constant"],
        "keyword": p["keyword"],
        "decorator": p["decorator"],
        "annotation": p["decorator"],
        "label": p["fg2"],
        "*.deprecated": {"strikethrough": True},
    }


def build(p: dict) -> dict:
    return {
        "$schema": "vscode://schemas/color-theme",
        "name": p["name"],
        "type": p["type"],
        "semanticHighlighting": True,
        "colors": workbench(p),
        "tokenColors": tokens(p),
        "semanticTokenColors": semantic(p),
    }


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for p, fname in PALETTES:
        (OUT / fname).write_text(json.dumps(build(p), indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        print(f"wrote themes/{fname}")


if __name__ == "__main__":
    main()
