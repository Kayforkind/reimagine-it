#!/usr/bin/env python3
"""Regenerate the case-study tables in the example docs from ground truth.

Source of truth is examples/end-users/manifest.json (direction + alternates
per slug) and each example's auto.json (fidelity percentage). The only
hand-maintained data here is the editorial "why it is here" line per slug,
which has no mechanical source.

Usage: python scripts/sync-case-docs.py
"""

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
EXAMPLES = ROOT / "examples" / "end-users"
README = EXAMPLES / "README.md"
CASE_STUDIES = ROOT / "docs" / "CASE_STUDIES.md"

# slug -> (source description, why it is here)
WHY = {
    "venator": ("crypto battle royale",
                "gaming language gets a signal-yellow gradient arena instead of a timeline scrubber"),
    "crimson-circuit": ("music festival",
                        "three nights become a magenta cinematic scroll, not a bar chart"),
    "velocita": ("skate brand",
                 "decks and riders become an expressive type poster"),
    "maracuya": ("juice bar",
                 "the menu becomes a product landing with a real source action"),
    "flick": ("streetwear",
              "the drop becomes a photography folio of garment studies"),
    "meridian": ("living building",
                 "one command ships three furnished designs: an orbitable 3D object, a magazine feature, and a living diagram"),
    "horizon": ("observability",
                "SLOs and latency numbers become an ops dashboard"),
    "hearth-grain": ("bakery",
                     "sixteen loaves become a photography folio of the morning bake, not a data poster"),
    "millbrook-budget": ("city budget",
                         "comparison, timeline, and survey language becomes an infographic whose first fold is the budget timeline"),
}


def load_examples():
    manifest = json.loads((EXAMPLES / "manifest.json").read_text(encoding="utf-8"))
    rows = []
    for ex in manifest["examples"]:
        rel = ex["source"]  # e.g. examples/end-users/venator/source.html
        slug = Path(rel).parent.name
        report = json.loads((EXAMPLES / slug / "auto.json").read_text(encoding="utf-8"))
        fidelity = report["fidelity"]["percentage"]
        name, _sep, _rest = ex["name"].partition(" — ")
        source_desc, why = WHY[slug]
        rows.append({
            "slug": slug,
            "name": name,
            "source": source_desc,
            "auto": ex["auto_token"],
            "alternates": ex["alternate_tokens"],
            "score": ex["score"],
            "fidelity": fidelity,
            "why": why,
        })
    return rows


def readme_row(r):
    alts = ", ".join(f"`{a}`" for a in r["alternates"])
    return (f"| [{r['name']}]({r['slug']}/) | {r['source']} → `{r['auto']}` | "
            f"{r['score']} | {alts} | {r['why']} |")


def case_row(r):
    alts = ", ".join(f"`{a}`" for a in r["alternates"])
    return (f"| [{r['name']}](../examples/end-users/{r['slug']}/) | "
            f"{r['source']} → `{r['auto']}` | {alts} | {r['score']} | "
            f"{r['fidelity']}% | [case study](../examples/end-users/{r['slug']}/) |")


def replace_table(doc: Path, header_re: str, make_row):
    raw = doc.read_bytes()
    crlf = b"\r\n" in raw
    text = raw.decode("utf-8").replace("\r\n", "\n")
    rows = load_examples()
    m = re.search(header_re, text, re.MULTILINE)
    if not m:
        raise SystemExit(f"table header not found in {doc}")
    header = text[m.start():m.end()].rstrip("\n")
    table = header + "\n" + "\n".join(make_row(r) for r in rows)
    start = m.start()
    end = text.index("\n\n", start)
    new = text[:start] + table + text[end:]
    if crlf:
        new = new.replace("\n", "\r\n")
    doc.write_bytes(new.encode("utf-8"))
    print(f"updated {doc.relative_to(ROOT)} ({len(rows)} rows)")


def main():
    replace_table(README, r"^\| Example [^\n]*\n\|[-:| ]+\n", readme_row)
    replace_table(CASE_STUDIES, r"^\| Example [^\n]*\n\|[-:| ]+\n", case_row)


if __name__ == "__main__":
    main()
