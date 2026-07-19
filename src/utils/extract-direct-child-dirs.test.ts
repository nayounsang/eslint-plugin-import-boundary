import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { extractDirectChildDirs } from "./extract-direct-child-dirs.js";

const tempDirs: string[] = [];

afterEach(() => {
    while (tempDirs.length > 0) {
        const dir = tempDirs.pop();
        if (dir) fs.rmSync(dir, { recursive: true, force: true });
    }
});

function makeTempTree(): string {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "extract-dirs-"));
    tempDirs.push(root);
    return root;
}

describe("extractDirectChildDirs", () => {
    it("lists immediate child directories as cwd-relative posix paths", () => {
        const cwd = makeTempTree();
        fs.mkdirSync(path.join(cwd, "src", "features", "auth"), {
            recursive: true,
        });
        fs.mkdirSync(path.join(cwd, "src", "features", "cart"), {
            recursive: true,
        });
        fs.writeFileSync(
            path.join(cwd, "src", "features", "readme.md"),
            "x",
        );
        fs.mkdirSync(path.join(cwd, "src", "features", ".hidden"), {
            recursive: true,
        });
        fs.mkdirSync(path.join(cwd, "src", "features", "auth", "login"), {
            recursive: true,
        });

        expect(extractDirectChildDirs("src/features", cwd)).toEqual([
            "src/features/auth",
            "src/features/cart",
        ]);
    });

    it("sorts results", () => {
        const cwd = makeTempTree();
        fs.mkdirSync(path.join(cwd, "z"), { recursive: true });
        fs.mkdirSync(path.join(cwd, "a"), { recursive: true });
        fs.mkdirSync(path.join(cwd, "m"), { recursive: true });

        expect(extractDirectChildDirs(".", cwd)).toEqual(["a", "m", "z"]);
    });

    it("throws when the path is missing", () => {
        const cwd = makeTempTree();
        expect(() => extractDirectChildDirs("missing", cwd)).toThrow(
            /extractDirectChildDirs: cannot read directory/,
        );
    });
});
