# rt-fe documentation

| Document | Audience | Content |
|---|---|---|
| [../README.md](../README.md) | everyone | Overview, feature catalog, route map, quick start |
| [architecture.md](architecture.md) | engineers | Layers, data flow, patterns, decisions |
| [design-system.md](design-system.md) | engineers, designers | Tokens, themes, breakpoints, component anatomy |
| [configuration.md](configuration.md) | engineers, ops | Environment variables, proxy, container |
| [features/](features/) | engineers | One page per feature: screens, states, API usage, code map |
| [../CHANGELOG.md](../CHANGELOG.md) | everyone | Released changes per version |

**Documentation rule:** a feature is not done until its `features/<feature>.md` page is accurate and
`npm run docs:readme` has refreshed the README (enforced by `npm run docs:check` in `npm run verify` and CI).
