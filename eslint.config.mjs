import { defineConfig } from 'eslint/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
});

export default defineConfig([
  {
    extends: compat.extends(
      'next/core-web-vitals',
      'next/typescript',
      'prettier'
    ),

    rules: {
      'no-console': 'warn',
      // Turn unused-vars into a warning, but ignore any name beginning with "_"
      'no-unused-vars': [
        'warn',
        {
          varsIgnorePattern: '^_', // ignore `const _foo = ...`
          argsIgnorePattern: '^_', // ignore `( _bar ) => …`
          ignoreRestSiblings: true // keep rest-destructured props from complaining
        }
      ],
      quotes: [
        'error',
        'single',
        {
          avoidEscape: true
        }
      ]
    }
  }
]);
