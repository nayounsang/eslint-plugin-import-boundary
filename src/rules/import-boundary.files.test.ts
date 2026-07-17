import { importBoundaryRule } from "./import-boundary.js";
import { fromTo, type RuleOptions } from "../test-helpers/from-to.js";
import { ruleTester } from "../test-helpers/rule-tester.js";

const FILES_OPTIONS = [
    {
        files: [
            "/project/src/A/**/*.{ts,tsx}",
            "/project/src/B/**/*.{ts,tsx}",
        ],
    },
] as const satisfies RuleOptions;

ruleTester.run("import-boundary (files option)", importBoundaryRule, {
    valid: [
        fromTo({
            name: "files-peer barrel",
            consumerFile: "A/foo/foo.tsx",
            importSource: "../bar",
            options: FILES_OPTIONS,
        }),
        fromTo({
            name: "files-peer other sibling",
            consumerFile: "A/foo/foo.tsx",
            importSource: "../baz",
            options: FILES_OPTIONS,
        }),
        fromTo({
            name: "files-cross root",
            consumerFile: "A/foo/foo.tsx",
            importSource: "../../B",
            options: FILES_OPTIONS,
        }),
        fromTo({
            name: "files-peer from bar",
            consumerFile: "A/bar/bar.tsx",
            importSource: "../foo",
            options: FILES_OPTIONS,
        }),
        fromTo({
            name: "files-cross from bar",
            consumerFile: "A/bar/bar.tsx",
            importSource: "../../B",
            options: FILES_OPTIONS,
        }),
        fromTo({
            name: "files-cross from root module",
            consumerFile: "B/b.tsx",
            importSource: "../A",
            options: FILES_OPTIONS,
        }),
        fromTo({
            name: "files-peer under B",
            consumerFile: "B/foo/foo.tsx",
            importSource: "../bar",
            options: FILES_OPTIONS,
        }),
        fromTo({
            name: "files-cross from B/foo",
            consumerFile: "B/foo/foo.tsx",
            importSource: "../../A",
            options: FILES_OPTIONS,
        }),
        fromTo({
            name: "direct child with files option",
            consumerFile: "A/a.tsx",
            importSource: "./foo",
            options: FILES_OPTIONS,
        }),
        fromTo({
            name: "root to other root",
            consumerFile: "A/a.tsx",
            importSource: "../B",
            options: FILES_OPTIONS,
        }),
        fromTo({
            name: "files-peer from nested under foo",
            consumerFile: "A/foo/nested/nested.tsx",
            importSource: "../../bar",
            options: FILES_OPTIONS,
        }),
        fromTo({
            name: "files-peer barrel via /index",
            consumerFile: "A/foo/foo.tsx",
            importSource: "../bar/index",
            options: FILES_OPTIONS,
        }),
    ],
    invalid: [
        {
            ...fromTo({
                name: "files-peer non-canonical relative → barrelOnly",
                consumerFile: "A/foo/foo.tsx",
                importSource: "../../A/bar",
                options: FILES_OPTIONS,
            }),
            errors: [{ messageId: "barrelOnly" }],
        },
        {
            ...fromTo({
                name: "cross deep child → notAllowedTarget",
                consumerFile: "A/foo/foo.tsx",
                importSource: "../../B/foo",
                options: FILES_OPTIONS,
            }),
            errors: [{ messageId: "notAllowedTarget" }],
        },

        {
            ...fromTo({
                name: "cross deep sibling → notAllowedTarget",
                consumerFile: "A/foo/foo.tsx",
                importSource: "../../B/bar",
                options: FILES_OPTIONS,
            }),
            errors: [{ messageId: "notAllowedTarget" }],
        },
        {
            ...fromTo({
                name: "peer deep → notAllowedTarget",
                consumerFile: "A/foo/foo.tsx",
                importSource: "../bar/util",
                options: FILES_OPTIONS,
            }),
            errors: [{ messageId: "notAllowedTarget" }],
        },
        {
            ...fromTo({
                name: "upward to files root → upwardImport",
                consumerFile: "A/foo/foo.tsx",
                importSource: "..",
                options: FILES_OPTIONS,
            }),
            errors: [{ messageId: "upwardImport" }],
        },
        {
            ...fromTo({
                name: "nested peer → notAllowedTarget",
                consumerFile: "A/foo/x/x.tsx",
                importSource: "../y",
                options: FILES_OPTIONS,
            }),
            errors: [{ messageId: "notAllowedTarget" }],
        },
        {
            ...fromTo({
                name: "no files option: peer → notAllowedTarget",
                consumerFile: "A/foo/foo.tsx",
                importSource: "../bar",
            }),
            errors: [{ messageId: "notAllowedTarget" }],
        },
        {
            ...fromTo({
                name: "outside files roots → notAllowedTarget",
                consumerFile: "A/foo/foo.tsx",
                importSource: "../../C",
                options: FILES_OPTIONS,
            }),
            errors: [{ messageId: "notAllowedTarget" }],
        },
    ],
});
