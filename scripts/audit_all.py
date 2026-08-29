#!/usr/bin/env python3
"""
Audit all gold HTML files in the repository.

Usage:
    python scripts/audit_all.py          # audit all gold HTML
    python scripts/audit_all.py --json   # JSON output

Exit code 0 = all files pass or warn, non-zero = at least one failure.
"""

import sys
import os
import subprocess
import json

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)

os.chdir(REPO)

AUDIT_SCRIPT = os.path.join(REPO, "scripts", "audit.py")


def _git_ignored(rel):
    """True when git would ignore this path. Untracked local shots must not fail CI locally."""
    result = subprocess.run(
        ["git", "check-ignore", "-q", rel],
        cwd=REPO,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    return result.returncode == 0


def find_gold_html():
    """Find tracked gold HTML files, excluding before.html, see.html, and vendors."""
    files = []
    gold_dir = os.path.join(REPO, "gold")
    skip_dirs = {"vendor", "loops", "_preview_b21", "x-ads", "pulsewave", "twolights", "saffron"}
    for root, dirs, filenames in os.walk(gold_dir):
        dirs[:] = [d for d in dirs if d not in skip_dirs]
        for fn in filenames:
            fp = os.path.join(root, fn)
            rel = os.path.relpath(fp, REPO)
            if not (fn.endswith(".html") and fn not in ("before.html", "see.html")):
                continue
            if _git_ignored(rel.replace("\\", "/")):
                continue
            files.append(rel)
    return sorted(files)


def main():
    json_out = "--json" in sys.argv
    files = find_gold_html()

    if not files:
        print("No gold HTML files found.")
        sys.exit(0)

    results = {"files": {}, "summary": {"total": 0, "clean": 0, "warnings": 0, "failures": 0}}

    for fpath in files:
        try:
            result = subprocess.run(
                [sys.executable, AUDIT_SCRIPT, fpath, "--json"],
                capture_output=True, text=True, timeout=15
            )
            if result.returncode == 0:
                results["summary"]["clean"] += 1
            elif result.returncode == 1:
                results["summary"]["warnings"] += 1
            else:
                results["summary"]["failures"] += 1

            results["summary"]["total"] += 1
            data = json.loads(result.stdout) if result.stdout.strip() else {"verdict": "ERROR"}
            results["files"][fpath] = data.get("verdict", "ERROR")
        except (subprocess.TimeoutExpired, json.JSONDecodeError) as e:
            results["files"][fpath] = "ERROR"
            results["summary"]["failures"] += 1
            results["summary"]["total"] += 1

    if json_out:
        json.dump(results, sys.stdout, indent=2)
        print()
    else:
        for fpath in sorted(results["files"]):
            verdict = results["files"][fpath]
            icons = {"CLEAN": "✓", "WARNINGS": "⚠", "FAIL": "✗", "ERROR": "?"}
            print(f"  {icons.get(verdict, '?')} {verdict:8s}  {fpath}")

        s = results["summary"]
        print(f"\n{s['total']} files: {s['clean']} clean, {s['warnings']} warnings, {s['failures']} failures")

    if results["summary"]["failures"] > 0:
        sys.exit(2)
    elif results["summary"]["warnings"] > 0:
        sys.exit(1)
    else:
        sys.exit(0)


if __name__ == "__main__":
    main()