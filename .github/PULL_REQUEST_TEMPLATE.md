## Task

- Brief: `contracts/tasks/NNN-fe-<slug>.md`
- Branch: `<type>/NNN-<slug>` (agents/ENGINEER.md 7)

## What & why

<!-- 2-5 lines. Link contract operations consumed (contracts/openapi/<feature>.yaml#operationId). -->

## Verification

- [ ] `npm run verify` green locally (lint + policy + typecheck + tests + build)
- [ ] Responsive checked at 320 / 768 / 1280 px; keyboard path and focus states checked
- [ ] Loading / empty / error / success states implemented

## Architecture & contract

- [ ] Route strings via `paths.ts`; API calls only through the feature `api/` layer
- [ ] Types match the contract; mock resource shaped to the contract (listed in the brief result)
- [ ] Tokens only (no hex/font literals), i18n keys in BOTH locales

## Hygiene

- [ ] Feature page in `docs/features/`, CHANGELOG line, `npm run docs:readme` run (README generated sections current)
- [ ] Feature page + CHANGELOG line + `npm run docs:readme` (README sections current)
- [ ] No-attribution self-check printed `clean` (commits, branch, this PR text)
