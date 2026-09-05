# RELEASES_TOKEN — letting the release bot land its own PRs

## The platform rule, precisely

A pull request **created with the default `GITHUB_TOKEN`** cannot trigger the
`pull_request` workflows that provide a repo's required status checks. GitHub
does this on purpose: a workflow could otherwise approve its own code.

Consequence for this repo: the release pipeline's token-board PRs (created
with `GITHUB_TOKEN`) can never accumulate the required `battery`/`review`
checks, so they cannot auto-merge. Today the pipeline treats them as
**drift notices** (non-fatal) and ships the boards as a release asset
(`token-boards.zip`) so nothing is lost.

This guide upgrades that to a fully-automated flow using a fine-grained
personal access token that belongs to the repo owner — exactly the pattern
GitHub's own docs recommend for trusted automation.

## 1. Create the fine-grained token

GitHub → Settings → Developer settings → **Fine-grained personal access
tokens** → Generate new token:

| Setting | Value |
|---|---|
| Token name | `reimagine-it-releases` |
| Expiration | 90 days (calendar a rotation reminder) |
| Resource owner | `Kayforkind` |
| Repository access | **Only select repositories** → `Kayforkind/reimagine-it` |
| Permissions → Contents | **Read and write** (push the boards branch) |
| Permissions → Pull requests | **Read and write** (open the PR; no approve) |

Deliberately minimal: no admin, no secrets access, no other repos, no
workflow scope. The token can push *branches* and open *PRs* — and because
main is protected with `enforce_admins`, it still cannot touch main
directly. All it adds over `GITHUB_TOKEN` is the right to have its PRs
**run the required workflows**.

## 2. Add it as a repo secret

Repo → Settings → Secrets and variables → **Actions** → New repository
secret:

- Name: `RELEASES_TOKEN`
- Secret: the token value

Secret scanning will not flag it (it is not committed anywhere) and push
protection stays silent for the same reason.

## 3. The one-line workflow change

In `.github/workflows/release-benchmark.yml`, the `token-board` job's
checkout becomes:

```yaml
- uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
  with:
    # RELEASES_TOKEN PRs DO trigger the pull_request workflows, so the
    # boards PR can collect the required checks and auto-merge.
    token: ${{ secrets.RELEASES_TOKEN || github.token }}
```

The `|| github.token` fallback keeps the workflow working (advisory drift
PR only) if the secret is absent — same behavior as today.

Also give the job's `gh` calls the same token so `gh pr create`/`gh pr
merge` act as the owner:

```yaml
env:
  GH_TOKEN: ${{ secrets.RELEASES_TOKEN || github.token }}
```

## 4. Result

On the next release where the boards change, the pipeline will:

1. push `boards/<tag>-<ts>` (as either token),
2. open the PR (as `RELEASES_TOKEN` when present),
3. the PR **runs the full `battery` + `review` gate**,
4. `gh pr merge --auto` lands it when green.

The audit trail stays complete: the PR is visible, attributed to the
owner, and passed every required check — the same bar as any human PR.

## 5. Rotation and revocation

- The token expires on its own (90 days) — the next release fails with a
  401 and falls back to the advisory flow, which is the designed failure
  mode: visible, non-blocking.
- Revoke instantly at Settings → Developer settings → Fine-grained tokens.
- Never widen the permissions instead of rotating; create a new token.

## Why not a GitHub App?

A GitHub App installation token would also work and doesn't expire as a
personal credential — but it is more moving parts (app registration,
private key, JWT exchange) for a single-repo, single-owner project. The
fine-grained PAT is the honest 80/20. Revisit if the project gains
co-maintainers.
