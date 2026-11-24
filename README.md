# rt-fe

**Accessible, mobile-first single-page application built with React 19 and TypeScript, using a
feature-sliced architecture, TanStack Query and a token-based design system.**

![React](https://img.shields.io/badge/react-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/typescript-5.9-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/vite-8-646CFF?logo=vite&logoColor=white)
![TanStack Query](https://img.shields.io/badge/tanstack%20query-5-FF4154)
![WCAG](https://img.shields.io/badge/a11y-WCAG%202.2%20AA-0A7D33)
<!-- CI badge (set once the repository exists):
![CI](https://github.com/<org>/<repo>/actions/workflows/on-pull-request.yml/badge.svg?branch=dev) -->

## Table of contents

1. [Overview](#overview)
2. [Features](#features)
3. [Route map](#route-map)
4. [Architecture](#architecture)
5. [Tech stack](#tech-stack)
6. [Getting started](#getting-started)
7. [Configuration](#configuration)
8. [Scripts](#scripts)
9. [Project structure](#project-structure)
10. [Design system](#design-system)
11. [Testing](#testing)
12. [CI/CD and branching](#cicd-and-branching)
13. [Deployment](#deployment)
14. [Security](#security)
15. [Contributing](#contributing)
16. [Documentation](#documentation)

## Overview

rt-fe is the frontend of the fs-reustemp full-stack workspace. It talks to the et-be API through a
same-origin proxy (`/api/v1`) and never handles tokens itself. It ships a working **hello** page: stack
status (frontend / API / database), a name form that writes to PostgreSQL through the backend, and the
list read back from it - the proof that the whole chain is configured.

- **Feature-sliced**: every feature is an isolated vertical slice; boundaries are enforced by lint.
- **Secure by default**: strict CSP and security headers from nginx, one HTTP client that turns every
  failure into a typed `ApiError`, no auth data in browser storage (cookie sessions arrive with auth).
- **Fast**: route-level code splitting, cached server state (TanStack Query), Web Vitals budgets.
- **Inclusive**: mobile-first from 320 px, WCAG 2.2 AA, keyboard paths, reduced-motion support, en/fr.
- **No offline layer by design**: no service worker or PWA (decision record 0001).

## Features

<!-- AUTO-GENERATED:FEATURES:START -->
<!-- Do not edit by hand: written by `npm run docs:readme` from docs/. -->

| Feature | Status | Since | Summary |
|---|---|---|---|
| [Hello (full-stack template)](docs/features/hello.md) | released | - | Type a name - it travels through nginx to the backend, is stored in PostgreSQL, and the backend answers "hello <name>". |
| [Wake-up splash (server gate)](docs/features/server-status.md) | released | - | An animated splash says the server is waking up; the app appears only when the backend and its database are ready. |
| [Portfolio home](docs/features/profile.md) | in-progress | - | Bilingual portfolio hero and About with dark, light and system themes. |

<!-- AUTO-GENERATED:FEATURES:END -->

Feature pages: [docs/features/](docs/features/). Release history: [CHANGELOG.md](CHANGELOG.md).

## Route map

<!-- AUTO-GENERATED:ROUTES:START -->
<!-- Do not edit by hand: written by `npm run docs:readme` from docs/. -->

| Route | Access | Feature | Status |
|---|---|---|---|
| `-` | public | [Hello (full-stack template)](docs/features/hello.md) | released |
| `/` | public | [Portfolio home](docs/features/profile.md) | in-progress |
| `/fr` | public | [Portfolio home](docs/features/profile.md) | in-progress |

<!-- AUTO-GENERATED:ROUTES:END -->

Access: `public` (anyone), `guest` (signed-out only), `protected` (signed-in), `role:<name>` (signed-in with role).
Authorization is always enforced by the API; guards only shape the experience.

## Latest changes

<!-- AUTO-GENERATED:CHANGES:START -->
<!-- Do not edit by hand: written by `npm run docs:readme` from docs/. -->

**Unreleased (merged into dev)**

- (001) Localized portfolio home with About, persisted theme selection and backend readiness splash.
_Added_
- Wake-up splash (server gate): an animated splash says the server is waking up; the app mounts only when the backend and its database are ready (free hosting sleeps). See docs/features/server-status.md.
_Security_
- Security hardening: GitHub Actions pinned to commit SHAs; README table escaping fixed (CodeQL); SECURITY.md; squash merges into dev. Docker build takes the public VITE_* values from Actions variables.
_Changed_
- Hello template replaces the placeholders: stack status (frontend / API / database from /api/ready), a name form that POSTs to the backend and shows "hello <name>", and the greetings list read from PostgreSQL; four-file components, TanStack Query, react-hook-form + zod, en/fr.
- Only necessary infrastructure kept: json-server mock, theme store and unused dependencies (date-fns, lucide-react, motion, zustand, react-query-devtools) removed; dark theme follows prefers-color-scheme.
- Test runner launched from the canonical path (scripts/run-vitest.mjs): Windows lowercase drive letters broke Vitest; ApiError registered as the TanStack Query error type.
- README: generated "Latest changes" section from this CHANGELOG; docs/architecture.md rewritten as the folder-by-folder guide.
_Fixed_
- nginx /api and /socket.io proxies send the upstream's own Host (+ TLS SNI, browser host in X-Forwarded-Host): a backend behind a host-routed platform (Render) was unreachable through the frontend.
- Pilot task 004: session expiry is registered by the auth feature api layer (App.tsx could not import apiClient under the lint rules); SessionGate gets its own file (oxlint only-export-components); NEW-PROJECT renames the index.html title.
- Pilot task 002: co-located *.test.ts(x) files may import the src/test harness (boundaries file category); Spinner and themeStore headers no longer contradict their CSS / point at a file the agent does not own.
- First real CI run (pilot project): Trivy action tag v0.36.0; Dependabot targets dev and ignores Node majors; Docker install step failed on the prepare hook (git-hooks.mjs now copied into the image).
- Lockfiles written on Windows broke npm ci on Linux CI: new `npm run lock:sync` (Linux lockfile via Docker, then npm ci); the pre-push hook checks the lockfile with the CI npm (10.9.8) on every push.
- nginx runtime image 1.27 -> 1.31-alpine + apk upgrade at build (Trivy gate failed on fixable CRITICAL CVEs).
- Own .gitattributes (LF everywhere; CHANGELOG union merge) - Windows checkouts no longer rewrite every line.
- ESLint boundaries: single files classified with file descriptors (plugin 7); no-console enforced in src/; stricter ts-comment rule.
- Node engine floor 22.22.2 (dev dependencies require it).
_Added_
- Git hooks installed by npm install (commit format, no AI attribution, no secrets/.env/BOM, branch naming, CHANGELOG line, lockfile sync, up to date with dev, local pipeline before push) and a unified policy check (no file-wide lint disables, no .only/.skip tests, no BOM).
- CI: verify on every push to dev (on-dev-push.yml); policy job.
- Template baseline: feature-sliced React 19 architecture with documented placeholders for the auth

<!-- AUTO-GENERATED:CHANGES:END -->

## Architecture

```mermaid
flowchart LR
  Page["pages / components"] --> Hooks["feature hooks (TanStack Query)"]
  Hooks --> Api["feature api (queryOptions + transport)"]
  Api --> Client["shared apiClient (cookies, CSRF, refresh, ApiError)"]
  Client -->|/api/v1| Proxy["Vite proxy / nginx"]
  Proxy --> BE["et-be"]
```

| Layer | Responsibility |
|---|---|
| `app/` | Providers, error boundary, session gate |
| `routes/` | Route tree, guards, lazy page registry |
| `layouts/` | Page shells with slots |
| `features/<name>/` | api, hooks, components, pages of one capability |
| `shared/` | apiClient, types, generic components and hooks, stores, i18n |
| `styles/` | Design tokens, breakpoints, global reset |

Details: [docs/architecture.md](docs/architecture.md).

## Tech stack

| Concern | Choice |
|---|---|
| UI | React 19, TypeScript 5.9 (strict), CSS Modules on design tokens, react-hook-form + zod |
| Build | Vite 8, PostCSS (`@custom-media`) |
| Routing | React Router 7 (native lazy routes, guards) |
| Server state | TanStack Query 5 (`queryOptions` per feature) |
| Client state | Zustand 5 (session identity, theme) |
| Forms | react-hook-form + zod |
| HTTP | axios (single `apiClient`) |
| i18n | i18next + react-i18next (en, fr) |
| Tests | Vitest, Testing Library, MSW (Node) |
| Quality | ESLint 9 (boundaries, react-hooks), oxlint, stylelint, policy script |
| Delivery | Docker (unprivileged nginx), GitHub Actions, GHCR, Trivy, CodeQL, gitleaks |

## Getting started

**Prerequisites:** Node.js 22 (`.nvmrc`) and a running et-be on port 4000 - or the whole stack from the
workspace: `docker compose up -d --build` (http://localhost:3000).

```bash
cp .env.example .env
npm ci                      # installs dependencies + git hooks
npm run dev                 # http://localhost:3000 (proxies /api to et-be on :4000)
```

Tests never need a backend: MSW (Node mode) simulates the contract.

## Configuration

`VITE_API_BASE_URL`, `VITE_DEFAULT_LOCALE` (read by the app), `VITE_BACKEND_UPSTREAM`, `VITE_USE_MOCK`,
`VITE_MOCK_UPSTREAM` (dev proxy), `BACKEND_UPSTREAM` (container). Every `VITE_*` value is public.
Full reference: [docs/configuration.md](docs/configuration.md).

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` / `npm run preview` | Dev server / serve the production build |
| `npm run build` | Typecheck (project references) + production build |
| `npm run verify` | **Local pipeline** (lint, policy, docs check, typecheck, tests, build) - run before every push |
| `npm run lint` | ESLint + oxlint + stylelint (zero warnings) |
| `npm run check:policy` | No PWA files/packages, no color/font literals in code |
| `npm test` / `npm run test:watch` | Vitest |
| `npm run docs:readme` / `docs:check` | Regenerate / verify the generated README sections |

## Project structure

```
src/
  main.tsx                 entry
  app/                     providers, error boundary
  routes/                  paths, router (lazy pages), route error
  layouts/                 AppLayout (slots)
  features/<name>/         api/, hooks/, components/, pages/
  shared/                  lib/ (apiClient...), types/, components/, hooks/, store/, i18n/
  styles/                  tokens.css, breakpoints.css, global.css
  test/                    setup, render helper, MSW server + handlers
docker/nginx/              nginx template + security headers
scripts/                   git hooks, policy, README generator, lockfile sync, Vitest launcher
docs/                      architecture, design system, configuration, feature pages
```

## Design system

Colors, fonts, spacing, radii, shadows and motion are tokens in `src/styles/tokens.css` (light and dark
themes); breakpoints are `@custom-media` in `src/styles/breakpoints.css`. Components are four co-located
files (structure, styles, i18n data, logic). Reference: [docs/design-system.md](docs/design-system.md).

## Testing

Component and hook tests with Vitest and Testing Library, rendered through `renderWithProviders`.
Network calls are intercepted by MSW in Node mode, so tests exercise the real `apiClient`
(CSRF, refresh, error normalization). No live backend, no browser service worker.

## CI/CD and branching

- One branch per task: `feature/`, `fix/`, `refactor/`, `perf/`, `test/`, `docs/`, `chore/`, `ci/` from `dev`;
  `hotfix/` from `main`. Commits: `type(<task>): summary`.
- Push to a work branch: **verify** (lint, policy, typecheck, tests, boundaries report, dependency audit,
  secret scan, README docs check), then a PR into `dev` with auto-merge.
- Pull requests: verify + Docker build and Trivy scan. `main`: verify + image published to GHCR.
  Weekly CodeQL. `dev` -> `main` promotion is a manual workflow.

## Deployment

Static build served by unprivileged nginx on port 8080. Set `BACKEND_UPSTREAM` at run time to point
`/api` and `/socket.io` at et-be; one image serves every environment. Health: `GET /healthz`.
Hashed assets are cached for a year; `index.html` is never cached.

## Security

No tokens in JavaScript (httpOnly cookies), CSRF header on every write, single-flight refresh,
strict Content Security Policy and security headers from nginx, lint bans on `dangerouslySetInnerHTML`,
inline styles, `window.open` and auth data in web storage, validated external URLs (`safeOpen`).
Report vulnerabilities privately to the repository owner.

## Contributing

1. Work from a task brief (`contracts/tasks/` in the workspace) on its branch.
2. Follow [docs/architecture.md](docs/architecture.md) (folders, file anatomy, naming - lint-enforced) and copy
   the boilerplate file of the same kind.
3. Update the feature page in `docs/features/`, add a CHANGELOG line, run `npm run docs:readme`.
4. `npm run verify` must be green before pushing. No AI attribution in commits, branches or PRs.

## Documentation

| Document | Content |
|---|---|
| [docs/README.md](docs/README.md) | Documentation index |
| [docs/architecture.md](docs/architecture.md) | Layers, data flow, patterns, decisions |
| [docs/design-system.md](docs/design-system.md) | Tokens, themes, breakpoints, components |
| [docs/configuration.md](docs/configuration.md) | Environment variables, proxy, container |
| [docs/features/](docs/features/) | One page per feature |
| [CHANGELOG.md](CHANGELOG.md) | Release history |

## License

Proprietary unless the owner adds a `LICENSE` file.
