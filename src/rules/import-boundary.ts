import { AST_NODE_TYPES, ESLintUtils } from "@typescript-eslint/utils";
import type { TSESTree } from "@typescript-eslint/utils";
import {
    classifyImport,
    getModulePath,
    getReportedToPath,
    parseRootFilesGraph,
    parseOptions,
    resolveImport,
    toReportPath,
    type BoundaryOptions,
    type ViolationId,
} from "../utils/index.js";

const createRule = ESLintUtils.RuleCreator(
    (_name) =>
        "https://nayounsang.github.io/eslint-plugin-import-boundary/",
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
                "Enforce import boundaries based on directory nesting.",
        },
        messages: {
            publicEntryOnly:
                'Import from "{{toPath}}" must use its public entry, not internal files, because {{reason}}.',
            upwardImport:
                '"{{fromPath}}" cannot import ancestor "{{toPath}}" because {{reason}}.',
            skipLevelImport:
                '"{{fromPath}}" cannot import "{{toPath}}" directly because {{reason}}.',
            notAllowedTarget:
                '"{{fromPath}}" cannot import "{{toPath}}" because {{reason}}.',
        },
        schema: [
            {
                type: "object",
                properties: {
                    publicEntryFiles: {
                        type: "array",
                        items: { type: "string" },
                    },
                    sharedFiles: {
                        type: "array",
                        items: { type: "string" },
                    },
                    rootFiles: {
                        type: "array",
                        items: {
                            oneOf: [
                                { type: "string" },
                                {
                                    type: "object",
                                    properties: {
                                        path: { type: "string" },
                                        allowedDependencies: {
                                            type: "array",
                                            items: { type: "string" },
                                        },
                                    },
                                    required: ["path"],
                                    additionalProperties: false,
                                },
                            ],
                        },
                    },
                },
                additionalProperties: false,
            },
        ],
    },
    defaultOptions: [{}],
    create(context) {
        const boundaryOptions = parseOptions(context.options[0]);
        const filesGraph = parseRootFilesGraph(
            boundaryOptions.rootFiles ?? [],
        );
        const filename = context.filename;
        if (getModulePath(filename) === null) {
            return {};
        }

        function checkSource(node: TSESTree.Node, importSource: string): void {
            const resolved = resolveImport(
                filename,
                importSource,
                boundaryOptions.publicEntryFiles,
            );
            if (!resolved) return;

            const violation = classifyImport(
                resolved,
                boundaryOptions,
                importSource,
            );
            if (!violation) return;

            context.report({
                node,
                messageId: violation.id,
                data: {
                    fromPath: toReportPath(resolved.fromPath),
                    toPath: getReportedToPath(
                        resolved,
                        violation.id,
                        filesGraph,
                    ),
                    reason: violation.reason,
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
