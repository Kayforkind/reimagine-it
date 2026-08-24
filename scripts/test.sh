#!/usr/bin/env bash
# Test runner: audit sweep (warnings OK), smoke test, unit tests.
# Exits non-zero only on real failures (audit exit >= 2 or any sub-test crash).
set +e

echo "── 1/3  Gold audit sweep ────────────────────────────────────"
python scripts/audit_all.py
AUDIT_EXIT=$?
echo "audit exit: $AUDIT_EXIT (0=clean, 1=warnings OK, 2+=failures)"
if [ "$AUDIT_EXIT" -ge 2 ]; then
  echo "FAIL: gold audit has craft-floor failures"
  exit 1
fi

echo ""
echo "── 2/3  Smoke test (gold/reimagine.py --ship) ────────────────"
python gold/reimagine.py --ship
SMOKE_EXIT=$?
if [ "$SMOKE_EXIT" -ne 0 ]; then
  echo "FAIL: smoke test crashed"
  exit 1
fi

echo ""
echo "── 3/3  Unit tests (test/unit/cli.test.js) ──────────────────"
node test/unit/cli.test.js
UNIT_EXIT=$?
if [ "$UNIT_EXIT" -ne 0 ]; then
  echo "FAIL: unit tests failed"
  exit 1
fi

echo ""
echo "ALL TESTS PASSED"
