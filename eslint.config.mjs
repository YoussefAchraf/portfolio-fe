// ESLint 9 flat config for rt-fe (runs alongside oxlint and stylelint: `npm run lint`).
//
// IMPORTANT (flat-config semantics): when two blocks match the same file and set the SAME
// rule, the later block REPLACES the earlier one; it does not merge. So every block below
// that sets `no-restricted-imports` / `no-restricted-syntax` declares its COMPLETE list,
// built from the shared IMPORT / SYNTAX pieces. Never add a partial block for those rules.

import js from '@eslint/js';
import boundaries from 'eslint-plugin-boundaries';
import importPlugin from 'eslint-plugin-import';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// ---------------------------------------------------------------------------
// Architecture elements (eslint-plugin-boundaries)
// ---------------------------------------------------------------------------
// Element descriptors match FOLDERS (eslint-plugin-boundaries 7); single files are classified with
// file descriptors (categories). Verified against the installed 7.4.4 README, types and violation tests.
const boundariesElements = [
  { type: 'app', pattern: 'src/app/**' },
  { type: 'routes', pattern: 'src/routes/**' },
  { type: 'layouts', pattern: 'src/layouts/**' },
  // One element per feature folder; `featureName` lets policies allow same-feature imports only.
  { type: 'feature', pattern: 'src/features/*', capture: ['featureName'] },
  { type: 'shared', pattern: 'src/shared/**' },
  { type: 'styles', pattern: 'src/styles/**' },
  { type: 'test', pattern: 'src/test/**' },
];

const boundariesFiles = [
  { pattern: 'src/main.tsx', category: 'entry' },
  // The two route files every layer may use (route strings + chunk prefetch).
  { pattern: 'src/routes/{paths,prefetchRoute}.ts', category: 'route-public' },
  // Tests next to their unit (AGENTS.md section 10) may use the shared test harness in src/test/.
  { pattern: 'src/**/*.test.{ts,tsx}', category: 'colocated-test' },
];
const TO_ROUTE_PUBLIC = { to: { file: { categories: 'route-public' } } };

// ---------------------------------------------------------------------------
// Shared restriction pieces
// ---------------------------------------------------------------------------
const IMPORT = {
  axios: { name: 'axios', message: 'Only src/shared/lib/apiClient.ts may import axios. Use your feature api/ layer.' },
};
const IMPORT_PATTERN = {
  apiClient: {
    group: ['**/shared/lib/apiClient', '@/shared/lib/apiClient'],
    message: 'Only a feature api/ folder may import apiClient (pages -> hooks -> api -> apiClient).',
  },
};

const SYNTAX = {
  noInnerHtml: {
    selector: "JSXAttribute[name.name='dangerouslySetInnerHTML']",
    message: 'dangerouslySetInnerHTML is forbidden without an approved sanitizer (agents/ENGINEER.md 6.3).',
  },
  noInlineStyle: {
    selector: "JSXAttribute[name.name='style']",
    message: 'Inline styles are forbidden - use a CSS module consuming tokens from src/styles/tokens.css.',
  },
  noWindowOpen: {
    selector: "MemberExpression[object.name='window'][property.name='open']",
    message: 'Use safeOpen() from src/shared/lib/safeOpen.ts (validates the URL) instead of window.open.',
  },
  noInlineRoutePath: {
    selector: "JSXAttribute[name.name='to'] > Literal",
    message: 'Route strings come from src/routes/paths.ts, never inline literals.',
  },
  noInlineRoutePathTemplate: {
    selector: "JSXAttribute[name.name='to'] > JSXExpressionContainer > TemplateLiteral",
    message: 'Build route strings with the helpers in src/routes/paths.ts, never inline templates.',
  },
  noDefaultExportInApi: {
    selector: 'ExportDefaultDeclaration',
    message: 'Feature api modules export named objects (authApi, authQueries), never a default export.',
  },
};
const SECURITY = [SYNTAX.noInnerHtml, SYNTAX.noInlineStyle, SYNTAX.noWindowOpen];

