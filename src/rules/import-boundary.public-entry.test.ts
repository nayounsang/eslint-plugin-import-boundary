import { importBoundaryRule } from "./import-boundary.js";
import { fromTo } from "../test-helpers/from-to.js";
import { ruleTester } from "../test-helpers/rule-tester.js";

ruleTester.run("import-boundary (publicEntryFiles)", importBoundaryRule, {
    valid: [
        fromTo({
            name: "default index entry via /index.js",
            consumerFile: "shell/shell.tsx",
            importSource: "./menu/index.js",
        }),
        fromTo({
            name: "default index entry via /index.mts style path",
            consumerFile: "shell/shell.tsx",
            importSource: "./menu/index.mts",
        }),
        fromTo({
            name: "custom public entry via /public",
            consumerFile: "shell/shell.tsx",
            importSource: "./menu/public",
            options: [{ publicEntryFiles: ["**/public"] }],
        }),
        fromTo({
            name: "custom public entry via /public.ts glob",
            consumerFile: "shell/shell.tsx",
            importSource: "./menu/public",
            options: [{ publicEntryFiles: ["**/public.ts"] }],
        }),
        fromTo({
            name: "folder path still ok with custom entry",
            consumerFile: "shell/shell.tsx",
            importSource: "./menu",
            options: [{ publicEntryFiles: ["**/public"] }],
        }),
    ],
    invalid: [
        {
            ...fromTo({
                name: "index no longer entry when overridden",
                consumerFile: "shell/shell.tsx",
                importSource: "./menu/index",
                options: [{ publicEntryFiles: ["**/public"] }],
            }),
            errors: [{ messageId: "skipLevelImport" }],
        },
        {
            ...fromTo({
                name: "internal still denied with custom entry",
                consumerFile: "shell/shell.tsx",
                importSource: "./menu/internal",
                options: [{ publicEntryFiles: ["**/public"] }],
            }),
            errors: [{ messageId: "skipLevelImport" }],
        },
        {
            ...fromTo({
                name: "empty publicEntryFiles: explicit index is not stripped",
                consumerFile: "shell/shell.tsx",
                importSource: "./menu/index",
                options: [{ publicEntryFiles: [] }],
            }),
            errors: [{ messageId: "skipLevelImport" }],
        },
    ],
});
