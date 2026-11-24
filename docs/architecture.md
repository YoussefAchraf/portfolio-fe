# rt-fe architecture guide

The map of `src/`: what each folder contains, which files and names it uses, what it may import and what
it must never contain. Every rule points at a file of the working **hello** slice, so the shape can be
read in code. Lint (ESLint boundaries + restricted imports, oxlint, stylelint) enforces the import,
naming and styling rules; this guide explains them.

## 1. Principles

- **Feature-sliced:** code is grouped by business feature (`features/<name>/`), not by technical type.
  Features never import each other; anything needed twice moves to `shared/`.
- **One network door:** page/component -> feature hook -> feature `api/` -> `shared/lib/apiClient` ->
  `/api`. Only `features/*/api/` imports `apiClient`; only `apiClient.ts` imports axios.
- **Server state in TanStack Query, nowhere else.** Keys and fetchers live together in
  `<feature>Queries.ts`; mutations invalidate exactly the keys they change.
- **Separation per component:** structure (`.tsx`), presentation (`.module.css`), data (`.data.json`),
  logic (`use<Thing>.ts`).
- **Design tokens only:** colors and fonts exist in `styles/tokens.css` and nowhere else.
- **Everything translatable:** no literal user-facing text in components; keys in `.data.json`, text in
  `shared/i18n/locales/<lang>/<namespace>.json`, every key in every locale.

### Dependency rule (lint-enforced)

```
entry (main.tsx) -> app, shared, styles
app              -> app, routes, shared
routes           -> routes, layouts, feature, shared          (paths.ts is public to every layer)
layouts          -> layouts, shared, routes/paths              (never features: feature UI arrives via slot props)
feature X        -> feature X only, shared, routes/paths
shared           -> shared
test             -> everything; colocated *.test.ts(x) may import src/test
```

## 2. Folder by folder

### `src/main.tsx` - entry
Imports fonts, `styles/tokens.css`, `styles/global.css`, initializes i18n and renders `<App />` in
`StrictMode`. Nothing else.

### `src/app/` - providers
| File | Contains |
|---|---|
| `App.tsx` | the provider stack: `ErrorBoundary` -> `QueryClientProvider` -> `RouterProvider` |
| `ErrorBoundary.tsx` (+ `.module.css`) | last-resort fallback for render crashes outside the router |

### `src/routes/` - navigation
| File | Contains |
|---|---|
| `paths.ts` | every URL as a constant (`paths.hello`); links use it, never string literals (lint) |
| `router.tsx` | the route tree: layout -> lazily loaded pages (`lazy` route option, one chunk per page); guards and layout slots are added here |
| `RouteError.tsx` (+ css) | router error element: 404 for unknown URLs, generic error otherwise |

### `src/layouts/<Name>Layout/` - page shells
Header / main (`<Outlet />`) / footer. Layouts never import features; feature UI (a user menu) is passed
as props from `router.tsx`. Same three/four-file anatomy as components. Boilerplate: `AppLayout/`.

### `src/features/<name>/` - one business feature
| Subfolder / file | Contains | Naming | Boilerplate (`features/hello/`) |
|---|---|---|---|
| `api/<name>Api.ts` | transport: typed calls through `apiClient`, response types mirroring the backend contract | `export const <name>Api = { async verb(): Promise<T> }`, named exports only | `api/helloApi.ts` |
| `api/<name>Queries.ts` | cache contract: `<name>Keys`, `<name>Queries` (`queryOptions`), `<name>Mutations` | | `api/helloQueries.ts` |
| `hooks/use<Thing>.ts` | React Query wrappers - the only door components use for server data; mutations invalidate keys | `use<Thing>` | `hooks/useHello.ts`, `hooks/useSayHello.ts` |
| `<thing>Schema.ts` | zod schema for a form; messages are i18n keys | | `greetingSchema.ts` |
| `<name>Store.ts` | (rare) client-only state shared inside the feature (Zustand, add the dependency then) | | - |
| `components/<Thing>/` | feature UI as four-file units (section 3) | PascalCase folder | `GreetingForm/`, `GreetingList/`, `StatusPanel/` |
| `pages/<Thing>Page/` | route targets: compose components; the ONLY default exports | `<Thing>Page.tsx` default export | `pages/HelloPage/` |

### `src/shared/` - used by two or more features
| Subfolder | Contains | Boilerplate |
|---|---|---|
| `lib/` | `apiClient.ts` (axios instance, every failure -> `ApiError`), `apiError.ts`, `queryClient.ts` (defaults, `ApiError` registered as the query error type), `env.ts` (the only reader of `import.meta.env`, zod-validated) | all four |
| `types/` | cross-feature types: `errorCodes.ts` (mirror of the backend catalog + `NETWORK_ERROR`, `TIMEOUT`) | `errorCodes.ts` |
| `components/<Thing>/` | reusable UI promoted on the SECOND need | `Spinner/` |
| `hooks/`, `store/` | generic hooks; global UI-only state (theme, drawer) - never server data | (empty) |
| `i18n/` | `index.ts` (i18next init, namespaces) + `locales/<lang>/<namespace>.json` | `common`, `hello` |

