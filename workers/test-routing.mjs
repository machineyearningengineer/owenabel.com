import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { preview } from "vite";
import { legacyCaseStudies } from "../src/data/work.ts";

const server = await preview({ preview: { host: "127.0.0.1", port: 8789, strictPort: true } });
try {
  const origin = "http://127.0.0.1:8789";
  const assets = new URL("./.cloudflare/output/v0/workers/default/assets/", import.meta.url);
  const pages = (await readdir(assets, { recursive: true })).filter(
    (file) => file.endsWith(".html") && file !== "404.html",
  );
  for (const file of pages) {
    const route = file === "index.html" ? "/" : `/${file.slice(0, -5)}`;
    const response = await fetch(origin + route);
    assert.equal(response.status, 200, route);
    assert.equal(await response.text(), await readFile(new URL(file, assets), "utf8"), route);
    const redirects =
      route === "/"
        ? [["/index.html", 308]]
        : [
            [route + "/", 301],
            [route + "/index.html", 301],
            [route + ".html", 308],
          ];
    for (const [path, status] of redirects) {
      const redirect = await fetch(origin + path + "?migration=check", { redirect: "manual" });
      assert.equal(redirect.status, status, path);
      assert.equal(new URL(redirect.headers.get("location"), origin).pathname, route, path);
      assert.equal(
        new URL(redirect.headers.get("location"), origin).search,
        "?migration=check",
        path,
      );
    }
  }
  for (const path of ["/missing-migration-route", "/work/missing-migration-route"]) {
    const response = await fetch(origin + path);
    assert.equal(response.status, 404, path);
    assert.equal(await response.text(), await readFile(new URL("404.html", assets), "utf8"));
  }
  // Merged and split case studies: each old URL lands on the page or chapter that replaced it.
  for (const [from, to] of Object.entries(legacyCaseStudies)) {
    const [path, anchor] = to.split("#");
    for (const variant of [from, from + "/", from + ".html"]) {
      const redirect = await fetch(origin + variant, { redirect: "manual" });
      assert.equal(redirect.status, 301, variant);
      const location = new URL(redirect.headers.get("location"), origin);
      assert.equal(location.pathname + location.hash, to, variant);
    }
    const target = await fetch(origin + path);
    assert.equal(target.status, 200, to);
    if (anchor) assert.ok((await target.text()).includes(`id="${anchor}"`), to);
  }
  for (const file of ["og.png", "owen-abel-amenze-cv.pdf", "sitemap-index.xml", "robots.txt"]) {
    const response = await fetch(origin + "/" + file);
    assert.equal(response.status, 200, file);
    assert.deepEqual(
      Buffer.from(await response.arrayBuffer()),
      await readFile(new URL(file, assets)),
      file,
    );
  }
  for (const path of ["/_redirects", "/cloudflare.config.ts", "/.env"]) {
    assert.equal((await fetch(origin + path)).status, 404, path);
  }
  console.log(
    `Verified ${pages.length} pages, canonical redirects, query preservation, custom 404s and assets.`,
  );
} finally {
  await server.close();
}
