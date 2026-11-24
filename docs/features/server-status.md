---
feature: server-status
title: Wake-up splash (server gate)
status: released           # template baseline: every project built from the template keeps it
since: -
task: -
summary: An animated splash says the server is waking up; the app appears only when the backend and its database are ready.
---

# Wake-up splash (server gate)

## Overview

On free hosting the backend sleeps when nobody uses it (Render free web service) and needs up to a
minute to wake; the database can be suspended too (Neon). The frontend is static and always awake, so it
shows a splash immediately and asks the backend's readiness probe until the backend AND every dependency
check (Postgres) answer ok. Only then does the app mount - pages never send a request to a sleeping
backend - and the splash fades out. The gate wraps the root layout (`src/routes/router.tsx`): every route,
including future ones, is behind it. It opens once per visit.

## Screens & states

| State | When | What the user sees |
|---|---|---|
| connecting | first probe in flight | nothing for 200 ms (an awake backend answers first: no flash), then the splash |
| waking | the probe answered "not ready", a proxy error or a timeout | "Waking up the server..." + why |
| slow | after 10 s | "Still waking up - this can take up to a minute." |
| timeout | after 2 min (polling stops) | alert "The server did not wake up." + Try again |
| ready | backend + database ok | the app; the splash fades out and leaves the DOM |

Accessibility: messages in a polite `role="status"` region, the timeout is a `role="alert"` with a real
button (44 px target, focus ring); the fading splash is `inert` and `aria-hidden`; reduced motion keeps a
slow animation (never frozen) and an instant fade.

## API usage

- `GET /api/ready` (et-be readiness probe: `{ status: 'ready' | 'not_ready', checks: { postgres: 'ok' | 'down' } }`,
  200 or 503). Every failure (timeout 10 s, network error, 502 from the proxy, 503) means "still waking".
- Polled every 3 s with TanStack Query (`refetchInterval`); the "ready" answer is cached for the visit.

## Files

| File | Role |
|---|---|
| `src/features/server-status/api/serverStatusApi.ts` | probe -> `'ready' \| 'waking'`, never throws |
| `src/features/server-status/api/serverStatusQueries.ts` | query key + options (cached for the visit) |
| `src/features/server-status/hooks/useServerReady.ts` | polling + phases (connecting, waking, slow, timeout, ready) |
| `src/features/server-status/components/ServerGate/` | splash (tsx, css, data.json with timings, useServerGate.ts, test) |
| `src/shared/i18n/locales/<lang>/serverStatus.json` | messages (en, fr) |

## Configuration

Timings live in `ServerGate.data.json` (`pollMs`, `slowAfterMs`, `timeoutMs`). A project hosted on an
always-on plan can keep the gate: an awake backend answers in milliseconds and the splash never shows.
