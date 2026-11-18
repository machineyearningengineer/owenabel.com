import { spawnSync } from "node:child_process";
import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const args = process.argv.slice(2);
const operation = args[0];
let cutover = false;
let bridge = false;
let profile;
let valid = ["--dry-run", "--execute"].includes(operation);
for (let index = 1; index < args.length; index++) {
  if (args[index] === "--cutover" && !cutover) cutover = true;
  else if (args[index] === "--bridge" && !bridge) bridge = true;
  else if (
    args[index] === "--profile" &&
    !profile &&
    /^[a-zA-Z0-9_-]+$/.test(args[index + 1] ?? "")
  ) {
    profile = args[++index];
  } else valid = false;
}
if (!valid || profile === "default" || (cutover && bridge)) {
  console.error(
    "Use --dry-run or --execute, optionally --cutover and --profile <operational-profile>.",
  );
  process.exit(1);
}
const credentialKeys = [
  "CLOUDFLARE_API_TOKEN",
  "CLOUDFLARE_WORKERS_WRITE_TOKEN",
  "CLOUDFLARE_PAGES_WRITE_TOKEN",
  "CLOUDFLARE_API_KEY",
  "CLOUDFLARE_EMAIL",
];
// cf loads dotenv files itself: reject credential overrides before any child runs.
for (const directory of [root, `${root}workers`]) {
  for (const name of await readdir(directory)) {
    if (!/^\.(env|dev\.vars)(\.|$)/.test(name) || name.endsWith(".example")) continue;
    const contents = await readFile(`${directory}/${name}`, "utf8");
    if (
      credentialKeys.some((key) =>
        new RegExp(`^\\s*(?:export\\s+)?${key}\\s*=`, "m").test(contents),
      )
    ) {
      throw new Error(
        `Remove Cloudflare credentials from ${directory}/${name}; use shell credentials.`,
      );
    }
  }
}
const token = process.env.CLOUDFLARE_WORKERS_WRITE_TOKEN;
if (operation === "--execute") {
  if ((!token && !profile) || !process.env.CLOUDFLARE_ACCOUNT_ID) {
    console.error(
      "Deploy requires a separate write token or explicit operational profile, and CLOUDFLARE_ACCOUNT_ID.",
    );
    process.exit(1);
  }
  if (!profile && token === process.env.CLOUDFLARE_API_TOKEN) {
    console.error("Use a separate Workers write token; do not reuse the ambient read credential.");
    process.exit(1);
  }
}
const buildEnv = { ...process.env };
for (const key of credentialKeys) delete buildEnv[key];
function run(commandArgs, env) {
  const result = spawnSync("pnpm", commandArgs, { cwd: root, env, stdio: "inherit" });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
run(["run", "build"], buildEnv);
const mode = cutover ? "cutover" : bridge ? "bridge" : "production";
if (cutover || bridge) {
  run(["--dir", "workers", "exec", "cf", "build", "--mode", mode], buildEnv);
  run(["exec", "node", "scripts/validate-workers.mjs"], buildEnv);
}
const command = ["--dir", "workers", "exec", "cf", "deploy", "--prebuilt", "--mode", mode];
if (operation === "--dry-run") {
  run([...command, "--dry-run"], buildEnv);
} else {
  // A named operational profile is explicit, never the default/read login.
  if (profile) run([...command, "--profile", profile], buildEnv);
  else run(command, { ...buildEnv, CLOUDFLARE_API_TOKEN: token });
}
