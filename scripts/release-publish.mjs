import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

function run(cmd, args) {
  const result = spawnSync(cmd, args, { stdio: "inherit", env: process.env });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

// setup-node writes .npmrc with ${NODE_AUTH_TOKEN}; map NPM_TOKEN when present.
if (process.env.NPM_TOKEN) {
  process.env.NODE_AUTH_TOKEN = process.env.NPM_TOKEN;
}

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const { name, version } = pkg;

// Idempotent: Release workflow re-runs on every main push.
const view = spawnSync("npm", ["view", `${name}@${version}`, "version"], {
  encoding: "utf8",
  env: process.env,
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
