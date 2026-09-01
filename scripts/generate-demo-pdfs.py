from __future__ import annotations

from pathlib import Path
from shutil import copy2

from reportlab.lib.colors import Color, HexColor, white
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "output" / "pdf"
PUBLIC_DIR = ROOT / "public" / "demo-files"
PAGE_W, PAGE_H = A4

INK = HexColor("#152033")
MUTED = HexColor("#60708A")
INDIGO = HexColor("#5B5CE2")
CYAN = HexColor("#25C2D7")
MINT = HexColor("#32C997")
PALE = HexColor("#F3F5FA")
LINE = HexColor("#DCE2EC")
AMBER = HexColor("#F6A723")
NAVY = HexColor("#0E1728")


def register_fonts() -> tuple[str, str]:
    regular = Path("C:/Windows/Fonts/YuGothR.ttc")
    bold = Path("C:/Windows/Fonts/YuGothB.ttc")
    if regular.exists() and bold.exists():
        pdfmetrics.registerFont(TTFont("DemoSans", str(regular), subfontIndex=0))
        pdfmetrics.registerFont(TTFont("DemoSansBold", str(bold), subfontIndex=0))
        return "DemoSans", "DemoSansBold"
    return "Helvetica", "Helvetica-Bold"


FONT, FONT_BOLD = register_fonts()


def rounded_box(c: canvas.Canvas, x: float, y: float, w: float, h: float, fill, radius=10):
    c.setFillColor(fill)
    c.setStrokeColor(fill)
    c.roundRect(x, y, w, h, radius, fill=1, stroke=0)


def draw_text(c: canvas.Canvas, text: str, x: float, y: float, size: float, color=INK, bold=False):
    c.setFillColor(color)
    c.setFont(FONT_BOLD if bold else FONT, size)
    c.drawString(x, y, text)


def wrap_lines(c: canvas.Canvas, text: str, max_width: float, size: float, bold=False) -> list[str]:
    font = FONT_BOLD if bold else FONT
    if " " not in text or any(ord(char) > 127 for char in text):
        lines: list[str] = []
        current = ""
        for char in text:
            candidate = current + char
            if c.stringWidth(candidate, font, size) <= max_width:
                current = candidate
            else:
                if current:
                    lines.append(current)
                current = char
        if current:
            lines.append(current)
        return lines

    words = text.split()
    lines = []
    current = ""
    for word in words:
        candidate = word if not current else f"{current} {word}"
        if c.stringWidth(candidate, font, size) <= max_width:
            current = candidate
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def paragraph(c: canvas.Canvas, text: str, x: float, y: float, max_width: float, size=9.5, leading=14, color=MUTED, bold=False):
    for index, line in enumerate(wrap_lines(c, text, max_width, size, bold)):
        draw_text(c, line, x, y - index * leading, size, color, bold)


def header(c: canvas.Canvas, locale: str, page: int):
    c.setFillColor(NAVY)
    c.rect(0, PAGE_H - 94, PAGE_W, 94, fill=1, stroke=0)
    rounded_box(c, 40, PAGE_H - 64, 28, 28, INDIGO, 8)
    c.setStrokeColor(white)
    c.setLineWidth(2.2)
    c.line(48, PAGE_H - 50, 54, PAGE_H - 56)
    c.line(54, PAGE_H - 56, 61, PAGE_H - 46)
    draw_text(c, "RELAYBRIDGE", 78, PAGE_H - 49, 11, white, True)
    draw_text(c, "AX-400 / E-17", 40, PAGE_H - 82, 7.5, HexColor("#9FB0CC"), True)
    page_label = f"SERVICE BULLETIN  •  {page:02d}" if locale == "en" else f"サービス速報  •  {page:02d}"
    draw_text(c, page_label, PAGE_W - 170, PAGE_H - 60, 7.5, HexColor("#9FB0CC"), True)


