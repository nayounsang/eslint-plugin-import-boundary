import { importBoundaryRule } from "./import-boundary.js";
import { fromTo, type RuleOptions } from "../test-helpers/from-to.js";
import { ruleTester } from "../test-helpers/rule-tester.js";

const ROOT_FILES_OPTIONS = [
    {
        rootFiles: [
            "/project/src/A",
            "/project/src/B",
        ],
    },
] as const satisfies RuleOptions;

ruleTester.run("import-boundary (rootFiles option)", importBoundaryRule, {
    valid: [
        fromTo({
            name: "rootFiles-cross root",
            consumerFile: "A/foo/foo.tsx",
            importSource: "../../B",
            options: ROOT_FILES_OPTIONS,
        }),
        fromTo({
            name: "rootFiles-cross from bar",
            consumerFile: "A/bar/bar.tsx",
            importSource: "../../B",
            options: ROOT_FILES_OPTIONS,
        }),
        fromTo({
            name: "rootFiles-cross from root module",
            consumerFile: "B/b.tsx",
            importSource: "../A",
            options: ROOT_FILES_OPTIONS,
        }),
        fromTo({
            name: "rootFiles-cross from B/foo",
            consumerFile: "B/foo/foo.tsx",
            importSource: "../../A",
            options: ROOT_FILES_OPTIONS,
        }),
        fromTo({
            name: "direct child with rootFiles option",
            consumerFile: "A/a.tsx",
            importSource: "./foo",
            options: ROOT_FILES_OPTIONS,
        }),
        fromTo({
            name: "root to other root",
            consumerFile: "A/a.tsx",
            importSource: "../B",
            options: ROOT_FILES_OPTIONS,
        }),
    ],
    invalid: [
        {
            ...fromTo({
                name: "same-root peer barrel → notAllowedTarget",
                consumerFile: "A/foo/foo.tsx",
                importSource: "../bar",
                options: ROOT_FILES_OPTIONS,
            }),
            errors: [{ messageId: "notAllowedTarget" }],
        },
        {
            ...fromTo({
                name: "same-root other sibling → notAllowedTarget",
                consumerFile: "A/foo/foo.tsx",
                importSource: "../baz",
                options: ROOT_FILES_OPTIONS,
            }),
            errors: [{ messageId: "notAllowedTarget" }],
        },
        {
            ...fromTo({
                name: "same-root peer from bar → notAllowedTarget",
                consumerFile: "A/bar/bar.tsx",
                importSource: "../foo",
                options: ROOT_FILES_OPTIONS,
            }),
            errors: [{ messageId: "notAllowedTarget" }],
        },
        {
            ...fromTo({
                name: "same-root peer under B → notAllowedTarget",
                consumerFile: "B/foo/foo.tsx",
                importSource: "../bar",
                options: ROOT_FILES_OPTIONS,
            }),
            errors: [{ messageId: "notAllowedTarget" }],
        },
        {
            ...fromTo({
                name: "same-root peer from nested → notAllowedTarget",
                consumerFile: "A/foo/nested/nested.tsx",
                importSource: "../../bar",
                options: ROOT_FILES_OPTIONS,
            }),
            errors: [{ messageId: "notAllowedTarget" }],
        },
        {
            ...fromTo({
                name: "same-root peer via /index → notAllowedTarget",
                consumerFile: "A/foo/foo.tsx",
                importSource: "../bar/index",
                options: ROOT_FILES_OPTIONS,
            }),
            errors: [{ messageId: "notAllowedTarget" }],
        },
        {
            ...fromTo({
                name: "cross deep child → notAllowedTarget",
                consumerFile: "A/foo/foo.tsx",
                importSource: "../../B/foo",
                options: ROOT_FILES_OPTIONS,
            }),
            errors: [{ messageId: "notAllowedTarget" }],
        },
        {
            ...fromTo({
                name: "cross deep sibling → notAllowedTarget",
                consumerFile: "A/foo/foo.tsx",
                importSource: "../../B/bar",
                options: ROOT_FILES_OPTIONS,
            }),
            errors: [{ messageId: "notAllowedTarget" }],
        },
        {
            ...fromTo({
                name: "peer deep → notAllowedTarget",
                consumerFile: "A/foo/foo.tsx",
                importSource: "../bar/util",
                options: ROOT_FILES_OPTIONS,
            }),
            errors: [{ messageId: "notAllowedTarget" }],
        },
        {
            ...fromTo({
                name: "upward to rootFiles root → upwardImport",
                consumerFile: "A/foo/foo.tsx",
                importSource: "..",
                options: ROOT_FILES_OPTIONS,
            }),
            errors: [{ messageId: "upwardImport" }],
        },
        {
            ...fromTo({
                name: "nested peer → notAllowedTarget",
                consumerFile: "A/foo/x/x.tsx",
                importSource: "../y",
                options: ROOT_FILES_OPTIONS,
            }),
            errors: [{ messageId: "notAllowedTarget" }],
        },
        {
            ...fromTo({
                name: "no rootFiles option: peer → notAllowedTarget",
                consumerFile: "A/foo/foo.tsx",
                importSource: "../bar",
            }),
            errors: [{ messageId: "notAllowedTarget" }],
        },
        {
            ...fromTo({
                name: "outside rootFiles roots → notAllowedTarget",
                consumerFile: "A/foo/foo.tsx",
                importSource: "../../C",
                options: ROOT_FILES_OPTIONS,
            }),
            errors: [{ messageId: "notAllowedTarget" }],
        },
    ],
});

const DIRECTED_OPTIONS = [
    {
        rootFiles: [
            "/project/src/A",
            {
                path: "/project/src/B",
                allowedDependencies: ["/project/src/A"],
            },
        ],
    },
] as const satisfies RuleOptions;

ruleTester.run("import-boundary (rootFiles allowedDependencies)", importBoundaryRule, {
    valid: [
        fromTo({
            name: "object root → listed dependency barrel",
            consumerFile: "B/foo/foo.tsx",
            importSource: "../../A",
            options: DIRECTED_OPTIONS,
        }),
        fromTo({
            name: "object root module → listed dependency",
            consumerFile: "B/b.tsx",
            importSource: "../A",
            options: DIRECTED_OPTIONS,
        }),
        fromTo({
            name: "direct child still allowed under object root",
            consumerFile: "B/b.tsx",
            importSource: "./foo",
            options: DIRECTED_OPTIONS,
        }),
    ],
    invalid: [
        {
            ...fromTo({
                name: "string root → object root denied (one-way)",
                consumerFile: "A/foo/foo.tsx",
                importSource: "../../B",
                options: DIRECTED_OPTIONS,
            }),
            errors: [{ messageId: "notAllowedTarget" }],
        },
        {
            ...fromTo({
                name: "object root → dependency internals denied",
                consumerFile: "B/foo/foo.tsx",
                importSource: "../../A/foo",
                options: DIRECTED_OPTIONS,
            }),
            errors: [{ messageId: "notAllowedTarget" }],
        },
    ],
});
