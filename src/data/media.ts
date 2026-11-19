/**
 * Clips and their posters on R2 (media.owenabel.com/clips/), keyed by
 * journeys/<project>/<beat> or lab/<slug>. src/data/media.json is written by
 * `pnpm run media:sync` from the staging folder outside git; don't edit it by hand.
 */
import manifest from "./media.json";

export type MediaFile = { url: string; bytes: number };
export type ClipMedia = {
  width: number;
  height: number;
  duration?: number;
  poster: MediaFile;
  mp4?: MediaFile;
  webm?: MediaFile;
};

const media: Record<string, ClipMedia> = manifest;

/** A clip or poster by id. Fails the build if it was never synced. */
export const clipMedia = (id: string): ClipMedia => {
  const entry = media[id];
  if (!entry)
    throw new Error(`No media for "${id}" in src/data/media.json. Run pnpm run media:sync.`);
  return entry;
};
