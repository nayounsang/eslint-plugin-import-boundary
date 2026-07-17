import { importBoundaryRule } from "./import-boundary.js";
import { fromTo } from "../test-helpers/from-to.js";
import { ruleTester } from "../test-helpers/rule-tester.js";

ruleTester.run("import-boundary", importBoundaryRule, {
    valid: [
        fromTo({
            name: "same-folder child barrel",
            consumerFile: "shell/menu/menu.tsx",
            importSource: "./util",
        }),
        fromTo({
            name: "external package ignored",
            consumerFile: "shell/menu/menu.tsx",
            importSource: "react",
        }),
        fromTo({
            name: "direct child barrel",
            consumerFile: "shell/shell.tsx",
            importSource: "./menu",
        }),
        fromTo({
            name: "exportAll direct child barrel",
            consumerFile: "shell/shell.tsx",
            importSource: "./menu",
            kind: "exportAll",
        }),
    ],
    invalid: [
        {
            ...fromTo({
                name: "non-canonical relative → barrelOnly",
                consumerFile: "shell/shell.tsx",
                importSource: "../shell/menu",
            }),
            errors: [{ messageId: "barrelOnly" }],
        },
        {
            ...fromTo({
                name: "exportNamed peer barrel → notAllowedTarget",
                consumerFile: "shell/menu/menu.tsx",
                importSource: "../tabs",
                kind: "exportNamed",
            }),
            errors: [{ messageId: "notAllowedTarget" }],
        },
        {
            ...fromTo({
                name: "exportAll skip-level → skipLevelImport",
                consumerFile: "shell/shell.tsx",
                importSource: "./menu/detail",
                kind: "exportAll",
            }),
            errors: [{ messageId: "skipLevelImport" }],
        },

        {
            ...fromTo({
                name: "peer barrel → notAllowedTarget",
                consumerFile: "shell/menu/menu.tsx",
                importSource: "../tabs",
            }),
            errors: [{ messageId: "notAllowedTarget" }],
        },
        {
            ...fromTo({
                name: "flat peer barrel → notAllowedTarget",
                consumerFile: "menu/menu.tsx",
                importSource: "../session",
            }),
            errors: [{ messageId: "notAllowedTarget" }],
        },
        {
            ...fromTo({
                name: "parent-peer barrel → notAllowedTarget",
                consumerFile: "shell/menu/detail/detail.tsx",
                importSource: "../../tabs",
            }),
            errors: [{ messageId: "notAllowedTarget" }],
        },
        {
            ...fromTo({
                name: "peer deep → notAllowedTarget",
                consumerFile: "shell/menu/menu.tsx",
                importSource: "../tabs/util",
            }),
            errors: [{ messageId: "notAllowedTarget" }],
        },
        {
            ...fromTo({
                name: "flat peer deep → notAllowedTarget",
                consumerFile: "menu/menu.tsx",
                importSource: "../detail/data",
            }),
            errors: [{ messageId: "notAllowedTarget" }],
        },
        {
            ...fromTo({
                name: "nephew deep → notAllowedTarget",
                consumerFile: "shell/tabs/tabs.tsx",
                importSource: "../menu/detail",
            }),
            errors: [{ messageId: "notAllowedTarget" }],
        },
        {
            ...fromTo({
                name: "skip-level child → skipLevelImport",
                consumerFile: "shell/shell.tsx",
                importSource: "./menu/detail",
            }),
            errors: [{ messageId: "skipLevelImport" }],
        },
        {
            ...fromTo({
                name: "upward parent → upwardImport",
                consumerFile: "shell/menu/menu.tsx",
                importSource: "..",
            }),
            errors: [{ messageId: "upwardImport" }],
        },
        {
            ...fromTo({
                name: "upward grandparent → upwardImport",
                consumerFile: "shell/menu/detail/detail.tsx",
                importSource: "../..",
            }),
            errors: [{ messageId: "upwardImport" }],
        },
        {
            ...fromTo({
                name: "upward parent by name → upwardImport",
                consumerFile: "shell/menu/detail/detail.tsx",
                importSource: "../../menu",
            }),
            errors: [{ messageId: "upwardImport" }],
        },
    ],
});
