import type { LabEntry } from "../lab";

export default {
  slug: "the-koi",
  year: "2026",
  title: "The koi",
  kind: "Note",
  line: "Ink fish on a canvas under the page headings. Tap the water and they dart from the ripple.",
  stack: ["TypeScript", "Canvas 2D"],
  built: "Nov 2026",
  runs: "Under the headings on this site",
  source: [
    {
      label: "src/scripts/koi-pond.ts",
      href: "https://github.com/machineyearningengineer/owenabel.com/blob/main/src/scripts/koi-pond.ts",
    },
  ],
  open: { label: "owenabel.com", href: "/" },
  clip: {
    caption: "Three taps on the homepage paper. Each one ripples and the nearest fish dart away.",
    provenance: "Recorded on owenabel.com · 18 Nov 2026",
  },
  testing: [
    "A quieter replacement for the WebGL colour field that used to sit behind the homepage.",
    "Each fish is a 16-segment spine that follows its head, drawn in the page's own ink and accent, so it changes with the theme.",
  ],
  stops: [
    "Taps on links and buttons keep their normal job and never ripple. Phones get at most three fish.",
    "It pauses off screen and in background tabs. With reduced motion the fish stay still.",
  ],
  how: [
    "A 2D canvas behind the heading, animated only while it is on screen.",
    "The heading and text sit above it, so it never gets in the way of reading.",
  ],
} satisfies LabEntry;