const banImports = ({ paths = [], patterns = [] }) => ({ 'no-restricted-imports': ['error', { paths, patterns }] });
const banSyntax = (...items) => ({ 'no-restricted-syntax': ['error', ...items] });

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
export default tseslint.config(
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**'],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  // Node scripts (ESM) -----------------------------------------------------------
  {
    files: ['scripts/**/*.mjs', 'postcss.config.js'],
    languageOptions: { sourceType: 'module', globals: globals.node },
  },

  // Base rules for application sources -------------------------------------
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.app.json',
        tsconfigRootDir: import.meta.dirname,
      },
      globals: globals.browser,
    },
    plugins: {
      import: importPlugin,
      'react-hooks': reactHooks,
    },
    settings: {
      'import/resolver': { typescript: { project: './tsconfig.app.json' } },
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
      'import/no-cycle': 'error',
      'import/no-default-export': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      // Ban the ts-ignore directive; allow ts-expect-error only with a real explanation (>= 15 chars).
      '@typescript-eslint/ban-ts-comment': ['error', { 'ts-expect-error': 'allow-with-description', minimumDescriptionLength: 15 }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        { allowExpressions: true, allowTypedFunctionExpressions: true },
      ],
      '@typescript-eslint/naming-convention': [
        'error',
        { selector: 'default', format: ['camelCase'], leadingUnderscore: 'allow' },
        { selector: 'import', format: ['camelCase', 'PascalCase'] },
        { selector: 'variable', format: ['camelCase', 'UPPER_CASE', 'PascalCase'], leadingUnderscore: 'allow' },
        { selector: 'function', format: ['camelCase', 'PascalCase'] },
        { selector: 'parameter', format: ['camelCase', 'PascalCase'], leadingUnderscore: 'allow' },
        { selector: 'objectLiteralProperty', format: null },
        { selector: 'typeProperty', format: null },
        { selector: 'class', format: ['PascalCase'] },
        { selector: 'interface', format: ['PascalCase'], prefix: ['I'] },
        { selector: 'typeAlias', format: ['PascalCase'] },
        { selector: 'enum', format: ['PascalCase'] },
        { selector: 'enumMember', format: ['PascalCase', 'UPPER_CASE'] },
        { selector: 'typeParameter', format: ['PascalCase'], prefix: ['T'] },
      ],
      eqeqeq: ['error', 'always'],
      'prefer-const': 'error',
      'no-var': 'error',
      'prefer-template': 'error',
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', ['internal', 'parent', 'sibling', 'index']],
          'newlines-between': 'never',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'no-restricted-properties': [
        'error',
        { object: 'localStorage', property: 'setItem', message: 'No auth/session data in localStorage - httpOnly cookies only.' },
        { object: 'sessionStorage', property: 'setItem', message: 'No auth/session data in sessionStorage - httpOnly cookies only.' },
      ],
      ...banImports({ paths: [IMPORT.axios] }),
      ...banSyntax(...SECURITY),
    },
  },

  // apiClient itself is the one place allowed to import axios ----------------
  {
    files: ['src/shared/lib/apiClient.ts'],
    rules: { ...banImports({}) },
  },

  // UI code: no axios, no apiClient (network only through feature api/) -----
  {
    files: [
      'src/features/*/{hooks,components,pages}/**/*.{ts,tsx}',
      'src/features/*/*.{ts,tsx}',
      'src/shared/{components,hooks,store}/**/*.{ts,tsx}',
      'src/layouts/**/*.{ts,tsx}',
      'src/routes/**/*.{ts,tsx}',
      'src/app/**/*.{ts,tsx}',
    ],
    rules: {
      ...banImports({ paths: [IMPORT.axios], patterns: [IMPORT_PATTERN.apiClient] }),
    },
  },

  // JSX in features / layouts / shared: security + no inline route strings ---
  {
    files: ['src/features/**/*.tsx', 'src/layouts/**/*.tsx', 'src/shared/**/*.tsx'],
    rules: {
      ...banSyntax(...SECURITY, SYNTAX.noInlineRoutePath, SYNTAX.noInlineRoutePathTemplate),
    },
  },

  // Feature api layer: named exports only -------------------------------------
  {
    files: ['src/features/*/api/**/*.ts'],
    rules: {
      ...banSyntax(...SECURITY, SYNTAX.noDefaultExportInApi),
    },
  },

  // Pages are the ONLY default exports (lazy route modules import them) ------
  {
    files: ['src/features/*/pages/**/*.tsx'],
    rules: { 'import/no-default-export': 'off' },
  },

  // Layer dependency policy ---------------------------------------------------
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { boundaries },
    settings: { 'boundaries/elements': boundariesElements, 'boundaries/files': boundariesFiles },
    rules: {
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          policies: [
            { from: { file: { categories: 'entry' } }, allow: { to: { element: { types: ['app', 'shared', 'styles'] } } } },
            { from: { element: { type: 'app' } }, allow: { to: { element: { types: ['app', 'routes', 'shared'] } } } },
            {
              from: { element: { type: 'routes' } },
              allow: { to: { element: { types: ['routes', 'layouts', 'feature', 'shared'] } } },
            },
            { from: { element: { type: 'layouts' } }, allow: { to: { element: { types: ['layouts', 'shared'] } } } },
            { from: { element: { type: 'layouts' } }, allow: TO_ROUTE_PUBLIC },
            { from: { element: { type: 'feature' } }, allow: { to: { element: { types: ['shared'] } } } },
            { from: { element: { type: 'feature' } }, allow: TO_ROUTE_PUBLIC },
            // Same-feature imports only (captured featureName must match).
            {
              from: { element: { type: 'feature' } },
              allow: {
                to: {
                  element: { type: 'feature', captured: { featureName: '{{ from.element.captured.featureName }}' } },
                },
              },
            },
            { from: { element: { type: 'shared' } }, allow: { to: { element: { types: ['shared'] } } } },
            { from: { file: { categories: 'colocated-test' } }, allow: { to: { element: { types: ['test'] } } } },
            {
              from: { element: { type: 'test' } },
              allow: { to: { element: { types: ['test', 'app', 'routes', 'layouts', 'feature', 'shared'] } } },
            },
          ],
        },
      ],
    },
  },

  // Tests: relaxed --------------------------------------------------------------
  {
    files: ['src/test/**/*.{ts,tsx}', 'src/**/*.test.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      'no-console': 'off',
    },
  },
);
