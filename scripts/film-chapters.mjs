#!/usr/bin/env node
// Writes a WebVTT chapters track for every Lab film that lists `chapters` in
// src/data/lab/*.ts and uploads it beside the film as
// media.owenabel.com/films/<file>.chapters.vtt. The last chapter ends at the
// film's real duration, read from the MP4 on R2. Unchanged tracks are skipped.
//
//   pnpm run films:chapters -- --dry-run
//   pnpm run films:chapters -- --profile personal-deploy
import { execFileSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { BASE, bucket, writeOptions } from "./r2.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const LAB = join(ROOT, "src/data/lab");
const options = writeOptions();
const r2 = options.dryRun ? undefined : bucket(options);

const stamp = (seconds) => {
  const ms = Math.round(seconds * 1000);
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor(ms / 60_000) % 60;
  const s = Math.floor(ms / 1000) % 60;
  const pad = (n, w = 2) => String(n).padStart(w, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}.${pad(ms % 1000, 3)}`;
};

const duration = (url) =>
  Number(
    execFileSync(
      "ffprobe",
      ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", url],
      {
        encoding: "utf8",
      },
    ),
  );

let written = 0;
for (const name of readdirSync(LAB).sort((a, b) => a.localeCompare(b))) {
  const { default: entry } = await import(pathToFileURL(join(LAB, name)).href);
  for (const film of entry.films ?? []) {
    if (!film.chapters?.length) continue;
    const end = duration(`${BASE}/films/${film.file}.mp4`);
    const starts = film.chapters.map(([at]) => at);
    if (starts[0] !== 0 || starts.some((at, i) => i && at <= starts[i - 1]) || starts.at(-1) >= end)
      throw new Error(`${film.file}: chapters must start at 0, rise, and end before ${end}s`);
    const cues = film.chapters.map(
      ([at, title], i) =>
        `${i + 1}\n${stamp(at)} --> ${stamp(film.chapters[i + 1]?.[0] ?? end)}\n${title}`,
    );
    const vtt = `WEBVTT\n\n${cues.join("\n\n")}\n`;
    const key = `films/${film.file}.chapters.vtt`;
    const live = await fetch(`${BASE}/${key}`, { cache: "no-store" });
    if (live.ok && (await live.text()) === vtt) {
      console.log(`unchanged ${key}`);
      continue;
    }
    console.log(
      `${options.dryRun ? "would upload" : "upload"} ${key} (${film.chapters.length} chapters)`,
    );
    if (options.dryRun) console.log(vtt);
    else
      await r2.put(key, vtt, {
        type: "text/vtt; charset=utf-8",
        cacheControl: "public, max-age=3600",
      });
    written++;
  }
}
console.log(`${written} chapter tracks ${options.dryRun ? "to upload" : "uploaded"}`);
