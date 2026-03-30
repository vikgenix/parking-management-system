import { tanstackConfig } from "@tanstack/eslint-config";
import prettierPlugin from "eslint-plugin-prettier";
import turboPlugin from "eslint-plugin-turbo";

export default [
  ...tanstackConfig,
  {
    plugins: {
      turbo: turboPlugin,
    },
    rules: {
      "turbo/no-undeclared-env-vars": "warn",
    },
  },
  {
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      "prettier/prettier": "warn",
    },
  },
  {
    ignores: ["dist/**"],
  },
];
