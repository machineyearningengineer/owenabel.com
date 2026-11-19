// Writes to the owenabel-media R2 bucket (media.owenabel.com), shared by
// media-sync.mjs and film-chapters.mjs.
//
// Writes need an explicit cf profile other than "default" (--profile <name>)
// and CLOUDFLARE_ACCOUNT_ID. The token is read in-process from cf's own store
// after `cf auth whoami` refreshes it; it is never printed or passed as an argument.
// The R2 REST API is used directly because `cf r2 objects put` can't set Cache-Control.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const BASE = "https://media.owenabel.com";
const BUCKET = "owenabel-media";

/** Reads --dry-run and --profile, and refuses writes without an operational profile. */
export function writeOptions(args = process.argv.slice(2)) {
  const dryRun = args.includes("--dry-run");
  const profile = args.includes("--profile") ? args[args.indexOf("--profile") + 1] : undefined;
  const account = process.env.CLOUDFLARE_ACCOUNT_ID;
  if (!dryRun) {
    if (!profile || profile === "default")
      throw new Error("Uploads need --profile <operational profile>, not default.");
    if (!account) throw new Error("Set CLOUDFLARE_ACCOUNT_ID to the personal account.");
  }
  return { dryRun, profile, account };
}

export function bucket({ profile, account }) {
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
  return {
    /** PUT one object with its Content-Type and Cache-Control. */
    async put(key, body, { type, cacheControl }) {
      const res = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${account}/r2/buckets/${BUCKET}/objects/${key}`,
        {
          method: "PUT",
          headers: {
            authorization: `Bearer ${getToken()}`,
            "content-type": type,
            "cache-control": cacheControl,
          },
          body,
        },
      );
      if (!res.ok)
        throw new Error(
          `Upload of ${key} failed: ${res.status} ${(await res.text()).slice(0, 300)}`,
        );
    },
  };
}

/** True when the public URL serves exactly `bytes` bytes. */
export async function served(url, bytes) {
  const res = await fetch(url, { method: "HEAD", cache: "no-store" });
  return res.ok && Number(res.headers.get("content-length")) === bytes;
}
