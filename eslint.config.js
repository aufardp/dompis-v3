import js from "@eslint/js";
import svelte from "eslint-plugin-svelte";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/.svelte-kit/**",
      ".cache/**",
      ".agents/**",
      ".claude/**",
      "docs/**",
      "tools/skills/**",
      "graphify-out/**",
      "**/*.md",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...svelte.configs.recommended,
  {
    files: ["**/*.{js,ts,svelte}"],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
  },
  {
    files: ["**/*.svelte"],
    languageOptions: { parserOptions: { parser: tseslint.parser } },
  },
  {
    files: ["apps/web/**/*.{js,ts,svelte}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@dompis/db", "@dompis/db/*", "**/packages/db/**"],
              message: "apps/web mengambil data melalui API sesuai A-01.",
            },
          ],
        },
      ],
    },
  },
];
