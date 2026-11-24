# Changelog

All notable changes to rt-fe. Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/);
versions follow [Semantic Versioning](https://semver.org/).

- Every task adds a line under **Unreleased** (Added / Changed / Fixed / Removed / Security), with its task id.
- The release task (when `dev` is promoted to `main`) renames **Unreleased** to the new version and date,
  sets `since:` on the released feature pages, and runs `npm run docs:readme`.

## [Unreleased]

- (001) Localized portfolio home with About, persisted theme selection and backend readiness splash.

### Added
- Wake-up splash (server gate): an animated splash says the server is waking up; the app mounts only when the backend and its database are ready (free hosting sleeps). See docs/features/server-status.md.

### Security
- Security hardening: GitHub Actions pinned to commit SHAs; README table escaping fixed (CodeQL); SECURITY.md; squash merges into dev. Docker build takes the public VITE_* values from Actions variables.

### Changed
- Hello template replaces the placeholders: stack status (frontend / API / database from /api/ready), a name form that POSTs to the backend and shows "hello <name>", and the greetings list read from PostgreSQL; four-file components, TanStack Query, react-hook-form + zod, en/fr.
- Only necessary infrastructure kept: json-server mock, theme store and unused dependencies (date-fns, lucide-react, motion, zustand, react-query-devtools) removed; dark theme follows prefers-color-scheme.
- Test runner launched from the canonical path (scripts/run-vitest.mjs): Windows lowercase drive letters broke Vitest; ApiError registered as the TanStack Query error type.
- README: generated "Latest changes" section from this CHANGELOG; docs/architecture.md rewritten as the folder-by-folder guide.

### Fixed
- nginx /api and /socket.io proxies send the upstream's own Host (+ TLS SNI, browser host in X-Forwarded-Host): a backend behind a host-routed platform (Render) was unreachable through the frontend.
- Pilot task 004: session expiry is registered by the auth feature api layer (App.tsx could not import apiClient under the lint rules); SessionGate gets its own file (oxlint only-export-components); NEW-PROJECT renames the index.html title.
- Pilot task 002: co-located *.test.ts(x) files may import the src/test harness (boundaries file category); Spinner and themeStore headers no longer contradict their CSS / point at a file the agent does not own.
- First real CI run (pilot project): Trivy action tag v0.36.0; Dependabot targets dev and ignores Node majors; Docker install step failed on the prepare hook (git-hooks.mjs now copied into the image).
- Lockfiles written on Windows broke npm ci on Linux CI: new `npm run lock:sync` (Linux lockfile via Docker, then npm ci); the pre-push hook checks the lockfile with the CI npm (10.9.8) on every push.
- nginx runtime image 1.27 -> 1.31-alpine + apk upgrade at build (Trivy gate failed on fixable CRITICAL CVEs).
- Own .gitattributes (LF everywhere; CHANGELOG union merge) - Windows checkouts no longer rewrite every line.
- ESLint boundaries: single files classified with file descriptors (plugin 7); no-console enforced in src/; stricter ts-comment rule.
- Node engine floor 22.22.2 (dev dependencies require it).

### Added
- Git hooks installed by npm install (commit format, no AI attribution, no secrets/.env/BOM, branch naming, CHANGELOG line, lockfile sync, up to date with dev, local pipeline before push) and a unified policy check (no file-wide lint disables, no .only/.skip tests, no BOM).
- CI: verify on every push to dev (on-dev-push.yml); policy job.
- Template baseline: feature-sliced React 19 architecture with documented placeholders for the auth
  reference slice and home page, design tokens (light/dark), `@custom-media` breakpoints, en/fr locales,
  contract-following json-server mock, unprivileged nginx image, CI (verify, policy, CodeQL, Docker build +
  Trivy), generated README sections from `docs/`.
