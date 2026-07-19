import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach } from "vitest";
import { importBoundaryRule } from "./import-boundary.js";
import { type RuleOptions } from "../test-helpers/from-to.js";
import { ruleTester } from "../test-helpers/rule-tester.js";
import { clearTsconfigPathsCache } from "../utils/tsconfig-paths.js";

const FIXTURE_ROOT = path
    .dirname(
        fileURLToPath(
            new URL(
                "../test-helpers/fixtures/alias-project/tsconfig.json",
                import.meta.url,
            ),
        ),
    )
    .replace(/\\/g, "/");

function file(rel: string): string {
    return `${FIXTURE_ROOT}/src/${rel}`;
}

afterEach(() => {
    clearTsconfigPathsCache();
});

const ROOT_FILES_OPTIONS = [
    {
        rootFiles: [
            `${FIXTURE_ROOT}/src/A`,
            `${FIXTURE_ROOT}/src/B`,
        ],
    },
] as const satisfies RuleOptions;

ruleTester.run("import-boundary (path aliases)", importBoundaryRule, {
    valid: [
        {
            name: "alias direct child barrel",
            code: 'import x from "@/shell/menu";',
            filename: file("shell/shell.tsx"),
        },
        {
            name: "alias npm package ignored",
            code: 'import React from "react";',
            filename: file("shell/shell.tsx"),
        },
        {
            name: "alias rootFiles-cross root barrel",
            code: 'import x from "@/B";',
            filename: file("A/foo/foo.tsx"),
            options: ROOT_FILES_OPTIONS,
        },
    ],
    invalid: [
        {
            name: "alias peer barrel → notAllowedTarget",
            code: 'import x from "@/shell/tabs";',
            filename: file("shell/menu/menu.tsx"),
            errors: [{ messageId: "notAllowedTarget" }],
        },
        {
            name: "alias skip-level → skipLevelImport",
            code: 'import x from "@/shell/menu/detail";',
            filename: file("shell/shell.tsx"),
            errors: [{ messageId: "skipLevelImport" }],
        },
        {
            name: "alias upward → upwardImport",
            code: 'import x from "@/shell";',
            filename: file("shell/menu/menu.tsx"),
            errors: [{ messageId: "upwardImport" }],
        },
    ],
});
