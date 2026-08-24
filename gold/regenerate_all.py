#!/usr/bin/env python3
"""
Master gold regenerator — runs every regeneration script in the gold/ tree.

Usage:
    python gold/regenerate_all.py          # run everything
    python gold/regenerate_all.py --dry    # list what would run
    python gold/regenerate_all.py --skip-screenshots  # skip Chrome-requiring steps

Exit code 0 = all regens succeeded. Non-zero = at least one failed.

This script proves the README claim "Everything on this page is tested"
with a single command. Each regenerator is idempotent — running it twice
produces the same output.
"""

import sys
import os
import subprocess
import time

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)

os.chdir(REPO)

# ── Registry: every regeneration command from the README table ─────────────
# Format: (description, command_list, requires_chrome)
# requires_chrome=False means it's pure data/calculation, no headless browser

REGERATIONS = [
    # Core gold — screenshots require Chrome
    ("Per-pack full-page after.png shots",
     ["python", "gold/shots.py"],
     requires_chrome=True),

    ("Infographic poster screenshot",
     ["python", "gold/_shot_full.py", "gold/domains/infographic/after.html",
      "gold/domains/infographic/after.png"],
     requires_chrome=True),

    ("Form gold: SVG + Three.js + simulation + loop close-ups",
     ["python", "gold/forms/shot.py"],
     requires_chrome=True),

    ("Form examples GIF",
     ["python", "gold/forms/make_gif.py"],
     requires_chrome=True),

    ("Jules second-source gold + GIF",
     ["python", "gold/jules/shot.py"],
     requires_chrome=True),

    ("Jules GIF assembly",
     ["python", "gold/jules/make_gif.py"],
     requires_chrome=True),

    ("Draw C full-page shot (WebGL2)",
     ["python", "gold/_shot_full.py", "gold/webpage/after-3.html",
      "gold/webpage/after-3-full.png"],
     requires_chrome=True),

    ("Master gallery + per-pack tile heroes",
     ["python", "gold/gallery.py"],
     requires_chrome=True),

    ("Quartet + twins triptych + per-pack compares",
     ["python", "gold/compare.py"],
     requires_chrome=True),

    ("Default before + after screenshots",
     ["python", "gold/webpage/run.py"],
     requires_chrome=True),

    ("Motion strip",
     ["python", "gold/domains/motion-run.py"],
     requires_chrome=True),

    ("Pulsewave gold",
     ["python", "gold/pulsewave/shot.py"],
     requires_chrome=True),

    ("Two Lights gold",
     ["python", "gold/twolights/shot.py"],
     requires_chrome=True),

    ("Saffron & Smoke gold",
     ["python", "gold/saffron/shot.py"],
     requires_chrome=True),

    # Non-Chrome — always run
    ("Gold review (flag cloth, clone scan, after.png pairs)",
     ["python", "scripts/review_gold.py"],
     requires_chrome=False),

    ("Skill smoke fixture",
     ["python", "gold/reimagine.py", "--ship"],
     requires_chrome=False),

    ("Audit all gold HTML",
     ["python", "scripts/audit_all.py"],
     requires_chrome=False),
]

# ── Determine Chrome availability ──────────────────────────────────────────

def chrome_available():
    """Check if Chrome/Chromium is on PATH or set via REIMAGINE_BROWSER."""
    if os.environ.get("REIMAGINE_BROWSER"):
        return True
    for name in ["chromium-browser", "chromium", "google-chrome", "chrome",
                 "google-chrome-stable", "chromium-browser",
                 "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
                 "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
                 "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"]:
        if subprocess.run(["which", name], capture_output=True).returncode == 0:
            return True
        if os.path.isfile(name) and os.access(name, os.X_OK):
            return True
    return False

# ── Runner ─────────────────────────────────────────────────────────────────

def main():
    dry = "--dry" in sys.argv
    skip_screenshots = "--skip-screenshots" in sys.argv
    chrome = chrome_available()

    if not chrome and not skip_screenshots:
        print("⚠️  Chrome not found on PATH. Screenshot steps will be skipped.")
        print("   Set REIMAGINE_BROWSER=<path> to enable screenshots.")
        print("   Or pass --skip-screenshots to silence this warning.\n")
        skip_screenshots = True

    total = 0
    passed = 0
    failed = 0
    skipped = 0
    results = []

    for desc, cmd, needs_chrome in REGERATIONS:
        total += 1

        if needs_chrome and skip_screenshots:
            print(f"⏭  SKIP (no Chrome) — {desc}")
            skipped += 1
            results.append((desc, "SKIPPED"))
            continue

        if dry:
            print(f"📋 WOULD RUN — {desc}")
            print(f"   {' '.join(cmd)}")
            skipped += 1
            continue

        print(f"\n{'─'*60}")
        print(f"▶  {desc}")
        print(f"   {' '.join(cmd)}")
        start = time.time()

        try:
            result = subprocess.run(cmd, capture_output=True, text=True,
                                    timeout=120, cwd=REPO)

            elapsed = time.time() - start
            if result.returncode == 0:
                print(f"   ✓ Passed ({elapsed:.1f}s)")
                if result.stdout.strip():
                    for line in result.stdout.strip().splitlines()[:5]:
                        print(f"     {line}")
                passed += 1
                results.append((desc, "PASSED"))
            else:
                print(f"   ✗ Failed ({elapsed:.1f}s) — exit code {result.returncode}")
                if result.stdout.strip():
                    for line in result.stdout.strip().splitlines()[-10:]:
                        print(f"     {line}")
                if result.stderr.strip():
                    print(f"   stderr:")
                    for line in result.stderr.strip().splitlines()[-5:]:
                        print(f"     {line}")
                failed += 1
                results.append((desc, "FAILED"))
        except subprocess.TimeoutExpired:
            print(f"   ✗ Timeout (120s)")
            failed += 1
            results.append((desc, "TIMEOUT"))
        except FileNotFoundError:
            print(f"   ✗ Command not found: {cmd[0]}")
            failed += 1
            results.append((desc, "NOT FOUND"))

    # ── Summary ────────────────────────────────────────────────────────────

    print(f"\n{'='*60}")
    print(f"REGENERATION SUMMARY")
    print(f"{'='*60}")
    for desc, status in results:
        icon = {"PASSED": "✓", "FAILED": "✗", "SKIPPED": "⏭", "TIMEOUT": "⏱", "NOT FOUND": "?"}
        print(f"  {icon.get(status, '?')} {status:8s}  {desc}")

    print(f"\nTotal: {total}  |  Passed: {passed}  |  Failed: {failed}  |  Skipped: {skipped}")

    if failed > 0:
        print(f"\n❌ {failed} regeneration(s) failed. Fix them before reporting 'shipped'.")
        sys.exit(1)
    elif skipped == total:
        print(f"\n⏭  All {skipped} steps skipped. Nothing was regenerated.")
    else:
        print(f"\n✓ All {passed} regeneration steps passed. 'Everything on this page is tested.'")

if __name__ == "__main__":
    main()