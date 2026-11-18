import type { LabEntry } from "../lab";

export default {
  slug: "nairaa-and-chill",
  year: "2026",
  title: "NAIRAA & Chill",
  kind: "Live site",
  line: "The site for a London music collective's nights, sets and merch. Its moments room flies you down a tunnel made of the night's photos.",
  stack: ["TanStack Start", "React", "WebGL", "Cloudflare Workers"],
  built: "Sep–Nov 2026",
  runs: "The live site, on Cloudflare Workers",
  source: "Private (client work)",
  open: { label: "nairaandchill.owenabel.com", href: "https://nairaandchill.owenabel.com" },
  clip: {
    caption:
      "The homepage's strip of photo doors, then the moments door: a floor of photo rings that tips into a tunnel.",
    live: { host: "nairaandchill.owenabel.com", href: "https://nairaandchill.owenabel.com" },
  },
  testing: [
    "How much motion and photography a site can carry and still read well on a phone.",
    "The homepage is a curved strip of photo doors. Moments opens a disc of photo rings that pitches into a tunnel and lands as a grid of every frame. Scrolling, touch or a key takes over from the autoplay at any point.",
    "A WebGL shader field, adapted from OpenShaders, sits behind the opening and the footer. Three menu styles can be swapped under yourself → menu style.",
  ],
  stops: [
    "It is a client preview and hasn't launched yet. The merch is a concept, the playlists are groupings of existing sets, and there is no sign-in, checkout or email.",
    "Haptics and headphone sound still need trying on real phones.",
  ],
  how: [
    "This is the site itself, a TanStack Start app on Cloudflare Workers.",
    "Playwright runs the desktop and phone journeys in Chrome. With reduced motion, forced colours or the pause button, the tunnel becomes a plain grid.",
  ],
} satisfies LabEntry;