def footer(c: canvas.Canvas, locale: str):
    c.setStrokeColor(LINE)
    c.line(40, 36, PAGE_W - 40, 36)
    note = "SIMULATED DOCUMENT • FOR DEMONSTRATION ONLY" if locale == "en" else "デモンストレーション用のシミュレーション文書"
    draw_text(c, note, 40, 22, 6.8, MUTED, True)
    draw_text(c, "RB-AX400-017", PAGE_W - 114, 22, 6.8, MUTED, True)


COPY = {
    "en": {
        "title": "E-17 pressure alert",
        "subtitle": "Field inspection guide / Cooling circuit",
        "status": "PRIORITY 2",
        "time": "Estimated check: 8 min",
        "summary": "Condition summary",
        "summary_body": "An E-17 event can appear when the inlet pressure sensor connection is interrupted after a restart. Keep the unit stopped while completing this visual check.",
        "safety": "Before you begin",
        "safety_body": "Confirm the AX-400 is in maintenance mode. Do not open sealed electrical compartments. This demonstration procedure does not replace site safety rules.",
        "steps": [
            ("Confirm the display", "Verify that E-17 is active and record the inlet pressure shown on the operator panel."),
            ("Inspect connector C4", "Locate the lower-right sensor connector. Check that the collar is aligned and fully seated."),
            ("Restart the sensor check", "After the connector is secure, run the panel check and confirm pressure returns above 2.0 bar."),
        ],
        "page2_title": "Connector C4 verification",
        "page2_subtitle": "Use the visual references below before returning the unit to service.",
        "signal": "Expected signal",
        "signal_body": "Stable green indicator / pressure above 2.0 bar",
        "reading": "PRESSURE READING",
        "before": "Before check",
        "after": "After reseat",
        "decision": "Completion criteria",
        "decision_body": "If E-17 clears and the reading remains stable for 30 seconds, return the unit to standby. If the alert remains, keep the unit stopped and escalate with the panel photo attached.",
        "support": "Translated support thread",
        "support_body": "Reference this bulletin in the RelayBridge case so the technician, engineer and customer receive the same localized instructions.",
        "callout": "ALIGN MARKS",
        "callout2": "SEAT COLLAR",
    },
    "ja": {
        "title": "E-17 圧力アラート",
        "subtitle": "現場点検ガイド / 冷却回路",
        "status": "優先度 2",
        "time": "推定点検時間：8分",
        "summary": "状態の概要",
        "summary_body": "再起動後に入口圧力センサーの接続が不安定になると、E-17 が表示される場合があります。目視点検が完了するまで装置を停止状態にしてください。",
        "safety": "作業を始める前に",
        "safety_body": "AX-400 がメンテナンスモードであることを確認してください。密閉された電気区画は開けないでください。このデモ手順は現場の安全規則に代わるものではありません。",
        "steps": [
            ("表示を確認", "E-17 が有効であることを確認し、操作パネルに表示される入口圧力を記録します。"),
            ("コネクター C4 を点検", "右下のセンサーコネクターを確認し、カラーの位置が合って完全に差し込まれていることを確認します。"),
            ("センサーチェックを再実行", "接続を固定した後、パネルチェックを実行し、圧力が 2.0 bar を超えることを確認します。"),
        ],
        "page2_title": "コネクター C4 の確認",
        "page2_subtitle": "装置を運転に戻す前に、以下の目視基準を確認してください。",
        "signal": "期待される信号",
        "signal_body": "緑色の表示が安定 / 圧力 2.0 bar 以上",
        "reading": "圧力測定値",
        "before": "点検前",
        "after": "再接続後",
        "decision": "完了条件",
        "decision_body": "E-17 が解除され、測定値が 30 秒間安定している場合は、装置をスタンバイに戻します。アラートが続く場合は停止を維持し、パネル写真を添付して担当者へ連絡してください。",
        "support": "翻訳済みサポートスレッド",
        "support_body": "RelayBridge のケースで本書を参照すると、技術者、エンジニア、お客様が同じ内容をそれぞれの言語で確認できます。",
        "callout": "位置マークを合わせる",
        "callout2": "カラーを固定",
    },
}


