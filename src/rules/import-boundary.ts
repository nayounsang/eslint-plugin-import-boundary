import { AST_NODE_TYPES, ESLintUtils } from "@typescript-eslint/utils";
import type { TSESTree } from "@typescript-eslint/utils";
import {
    classifyImport,
    getModulePath,
    getReportedToPath,
    resolveImport,
    toReportPath,
    type ViolationId,
} from "../utils/boundary-context.js";
import { parseFilesRoots } from "../utils/files-roots.js";
import { type BoundaryOptions, parseOptions } from "../utils/options.js";

const createRule = ESLintUtils.RuleCreator(
    (name) =>
        `https://github.com/untitle/jsproject/blob/main/tot/eslint-plugin-import-boundary/README.md#${name}`,
);

function getImportSource(
    node:
        | TSESTree.ImportDeclaration
        | TSESTree.ExportNamedDeclaration
        | TSESTree.ExportAllDeclaration,
): string | null {
    if (!node.source || node.source.type !== AST_NODE_TYPES.Literal) return null;
    if (typeof node.source.value !== "string") return null;
    return node.source.value;
}

type Options = readonly [BoundaryOptions];

export const importBoundaryRule = createRule<Options, ViolationId>({
    name: "import-boundary",
    meta: {
        type: "problem",
        docs: {
            description:
                "Enforce import boundaries based on directory nesting. Scope files via ESLint `files`.",
        },
        messages: {
            barrelOnly:
                'Import from "{{toPath}}" must use its index barrel, not internal files.',
            upwardImport:
                '"{{fromPath}}" cannot import ancestor "{{toPath}}".',
            skipLevelImport:
                '"{{fromPath}}" cannot import "{{toPath}}" directly. Use a direct child instead.',
            notAllowedTarget:
                '"{{fromPath}}" is not allowed to import "{{toPath}}".',
        },
        schema: [
            {
                type: "object",
                properties: {
                    sharedFiles: {
                        type: "array",
                        items: { type: "string" },
                    },
                    files: {
                        type: "array",
                        items: { type: "string" },
                    },
                },
                additionalProperties: false,
            },
        ],
    },
    defaultOptions: [{}],
    create(context) {
        const boundaryOptions = parseOptions(context.options[0]);
        const filesRoots = parseFilesRoots(boundaryOptions.files ?? []);
        const filename = context.filename;
        if (getModulePath(filename) === null) {
            return {};
        }

        function checkSource(node: TSESTree.Node, importSource: string): void {
            const resolved = resolveImport(filename, importSource);
            if (!resolved) return;

            const violation = classifyImport(
                resolved,
                boundaryOptions,
                importSource,
            );
            if (!violation) return;

            context.report({
                node,
                messageId: violation,
                data: {
                    fromPath: toReportPath(resolved.fromPath),
                    toPath: getReportedToPath(resolved, violation, filesRoots),
                },
            });
        }

        return {
            ImportDeclaration(node) {
                const importSource = getImportSource(node);
                if (!importSource) return;
                checkSource(node, importSource);
            },
            ExportNamedDeclaration(node) {
                const importSource = getImportSource(node);
                if (!importSource) return;
                checkSource(node, importSource);
            },
            ExportAllDeclaration(node) {
                const importSource = getImportSource(node);
                if (!importSource) return;
                checkSource(node, importSource);
            },
        };
    },
});
