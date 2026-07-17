import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        setupFiles: ["./src/test-helpers/rule-tester-setup.ts"],
        coverage: {
            provider: "v8",
            reporter: ["text", "html", "lcov"],
            include: ["src/**/*.{ts,tsx}"],
            exclude: [
                "**/test-helpers/**",
                "**/*.test.ts",
                "src/index.ts",
            ],
            reportsDirectory: "./coverage",
            thresholds: {
                lines: 90,
                statements: 90,
                functions: 90,
            },
        },
    },
});
