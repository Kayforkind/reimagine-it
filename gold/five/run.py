"""Run the five fixtures. Write gold/five/RESULTS.md from live exits and output."""

from __future__ import annotations

import json
import os
import shutil
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent
REPO = ROOT.parent.parent
PY = sys.executable
RESULTS = ROOT / "RESULTS.md"
RESULTS_JSON = ROOT / "RESULTS.json"
RESULTS_SVG = ROOT / "RUN.svg"

DARK = "#0c0e12"
DIM = "#8b97a4"
TEXT = "#e8edf4"
RED = "#e08e7e"
RED_INK = "#3a1a1a"
RED_STROKE = "#7a2f2f"
GREEN = "#7ee0c0"
GREEN_INK = "#04251c"
GREEN_STROKE = "#1e5c4d"
PANEL = "#171c24"
PANEL_STROKE = "#2a3340"
GREEN_PANEL = "#12352c"
RED_PANEL = "#3a1a1a"


def capture(
    args: list[str],
    cwd: Path,
    stdin: str | None = None,
    extra_env: dict[str, str] | None = None,
) -> dict[str, object]:
    env = None
    if extra_env:
        env = dict(os.environ)
        env.update(extra_env)
    proc = subprocess.run(
        [PY, *args],
        cwd=str(cwd),
        input=stdin,
        capture_output=True,
        text=True,
        encoding="utf-8",
        env=env,
    )
    return {
        "cmd": " ".join(args),
        "cwd": str(cwd.relative_to(REPO)).replace("\\", "/"),
        "exit": proc.returncode,
        "stdout": proc.stdout,
        "stderr": proc.stderr,
        "stdin": stdin is not None,
    }


def expect(row: dict[str, object], code: int) -> dict[str, object]:
    row["expect"] = code
    row["pass"] = row["exit"] == code
    return row


def two_panel_svg(
    out: Path,
    title: str,
    left_title: str,
    left_body: list[str],
    left_color: str,
    right_title: str,
    right_body: list[str],
    right_color: str,
    footer: str,
    width: int = 720,
    height: int = 300,
) -> None:
    panel_w = (width - 60) // 2 - 20
    left_x = 20
    right_x = width - panel_w - 20
    left_panel = GREEN_PANEL if left_color == GREEN else (RED_PANEL if left_color == RED else PANEL)
    left_stroke = GREEN_STROKE if left_color == GREEN else (RED_STROKE if left_color == RED else PANEL_STROKE)
    right_panel = GREEN_PANEL if right_color == GREEN else (RED_PANEL if right_color == RED else PANEL)
    right_stroke = GREEN_STROKE if right_color == GREEN else (RED_STROKE if right_color == RED else PANEL_STROKE)
    parts: list[str] = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" '
        f'role="img" aria-label="{title}">',
        f'<title>{title}</title>',
        f'<rect width="100%" height="100%" fill="{DARK}"/>',
        (
            f'<text x="20" y="34" fill="{DIM}" font-size="11" letter-spacing="2.4" '
            'font-family="ui-sans-serif, system-ui, Segoe UI, sans-serif">'
            f'{title.upper()}</text>'
        ),
        (
            f'<rect x="{left_x}" y="58" width="{panel_w}" height="{height - 120}" rx="10" '
            f'fill="{left_panel}" stroke="{left_stroke}"/>'
        ),
        (
            f'<text x="{left_x + 18}" y="88" fill="{left_color}" font-size="12" letter-spacing="2" '
            'font-family="ui-sans-serif, system-ui, Segoe UI, sans-serif">'
            f'{left_title}</text>'
        ),
    ]
    y = 116
    for line in left_body:
        parts.append(
            f'<text x="{left_x + 18}" y="{y}" fill="{TEXT}" font-size="13" '
            'font-family="ui-monospace, Consolas, Menlo, monospace">'
            f'{line}</text>'
        )
        y += 22
    parts.extend(
        [
            (
                f'<rect x="{right_x}" y="58" width="{panel_w}" height="{height - 120}" rx="10" '
                f'fill="{right_panel}" stroke="{right_stroke}"/>'
            ),
            (
                f'<text x="{right_x + 18}" y="88" fill="{right_color}" font-size="12" letter-spacing="2" '
                'font-family="ui-sans-serif, system-ui, Segoe UI, sans-serif">'
                f'{right_title}</text>'
            ),
        ]
    )
    y = 116
    for line in right_body:
        parts.append(
            f'<text x="{right_x + 18}" y="{y}" fill="{TEXT}" font-size="13" '
            'font-family="ui-monospace, Consolas, Menlo, monospace">'
            f'{line}</text>'
        )
        y += 22

    arrow_cx = width // 2
    arrow_cy = 58 + (height - 120) // 2
    parts.extend(
        [
            f'<path d="M {arrow_cx - 14} {arrow_cy} L {arrow_cx + 14} {arrow_cy}" '
            f'stroke="{GREEN}" stroke-width="2" fill="none"/>',
            f'<path d="M {arrow_cx + 6} {arrow_cy - 6} L {arrow_cx + 14} {arrow_cy} '
            f'L {arrow_cx + 6} {arrow_cy + 6}" '
            f'stroke="{GREEN}" stroke-width="2" fill="none"/>',
            (
                f'<text x="{arrow_cx}" y="{arrow_cy - 12}" fill="{GREEN}" font-size="10" '
                'letter-spacing="2" text-anchor="middle" '
                'font-family="ui-sans-serif, system-ui, Segoe UI, sans-serif">SHIP</text>'
            ),
            (
                f'<text x="20" y="{height - 24}" fill="{DIM}" font-size="11" '
                'font-family="ui-sans-serif, system-ui, Segoe UI, sans-serif">'
                f'{footer}</text>'
            ),
            '</svg>\n',
        ]
    )
    out.write_text("\n".join(parts), encoding="utf-8")


