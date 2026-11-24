---
feature: <kebab-name>
title: <Human title>
status: planned            # planned | in-progress | released | deprecated
since: -                   # version that first shipped it to main (set by the release task)
task: <NNN>                # task id(s), comma-separated
summary: <One sentence: what the user can do.>
routes: </path [access]>   # access: public | guest | protected | role:<name>; comma-separated
---

# <Human title>

> Copy this file to `docs/features/<feature>.md`. The front-matter feeds the README feature and route
> tables (`npm run docs:readme`); keep it accurate. Write for an engineer joining the team.

## Overview

<What the user can do, for which role, key UX rules. 3-6 lines.>

## Screens & states

| Screen (route) | States designed | Notes |
|---|---|---|
| `<path>` | loading, empty, error, success | <responsive / a11y notes> |

## API usage

- Contract: `contracts/openapi/<feature>.yaml` (workspace) - operations consumed: `<operationId>`, ...
- Error codes handled and their UX: `<CODE>` -> <message key / behavior>
- Mock resource while the backend is pending: `mock/...` (remove when migrated)

## Code map

| Part | Files |
|---|---|
| API + queries | `src/features/<f>/api/<f>Api.ts`, `<f>Queries.ts` |
| Hooks | `src/features/<f>/hooks/...` |
| Components | `src/features/<f>/components/<Thing>/` |
| Pages | `src/features/<f>/pages/<Thing>Page/` |
| Routing | `src/routes/paths.ts`, `routeModules.ts`, `router.tsx` |
| i18n | `src/shared/i18n/locales/{en,fr}/<f>.json` |

## State & caching

<Query keys, staleTime, invalidation after mutations, any store usage.>

## Testing

<Which component/hook tests cover it (MSW handlers used) and how to run them.>
