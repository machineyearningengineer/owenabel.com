import type { LabEntry } from "../lab";

export default {
  slug: "answers-that-cite-the-record",
  year: "2026",
  title: "Answers that cite the record",
  kind: "Replay demo",
  line: "An experiment: can an AI agent answer questions about care records without making anything up? Every claim links to the visit note behind it, and it says what the records can't show.",
  stack: ["Python", "FastAPI", "SQLite", "OpenAI"],
  built: "Nov 2026",
  runs: "Recorded answers, replayed in your browser",
  source: [
    {
      label: "Source on GitHub, as submitted",
      href: "https://github.com/machineyearningengineer/emma-care-agent",
    },
  ],
  open: { label: "care-agent.owenabel.com", href: "https://care-agent.owenabel.com" },
  clip: {
    caption:
      "Asking who needs attention this week, then opening a citation: the claim sits above the carer's own note.",
    live: { host: "care-agent.owenabel.com", href: "https://care-agent.owenabel.com" },
  },
  films: [
    {
      file: "care-agent-walkthrough",
      title: "One question, end to end",
      length: "10:58",
      line: "How one question becomes a checked answer, the limits that keep it safe, what is checked and what is fragile, and what breaks first. Narrated by an AI voice.",
    },
  ],
  testing: [
    "Whether a model that writes its own read-only SQL can answer a care manager's plain questions with claims they can check.",
    "Every row it reads carries its record's ID. The answer cites them as (visit 12), and the page turns each one into a button that opens the note.",
  ],
  stops: [
    "It can't tell whether visits were missed or late, because the data has no planned times. It says so.",
    "It catches the medication trap: a visit marked Completed whose note says the family hadn't given the medicine.",
    "It refuses to delete anything, and the database connection is read-only anyway. It has only been tested on synthetic data.",
  ],
  how: [
    "No server and no model. The page is the real front end. A small script answers its API calls from files. They hold five answers recorded from the live agent on 7 Nov 2026, the queries each one ran, and every visit and form record.",
    "Any other question gets a reply saying it is a recording, with the five questions to try.",
  ],
} satisfies LabEntry;
