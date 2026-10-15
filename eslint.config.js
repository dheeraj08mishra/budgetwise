import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

export default [
  { ignores: ["build/", "dist/", "node_modules/"] },
  js.configs.recommended,
  {
    files: ["src/**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "module",
      globals: { ...globals.browser },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    settings: { react: { version: "detect" } },
    plugins: { react, "react-hooks": reactHooks },
    rules: {
      ...react.configs.flat.recommended.rules,
      ...react.configs.flat["jsx-runtime"].rules,
      ...reactHooks.configs.recommended.rules,
      "react/prop-types": "off", // plain JS project, no PropTypes
      "no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", caughtErrors: "none" },
      ],
    },
  },
  {
    // Service worker template: placeholders are filled in at build time
    files: ["pwa/sw.js"],
    languageOptions: {
      globals: {
        ...globals.serviceworker,
        __BUILD__: "readonly",
        __PRECACHE__: "readonly",
      },
    },
  },
  {
    // Node-side files: config, build plugin and unit tests
    files: ["*.config.js", "pwa/plugin.js", "test/**/*.js"],
    languageOptions: { globals: { ...globals.node } },
  },
  {
    // Browser flows: Node script whose page.evaluate callbacks run in Chrome
    files: ["e2e/**/*.mjs"],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
  },
];
