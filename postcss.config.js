// PostCSS - used automatically by Vite for every CSS file (global and *.module.css).
//
// Breakpoints: src/styles/breakpoints.css declares `@custom-media --bp-tablet (min-width: 768px);`.
// CSS variables (var()) do NOT work inside @media conditions, so breakpoints use @custom-media,
// compiled to plain media queries by postcss-custom-media.
//
// How a component uses one:
//   @import '@/styles/breakpoints.css';      <- first line of the .module.css (Vite inlines it;
//                                               the file only holds definitions, so it adds no CSS)
//   @media (--bp-tablet) { .card { ... } }
//
// VERIFY plugin options against the pinned postcss-custom-media version when installing.
import postcssCustomMedia from 'postcss-custom-media';

export default {
  plugins: [postcssCustomMedia()],
};
