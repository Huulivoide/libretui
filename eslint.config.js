import js from '@eslint/js';
import ts from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default ts.config(
  js.configs.recommended,
  ...ts.configs.recommended,
  ...ts.configs.strictTypeChecked,
  prettier,
  {
    ignores: ['dist/'],
  },
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Prefer `type` over `interface`
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      // Prefer Array<T> / ReadonlyArray<T> over T[] shorthand
      '@typescript-eslint/array-type': [
        'error',
        { default: 'generic', readonly: 'generic' },
      ],
      // Always use {} blocks for if/else/for/while
      curly: ['error', 'all'],
    },
  },
);
