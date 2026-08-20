"""Motion-strip capture: three frames per variant (0 / 500 / 1000 ms) composited.

For each domain gold + the default webpage gold, shoot a frame at t=0, t=500ms,
and t=1000ms of virtual time. Composite into a single per-variant strip AND a
combined all-variants motion strip so a stranger can see the animation is real.

Usage:
    python gold/domains/motion-run.py
"""
from __future__ import annotations

import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent
REPO = ROOT.parent.parent

# (label, html_path)
VARIANTS: list[tuple[str, Path]] = [
    ("cinematic",   REPO / "gold" / "domains" / "cinematic"   / "after.html"),
    ("artistic",    REPO / "gold" / "domains" / "artistic"    / "after.html"),
    ("dashboard",   REPO / "gold" / "domains" / "dashboard"   / "after.html"),
    ("photography", REPO / "gold" / "domains" / "photography" / "after.html"),
]

FRAME_MS: list[int] = [200, 1800, 3800]
WIDTH = 900
HEIGHT = 560


def find_browser() -> str:
    for c in (
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    ):
        if Path(c).exists():
            return c
    raise SystemExit("no headless browser found")


def shoot(browser: str, src: Path, dst: Path, ms: int, w: int, h: int, timeout: int = 30) -> None:
    src_url = "file:///" + str(src).replace("\\", "/")
    # --virtual-time-budget forces the page to advance N ms of virtual time
    # (including animation) before the screenshot is taken.
    try:
        subprocess.run(
            [
                browser,
                "--headless=new",
                "--disable-gpu",
                "--hide-scrollbars",
                "--use-gl=swiftshader",
                "--no-sandbox",
                "--disable-extensions",
                "--disable-sync",
                f"--window-size={w},{h}",
                f"--virtual-time-budget={ms}",
                f"--screenshot={dst}",
                src_url,
            ],
            check=False,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            timeout=timeout,
        )
    except subprocess.TimeoutExpired:
        pass


def strip_html(label: str, variant_frames: list[Path]) -> str:
    tiles = "".join(
        f'<figure><img src="{variant_frames[i].name}" alt="{label} frame {i}">'
        f'<figcaption>t = {FRAME_MS[i]} ms</figcaption></figure>'
        for i in range(len(variant_frames))
    )
    return f"""<!doctype html>
<html><head><meta charset="utf-8"><title>{label} motion</title>
<style>
  html,body{{margin:0;background:#0c0e12;color:#e8e6e0;font-family:ui-monospace,Consolas,monospace;font-size:12px}}
  .wrap{{padding:18px 20px}}
  h1{{margin:0 0 10px;font-family:Georgia,serif;font-style:italic;font-size:22px;color:#f0ede7;font-weight:400}}
  h1 b{{color:#ff8b6e;font-weight:400;letter-spacing:.18em;text-transform:uppercase;font-family:ui-monospace,Consolas,monospace;font-size:12px;margin-right:10px}}
  .row{{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px}}
  figure{{margin:0;background:#12161f;border:1px solid #232a38;border-radius:6px;overflow:hidden}}
  figcaption{{padding:8px 12px;color:#8b8579;letter-spacing:.14em;text-transform:uppercase;font-size:11px;
    border-top:1px solid #1a1f2b;background:#0f131c}}
  img{{display:block;width:100%;height:auto}}
</style></head><body><div class="wrap">
<h1><b>{label}</b>motion strip &middot; three frames &middot; 500 ms apart</h1>
<div class="row">{tiles}</div>
</div></body></html>
"""


