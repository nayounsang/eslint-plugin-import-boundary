import { z } from "zod";
import {
    assertPublicEntryFileGlobs,
    DEFAULT_PUBLIC_ENTRY_FILES,
} from "./public-entry-files.js";
import {
    parseRootFilesGraph,
    type RootFilesEntry,
} from "./relations/index.js";

export type { RootFilesEntry };

const rootFilesEntrySchema = z.union(
    [
        z.string({
            error: 'Each "rootFiles" entry must be a path string or object',
        }),
        z.strictObject(
            {
                path: z.string({
                    error: '"rootFiles" object entries require a string "path"',
                }),
                allowedDependencies: z
                    .array(
                        z.string({
                            error: 'Each "allowedDependencies" entry must be a path string',
                        }),
                        {
                            error: '"allowedDependencies" must be an array of path strings',
                        },
                    )
                    .optional(),
                allowFreeInternal: z
                    .boolean({
                        error: '"allowFreeInternal" must be a boolean',
                    })
                    .optional(),
            },
            {
                error: (issue) => {
                    if (issue.code === "unrecognized_keys") {
                        return 'Unknown keys are not allowed on "rootFiles" object entries';
                    }
                    return 'Each "rootFiles" entry must be a path string or object';
                },
            },
        ),
    ],
    {
        error: 'Each "rootFiles" entry must be a path string or object',
    },
);

export const boundaryOptionsSchema = z.strictObject(
    {
        publicEntryFiles: z
            .array(
                z.string({
                    error: 'Each "publicEntryFiles" entry must be a glob string',
                }),
                {
                    error: '"publicEntryFiles" must be an array of glob strings',
                },
            )
            .optional()
            .default([...DEFAULT_PUBLIC_ENTRY_FILES]),
        sharedFiles: z
            .array(
                z.string({
                    error: 'Each "sharedFiles" entry must be a glob string',
                }),
                {
                    error: '"sharedFiles" must be an array of glob strings',
                },
            )
            .optional()
            .default([]),
        rootFiles: z
            .array(rootFilesEntrySchema, {
                error: '"rootFiles" must be an array of path strings or objects',
            })
            .optional()
            .default([]),
    },
    {
        error: (issue) => {
            if (issue.code === "unrecognized_keys") {
                return "Unknown option keys are not allowed";
            }
            if (issue.code === "invalid_type") {
                return "Options must be an object";
            }
            return undefined;
        },
    },
);

export type BoundaryOptions = z.input<typeof boundaryOptionsSchema>;

export function parseOptions(options: unknown): BoundaryOptions {
    const result = boundaryOptionsSchema.safeParse(options ?? {});
    if (!result.success) {
        throw new Error(
            `import-boundary: invalid options — ${z.prettifyError(result.error)}`,
            { cause: result.error },
        );
    }
    try {
        assertPublicEntryFileGlobs(result.data.publicEntryFiles ?? []);
        parseRootFilesGraph(result.data.rootFiles ?? []);
    } catch (cause) {
        const message =
            cause instanceof Error ? cause.message : String(cause);
        throw new Error(`import-boundary: invalid options — ${message}`, {
            cause,
        });
    }
    return result.data;
}
