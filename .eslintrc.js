module.exports = {
  env: {
    es6: true,
    node: true,
    mocha: true,
  },
  extends: 'airbnb-base',
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  rules: {
    // Override rules defined in the 'airbnb-base' standard ruleset in this section
    'no-console': 0,
    'max-len': ['error', { code: 120 }],
  },
};
