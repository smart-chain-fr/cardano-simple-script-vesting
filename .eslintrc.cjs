module.exports = {
  env:{
    jest: true,
    node: true,
    browser: true,
  },
  extends: [
    'airbnb-base',
    'prettier'
  ],
  "settings": {
  "import/resolver": {
    "node": {
      "extensions": [".js", ".jsx", ".ts", ".tsx"]
      }
    },
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
    'prettier'
  ],
  rules: {
    'import/extensions': 'off',
    "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    // 'no-unused-vars': 'warn',
  },
}
