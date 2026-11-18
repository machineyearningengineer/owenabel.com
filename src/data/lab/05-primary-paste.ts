import type { LabEntry } from "../lab";

export default {
  slug: "primary-paste",
  year: "2026",
  title: "Primary Paste",
  kind: "Mac app",
  line: "Select text, middle-click to paste it. A second clipboard for macOS, the way Linux has always had one.",
  stack: ["Swift", "AppKit", "SwiftUI"],
  built: "Oct 2026",
  runs: "A native menu bar app, unsigned preview",
  source: [
    {
      label: "machineyearningengineer/primary-paste",
      href: "https://github.com/machineyearningengineer/primary-paste",
    },
  ],
  open: {
    label: "github.com/machineyearningengineer/primary-paste",
    href: "https://github.com/machineyearningengineer/primary-paste",
  },
  clip: {
    caption:
      "Selecting a line in Safari, then middle-clicking in TextEdit. The normal clipboard is untouched.",
    note: "From the demo video in the project's repository, recorded on a Mac with the app running",
  },
  testing: [
    "Whether the Linux habit of select, then middle-click, can work across Mac apps without touching ⌘C and ⌘V.",
    "Selections stay in memory. Links and tabs keep their normal middle-click. Queue, Stack and Cycle hold more than one item.",
  ],
  stops: [
    "It is an unsigned preview (0.1.0, build 3), with no Developer ID signature or notarisation, so macOS warns before opening it.",
    "It needs Accessibility and Input Monitoring permission. Trackpads have no middle button, so there is an optional ⌃⌥⌘V shortcut.",
  ],
  how: [
    "A native Mac app: Swift, AppKit and SwiftUI, with no cloud service.",
    "Build it from source with Xcode, or download the preview from the repository's releases.",
  ],
} satisfies LabEntry;
