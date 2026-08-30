#!/usr/bin/env python3
"""
Audit many HTML files with Design Health.

Usage:
    python scripts/audit_all.py                      # sweep tracked gold HTML
    python scripts/audit_all.py --json               # verdict summary as JSON
    python scripts/audit_all.py --reports a.html b.html
                                                     # full reports as JSON
    python scripts/audit_all.py path/to/page.html    # audit explicit paths

Exit code 0 = all clean, 1 = warnings only, 2 = at least one failure.

`--reports` is what `test/unit/audit-parity.test.js` consumes to prove the
Python mirror and `src/audit.js` agree file by file.
"""

import json
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)

sys.path.insert(0, HERE)
os.chdir(REPO)

from audit import audit_html, exit_code_for  # noqa: E402  (path set above)

SKIP_DIRS = {
    "vendor", "loops", "_preview_b21", "x-ads", "pulsewave",
    "twolights", "saffron", "node_modules",
}
SKIP_FILES = {"before.html", "see.html"}


def _git_ignored(rel):
    """True when git would ignore this path. Untracked local shots must not fail CI."""
    result = subprocess.run(
        ["git", "check-ignore", "-q", rel],
        cwd=REPO,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    return result.returncode == 0


def find_gold_html():
    """Tracked gold HTML files, excluding sources, previews, and vendored copies."""
    files = []
    for root, dirs, filenames in os.walk(os.path.join(REPO, "gold")):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        for name in filenames:
            if not name.endswith(".html") or name in SKIP_FILES:
                continue
            rel = os.path.relpath(os.path.join(root, name), REPO)
            if _git_ignored(rel.replace("\\", "/")):
                continue
            files.append(rel)
    return sorted(files)


def report_for(path):
    with open(path, "r", encoding="utf-8") as handle:
        return audit_html(handle.read(), path.replace("\\", "/"))


def main():
    args = [arg for arg in sys.argv[1:] if not arg.startswith("--")]
    flags = {arg for arg in sys.argv[1:] if arg.startswith("--")}
    json_out = "--json" in flags
    reports_out = "--reports" in flags

    files = args if args else find_gold_html()
    if not files:
        print("No HTML files found.")
        sys.exit(0)

    reports = {}
    worst = 0
    summary = {"total": 0, "clean": 0, "warnings": 0, "failures": 0}

    for path in files:
        if not os.path.isfile(path):
            print("File not found: %s" % path, file=sys.stderr)
            sys.exit(2)
        report = report_for(path)
        reports[path.replace("\\", "/")] = report
        code = exit_code_for(report)
        worst = max(worst, code)
        summary["total"] += 1
        summary["clean" if code == 0 else "warnings" if code == 1 else "failures"] += 1

    if reports_out:
        json.dump(reports, sys.stdout, indent=2, sort_keys=True)
        print()
    elif json_out:
        json.dump({
            "files": {path: report["verdict"] for path, report in reports.items()},
            "summary": summary,
        }, sys.stdout, indent=2, sort_keys=True)
        print()
    else:
        icons = {"CLEAN": "OK  ", "WARNINGS": "WARN", "FAIL": "FAIL"}
        for path in sorted(reports):
            report = reports[path]
            print("  %s %-9s %d/%d rules  %s" % (
                icons.get(report["verdict"], "?"), report["verdict"],
                report["passed"], report["rules"], path,
            ))
        print("\n%d files: %d clean, %d warnings, %d failures  (%d rules each)" % (
            summary["total"], summary["clean"], summary["warnings"],
            summary["failures"], len(reports[sorted(reports)[0]]["checks"]),
        ))

    sys.exit(worst)


if __name__ == "__main__":
    main()
