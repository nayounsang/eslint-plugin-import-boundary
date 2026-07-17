import { importBoundaryRule } from "./import-boundary.js";
import { fromTo } from "../test-helpers/from-to.js";
import { ruleTester } from "../test-helpers/rule-tester.js";

ruleTester.run("import-boundary (sharedFiles)", importBoundaryRule, {
    valid: [
        // sharedFiles: **/foo.ts, **/foo.tsx
        fromTo({
            name: "import shared file",
            consumerFile: "shell/menu/menu.tsx",
            importSource: "../foo",
            options: [{ sharedFiles: ["**/foo.ts", "**/foo.tsx"] }],
        }),
        fromTo({
            name: "import ancestor shared file",
            consumerFile: "shell/menu/detail/detail.tsx",
            importSource: "../../foo",
            options: [{ sharedFiles: ["**/foo.ts", "**/foo.tsx"] }],
        }),
        fromTo({
            name: "shared importer → child barrel",
            consumerFile: "shell/foo.ts",
            importSource: "./menu",
            options: [{ sharedFiles: ["**/foo.ts", "**/foo.tsx"] }],
        }),
        fromTo({
            name: "shared importer → external",
            consumerFile: "shell/foo.ts",
            importSource: "react",
            options: [{ sharedFiles: ["**/foo.ts", "**/foo.tsx"] }],
        }),

        // sharedFiles: **/foo.*.ts, **/foo.*.tsx
        fromTo({
            name: "import shared foo.* file",
            consumerFile: "shell/menu/menu.tsx",
            importSource: "../foo.helpers",
            options: [{ sharedFiles: ["**/foo.*.ts", "**/foo.*.tsx"] }],
        }),
        fromTo({
            name: "import nested shared file",
            consumerFile: "shell/menu/detail/detail.tsx",
            importSource: "../foo.util",
            options: [{ sharedFiles: ["**/foo.*.ts", "**/foo.*.tsx"] }],
        }),
        fromTo({
            name: "nested shared importer → child barrel",
            consumerFile: "shell/menu/foo.util.ts",
            importSource: "./detail",
            options: [{ sharedFiles: ["**/foo.*.ts", "**/foo.*.tsx"] }],
        }),

        // sharedFiles: **/foo/**
        fromTo({
            name: "import shared folder file",
            consumerFile: "shell/menu/menu.tsx",
            importSource: "../foo/format",
            options: [{ sharedFiles: ["**/foo/**"] }],
        }),

        // sharedFiles: **/foo.ts(x) + **/foo.*.ts(x)
        fromTo({
            name: "nested shared → ancestor shared",
            consumerFile: "shell/menu/foo.util.ts",
            importSource: "../foo",
            options: [
                {
                    sharedFiles: [
                        "**/foo.ts",
                        "**/foo.tsx",
                        "**/foo.*.ts",
                        "**/foo.*.tsx",
                    ],
                },
            ],
        }),
    ],
    invalid: [
        // sharedFiles: **/foo.ts, **/foo.tsx
        {
            ...fromTo({
                name: "shared importer skip-level → skipLevelImport",
                consumerFile: "shell/foo.ts",
                importSource: "./menu/detail",
                options: [{ sharedFiles: ["**/foo.ts", "**/foo.tsx"] }],
            }),
            errors: [{ messageId: "skipLevelImport" }],
        },
        {
            ...fromTo({
                name: "flat shared importer → peer barrel",
                consumerFile: "menu/foo.ts",
                importSource: "../detail",
                options: [{ sharedFiles: ["**/foo.ts", "**/foo.tsx"] }],
            }),
            errors: [{ messageId: "notAllowedTarget" }],
        },
        {
            ...fromTo({
                name: "flat shared deep peer → notAllowedTarget",
                consumerFile: "menu/foo.ts",
                importSource: "../detail/data",
                options: [{ sharedFiles: ["**/foo.ts", "**/foo.tsx"] }],
            }),
            errors: [{ messageId: "notAllowedTarget" }],
        },

        // sharedFiles: **/foo.*.ts, **/foo.*.tsx
        {
            ...fromTo({
                name: "nested shared importer → peer barrel",
                consumerFile: "shell/menu/foo.util.ts",
                importSource: "../tabs",
                options: [{ sharedFiles: ["**/foo.*.ts", "**/foo.*.tsx"] }],
            }),
            errors: [{ messageId: "notAllowedTarget" }],
        },
        {
            ...fromTo({
                name: "nested shared upward → upwardImport",
                consumerFile: "shell/menu/foo.util.ts",
                importSource: "..",
                options: [{ sharedFiles: ["**/foo.*.ts", "**/foo.*.tsx"] }],
            }),
            errors: [{ messageId: "upwardImport" }],
        },

        // sharedFiles: **/foo/**
        {
            ...fromTo({
                name: "shared folder importer → peer barrel",
                consumerFile: "shell/foo/format.ts",
                importSource: "../menu",
                options: [{ sharedFiles: ["**/foo/**"] }],
            }),
            errors: [{ messageId: "notAllowedTarget" }],
        },
        {
            ...fromTo({
                name: "shared folder upward → upwardImport",
                consumerFile: "shell/foo/format.ts",
                importSource: "..",
                options: [{ sharedFiles: ["**/foo/**"] }],
            }),
            errors: [{ messageId: "upwardImport" }],
        },
    ],
});
