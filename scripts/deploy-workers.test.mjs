import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { delimiter, join } from "node:path";
import { test } from "node:test";

await test("Workers deployments isolate credentials and local dry runs never invoke the uploader", () => {
  const fixture = mkdtempSync(join(tmpdir(), "workers-deploy-test-"));
  try {
    // Intercept pnpm before it can invoke the real cf or access the network.
    writeFileSync(
      join(fixture, "pnpm"),
      `#!${process.execPath}\nconst data = JSON.stringify({ args: process.argv.slice(2), token: process.env.CLOUDFLARE_API_TOKEN, write: process.env.CLOUDFLARE_WORKERS_WRITE_TOKEN, key: process.env.CLOUDFLARE_API_KEY, email: process.env.CLOUDFLARE_EMAIL });\nif (process.argv[2] === "run") require("node:fs").writeFileSync(process.env.WORKERS_TEST_BUILD_LOG, data); else console.log(data);\n`,
      { mode: 0o700 },
    );
    const env = {
      ...process.env,
      PATH: `${fixture}${delimiter}${process.env.PATH}`,
      CLOUDFLARE_API_TOKEN: "dummy-read",
      CLOUDFLARE_WORKERS_WRITE_TOKEN: "",
      CLOUDFLARE_ACCOUNT_ID: "dummy-account",
      CLOUDFLARE_API_KEY: "dummy-legacy-key",
      CLOUDFLARE_EMAIL: "dummy-email",
      WORKERS_TEST_BUILD_LOG: join(fixture, "build.json"),
    };
    const run = (args, overrides = {}) =>
      spawnSync(process.execPath, ["scripts/deploy-workers.mjs", ...args], {
        env: { ...env, ...overrides },
        encoding: "utf8",
      });
    assert.equal(run([]).status, 1);
    assert.equal(run(["--dry-run", "--bridge", "--cutover"]).status, 1);
    assert.equal(run(["--execute", "--profile", "default"]).status, 1);
    assert.equal(run(["--execute", "--profile"]).status, 1);
    assert.equal(run(["--dry-run", "--execute"]).status, 1);
    const dry = run(["--dry-run"], { CLOUDFLARE_WORKERS_WRITE_TOKEN: "dummy-write" });
    assert.equal(dry.status, 0, dry.stderr);
    assert.equal(JSON.parse(dry.stdout).args.at(-1), "--dry-run");
    assert.equal(dry.stdout.includes("dummy-write"), false);
    assert.deepEqual(JSON.parse(readFileSync(env.WORKERS_TEST_BUILD_LOG, "utf8")), {
      args: ["run", "build"],
    });
    assert.equal(run(["--execute"]).status, 1);
    assert.equal(run(["--execute"], { CLOUDFLARE_WORKERS_WRITE_TOKEN: "dummy-read" }).status, 1);
    assert.equal(
      run(["--execute"], {
        CLOUDFLARE_WORKERS_WRITE_TOKEN: "dummy-write",
        CLOUDFLARE_ACCOUNT_ID: "",
      }).status,
      1,
    );
    const upload = run(["--execute"], { CLOUDFLARE_WORKERS_WRITE_TOKEN: "dummy-write" });
    assert.equal(upload.status, 0, upload.stderr);
    const child = JSON.parse(upload.stdout);
    assert.deepEqual(JSON.parse(readFileSync(env.WORKERS_TEST_BUILD_LOG, "utf8")), {
      args: ["run", "build"],
    });
    assert.equal(child.token, "dummy-write");
    assert.equal(child.write, undefined);
    assert.equal(child.key, undefined);
    assert.equal(child.email, undefined);
    assert.deepEqual(child.args, [
      "--dir",
      "workers",
      "exec",
      "cf",
      "deploy",
      "--prebuilt",
      "--mode",
      "production",
    ]);
    const profileUpload = run(["--execute", "--profile", "fixture-operations"]);
    assert.equal(profileUpload.status, 0, profileUpload.stderr);
    const profileChild = JSON.parse(profileUpload.stdout);
    assert.equal(profileChild.token, undefined);
    assert.equal(profileChild.write, undefined);
    assert.deepEqual(profileChild.args.slice(-2), ["--profile", "fixture-operations"]);
    const cutover = run(["--dry-run", "--cutover"], {
      CLOUDFLARE_WORKERS_WRITE_TOKEN: "dummy-write",
    });
    assert.equal(cutover.status, 0, cutover.stderr);
    const commands = cutover.stdout
      .trim()
      .split("\n")
      .map((line) => JSON.parse(line));
    assert.deepEqual(
      commands.map((command) => command.args),
      [
        ["--dir", "workers", "exec", "cf", "build", "--mode", "cutover"],
        ["exec", "node", "scripts/validate-workers.mjs"],
        [
          "--dir",
          "workers",
          "exec",
          "cf",
          "deploy",
          "--prebuilt",
          "--mode",
          "cutover",
          "--dry-run",
        ],
      ],
    );
    for (const command of commands) {
      assert.equal(command.token, undefined);
      assert.equal(command.write, undefined);
      assert.equal(command.key, undefined);
      assert.equal(command.email, undefined);
    }
    // Test dotenv overrides in an isolated copy, leaving real local files untouched.
    mkdirSync(join(fixture, "scripts"));
    mkdirSync(join(fixture, "workers"));
    writeFileSync(
      join(fixture, "scripts/deploy-workers.mjs"),
      readFileSync("scripts/deploy-workers.mjs"),
    );
    for (const directory of [fixture, join(fixture, "workers")]) {
      const credentialFile = join(directory, ".env.cutover");
      writeFileSync(credentialFile, "export CLOUDFLARE_API_TOKEN=dummy-dotenv\n");
      const guarded = spawnSync(
        process.execPath,
        [join(fixture, "scripts/deploy-workers.mjs"), "--dry-run", "--cutover"],
        { env, encoding: "utf8" },
      );
      assert.equal(guarded.status, 1);
      assert.match(guarded.stderr, /Remove Cloudflare credentials/);
      assert.equal(guarded.stdout, "");
      rmSync(credentialFile);
    }
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }
});
