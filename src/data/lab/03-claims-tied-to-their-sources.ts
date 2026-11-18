import type { LabEntry } from "../lab";

export default {
  slug: "claims-tied-to-their-sources",
  year: "2026",
  title: "Claims tied to their sources",
  kind: "Replay demo",
  line: "An experiment: can a research tool tie each claim to the passage it came from, and say so when the evidence doesn't answer the question?",
  stack: ["Next.js", "TypeScript", "Firestore", "Cloud Run", "Gemini"],
  built: "Nov 2026",
  runs: "Two saved reports, served as static files",
  open: { label: "fieldnotes.owenabel.com", href: "https://fieldnotes.owenabel.com" },
  clip: {
    caption:
      "Opening the saved Discover report, then a citation: the source card and the passage the claim rests on.",
    live: { host: "fieldnotes.owenabel.com", href: "https://fieldnotes.owenabel.com" },
  },
  testing: [
    "Whether code, not the model, can own the link between a claim and its evidence.",
    "The model picks a passage ID for each claim. Code supplies the citation and the quoted text, and a second model call checks support before a section is shown.",
  ],
  stops: [
    'The Compare report found no source comparing sodium-ion and lithium iron phosphate for grid storage. It says "Not directly answered" and lists what is missing.',
    "Two or three searches are not a literature review, a model check is not proof, and no subject expert reviewed the reports.",
  ],
  how: [
    "The real report reader, exported as static pages, with two reports saved from the live service on 2 Nov 2026. Sources and passages open from the saved data.",
    "It can't run a new search. Asking a new question says so and points to the saved reports.",
  ],
} satisfies LabEntry;
