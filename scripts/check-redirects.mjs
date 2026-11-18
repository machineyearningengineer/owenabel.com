import assert from "node:assert/strict";
import { readFile, readdir, writeFile, mkdir } from "node:fs/promises";
import { join, relative } from "node:path";

const canonicalOrigin = "https://owenabel.com";
const origins = [
  canonicalOrigin,
  "https://www.owenabel.com",
  "http://owenabel.com",
  "http://www.owenabel.com",
];
const files = await readdir(new URL("../dist/", import.meta.url), {
  recursive: true,
  withFileTypes: true,
});
const root = new URL("../dist/", import.meta.url).pathname.replace(/\/$/, "");
const paths = new Map();
function add(path, finalPath, status = 200) {
  paths.set(path, { finalPath, status });
}
for (const file of files.filter((entry) => entry.isFile())) {
  const path = "/" + relative(root, join(file.parentPath, file.name)).replaceAll("\\", "/");
  if (path === "/_redirects" || path === "/_headers") continue;
  if (path.endsWith(".html")) {
    const route = path === "/index.html" ? "/" : path.slice(0, -5);
    add(route, route);
    add(path, route);
    if (route !== "/" && route !== "/404") {
      add(route + "/", route);
      add(route + "/index.html", route);
    }
    const html = await readFile(`${file.parentPath}/${file.name}`, "utf8");
    assert.doesNotMatch(html, /http-equiv\s*=\s*["']?refresh/i, `Meta refresh in ${path}`);
    for (const match of html.matchAll(/(?:href|src)=["']([^"']+)["']/g)) {
      const url = new URL(match[1].replaceAll("&amp;", "&"), canonicalOrigin + route);
      if (url.origin === canonicalOrigin && !url.pathname.endsWith(".html"))
        add(url.pathname + url.search, url.pathname);
    }
  } else add(path, path);
}
for (const path of [
  "/missing-redirect-check",
  "/work/missing-redirect-check",
  "/missing-redirect-check/",
  "/_redirects",
  "/cloudflare.config.ts",
])
  add(path, path, 404);
const query = "redirect_check=1&next=https%3A%2F%2Fexample.com%2Fa%3Fx%3D1&lang=en";
const cases = [...paths].flatMap(([path, expected]) =>
  origins.flatMap((origin) => {
    const url = new URL(path, origin);
    const queried = new URL(url);
    for (const [key, value] of new URLSearchParams(query)) queried.searchParams.append(key, value);
    return [
      { url: url.href, ...expected },
      { url: queried.href, ...expected },
    ];
  }),
);
const results = [];
let cursor = 0;
async function inspect(item) {
  const seen = new Set();
  const chain = [];
  let current = new URL(item.url);
  const expectedQuery = [...current.searchParams];
  for (let hop = 0; hop <= 3; hop++) {
    assert.ok(!seen.has(current.href), `Redirect loop: ${chain.join(" -> ")} -> ${current.href}`);
    seen.add(current.href);
    chain.push(current.href);
    const response = await fetch(current, {
      redirect: "manual",
      signal: AbortSignal.timeout(15_000),
    });
    assert.equal(response.headers.get("refresh"), null, `Refresh header at ${current}`);
    // Cloudflare's managed robots.txt answers /robots.txt on every host and
    // scheme with 200, ahead of the edge redirects. Accept only its managed file.
    if (current.pathname === "/robots.txt" && response.status === 200) {
      assert.match(
        await response.text(),
        /BEGIN Cloudflare Managed content/,
        `Unexpected robots.txt at ${current}`,
      );
      results.push({ url: item.url, redirects: chain.length - 1, status: 200, finalUrl: current.href });
      return;
    }
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get("location");
      assert.ok(location, `Redirect without Location: ${current}`);
      current = new URL(location, current);
      current.hash = "";
      assert.ok(
        origins.includes(current.origin),
        `Unexpected redirect off the portfolio: ${current}`,
      );
      await response.body?.cancel();
      continue;
    }
    assert.equal(
      response.status,
      item.status,
      `Unexpected final status: ${item.url} -> ${current}`,
    );
    assert.equal(current.origin, canonicalOrigin, `Noncanonical origin: ${current}`);
    assert.equal(current.pathname, item.finalPath, `Noncanonical path: ${current}`);
    assert.deepEqual(
      [...current.searchParams],
      expectedQuery,
      `Changed query: ${item.url} -> ${current}`,
    );
    if (response.headers.get("content-type")?.includes("text/html")) {
      assert.doesNotMatch(
        await response.text(),
        /http-equiv\s*=\s*["']?refresh/i,
        `Live meta refresh at ${current}`,
      );
    } else await response.body?.cancel();
    results.push({
      url: item.url,
      redirects: chain.length - 1,
      status: response.status,
      finalUrl: current.href,
    });
    return;
  }
  throw new Error(`Excessive redirect chain: ${chain.join(" -> ")}`);
}
await Promise.all(
  Array.from({ length: 6 }, async () => {
    while (cursor < cases.length) {
      const item = cases[cursor++];
      await inspect(item);
    }
  }),
);
const report = {
  checkedAt: new Date().toISOString(),
  urls: results.length,
  maxRedirects: Math.max(...results.map((r) => r.redirects)),
  loops: 0,
  results,
};
await mkdir(new URL("../.cloudflare/audit/", import.meta.url), { recursive: true });
await writeFile(
  new URL("../.cloudflare/audit/redirect-review.json", import.meta.url),
  JSON.stringify(report, null, 2) + "\n",
);
console.log(
  `Verified ${report.urls} live URL variants: no loops; maximum ${report.maxRedirects} redirects; canonical destinations and query strings preserved.`,
);
