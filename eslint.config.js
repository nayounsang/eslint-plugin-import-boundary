import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import importBoundary from "./dist/index.js";

export default tseslint.config(
    {
        ignores: ["dist/**", "node_modules/**", "coverage/**"],
    },
    eslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    {
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            "@typescript-eslint/consistent-type-imports": [
                "error",
                { prefer: "type-imports", fixStyle: "inline-type-imports" },
            ],
            "@typescript-eslint/no-deprecated": "error",
            "@typescript-eslint/no-unused-vars": [
                "error",
                {
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                },
            ],
            "@typescript-eslint/require-await": "off",
            "no-console": "warn",
        },
    },
    {
        files: ["src/**/*.{ts,tsx}"],
        plugins: {
            "import-boundary": importBoundary,
        },
        rules: {
            "import-boundary/import-boundary": [
                "error",
                {
                    rootFiles: ["src/rules/**/*.{ts,tsx}", "src/utils/**/*.{ts,tsx}"],
                },
            ],
        },
    },
    {
        files: ["**/*.test.ts", "src/test-helpers/**/*.ts"],
        rules: {
            "import-boundary/import-boundary": "off",
            "@typescript-eslint/no-unsafe-assignment": "off",
            "@typescript-eslint/no-unsafe-member-access": "off",
            "@typescript-eslint/no-unsafe-call": "off",
            "@typescript-eslint/no-unsafe-return": "off",
            "@typescript-eslint/no-unsafe-argument": "off",
        },
    },
);
