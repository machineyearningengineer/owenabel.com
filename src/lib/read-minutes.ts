// Reading time for each story page, as the page itself reports it
// (StoryLayout writes data-read-minutes), so the Work page never disagrees.
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import type { AstroComponentFactory } from "astro/runtime/server/index.js";

const pages = import.meta.glob<{ default: AstroComponentFactory }>("../pages/work/*.astro");

let cache: Promise<Record<string, number>> | undefined;

export const readMinutes = () =>
  (cache ??= (async () => {
    const container = await AstroContainer.create();
    const entries = await Promise.all(
      Object.entries(pages).map(async ([path, load]) => {
        const href = `/work/${path
          .split("/")
          .pop()!
          .replace(/\.astro$/, "")}`;
        const html = await container.renderToString((await load()).default, {
          request: new Request(new URL(href, "https://owenabel.com")),
        });
        const minutes = Number(/data-read-minutes="(\d+)"/.exec(html)?.[1]);
        if (!minutes) throw new Error(`readMinutes: no reading time on ${href}`);
        return [href, minutes] as const;
      }),
    );
    return Object.fromEntries(entries);
  })());
