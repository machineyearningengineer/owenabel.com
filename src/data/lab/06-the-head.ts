import type { LabEntry } from "../lab";

export default {
  slug: "the-head",
  year: "2026",
  title: "The head",
  kind: "Note",
  line: "The head on my homepage: 14 frames made from one photo. It turns to follow your cursor and doesn't like being poked.",
  stack: ["TypeScript", "CSS sprite", "Apple Vision"],
  built: "Nov 2026",
  runs: "On the homepage, in your browser",
  source: [
    {
      label: "src/scripts/owen-head.ts",
      href: "https://github.com/machineyearningengineer/owenabel.com/blob/main/src/scripts/owen-head.ts",
    },
    {
      label: "assets/owen-head/README.md",
      href: "https://github.com/machineyearningengineer/owenabel.com/blob/main/assets/owen-head/README.md",
    },
  ],
  open: { label: "owenabel.com", href: "/" },
  clip: {
    caption:
      "The head follows the cursor round, then five quick taps: a wince, teary, annoyed with a vein, a sigh.",
    provenance: "Recorded on owenabel.com · 18 Nov 2026",
  },
  testing: [
    "Whether a cheap trick can make a page feel like someone is there.",
    "Each of the 14 frames was edited from one approved photo in ChatGPT Images, cut out on the Mac with Apple Vision, and built into one sprite. Eight frames turn toward the cursor; with no cursor it glances around on its own.",
    "Taps escalate: a wince, then teary, then annoyed with a cartoon vein, then a sigh, and back to calm. Playing the voice line makes it look shocked.",
  ],
  stops: [
    "Eight directions means it snaps rather than turns. It doesn't follow a finger on touch screens, and with reduced motion it only reacts to taps.",
    "A new frame means generating it from the master again and re-cutting it, and the cut-out step only runs on macOS.",
  ],
  how: [
    "One WebP sprite of 14 frames. The script picks a frame by setting a CSS variable.",
    "Asking for every angle in one image made the face drift, so each frame was made from the master on its own.",
  ],
} satisfies LabEntry;
