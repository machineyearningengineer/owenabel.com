// Builds public/owen-head-sprite.webp from assets/owen-head.
//
//   pnpm head:build            rebuild the sprite from the existing cutouts
//   pnpm head:build 3-right    re-cut one frame from frames/ (macOS), then rebuild
//
// Cutting out uses Apple Vision through scripts/cut-out-subject.swift, so it
// needs macOS. Rebuilding from committed cutouts works anywhere.
import { execFileSync } from "node:child_process";
import { mkdtempSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";

const root = new URL("../", import.meta.url).pathname;
const frames = join(root, "assets/owen-head/frames");
const cutouts = join(root, "assets/owen-head/cutouts");
const output = join(root, "public/owen-head-sprite.webp");
const CELL = { width: 192, height: 208 };
const HEAD_HEIGHT = 200;

const names = readdirSync(frames)
  .filter((file) => file.endsWith(".jpg"))
  .map((file) => file.replace(/\.jpg$/, ""))
  .sort((a, b) => Number.parseInt(a) - Number.parseInt(b));

const recut = process.argv.slice(2);
for (const name of recut) {
  if (!names.includes(name))
    throw new Error(`No frame called ${name}. Frames: ${names.join(", ")}`);
  const scratch = mkdtempSync(join(tmpdir(), "owen-head-"));
  const raw = join(scratch, "cutout.png");
  execFileSync(
    "swift",
    [join(root, "scripts/cut-out-subject.swift"), join(frames, `${name}.jpg`), raw],
    {
      stdio: "inherit",
    },
  );
  await sharp(raw)
    .resize({ height: 420 })
    .png({ compressionLevel: 9 })
    .toFile(join(cutouts, `${name}.png`));
  rmSync(scratch, { recursive: true });
  console.log(`Re-cut ${name}`);
}

// Same scale for every frame, each centred on a shared baseline, so the
// head doesn't jump when the frame changes.
const metadata = await Promise.all(
  names.map((name) => sharp(join(cutouts, `${name}.png`)).metadata()),
);
const scale = HEAD_HEIGHT / Math.max(...metadata.map((m) => m.height ?? 0));
const layers = await Promise.all(
  names.map(async (name, index) => {
    const width = Math.round((metadata[index].width ?? 0) * scale);
    const height = Math.round((metadata[index].height ?? 0) * scale);
    return {
      input: await sharp(join(cutouts, `${name}.png`))
        .resize(width, height)
        .png()
        .toBuffer(),
      left: index * CELL.width + Math.round((CELL.width - width) / 2),
      top: CELL.height - 4 - height,
    };
  }),
);

await sharp({
  create: {
    width: CELL.width * names.length,
    height: CELL.height,
    channels: 4,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  },
})
  .composite(layers)
  .webp({ quality: 84, alphaQuality: 92, effort: 6 })
  .toFile(output);

console.log(`Built ${output} from ${names.length} frames: ${names.join(", ")}`);
