module.exports = {
    env: {
      es2020: true,
      node: true
    },
    extends: ['eslint:recommended', 'prettier', 'plugin:@typescript-eslint/recommended'],
    parser: '@typescript-eslint/parser',
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module'
    },
    plugins: ['@typescript-eslint'],
    rules: {
      '@typescript-eslint/no-unused-vars': [1, { argsIgnorePattern: '^_' }],
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off'
    }
  }
  