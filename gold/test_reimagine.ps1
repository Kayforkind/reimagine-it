#Requires -Version 5.1
# Smoke test: fail list exits 1; --ship exits 0; shipped.json keeps the flat keys.
$ErrorActionPreference = 'Stop'

$RepoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $RepoRoot

$py = $null
foreach ($cand in @('python', 'py')) {
    if (Get-Command $cand -ErrorAction SilentlyContinue) {
        $py = $cand
        break
    }
}
if (-not $py) {
    throw "Neither 'python' nor 'py' found on PATH."
}

$shipped = Join-Path $RepoRoot 'gold\shipped.json'
$backup = Join-Path $RepoRoot 'gold\shipped.json.bak'
$hadShipped = Test-Path -LiteralPath $shipped
if ($hadShipped) {
    Copy-Item -LiteralPath $shipped -Destination $backup -Force
}

try {
    & $py gold/reimagine.py
    $code = $LASTEXITCODE
    if ($code -ne 1) { throw "Expected exit 1 for gold/reimagine.py, got $code" }

    & $py gold/reimagine.py --fail
    $code = $LASTEXITCODE
    if ($code -ne 1) { throw "Expected exit 1 for --fail, got $code" }

    & $py gold/reimagine.py --ship
    $code = $LASTEXITCODE
    if ($code -ne 0) { throw "Expected exit 0 for --ship, got $code" }

    if (-not (Test-Path -LiteralPath $shipped)) {
        throw 'gold/shipped.json was not created by --ship'
    }
    $json = Get-Content -LiteralPath $shipped -Raw | ConvertFrom-Json
    foreach ($k in @('reimagined', 'mode', 'about', 'hero', 'stretch', 'verified')) {
        if (-not ($json.PSObject.Properties.Name -contains $k)) {
            throw "shipped.json missing key: $k"
        }
    }
    Write-Host 'PASS: gold/reimagine.py exits 1,1,0 and shipped.json keys verified.'
}
finally {
    if (Test-Path -LiteralPath $backup) {
        Copy-Item -LiteralPath $backup -Destination $shipped -Force
        Remove-Item -LiteralPath $backup -Force
    }
    elseif (-not $hadShipped -and (Test-Path -LiteralPath $shipped)) {
        Remove-Item -LiteralPath $shipped -Force
    }
}