def viz_01(rows: list[dict[str, object]]) -> None:
    piped = rows[0]
    ok = rows[1]
    empty = rows[2]
    bytes_str = ""
    for line in (ok["stdout"] or "").splitlines():
        if '"bytes"' in line:
            bytes_str = line.strip()
            break
    out = ROOT / "01-cli" / "pipe.svg"
    two_panel_svg(
        out,
        title="CLI stdin",
        left_title=f"BEFORE  exit {piped['exit']}",
        left_body=[
            "$ python before.py",
            "stdin: piped",
            "usage: before.py FILE",
        ],
        left_color=RED,
        right_title=f"AFTER  exit {ok['exit']}",
        right_body=[
            "$ python after.py --stdin",
            "stdin: piped",
            bytes_str or '{"stdin": true, "bytes": ?}',
        ],
        right_color=GREEN,
        footer=f"empty stdin still fails (exit {empty['exit']}). tested run.",
    )


def viz_02(rows: list[dict[str, object]]) -> None:
    broken = rows[1]
    green = rows[2]
    out = ROOT / "02-door" / "door.svg"
    two_panel_svg(
        out,
        title="First-run door",
        left_title=f"LOCKED  exit {broken['exit']}",
        left_body=[
            "$ python after.py",
            "FAIL",
            "copy door.example",
            "  to door.txt",
        ],
        left_color=RED,
        right_title=f"OPEN  exit {green['exit']}",
        right_body=[
            "$ cp door.example door.txt",
            "$ python after.py",
            "OK",
        ],
        right_color=GREEN,
        footer="one command copies the door. no lecture. tested run.",
    )


def viz_04(rows: list[dict[str, object]]) -> None:
    red = rows[0]
    green = rows[1]
    out = ROOT / "04-layers" / "layers.svg"
    two_panel_svg(
        out,
        title="Layer law",
        left_title=f"FAIL  exit {red['exit']}",
        left_body=[
            "pkg_b/core.py",
            "  imports pkg_a.internal",
            "layer law broken",
        ],
        left_color=RED,
        right_title=f"HELD  exit {green['exit']}",
        right_body=[
            "pkg_b/core.py",
            "  imports pkg_a.public",
            "layer law held",
        ],
        right_color=GREEN,
        footer="same file, one import moved from internal to public. tested run.",
    )


