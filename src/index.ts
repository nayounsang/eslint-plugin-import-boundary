import type { TSESLint } from "@typescript-eslint/utils";
import { importBoundaryRule } from "./rules/index.js";
import { extractDirectChildDirs } from "./utils/index.js";

const plugin: TSESLint.FlatConfig.Plugin = {
  meta: {
    name: "eslint-plugin-import-boundary",
    version: "0.0.1",
  },
  rules: {
    "import-boundary": importBoundaryRule,
  },
};

export default plugin;
export { extractDirectChildDirs };
