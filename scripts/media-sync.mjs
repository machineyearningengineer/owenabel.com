#!/usr/bin/env node
// Uploads the site's clips to R2 and rewrites src/data/media.json.
//
// Sources live outside git, in ~/dev/personal/owenabel-media-staging/site
// (or MEDIA_SOURCE): journeys/<project>/<beat>.{mp4,webm,jpg} and
// lab/<slug>.{mp4,webm,jpg}. A slug with only a .jpg is a poster on its own.
//
// Each file is stored once under a content-hashed key, e.g.
// clips/milk-and-henny/door-scan.1a2b3c4d.mp4, with a one-year immutable
// Cache-Control, so a changed clip gets a new URL and an old one never goes
// stale. Keys already on media.owenabel.com are skipped.
//
//   pnpm run media:sync -- --dry-run                    # hash and plan, no writes
//   pnpm run media:sync -- --profile personal-deploy    # upload what's new, write the manifest
//
// Writes need an explicit cf profile other than "default" and
// CLOUDFLARE_ACCOUNT_ID. The token is read in-process from cf's own store
// after `cf auth whoami` refreshes it; it is never printed or passed as an argument.
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE =
  process.env.MEDIA_SOURCE ?? join(homedir(), "dev/personal/owenabel-media-staging/site");
const MANIFEST = join(ROOT, "src/data/media.json");
const BASE = "https://media.owenabel.com";
const BUCKET = "owenabel-media";
const CACHE_CONTROL = "public, max-age=31536000, immutable";
const TYPES = { mp4: "video/mp4", webm: "video/webm", jpg: "image/jpeg" };

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const profile = args.includes("--profile") ? args[args.indexOf("--profile") + 1] : undefined;
const account = process.env.CLOUDFLARE_ACCOUNT_ID;

if (!existsSync(SOURCE)) throw new Error(`No media sources at ${SOURCE}`);
if (!dryRun) {
  if (!profile || profile === "default")
    throw new Error("Uploads need --profile <operational profile>, not default.");
  if (!account) throw new Error("Set CLOUDFLARE_ACCOUNT_ID to the personal account.");
}

// Every clip id (journeys/<project>/<beat> or lab/<slug>) with its files.
const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
const clips = new Map();
for (const path of walk(SOURCE)) {
  const ext = extname(path).slice(1);
  if (!(ext in TYPES)) continue;
  const id = relative(SOURCE, path).slice(0, -(ext.length + 1));
  if (!/^(journeys\/[a-z0-9-]+\/[a-z0-9-]+|lab\/[a-z0-9-]+)$/.test(id))
    throw new Error(`Unexpected source path: ${path}`);
  if (!clips.has(id)) clips.set(id, {});
  clips.get(id)[ext] = path;
}

const probe = (path) => {
  const out = execFileSync(
    "ffprobe",
    [
      "-v",
      "error",
      "-select_streams",
      "v:0",
      "-show_entries",
      "stream=width,height:format=duration",
      "-of",
      "json",
      path,
    ],
    { encoding: "utf8" },
  );
  const json = JSON.parse(out);
  const { width, height } = json.streams[0];
  const duration = Number(json.format.duration);
  return {
    width,
    height,
    duration: Number.isFinite(duration) ? Math.round(duration * 10) / 10 : undefined,
  };
};

let token;
const getToken = () => {
  if (token) return token;
  // whoami refreshes an expired OAuth token in the profile file.
  execFileSync("pnpm", ["exec", "cf", "auth", "whoami", "--profile", profile], {
    cwd: ROOT,
    stdio: "ignore",
    env: { ...process.env, CLOUDFLARE_API_TOKEN: "" },
  });
  const file = join(homedir(), "Library/Preferences/cloudflare/config", `${profile}.json`);
  token = JSON.parse(readFileSync(file, "utf8")).oauth_token;
  if (!token) throw new Error(`No OAuth token in profile ${profile}`);
  return token;
};

const exists = async (url, bytes) => {
  const res = await fetch(url, { method: "HEAD" });
  return res.ok && Number(res.headers.get("content-length")) === bytes;
};

const upload = async (key, path, type) => {
  const body = readFileSync(path);
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${account}/r2/buckets/${BUCKET}/objects/${key}`,
    {
      method: "PUT",
      headers: {
        authorization: `Bearer ${getToken()}`,
        "content-type": type,
        "cache-control": CACHE_CONTROL,
      },
      body,
    },
  );
  if (!res.ok)
    throw new Error(`Upload of ${key} failed: ${res.status} ${(await res.text()).slice(0, 300)}`);
};

const manifest = {};
let uploaded = 0;
let skipped = 0;
for (const id of [...clips.keys()].sort((a, b) => a.localeCompare(b))) {
  const files = clips.get(id);
  if (!files.jpg) throw new Error(`${id} has no poster .jpg`);
  if (Boolean(files.mp4) !== Boolean(files.webm))
    throw new Error(`${id} needs both .mp4 and .webm, or neither`);
  const entry = { ...probe(files.mp4 ?? files.jpg) };
  if (!files.mp4) delete entry.duration;
  // clips/<project>/<beat> for journeys, clips/lab/<slug> for the Lab.
  const stem = `clips/${id.replace(/^journeys\//, "")}`;
  for (const ext of ["jpg", "mp4", "webm"]) {
    const path = files[ext];
    if (!path) continue;
    const bytes = statSync(path).size;
    const hash = createHash("sha256").update(readFileSync(path)).digest("hex").slice(0, 8);
    const key = `${stem}.${hash}.${ext}`;
    const url = `${BASE}/${key}`;
    if (await exists(url, bytes)) skipped++;
    else {
      console.log(`${dryRun ? "would upload" : "upload"} ${key} (${(bytes / 1024).toFixed(0)} KB)`);
      if (!dryRun) {
        await upload(key, path, TYPES[ext]);
        if (!(await exists(url, bytes))) throw new Error(`${url} is not readable after upload`);
      }
      uploaded++;
    }
    entry[ext === "jpg" ? "poster" : ext] = { url, bytes };
  }
  manifest[id] = entry;
}

console.log(
  `${clips.size} clips, ${uploaded} ${dryRun ? "to upload" : "uploaded"}, ${skipped} already on R2`,
);
if (dryRun) process.exit(0);
writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`wrote ${relative(ROOT, MANIFEST)}`);
