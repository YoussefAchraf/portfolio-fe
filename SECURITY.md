# Security policy

## Reporting a vulnerability

Please report security issues **privately** through GitHub: **Security** tab -> **Report a vulnerability**
(private vulnerability reporting is enabled). Do not open a public issue for a vulnerability.

Include what is affected, steps to reproduce, and the impact you expect. You will get an answer within
7 days. Confirmed issues are fixed as soon as possible and you are credited unless you prefer otherwise.

## Supported versions

Only the latest release on `main` and the `dev` branch receive security fixes.

## Protections in place

- Secret scanning with push protection; gitleaks in CI.
- Dependabot alerts and security updates; `npm audit` in CI.
- CodeQL code scanning, required to pass on pull requests; Trivy scan of every Docker image.
- Rulesets on `dev` and `main`: pull requests only, required checks, signed commits, no force pushes or
  deletions; release tags (`v*`) are immutable.
- GitHub Actions restricted to GitHub-owned and verified creators and pinned to commit SHAs.
- Configuration and secrets are injected at runtime by the hosting platform; images contain none.
