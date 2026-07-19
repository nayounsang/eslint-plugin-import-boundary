import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

function run(cmd, args) {
  const result = spawnSync(cmd, args, { stdio: "inherit" });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const { name, version } = pkg;

// Idempotent: Release workflow re-runs on every main push.
const view = spawnSync("npm", ["view", `${name}@${version}`, "version"], {
  encoding: "utf8",
});
if (view.status === 0 && view.stdout.trim() === version) {
  console.log(`${name}@${version} already published — skipping`);
  process.exit(0);
}

run("pnpm", ["build"]);
// Avoid `changeset publish` → `pnpm publish --json` (pnpm bug: EINVALIDTAGNAME).
run("npm", ["publish", "--access", "public"]);
run("pnpm", ["exec", "changeset", "tag"]);
run("git", ["push", "origin", "--tags"]);
