/**
 * The Lab: experiments, demos and films. One file per entry in src/data/lab/,
 * ordered by its file name. Each entry feeds a row on /lab and its note at
 * /lab/<slug>. Clips and thumbnails live in public/lab/<slug>.{mp4,webm,jpg};
 * films stream from R2 at media.owenabel.com/films/<film>.{mp4,jpg,vtt}.
 */
export type LabKind = "Live site" | "Replay demo" | "Films" | "Mac app" | "Note";
export type LabLink = { label: string; href: string };

export type LabFilm = {
  /** File name on R2 without the extension. */
  file: string;
  title: string;
  /** m:ss */
  length: string;
  line: string;
  related?: LabLink;
};

export type LabEntry = {
  slug: string;
  year: string;
  title: string;
  kind: LabKind;
  /** One plain sentence (or two) for the row and the note's header. */
  line: string;
  stack: string[];
  built: string;
  /** Short answer for the details table. */
  runs: string;
  /** Where the code is. Text for no link, links for public code; leave it out for "On request". */
  source?: string | LabLink[];
  /** The main action under the exhibit: the demo, the site or the repository. */
  open?: LabLink;
  /**
   * A clip at public/lab/<slug>, or the films' poster when there is no clip.
   * `live` is where it was recorded; `note` replaces that line for a clip from elsewhere.
   */
  clip?: { caption: string; live?: { host: string; href: string }; note?: string };
  films?: LabFilm[];
  /** A line under the films heading, e.g. how they were made. */
  filmsNote?: string;
  testing: string[];
  stops: string[];
  how: string[];
};

export const MEDIA = "https://media.owenabel.com/films";

const modules = import.meta.glob<{ default: LabEntry }>("./lab/*.ts", { eager: true });

export const lab: LabEntry[] = Object.keys(modules)
  .sort()
  .map((path) => modules[path].default);

export const labNumber = (entry: LabEntry) =>
  `L-${String(lab.indexOf(entry) + 1).padStart(2, "0")}`;

/** "Live site ↗" for things that open elsewhere. */
export const kindLabel = (entry: LabEntry) =>
  entry.kind === "Live site" || entry.kind === "Mac app" ? `${entry.kind} ↗` : entry.kind;

/** Total running time of an entry's films, as m:ss. */
export const filmLength = (entry: LabEntry) => {
  if (!entry.films?.length) return undefined;
  const seconds = entry.films.reduce((sum, film) => {
    const [m, s] = film.length.split(":").map(Number);
    return sum + m * 60 + s;
  }, 0);
  const total = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
  return entry.films.length === 1 ? total : `${entry.films.length} films, ${total}`;
};
