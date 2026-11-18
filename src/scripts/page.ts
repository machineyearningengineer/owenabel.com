/**
 * Runs `init` on every page view, including client-side navigations.
 * The signal aborts before the next page swaps in, so listeners attached
 * with `{ signal }` never pile up across pages.
 */
export function onPage(init: (signal: AbortSignal) => void) {
  document.addEventListener("astro:page-load", () => {
    const controller = new AbortController();
    document.addEventListener("astro:before-swap", () => controller.abort(), { once: true });
    init(controller.signal);
  });
}
