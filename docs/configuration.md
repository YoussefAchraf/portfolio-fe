# Configuration

Every `VITE_*` variable is **public** - it is bundled into browser code. Never put secrets in them.
Local values: copy `.env.example` to `.env`.

## Environment variables

| Variable | Read by | Default | Description |
|---|---|---|---|
| `VITE_API_BASE_URL` | app (`src/shared/lib/env.ts`) | `/api` | API base as seen by the browser; proxies strip `/api` |
| `VITE_DEFAULT_LOCALE` | app | `en` | Fallback UI language (`en` \| `fr`) |
| `VITE_BACKEND_UPSTREAM` | `vite.config.ts` (dev proxy) | `http://localhost:4000` | et-be address for `npm run dev` / `preview` |

New app variables are added to `src/shared/lib/env.ts`, `.env.example` and this table in the same change.

## Proxying

| Path | Dev (Vite) | Container (nginx) |
|---|---|---|
| `/api/*` | -> backend, `/api` stripped | -> `${BACKEND_UPSTREAM}`, `/api` stripped |
| `/socket.io/*` | -> backend (optional Realtime module) | -> `${BACKEND_UPSTREAM}` (websocket upgrade) |
| everything else | Vite dev server | static files, SPA fallback to `index.html` |

## Container

| Setting | Value |
|---|---|
| Image | `nginxinc/nginx-unprivileged` (non-root), port 8080 |
| Runtime variable | `BACKEND_UPSTREAM` (default `http://backend:4000`) - rendered into nginx config at start |
| Health | `GET /healthz` |
| Caching | `/assets/*` immutable for 1 year; `index.html` no-cache |
| Security headers | CSP, nosniff, referrer policy, frame denial, permissions policy (`docker/nginx/security-headers.conf`) |

Local: `docker compose up -d --build` -> http://localhost:3000 (expects et-be on the host's port 4000).

## Known issue: production build on Windows

A `npm run build` made on Windows currently produces a bundle that crashes in the browser
(`Cannot read properties of null (reading 'useContext')`): Rolldown 1.2.19 (Vite 8.3.8) bundles React twice.
Builds made on Linux - Render, the Docker image, CI - are correct. To check the production app locally,
run the Docker image (`docker compose up` from the workspace) instead of `vite build` + `vite preview` on
Windows. `npm run dev` is not affected. Retest after a Vite update.
