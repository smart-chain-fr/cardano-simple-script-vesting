module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
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
    'prettier/prettier': 'off',
    'import/extensions': 'off'
  },
};
