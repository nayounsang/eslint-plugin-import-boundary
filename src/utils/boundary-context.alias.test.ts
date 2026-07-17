import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import { resolveImport } from "./boundary-context.js";
import {
    clearTsconfigPathsCache,
    matchesPathPattern,
    resolveAliasPath,
} from "./tsconfig-paths.js";

const FIXTURES = path.dirname(
    fileURLToPath(
        new URL(
            "../test-helpers/fixtures/alias-project/tsconfig.json",
            import.meta.url,
        ),
    ),
);
const JS_FIXTURES = path.dirname(
    fileURLToPath(
        new URL(
            "../test-helpers/fixtures/alias-jsconfig/jsconfig.json",
            import.meta.url,
        ),
    ),
);

function fixtureFile(...parts: string[]): string {
    return path.posix.join(FIXTURES.replace(/\\/g, "/"), ...parts);
}

afterEach(() => {
    clearTsconfigPathsCache();
});

describe("matchesPathPattern", () => {
    it("matches exact and wildcard patterns", () => {
        expect(matchesPathPattern("@/shell/menu", "@/*")).toBe(true);
        expect(matchesPathPattern("react", "@/*")).toBe(false);
        expect(matchesPathPattern("@utils", "@utils")).toBe(true);
        expect(matchesPathPattern("@utils/x", "@utils")).toBe(false);
    });
});

describe("resolveAliasPath", () => {
    it("resolves @/ aliases via tsconfig paths", () => {
        const resolved = resolveAliasPath(
            fixtureFile("src/shell/shell.tsx"),
            "@/shell/menu",
        );
        expect(resolved).toBe(fixtureFile("src/shell/menu"));
    });

    it("returns null for npm packages even when baseUrl is set", () => {
        expect(
            resolveAliasPath(fixtureFile("src/shell/shell.tsx"), "react"),
        ).toBeNull();
    });

    it("falls back to jsconfig.json", () => {
        const file = path.posix.join(
            JS_FIXTURES.replace(/\\/g, "/"),
            "src/a.tsx",
        );
        const resolved = resolveAliasPath(file, "#/b");
        expect(resolved).toBe(
            path.posix.join(JS_FIXTURES.replace(/\\/g, "/"), "src/b"),
        );
    });
});

describe("resolveImport", () => {
    it("keeps relative imports as before", () => {
        const resolved = resolveImport(
            fixtureFile("src/shell/shell.tsx"),
            "./menu",
        );
        expect(resolved).toEqual({
            fromPath: fixtureFile("src/shell"),
            pathNoExt: fixtureFile("src/shell/menu"),
            isExternal: false,
        });
    });

    it("resolves path aliases", () => {
        const resolved = resolveImport(
            fixtureFile("src/shell/shell.tsx"),
            "@/shell/menu",
        );
        expect(resolved).toEqual({
            fromPath: fixtureFile("src/shell"),
            pathNoExt: fixtureFile("src/shell/menu"),
            isExternal: false,
        });
    });

    it("treats unmatched non-relative as external", () => {
        const resolved = resolveImport(
            fixtureFile("src/shell/shell.tsx"),
            "react",
        );
        expect(resolved).toEqual({
            fromPath: fixtureFile("src/shell"),
            pathNoExt: null,
            isExternal: true,
        });
    });
});
