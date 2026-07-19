import type { ValidTestCase } from "@typescript-eslint/rule-tester";
import type { RootFilesEntry } from "../utils/index.js";

/** Must stay a 1-tuple so RuleTester does not widen `options` to an open-ended array. */

export type RuleOptions = readonly [
    {
        publicEntryFiles?: string[];
        sharedFiles?: string[];
        rootFiles?: RootFilesEntry[];
    },
];

export type FromToKind = "import" | "exportNamed" | "exportAll";

const PROJECT = "/project/src";

export const EMPTY_OPTIONS = [{}] as const satisfies RuleOptions;

function codeForKind(kind: FromToKind, importSource: string): string {
    switch (kind) {
        case "exportNamed":
            return `export { x } from "${importSource}";`;
        case "exportAll":
            return `export * from "${importSource}";`;
        default:
            return `import x from "${importSource}";`;
    }
}

/**
 * Simulates an import/re-export of `{importSource}` in `consumerFile`.
 */
export function fromTo({
    name,
    consumerFile,
    importSource,
    options = EMPTY_OPTIONS,
    kind = "import",
}: {
    name: string;
    consumerFile: string;
    importSource: string;
    options?: RuleOptions;
    kind?: FromToKind;
}): ValidTestCase<RuleOptions> {
    return {
        name,
        code: codeForKind(kind, importSource),
        filename: `${PROJECT}/${consumerFile}`,
        options,
    };
}