def combined_html(rows: list[tuple[str, list[Path]]]) -> str:
    body_rows = "".join(
        f"""
  <section>
    <div class="label"><b>{label}</b>animation running</div>
    <div class="row">
      <figure><img src="{frames[0].name}" alt="{label} t={FRAME_MS[0]}"><figcaption>t = {FRAME_MS[0]} ms</figcaption></figure>
      <figure><img src="{frames[1].name}" alt="{label} t={FRAME_MS[1]}"><figcaption>t = {FRAME_MS[1]} ms</figcaption></figure>
      <figure><img src="{frames[2].name}" alt="{label} t={FRAME_MS[2]}"><figcaption>t = {FRAME_MS[2]} ms</figcaption></figure>
    </div>
  </section>
""" for label, frames in rows
    )
    return f"""<!doctype html>
<html><head><meta charset="utf-8"><title>motion strip (all variants)</title>
<style>
  html,body{{margin:0;background:#05070c;color:#ecf1ff;font-family:ui-monospace,Consolas,monospace;font-size:12px}}
  .wrap{{padding:22px 28px 34px;max-width:1360px;margin:0 auto}}
  h1{{margin:0 0 4px;font-family:Georgia,serif;font-style:italic;font-size:26px;color:#f0ede7;font-weight:400}}
  .lead{{color:#7c8aa8;margin-bottom:22px;letter-spacing:.06em}}
  section{{margin-bottom:22px}}
  .label{{color:#7c8aa8;letter-spacing:.24em;text-transform:uppercase;font-size:11px;margin:0 0 8px 4px}}
  .label b{{color:#7cf3ff;font-weight:400;letter-spacing:.24em;margin-right:12px}}
  .row{{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px}}
  figure{{margin:0;background:#0f1420;border:1px solid #1e2436;border-radius:8px;overflow:hidden;
    box-shadow:0 12px 30px -12px #000}}
  figcaption{{padding:8px 12px;color:#7c8aa8;letter-spacing:.14em;text-transform:uppercase;font-size:11px;
    border-top:1px solid #1a1f2b;background:#0a0f19}}
  img{{display:block;width:100%;height:auto}}
</style></head><body><div class="wrap">
<h1>/awe-me webpage &mdash; four packs, motion is real</h1>
<div class="lead">Three frames per pack, spaced 500 ms apart. If the pixels change frame-to-frame, the motion budget landed.</div>
{body_rows}
</div></body></html>
"""


def main() -> None:
    browser = find_browser()
    print(f"browser: {browser}")

    all_rows: list[tuple[str, list[Path]]] = []
    for label, html_path in VARIANTS:
        if not html_path.exists():
            print(f"skip {label}: {html_path} not found")
            continue

        frames: list[Path] = []
        for ms in FRAME_MS:
            out = ROOT / f"{label}-t{ms}.png"
            if out.exists():
                out.unlink()
            shoot(browser, html_path, out, ms=ms, w=WIDTH, h=HEIGHT)
            if not out.exists():
                print(f"  {label} t={ms}ms  FAILED (no file written)")
                continue
            frames.append(out)
            print(f"  {label} t={ms}ms  {out.stat().st_size:>7,} bytes")

        if len(frames) != len(FRAME_MS):
            print(f"  {label}: skipping strip (missing frames)")
            continue

        # per-variant strip
        strip_p = ROOT / f"{label}-motion.html"
        strip_p.write_text(strip_html(label, frames), encoding="utf-8")
        strip_png = ROOT / f"{label}-motion.png"
        # width for strip HTML: 3 columns * WIDTH + gaps + padding
        shoot(browser, strip_p, strip_png, ms=200, w=WIDTH * 3 + 96, h=HEIGHT + 140)
        print(f"  {label} strip -> {strip_png.name}")
        all_rows.append((label, frames))

    # combined
    combined_p = ROOT / "motion-strip.html"
    combined_p.write_text(combined_html(all_rows), encoding="utf-8")
    combined_png = ROOT / "motion-strip.png"
    shoot(
        browser,
        combined_p,
        combined_png,
        ms=300,
        w=WIDTH * 3 + 120,
        h=(HEIGHT + 90) * len(all_rows) + 160,
    )
    print(f"\nmotion-strip.png -> {combined_png.stat().st_size:,} bytes")


if __name__ == "__main__":
    main()