def run_01() -> list[dict[str, object]]:
    cwd = ROOT / "01-cli"
    piped = capture(["before.py"], cwd, stdin="hello from a pipe\n")
    after = capture(["after.py", "--stdin"], cwd, stdin="hello from a pipe\n")
    empty = capture(["after.py", "--stdin"], cwd, stdin="\n")
    return [
        expect(piped, 2),
        expect(after, 0),
        expect(empty, 1),
    ]


def run_02() -> list[dict[str, object]]:
    cwd = ROOT / "02-door"
    door = cwd / "door.txt"
    if door.exists():
        door.unlink()
    lecture = capture(["before.py"], cwd)
    broken = capture(["after.py"], cwd)
    shutil.copyfile(cwd / "door.example", door)
    green = capture(["after.py"], cwd)
    door.unlink(missing_ok=True)
    return [
        expect(lecture, 1),
        expect(broken, 1),
        expect(green, 0),
    ]


def run_03() -> list[dict[str, object]]:
    cwd = ROOT / "03-ledger"
    dump = capture(["before.py"], cwd)
    html = capture(["after.py"], cwd)
    index = cwd / "index.html"
    body = index.read_text(encoding="utf-8") if index.is_file() else ""
    titles = ["stdin-pipe", "first-run-door", "layer-law"]
    missing = [t for t in titles if t not in body]
    check = {
        "cmd": "assert titles in index.html",
        "cwd": "gold/five/03-ledger",
        "exit": 1 if missing else 0,
        "stdout": f"missing={missing}\n" if missing else "all three titles present\n",
        "stderr": "",
    }
    return [
        expect(dump, 0),
        expect(html, 0),
        expect(check, 0),
    ]


def run_04() -> list[dict[str, object]]:
    cwd = ROOT / "04-layers"
    core = cwd / "pkg_b" / "core.py"
    before = cwd / "pkg_b" / "core_before.py"
    after = cwd / "pkg_b" / "core_after.py"
    shutil.copyfile(before, core)
    red = capture(["check.py"], cwd)
    shutil.copyfile(after, core)
    green = capture(["check.py"], cwd)
    return [expect(red, 1), expect(green, 0)]


def run_05() -> list[dict[str, object]]:
    gold = REPO / "gold"
    shipped = gold / "shipped.json"
    backup = gold / "shipped.json.bak"
    had = shipped.is_file()
    if had:
        shutil.copyfile(shipped, backup)
    try:
        fail = capture(["reimagine.py", "--fail"], gold)
        ship = capture(["reimagine.py", "--ship"], gold)
        return [expect(fail, 1), expect(ship, 0)]
    finally:
        if backup.is_file():
            shutil.copyfile(backup, shipped)
            backup.unlink()
        elif not had and shipped.is_file():
            shipped.unlink()


def fmt_block(row: dict[str, object]) -> str:
    out = (row["stdout"] or "").rstrip()
    err = (row["stderr"] or "").rstrip()
    lines = [
        f"$ python {row['cmd']}",
        f"cwd: {row['cwd']}",
    ]
    if row.get("stdin"):
        lines.append("stdin: piped")
    lines.append(
        f"exit: {row['exit']} (expect {row['expect']}) {'PASS' if row['pass'] else 'FAIL'}"
    )
    if out:
        lines.append(out)
    if err:
        lines.append(err)
    return "\n".join(lines) + "\n"