### `src/styles/` - the design system
`tokens.css` (the only file with colors and fonts; dark theme via `prefers-color-scheme`), `breakpoints.css`
(`@custom-media --bp-*`, because CSS variables do not work inside `@media`), `global.css` (reset, base).

### `src/test/` - test harness
`setup.ts` (jest-dom, real i18n in `en`, MSW lifecycle with unhandled requests failing the test),
`server.ts` (MSW in Node mode - never a browser service worker), `handlers/<feature>Handlers.ts`
(contract-shaped fake backend), `renderWithProviders.tsx` (fresh QueryClient per test).

### Outside `src/`
| Path | Contains |
|---|---|
| `docker/nginx/` | `default.conf.template` (serves the SPA, proxies `/api` to `BACKEND_UPSTREAM` with the upstream Host + SNI) + `security-headers.conf` (CSP and friends) |
| `Dockerfile` | build stage (Vite) -> unprivileged nginx runtime |
| `scripts/` | git hooks, policy check, README generator, Linux lockfile sync, Vitest launcher |
| `docs/` | this guide, configuration, design system, `features/<feature>.md` (feed the README) |

## 3. Component anatomy - four files, one responsibility each

| File | Allowed | Forbidden |
|---|---|---|
| `<Thing>.tsx` | JSX binding `styles.*`, `data.*`, the logic hook, `t(key)` | inline `style`, literal text, logic beyond trivial binding, fetching |
| `<Thing>.module.css` | tokens (`var(--...)`), camelCase classes, `@media (--bp-*)`, every interactive state | colors/fonts literals, pixel breakpoints |
| `<Thing>.data.json` | i18n KEYS and static config (ids, limits, option lists) | translatable text, secrets, server data |
| `use<Thing>.ts` | state, handlers, derived values, feature hooks | JSX, styles, strings, apiClient/axios |

Trivial components may omit the hook (`StatusPanel`, `GreetingList`) or the data file - never `.tsx` or
`.module.css`. Boilerplate four-file unit: `features/hello/components/GreetingForm/`.

## 4. The write path (`GreetingForm` -> database)

| # | File | What happens |
|---|---|---|
| 1 | `GreetingForm.tsx` | binds the input, button, errors and answer from `useGreetingForm` |
| 2 | `useGreetingForm.ts` | react-hook-form + `greetingSchema` (1-60 chars) -> `useSayHello().mutateAsync(name)` |
| 3 | `hooks/useSayHello.ts` | `useMutation(helloMutations.create)`; on success invalidates `helloKeys.all` |
| 4 | `api/helloApi.ts` -> `shared/lib/apiClient.ts` | `POST /api/v1/hello`; a 4xx/5xx becomes `ApiError(code, status, fields)` |
| 5 | nginx (prod) / Vite proxy (dev) | strips `/api`, forwards to the backend `POST /v1/hello` |
| 6 | back in the form | answer `hello <name>` shown in a live region; `GreetingList` refetches from the database |

## 5. Adding a feature by copying the boilerplate

1. Contract exists in `contracts/openapi/<feature>.yaml`; types in `api/<feature>Api.ts` mirror it.
2. `features/<feature>/api/{<feature>Api,<feature>Queries}.ts` (copy `hello/api/`).
3. `hooks/use<Thing>.ts` per query/mutation (copy `useHello.ts`, `useSayHello.ts`).
4. Components as four-file units (copy `GreetingForm/`), a page (copy `pages/HelloPage/`).
5. `paths.ts` entry + lazy route in `router.tsx`.
6. Locale files `locales/{en,fr}/<feature>.json` + namespace in `shared/i18n/index.ts`.
7. MSW handlers `src/test/handlers/<feature>Handlers.ts` + registered in `server.ts`; tests next to units.
8. `docs/features/<feature>.md`, CHANGELOG line, `npm run docs:readme`.

Remove the demo once real features exist: `features/hello/`, its route, `locales/*/hello.json`,
`test/handlers/helloHandlers.ts`, `docs/features/hello.md`.

## 6. Checklist (before every push)

- [ ] Right folder and name; four-file units; pages are the only default exports.
- [ ] Network only through the feature `api/`; server data only in TanStack Query; errors handled by `code`.
- [ ] Tokens only; mobile-first; every state styled (hover, focus-visible, disabled, loading, empty, error).
- [ ] Labels visible, errors linked (`aria-describedby`), async results in live regions; works at 320 px.
- [ ] Every i18n key in every locale; no literal text.
- [ ] `npm run verify` green (lint, policy, docs, typecheck, tests, build).