def page_one(c: canvas.Canvas, locale: str):
    t = COPY[locale]
    header(c, locale, 1)
    draw_text(c, t["title"], 40, PAGE_H - 140, 25, INK, True)
    draw_text(c, t["subtitle"], 40, PAGE_H - 161, 9.5, MUTED)
    rounded_box(c, 40, PAGE_H - 207, 94, 25, Color(0.96, 0.69, 0.2, alpha=0.16), 12)
    draw_text(c, t["status"], 52, PAGE_H - 199, 7.5, AMBER, True)
    draw_text(c, t["time"], 151, PAGE_H - 199, 8, MUTED, True)

    rounded_box(c, 40, PAGE_H - 328, PAGE_W - 80, 96, PALE, 14)
    rounded_box(c, 55, PAGE_H - 264, 28, 28, INDIGO, 8)
    draw_text(c, "i", 66, PAGE_H - 256, 12, white, True)
    draw_text(c, t["summary"], 96, PAGE_H - 253, 11, INK, True)
    paragraph(c, t["summary_body"], 96, PAGE_H - 275, PAGE_W - 152, 8.9, 13)

    rounded_box(c, 40, PAGE_H - 426, PAGE_W - 80, 76, HexColor("#FFF8EA"), 14)
    draw_text(c, "!", 57, PAGE_H - 384, 13, AMBER, True)
    draw_text(c, t["safety"], 88, PAGE_H - 378, 10.5, INK, True)
    paragraph(c, t["safety_body"], 88, PAGE_H - 399, PAGE_W - 144, 8.3, 12.5)

    y = PAGE_H - 486
    for index, (title, body) in enumerate(t["steps"], 1):
        c.setFillColor(white)
        c.setStrokeColor(LINE)
        c.roundRect(40, y - 72, PAGE_W - 80, 66, 12, fill=1, stroke=1)
        c.setFillColor(INDIGO if index < 3 else CYAN)
        c.circle(68, y - 39, 15, fill=1, stroke=0)
        draw_text(c, str(index), 64, y - 44, 10, white, True)
        draw_text(c, title, 97, y - 29, 10, INK, True)
        paragraph(c, body, 97, y - 49, PAGE_W - 160, 8.1, 12)
        y -= 79
    footer(c, locale)


