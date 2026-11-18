# Page Transitions

This site stays a static Astro multi-page app. The goal was to make page
switching feel smooth without adding Astro's `ClientRouter` or turning the site
into an SPA.

## What We Fixed

### First Paint Theme

The first flash was caused by the browser painting before the full stylesheet
had loaded. The fix lives at the top of `BaseLayout.astro`:

- `meta name="color-scheme"` declares support for light and dark.
- `theme-color` matches the browser UI to the preferred scheme.
- A tiny inline style sets the first background and text color with literal hex
  values, not CSS variables.
- A blocking inline script reads `owenabel-theme` and sets
  `document.documentElement.dataset.theme` before the body paints.

The external stylesheet also avoids an unconditional light theme. `:root` uses
`color-scheme: light dark`, and `prefers-color-scheme: dark` mirrors the dark
tokens unless the user has explicitly chosen `data-theme="light"`.

### Texture Pop

The background grain is a real image, so it can appear after the base
background. We preload `/grain.png` in the document head. Cloudflare also emits
an Early Hints preload header for it.

### Client-side navigation

The site uses Astro's `ClientRouter` so the audio player survives page changes.
Pages are still static HTML; the router fetches the next page and swaps it in
with a same-document view transition. Without JavaScript, links fall back to
normal full-page navigation. Reduced-motion users get no transition animation.

Rules that keep this working:

- Page scripts register through `onPage` in `src/scripts/page.ts`. It runs on
  every `astro:page-load` and passes an `AbortSignal` that fires before the
  next swap. Attach `document`/`window` listeners with `{ signal }`, and stop
  timers, animation frames and observers on abort.
- The swap replaces `<html>` attributes, so the head script re-applies the
  saved theme on `astro:after-swap`.
- `LedgerPlayer` is `transition:persist`: one `<audio>` element for the whole
  visit. Any element with `data-play`, `data-play-title` and
  `data-play-source` takes it over; the player marks matching triggers with
  `data-playing`.
- Named view transitions: the site header, brand and nav stay put, the
  player keeps its place, and each homepage exhibit morphs into its case
  study's screenshot (`exhibit-<slug>`).

### Same-Page Links

Clicking a link to the page you are already on can trigger a pointless full
document reload. That looked like a hard refresh in browsers where native view
transitions did not smooth same-URL reloads.

We avoid that semantically instead of installing a global click interceptor:

- Navigation links already receive `aria-current="page"` when active.
- The brand/home link receives `aria-current="page"` only on `/`.
- Current links get `pointer-events: none` and `cursor: default`.

This prevents current-page menu clicks from reloading while keeping real links,
hash links, external links, and mail links normal.
