const js = require("@eslint/js");
const globals = require("globals");

module.exports = [
  {
    // One-off legacy scripts from before multi-user (fetchExpense.js is even ESM
    // in a CommonJS project). Left untouched, and not linted.
    ignores: ["node_modules/**", "coverage/**", "deleteExpense.js", "fetchExpense.js", "fixExpenses.js"],
  },
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: { sourceType: "commonjs", ecmaVersion: 2023, globals: { ...globals.node } },
  },
  {
    files: ["tests/**/*.js"],
    languageOptions: { globals: { ...globals.node, ...globals.jest } },
  },
];