def page_two(c: canvas.Canvas, locale: str):
    t = COPY[locale]
    header(c, locale, 2)
    draw_text(c, t["page2_title"], 40, PAGE_H - 140, 23, INK, True)
    draw_text(c, t["page2_subtitle"], 40, PAGE_H - 163, 9, MUTED)

    rounded_box(c, 40, PAGE_H - 440, 292, 238, NAVY, 16)
    c.setFillColor(HexColor("#263349"))
    c.roundRect(83, PAGE_H - 396, 205, 155, 14, fill=1, stroke=0)
    c.setFillColor(HexColor("#111927"))
    c.roundRect(113, PAGE_H - 374, 145, 111, 10, fill=1, stroke=0)
    c.setFillColor(HexColor("#73819A"))
    c.circle(153, PAGE_H - 319, 26, fill=1, stroke=0)
    c.setFillColor(HexColor("#1E2A3C"))
    c.circle(153, PAGE_H - 319, 16, fill=1, stroke=0)
    c.setFillColor(CYAN)
    c.rect(150, PAGE_H - 291, 6, 13, fill=1, stroke=0)
    c.setFillColor(HexColor("#AFB8C7"))
    c.roundRect(184, PAGE_H - 343, 49, 48, 8, fill=1, stroke=0)
    c.setFillColor(HexColor("#303D51"))
    c.roundRect(193, PAGE_H - 333, 31, 29, 5, fill=1, stroke=0)
    c.setStrokeColor(CYAN)
    c.setLineWidth(2)
    c.line(153, PAGE_H - 289, 153, PAGE_H - 255)
    c.line(153, PAGE_H - 255, 90, PAGE_H - 238)
    c.setFillColor(CYAN)
    c.circle(90, PAGE_H - 238, 3, fill=1, stroke=0)
    c.line(224, PAGE_H - 316, 277, PAGE_H - 287)
    c.circle(277, PAGE_H - 287, 3, fill=1, stroke=0)
    draw_text(c, t["callout"], 54, PAGE_H - 229, 7.2, white, True)
    draw_text(c, t["callout2"], 199, PAGE_H - 271, 7.2, white, True)
    draw_text(c, "C4", 56, PAGE_H - 418, 9, HexColor("#9FB0CC"), True)

    rounded_box(c, 350, PAGE_H - 308, PAGE_W - 390, 106, PALE, 14)
    rounded_box(c, 365, PAGE_H - 236, 28, 28, MINT, 8)
    draw_text(c, "✓", 371, PAGE_H - 229, 12, white, True)
    draw_text(c, t["signal"], 405, PAGE_H - 226, 10, INK, True)
    paragraph(c, t["signal_body"], 365, PAGE_H - 264, PAGE_W - 430, 8.4, 13)

    rounded_box(c, 350, PAGE_H - 440, PAGE_W - 390, 116, white, 14)
    c.setStrokeColor(LINE)
    c.roundRect(350, PAGE_H - 440, PAGE_W - 390, 116, 14, fill=0, stroke=1)
    draw_text(c, t["reading"], 365, PAGE_H - 348, 7.2, MUTED, True)
    draw_text(c, "1.4", 365, PAGE_H - 389, 25, AMBER, True)
    draw_text(c, "bar", 409, PAGE_H - 388, 8, MUTED, True)
    draw_text(c, t["before"], 365, PAGE_H - 412, 7.5, MUTED)
    draw_text(c, "2.2", 472, PAGE_H - 389, 25, MINT, True)
    draw_text(c, "bar", 518, PAGE_H - 388, 8, MUTED, True)
    draw_text(c, t["after"], 472, PAGE_H - 412, 7.5, MUTED)

    rounded_box(c, 40, PAGE_H - 583, PAGE_W - 80, 116, PALE, 14)
    draw_text(c, t["decision"], 58, PAGE_H - 493, 11, INK, True)
    paragraph(c, t["decision_body"], 58, PAGE_H - 518, PAGE_W - 116, 8.7, 13.5)

    rounded_box(c, 40, PAGE_H - 704, PAGE_W - 80, 94, HexColor("#EEF8FA"), 14)
    rounded_box(c, 56, PAGE_H - 649, 30, 30, CYAN, 9)
    c.setStrokeColor(white)
    c.setLineWidth(2)
    c.line(63, PAGE_H - 635, 70, PAGE_H - 642)
    c.line(70, PAGE_H - 642, 80, PAGE_H - 631)
    draw_text(c, t["support"], 101, PAGE_H - 632, 10.5, INK, True)
    paragraph(c, t["support_body"], 101, PAGE_H - 655, PAGE_W - 160, 8.2, 12.5)
    footer(c, locale)


def build(locale: str):
    suffix = "EN" if locale == "en" else "JA"
    output = OUTPUT_DIR / f"AX-400_E17_Service_Bulletin_{suffix}.pdf"
    c = canvas.Canvas(str(output), pagesize=A4)
    c.setTitle(f"AX-400 E-17 Service Bulletin ({suffix})")
    c.setAuthor("RelayBridge Demo")
    page_one(c, locale)
    c.showPage()
    page_two(c, locale)
    c.showPage()
    c.save()
    copy2(output, PUBLIC_DIR / output.name)
    return output


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
    for locale in ("en", "ja"):
        print(build(locale))


if __name__ == "__main__":
    main()
