// ESLint 9 flat config for KrackedUI systems (gate check 2, `lint`).
// Scope: systems/*/registry/src, systems/*/registry/test, systems/*/templates, systems/*/docs.
// typescript-eslint recommended-type-checked + react-hooks + jsx-a11y recommended.
// Rule changes are standard changes (standard/SPEC.md "Changing the standard"), not per-system tweaks.
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';

const files = [
  'systems/*/registry/src/**/*.{ts,tsx}',
  'systems/*/registry/test/**/*.{ts,tsx}',
  'systems/*/templates/*/src/**/*.{ts,tsx}',
  'systems/*/docs/**/*.{ts,tsx}',
];

export default tseslint.config(
  { ignores: ['**/node_modules/**', '**/dist/**', '**/.next/**', 'systems/*/capture/**', 'systems/*/mirror/**', 'systems/*/docs/generated/**', 'systems/*/registry/src/icons/paths.ts'] },
  {
    files,
    extends: [js.configs.recommended, ...tseslint.configs.recommendedTypeChecked, jsxA11y.flatConfigs.recommended],
    plugins: { 'react-hooks': reactHooks },
    languageOptions: {
      parserOptions: {
        // Each file is type-checked with the tsconfig that owns it.
        project: ['systems/*/registry/tsconfig.json', 'apps/docs/tsconfig.json', 'systems/*/templates/*/tsconfig.json', 'standard/gate/tests/tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    linterOptions: { reportUnusedDisableDirectives: 'error' },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // Unused variables are errors, except intentionally ignored ones (`_x`) and rest siblings (`{ a, ...rest }`).
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none', ignoreRestSiblings: true }],
      // `@ts-ignore` / `@ts-nocheck` are never allowed; `@ts-expect-error` needs a reason.
      '@typescript-eslint/ban-ts-comment': ['error', { 'ts-ignore': true, 'ts-nocheck': true, 'ts-check': false, 'ts-expect-error': 'allow-with-description' }],
      // Overlays (menus, popovers, dialogs) move focus into their search field on open, as the WAI-ARIA
      // dialog/combobox patterns require; the rule cannot tell that from autofocus on page load.
      // Focus on page load is caught by the a11y check instead.
      'jsx-a11y/no-autofocus': 'off',
      // Event handlers commonly return promises in React (`onClick={async () => …}`).
      '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: { attributes: false } }],
    },
  },
  {
    // The package and templates may not silence the linter at all.
    files: ['systems/*/registry/src/**/*.{ts,tsx}', 'systems/*/templates/*/src/**/*.{ts,tsx}'],
    linterOptions: { noInlineConfig: true },
  },
);
