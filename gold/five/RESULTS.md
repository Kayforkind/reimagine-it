# Tested results

Captured `2026-08-20T01:06:42Z` with `python.exe 3.13.3`.
Re-run: `python gold/five/run.py`

### 1. CLI stdin — `/awe-me`

```text
$ python before.py
cwd: gold/five/01-cli
stdin: piped
exit: 2 (expect 2) PASS
usage: before.py FILE
```

```text
$ python after.py --stdin
cwd: gold/five/01-cli
stdin: piped
exit: 0 (expect 0) PASS
{"stdin": true, "bytes": 18}
```

```text
$ python after.py --stdin
cwd: gold/five/01-cli
stdin: piped
exit: 1 (expect 1) PASS
empty stdin
```

### 2. First-run door — `/inspire-me`

```text
$ python before.py
cwd: gold/five/02-door
exit: 1 (expect 1) PASS
Welcome to Local MCP.
Please read the architecture notes, then the security notes, then ask Slack.
first-run: no command to copy. exit 1
```

```text
$ python after.py
cwd: gold/five/02-door
exit: 1 (expect 1) PASS
FAIL
broken: copy door.example to door.txt then re-run
```

```text
$ python after.py
cwd: gold/five/02-door
exit: 0 (expect 0) PASS
OK
```

### 3. Ledger skyline — `/awe-me infographic`

```text
$ python before.py
cwd: gold/five/03-ledger
exit: 0 (expect 0) PASS
{"kind":"pr","title":"stdin-pipe"}
{"kind":"docs","title":"first-run-door"}
{"kind":"arch","title":"layer-law"}
```

```text
$ python after.py
cwd: gold/five/03-ledger
exit: 0 (expect 0) PASS
wrote index.html rows=3
```

```text
$ python assert titles in index.html
cwd: gold/five/03-ledger
exit: 0 (expect 0) PASS
all three titles present
```

### 4. Layer law — `/awe-me architecture`

```text
$ python check.py
cwd: gold/five/04-layers
exit: 1 (expect 1) PASS
FAIL: pkg_b/core.py imports pkg_a.internal
```

```text
$ python check.py
cwd: gold/five/04-layers
exit: 0 (expect 0) PASS
OK: layer law held
```

### 5. This repo gold — `/awe-me`

```text
$ python awe.py --fail
cwd: gold
exit: 1 (expect 1) PASS
- make it more cinematic
- wow-factor infographic
- maybe a Three.js thing
- inspiring onboarding vibes
- surprise them somehow
AWE: blocked — a list of vibes is not an artifact
```

```text
$ python awe.py --ship
cwd: gold
exit: 0 (expect 0) PASS
{
  "awe": "shipped",
  "mode": "awe-me",
  "about": "A stranger sees a vibe list die, then the same context as one proving command.",
  "hero": "gold/awe.py --ship",
  "stretch": "npx skills add kazimrmerchant/skill-slice --skill awe-me",
  "verified": "this command exits 0; gold/awe.py --fail exits 1"
}
```