def main() -> int:
    suites = [
        ("1. CLI stdin — `/reimagine-it`", run_01),
        ("2. First-run door — `/reimagine-it`", run_02),
        ("3. Ledger skyline — `/reimagine-it infographic`", run_03),
        ("4. Layer law — `/reimagine-it architecture`", run_04),
        ("5. This repo gold — `/reimagine-it`", run_05),
    ]
    started = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    python_ver = sys.version.split()[0]
    all_rows: list[dict[str, object]] = []
    parts = [
        f"# Tested results",
        "",
        f"Captured `{started}` with `{Path(PY).name} {python_ver}`.",
        f"Re-run: `python gold/five/run.py`",
        "",
    ]
    vizzers = {
        "1. CLI stdin — `/reimagine-it`": viz_01,
        "2. First-run door — `/reimagine-it`": viz_02,
        "4. Layer law — `/reimagine-it architecture`": viz_04,
    }
    failed = 0
    suite_results: list[dict[str, object]] = []
    for title, fn in suites:
        rows = fn()
        all_rows.extend(rows)
        suite_failed = sum(1 for row in rows if not row["pass"])
        failed += suite_failed
        suite_results.append(
            {"title": title, "runs": len(rows), "failed": suite_failed}
        )
        if title in vizzers and suite_failed == 0:
            vizzers[title](rows)
        parts.append(f"### {title}")
        parts.append("")
        for row in rows:
            parts.append("```text")
            parts.append(fmt_block(row).rstrip())
            parts.append("```")
            parts.append("")
    RESULTS.write_text("\n".join(parts).rstrip() + "\n", encoding="utf-8")
    RESULTS_JSON.write_text(
        json.dumps({"started": started, "python": python_ver, "failed": failed, "runs": all_rows}, indent=2)
        + "\n",
        encoding="utf-8",
    )

    row_h = 44
    header_h = 78
    footer_h = 44
    canvas_w = 720
    canvas_h = header_h + row_h * len(suite_results) + footer_h
    suite_status = "shipped" if failed == 0 else f"failed {failed}"
    header_fill = "#7ee0c0" if failed == 0 else "#e08e7e"
    svg: list[str] = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {canvas_w} {canvas_h}" '
        f'role="img" aria-label="Suite results">',
        '<title>gold/five suite results</title>',
        '<rect width="100%" height="100%" fill="#0c0e12"/>',
        (
            '<text x="32" y="40" fill="#8b97a4" font-size="11" letter-spacing="2.4" '
            'font-family="ui-sans-serif, system-ui, Segoe UI, sans-serif">REIMAGINED: '
            f'{suite_status.upper()}</text>'
        ),
        (
            f'<text x="32" y="62" fill="{header_fill}" font-size="18" '
            'font-family="ui-sans-serif, system-ui, Segoe UI, sans-serif">'
            f'gold/five &#8212; {len(all_rows)} runs, {failed} failed</text>'
        ),
    ]
    for i, suite in enumerate(suite_results):
        y = header_h + i * row_h
        row_ok = suite["failed"] == 0
        badge_fill = "#12352c" if row_ok else "#3a1a1a"
        badge_stroke = "#1e5c4d" if row_ok else "#7a2f2f"
        badge_text = "PASS" if row_ok else "FAIL"
        svg.append(
            f'<rect x="32" y="{y}" width="{canvas_w - 64}" height="{row_h - 8}" rx="8" '
            f'fill="#171c24" stroke="#2a3340"/>'
        )
        svg.append(
            f'<text x="52" y="{y + 24}" fill="#e8edf4" font-size="13" '
            'font-family="ui-monospace, Consolas, Menlo, monospace">'
            f'{str(suite["title"]).replace("`", "").replace("&", "&amp;")}'
            '</text>'
        )
        svg.append(
            f'<rect x="{canvas_w - 128}" y="{y + 8}" width="72" height="{row_h - 24}" rx="6" '
            f'fill="{badge_fill}" stroke="{badge_stroke}"/>'
        )
        svg.append(
            f'<text x="{canvas_w - 92}" y="{y + 24}" fill="{header_fill}" font-size="11" '
            'letter-spacing="2" text-anchor="middle" '
            'font-family="ui-sans-serif, system-ui, Segoe UI, sans-serif">'
            f'{badge_text}</text>'
        )
    svg.append(
        f'<text x="32" y="{canvas_h - 18}" fill="#8b97a4" font-size="11" '
        'font-family="ui-sans-serif, system-ui, Segoe UI, sans-serif">'
        f'Captured {started} &#183; {Path(PY).name} {python_ver} &#183; re-run: python gold/five/run.py</text>'
    )
    svg.append('</svg>\n')
    RESULTS_SVG.write_text("\n".join(svg), encoding="utf-8")

    sys.stdout.write(f"wrote {RESULTS.relative_to(REPO)} failed={failed}\n")
    return 0 if failed == 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())
