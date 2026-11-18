import type { LabEntry } from "../lab";

export default {
  slug: "systems-from-scratch",
  year: "2026",
  title: "Systems from Scratch",
  kind: "Films",
  line: "Animated films that build one receipts app, from adding up a receipt to an AI assistant that acts on it.",
  stack: ["Canvas", "Headless Chrome", "Kokoro", "ffmpeg"],
  built: "Nov 2026",
  runs: "Streamed from Cloudflare R2, with captions",
  source: "Private",
  open: { label: "Watch", href: "#films" },
  films: [
    {
      file: "sfs-e00-the-whole-map",
      title: "The whole map",
      length: "4:54",
      line: "One small receipts app, and the whole system behind its one screen.",
    },
    {
      file: "sfs-e05-tapped-twice-saved-once",
      title: "Tapped twice, saved once",
      length: "8:48",
      line: "One tap gets saved twice in the job queue. How to make a repeat harmless.",
      related: {
        label: "The same problem with real payments",
        href: "/work/milk-and-henny#payments",
      },
    },
    {
      file: "sfs-e10-the-ai-reads-the-receipt",
      title: "The AI reads the receipt",
      length: "9:22",
      line: "The first part of the system that can be confidently wrong: it reads eight pounds as eighty.",
    },
    {
      file: "messages-reactions-retained-history",
      title: "Messages, reactions and retained history",
      length: "13:50",
      line: "From request and response to events: one receipt, the reactions it starts, and the history that is kept.",
    },
  ],
  filmsNote:
    "Every frame is drawn in code and rendered in headless Chrome. The voice is AI, not a person, and its word timings drive the animation, so things move on the word.",
  testing: [
    "Whether one small app can carry a whole course: the same receipts app in every film, one idea at a time.",
    "Here are three episodes from the series and one longer film on messages and events.",
  ],
  stops: [
    "The voice is synthetic. The app, the people and the prices are made up to fit each idea.",
    "They explain how an idea works and stop short of setting up any particular product.",
  ],
  how: [
    "720p MP4 files on Cloudflare R2, played in a plain video element.",
    "The captions come from the same word timings that drive the animation.",
  ],
} satisfies LabEntry;
