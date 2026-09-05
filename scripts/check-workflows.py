#!/usr/bin/env python3
"""CI guard: every GitHub Actions workflow must be structurally valid.

Catches the failure modes that standard YAML parsers let through but
GitHub Actions rejects at run-create time:

  1. a step with neither `run:` nor `uses:` (the audit.yml outage: a
     mangled edit detached the step body from its `run: |` header)
  2. duplicate mapping keys (rejected by GitHub's stricter parser)
  3. loose tag pins (`uses: org/action@v4`) — supply-chain poison;
     every `uses:` must be pinned to a 40-char commit SHA
  4. `pip install` without `--require-hashes` on a pinned requirement

Exit 0 only when every workflow passes all checks.
"""

import glob
import re
import sys

import yaml


class StrictLoader(yaml.SafeLoader):
    """SafeLoader that rejects duplicate mapping keys."""


def _no_dupes(loader, node, deep=False):
    seen = set()
    for k, _ in node.value:
        key = k.value
        if key in seen:
            raise yaml.YAMLError(f"duplicate mapping key: {key!r}")
        seen.add(key)
    return yaml.SafeLoader.construct_mapping(loader, node, deep)


StrictLoader.add_constructor(
    yaml.resolver.BaseResolver.DEFAULT_MAPPING_TAG, _no_dupes
)

SHA_PIN = re.compile(r"^[\w.\-/]+@[0-9a-f]{40}( .*)?$")
# END of a heredoc-requirements pip install (the block covers several lines)
HEREDOC_PIP = re.compile(
    r"pip install[^\n]*--require-hashes[^\n]*-r /dev/stdin <<'(\w+)'\n(.*?)\n\1",
    re.S,
)


def check_workflow(path, text):
    problems = []
    doc = yaml.load(text, Loader=StrictLoader)
    for job_name, job in (doc.get("jobs") or {}).items():
        for i, step in enumerate(job.get("steps") or []):
            uses = step.get("uses")
            run = step.get("run")
            if uses is None and run is None:
                problems.append(
                    f"  {path}: job '{job_name}' step #{i + 1} has neither "
                    "`run:` nor `uses:` (GitHub rejects this at parse time)"
                )
            if uses is not None and not SHA_PIN.match(uses):
                problems.append(
                    f"  {path}: job '{job_name}' step #{i + 1} uses is not "
                    f"SHA-pinned: {uses}"
                )
            if run is not None:
                for m in HEREDOC_PIP.finditer(run):
                    # Join both pip continuation styles: trailing backslash,
                    # and indented --hash lines continuing the previous
                    # requirement (canonical pip multi-line requirements).
                    body = re.sub(r" ?\\\n", " ", m.group(2))
                    req, req_line = "", 0
                    for ln_no, ln in enumerate(body.splitlines(), 1):
                        s = ln.strip()
                        if not s or s.startswith("#"):
                            continue
                        if s.startswith("--hash="):
                            if not req:
                                problems.append(
                                    f"  {path}: job '{job_name}' step #{i + 1} "
                                    f"hash without a requirement: {s[:60]}"
                                )
                            else:
                                req += " " + s
                            continue
                        # New requirement line: validate the previous one.
                        if req and ("==" not in req or "--hash=" not in req):
                            problems.append(
                                f"  {path}: job '{job_name}' step #{i + 1} "
                                f"requirement not version+hash pinned: {req[:60]}"
                            )
                        req, req_line = s, ln_no
                    if req and ("==" not in req or "--hash=" not in req):
                        problems.append(
                            f"  {path}: job '{job_name}' step #{i + 1} "
                            f"requirement not version+hash pinned: {req[:60]}"
                        )
    return problems


def main():
    problems = []
    for path in sorted(glob.glob(".github/workflows/*.yml")):
        text = open(path, encoding="utf-8").read()
        try:
            problems.extend(check_workflow(path, text))
        except yaml.YAMLError as exc:
            problems.append(f"  {path}: YAML error: {exc}")
    if problems:
        print("WORKFLOW LINT FAILED:")
        print("\n".join(problems))
        return 1
    count = len(glob.glob(".github/workflows/*.yml"))
    print(f"workflow lint OK — {count} workflows: steps well-formed, uses SHA-pinned, pip hash-pinned")
    return 0


if __name__ == "__main__":
    sys.exit(main())
