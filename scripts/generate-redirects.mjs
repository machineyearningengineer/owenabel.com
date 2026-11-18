import { readdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const outputDirectory = fileURLToPath(new URL("../dist/", import.meta.url));
const files = await readdir(outputDirectory, { recursive: true });
const routes = files
  .filter((file) => file.endsWith(".html") && file !== "index.html" && file !== "404.html")
  .map((file) => `/${file.replaceAll("\\", "/").replace(/\.html$/, "")}`)
  .sort();

const redirects = routes.flatMap((route) => [
  `${route}/ ${route} 301`,
  `${route}/index.html ${route} 301`,
  `${route}.html ${route} 308`,
]);

await writeFile(
  new URL("../dist/_redirects", import.meta.url),
  `# Generated from built pages; keep legacy directory URLs working.\n/index.html / 308\n# Booking moved onto the contact page.\n/book /contact#book 301\n/book.html /contact#book 301\n${redirects.join("\n")}\n`,
);
console.log(`Generated canonical URL redirects for ${routes.length} pages.`);
