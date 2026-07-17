import { z } from "zod";

export const boundaryOptionsSchema = z.strictObject(
    {
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
        files: z
            .array(
                z.string({
                    error: 'Each "files" entry must be a glob string',
                }),
                {
                    error: '"files" must be an array of glob strings',
                },
            )
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
    return result.data;
}
