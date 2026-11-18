import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const output = join(root, "workers/.cloudflare/output/v0/workers/default");
const config = JSON.parse(await readFile(join(output, "worker.config.json"), "utf8"));
assert.equal(config.compatibilityDate, "2026-05-12");
assert.equal(config.assets.htmlHandling, "drop-trailing-slash");
assert.equal(config.assets.notFoundHandling, "404-page");
assert.equal(config.assets.runWorkerFirst, false);
assert.equal(config.entrypoint, undefined, "This site must remain assets-only");
assert.equal(config.env, undefined, "Unexpected runtime bindings");
const context = JSON.parse(
  await readFile(join(root, "workers/.cloudflare/output/v0/config.json"), "utf8"),
);
assert.equal(
  config.name,
  ["cutover", "bridge"].includes(context.buildContext.mode)
    ? "owenabel-com"
    : "owenabel-com-preview",
);
assert.deepEqual(
  config.domains,
  context.buildContext.mode === "cutover" ? ["owenabel.com", "www.owenabel.com"] : [],
);
assert.deepEqual(
  config.triggers,
  context.buildContext.mode === "bridge"
    ? [
        { type: "fetch", pattern: "owenabel.com/*", zone: "owenabel.com" },
        { type: "fetch", pattern: "www.owenabel.com/*", zone: "owenabel.com" },
      ]
    : [],
);
const files = await readdir(join(root, "dist"), { recursive: true, withFileTypes: true });
const assets = files.filter((file) => file.isFile());
assert.ok(assets.length <= 20_000, "Workers Free supports 20,000 assets");
for (const asset of assets) {
  const relative = join(asset.parentPath.slice(join(root, "dist").length), asset.name);
  const source = join(asset.parentPath, asset.name);
  assert.ok((await stat(source)).size <= 25 * 1024 * 1024, `Asset exceeds 25 MiB: ${relative}`);
  assert.deepEqual(
    await readFile(join(output, "assets", relative)),
    await readFile(source),
    `Changed asset: ${relative}`,
  );
}
for (const file of ["index.html", "404.html", "_redirects", "sitemap-index.xml"]) {
  await stat(join(output, "assets", file));
}
assert.ok((await readFile(join(output, "assets/_redirects"), "utf8")).includes("/work/ /work 301"));
console.log(`Validated Workers configuration and ${assets.length} unchanged static files.`);
