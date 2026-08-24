"""Generate and verify the 20-unit HTML benchmark in quality-gated waves."""
from __future__ import annotations

import hashlib
import json
import shutil
import subprocess
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "benchmark"
BANK = ROOT / "SCALE_UNIT_BANK.json"
LEDGER = OUT / "SCALE_LEDGER.jsonl"
QUARANTINE = OUT / "quarantine"
WAVE_SIZE = 5


def append(entry: dict) -> None:
    with LEDGER.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(entry, ensure_ascii=False) + "\n")


def source_html(unit: dict) -> str:
    axis = " · ".join(unit["axes"])
    return f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>{unit['title']}</title></head>
<body><main><h1>{unit['title']}</h1><p>{unit['spec']}</p>
<h2>What to know</h2><ul><li>Audience: {unit['axes'][0]}</li><li>Format: {unit['axes'][1]}</li><li>Shape: {unit['axes'][2]}</li><li>Intent: {unit['axes'][3]}</li></ul>
<p>Field note for the {axis} edition. Updated in 2027; contact hello@example.test for details.</p>
</main></body></html>'''


def run(cmd: list[str]) -> None:
    subprocess.run(cmd, cwd=ROOT, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def verify(unit: dict, folder: Path) -> tuple[bool, list[str]]:
    errors: list[str] = []
    source = folder / "source.html"
    artifact = folder / "auto.html"
    report = folder / "auto.json"
    if not all(path.is_file() for path in (source, artifact, report)):
        return False, ["missing source, artifact, or report"]
    output = artifact.read_text(encoding="utf-8")
    data = json.loads(report.read_text(encoding="utf-8"))
    if unit["title"] not in output:
        errors.append("title not preserved")
    if not data.get("fidelity") or data["fidelity"].get("detected", 0) < 1:
        errors.append("fidelity report missing")
    if not data.get("token") or not data.get("candidates"):
        errors.append("decision report incomplete")
    if not output.lower().startswith("<!doctype html>") or "</html>" not in output.lower():
        errors.append("artifact is not standalone HTML")
    return not errors, errors


def main() -> int:
    units = json.loads(BANK.read_text(encoding="utf-8"))["units"]
    OUT.mkdir(exist_ok=True)
    if LEDGER.exists():
        LEDGER.unlink()
    append({"type": "meta", "run_id": datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ"), "medium": "html", "target": len(units), "wave_size": WAVE_SIZE})
    seen: set[str] = set()
    shipped: list[str] = []
    quarantined: list[str] = []
    waves = []
    for start in range(0, len(units), WAVE_SIZE):
        wave_units = units[start:start + WAVE_SIZE]
        wave_id = f"wave-{start // WAVE_SIZE + 1}"
        accepted = []
        failures = []
        for unit in wave_units:
            folder = OUT / unit["id"]
            folder.mkdir(parents=True, exist_ok=True)
            source = folder / "source.html"
            source.write_text(source_html(unit), encoding="utf-8")
            digest = hashlib.sha256(source.read_bytes()).hexdigest()
            if digest in seen:
                failures.append({"id": unit["id"], "reason": "duplicate source fingerprint"})
                continue
            seen.add(digest)
            run(["node", "scripts/auto.js", "--input", str(source), "--output", str(folder / "auto.html"), "--report", str(folder / "auto.json"), "--seed", str(start + 41), "--brief", unit["axes"][4], "--candidates", "3", "--quiet"])
            ok, errors = verify(unit, folder)
            if ok:
                accepted.append(unit["id"])
                shipped.append(unit["id"])
            else:
                failures.append({"id": unit["id"], "reason": "; ".join(errors)})
                q = QUARANTINE / wave_id / unit["id"]
                q.parent.mkdir(parents=True, exist_ok=True)
                shutil.copytree(folder, q, dirs_exist_ok=True)
                quarantined.append(unit["id"])
        report = {"type": "wave", "wave": wave_id, "accepted": accepted, "failures": failures, "sample_ids": accepted[:], "verdict": "PASS" if not failures else "WEAK"}
        append(report)
        append({"type": "calibration", "wave": wave_id, "sample_ids": accepted[:], "fidelity": "title+report+standalone", "uniqueness": "sha256 source fingerprints", "verdict": report["verdict"]})
        waves.append(report)
        if failures and len(failures) / max(len(wave_units), 1) > 0.2:
            raise SystemExit(f"stopping after {wave_id}: failure rate exceeds 20%")
    evidence = {"n_shipped": len(shipped), "n_quarantined": len(quarantined), "sample_ids": shipped, "sample_verdicts": ["PASS"] * len(shipped), "waves_run": waves, "wave_reviews": [], "medium": "html", "review_paths": []}
    append({"type": "done", **evidence})
    (OUT / "SCALE_WAVE_REPORT.md").write_text("# Benchmark wave report\n\n" + json.dumps(evidence, indent=2) + "\n", encoding="utf-8")
    print(f"shipped={len(shipped)} quarantined={len(quarantined)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
