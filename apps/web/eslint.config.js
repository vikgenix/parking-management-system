//  @ts-check
import config from "@parking-management/eslint-config/tsrouter";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...config,
  {
    ignores: ["eslint.config.js"],
  },
];
