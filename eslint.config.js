const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  { ignores: ['.expo/**', 'dist/**', 'docs/**'] },
  { files: ['scripts/**/*.{js,cjs}'], languageOptions: { globals: { Buffer: 'readonly', __dirname: 'readonly' } } },
  { files: ['src/**/*.{ts,tsx}', 'app/**/*.{ts,tsx}'], rules: { '@typescript-eslint/no-explicit-any': 'error', 'no-console': 'error' } },
]);
