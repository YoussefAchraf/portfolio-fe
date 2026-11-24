# Design system

## Principles

Mobile-first, calm and consistent. One accent color carries the brand; status colors are semantic and
never decorative. WCAG 2.2 AA contrast in both themes. Motion is short and purposeful and respects
`prefers-reduced-motion`.

## Tokens - `src/styles/tokens.css`

The only file allowed to declare colors and fonts (stylelint + `npm run check:policy` enforce it).
Rebranding means editing this file only.

| Group | Tokens |
|---|---|
| Typography | `--font-family-base`, `--font-size-100` ... `--font-size-700` (fluid h1), `--font-weight-regular/semibold`, `--line-height-body/heading`, `--measure` |
| Spacing (4/8 grid) | `--space-1` (4px) `--space-2` (8) `--space-3` (12) `--space-4` (16) `--space-6` (24) `--space-8` (32) `--space-12` (48) |
| Radii | `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-full` |
| Surfaces & text | `--color-bg`, `--color-surface`, `--color-surface-raised`, `--color-border`, `--color-text`, `--color-text-muted`, `--color-text-inverse` |
| Brand & status | `--color-accent`, `--color-accent-hover`, `--color-accent-contrast`, `--color-focus-ring`, `--color-success`, `--color-warning`, `--color-danger`, `--color-danger-surface` |
| Elevation | `--shadow-sm`, `--shadow-md` |
| Interaction | `--touch-target-min` (44px), `--focus-ring-width`, `--duration-fast`, `--duration-base`, `--easing-standard` |
| Layout | `--layout-max-width`, `--z-header`, `--z-overlay`, `--z-toast` |

## Themes

The theme follows the OS (`prefers-color-scheme`): the dark block in `tokens.css` redefines the semantic
color tokens. Components never know which theme is active. A manual toggle would set `data-theme` on
`<html>` and add a `[data-theme='dark']` selector next to the media query.

## Breakpoints - `src/styles/breakpoints.css`

| Name | Query |
|---|---|
| `--bp-phone-lg` | `(min-width: 480px)` |
| `--bp-tablet` | `(min-width: 768px)` |
| `--bp-desktop` | `(min-width: 1024px)` |
| `--bp-wide` | `(min-width: 1280px)` |

Usage in a CSS module: `@import '@/styles/breakpoints.css';` then `@media (--bp-tablet) { ... }`
(`@custom-media`, because CSS variables do not work inside media queries).

## Component anatomy

Every component is four co-located files: `<Thing>.tsx` (structure), `<Thing>.module.css` (presentation,
tokens only), `<Thing>.data.json` (i18n keys + static config), `use<Thing>.ts` (logic). Shared components
live in `src/shared/components/` and are created on the second need, not speculatively.

## Shared components

| Component | Purpose | Status |
|---|---|---|
| `Spinner` | Loading indicator (route chunks, lists, buttons) | implemented |
