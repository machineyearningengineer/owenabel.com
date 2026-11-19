# Writing for owenabel.com

How every page on this site is written and laid out. Read this before changing
any visible copy. `pnpm run check:prose` (part of `pnpm run build`) enforces the
patterns a script can catch; the rest needs judgement.

## Who reads it, in what order

A recruiter or product person reads the top of a page and the numbers. An
engineer reads "Under the hood". Write so the first group gets the point in the
hero and the first chapter, and the second finds the mechanism without wading
through the pitch.

Each story page follows one arc: **the problem** (a person and what goes wrong),
**how it works** (numbered steps, each with a clip), **what happened** (numbers
with their date and source), **under the hood** (one mechanism per
sub-chapter), **what I learned** (two or three short paragraphs).

## Voice

- First person, Owen's voice. British spelling. Plain words, named actors,
  concrete verbs: "the scanner replays its queue", not "offline resilience is
  ensured".
- Say what happened and what it cost or saved. A number carries its date or
  period and where it came from ("54,295 page views, June 2026").
- Tell Owen's own account as he tells it. Things he built and confirmed (the
  Fête collection agents, their 87 of 159 listings) are stated plainly, without
  "my estimate" or "in an earlier version" hedges. Keep a limit only where
  leaving it out would mislead, and say it once, at that point.
- Never invent a figure, a client, a timeline or a result to smooth a story.
  If a fact isn't in Owen's words, the code or a record, leave it out.
- Humour is welcome when it comes from the thing itself (Pitch Night,
  "machineyearningengineer"). No jokes bolted on.
- Interview take-homes in the Lab never name the company, anywhere visible.

## Explain it, then name it

Owen's interview reviews found the same two habits every time: explaining
everything before the headline, and naming a technique as if the name explained
it. Fix both on the page.

- **Lead with the headline:** the decision or the result first, then how.
- **Tell each piece of work as a short story** (situation, task, action,
  result): what was in the way, what had to happen, what Owen did, and what
  changed. Then what he learned, if it's worth saying.
- **Describe what was done in plain steps before giving a technique its name.**
  "First I shipped the new component next to the old one… Engineers call this
  expand and contract" works. "I used expand and contract" on its own does
  not. A reader who doesn't know the term should lose nothing.
- **The same goes for tools and acronyms** (nDCG, trigram matching, SKIP
  LOCKED, an outbox): say what it does for the reader in a clause. A list of
  tool names is not an explanation.

## Patterns that read as generated

Follow Wikipedia's [Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing).
Fix the claim, not just the word: name the actor, the consequence or the
source.

- Inflated words: delve, tapestry, seamless, robust, cutting-edge, showcase,
  game-changer, pivotal, transformative.
- Significance instead of a consequence: "plays a key role", "underscores the
  importance of".
- "X, not Y" slogans in headings or as one-line takeaways. A precise contrast
  inside a sentence is fine when it states a scope ("counts of tracked
  actions, not people").
- Stacked openers (Additionally, Moreover, Furthermore), trailing "-ing"
  clauses that assert meaning ("…, highlighting its value"), "serves as".
- Formulaic closers: "In conclusion", "Overall", "Looking ahead".
- Rule-of-three lists used for rhythm, not content. Em dashes as cadence: use
  a full stop.
- Embellished titles. Owen is "Engineer / London".

## Reading size and shape

Measured on 18 November 2026 at 1440px and 390px.

- Story body copy is Georgia 18px on a 1.6 line height, about 65–70 characters a
  line on desktop. Titles are Georgia too. Labels, captions, tables, contents
  and the ledger pages are Berkeley Mono.
- Line length is set once, in `:root` of src/styles/global.css: `--measure`
  (Georgia body, about 65–70 characters), `--measure-mono` (66ch, mono
  paragraphs and captions) and `--measure-lead` (the hero hook). Use these;
  never hard-code a reading width.
- **One idea per paragraph, about 60 words at most.** On a phone that is eight
  lines; anything longer reads as a wall. Split at the turn in the argument.
- Sentences mostly under 25 words; one over 30 needs a reason.
- A step has two or three short paragraphs and one clip set. Supporting detail
  moves to "Under the hood", not into the step.
- Don't repeat in prose what a diagram or clip already shows. A diagram's
  summary goes in its SVG description for screen readers, not under it.
- Headings name the thing or the action ("A door with no signal").
- Lists only for parallel items a reader will scan; arguments stay as prose.

## Media

- Every clip says what it shows in one sentence. The provenance line under it
  (live site or local build with made-up data, and the date) is automatic: set
  `local` on clips recorded off the live site.
- Several clips for one step go in a `ClipSet`, shown one at a time.
- No real customer data in any clip, ever.

## Colour and weight

- The paper and ink surface does the work. The accent marks the current step,
  the active chapter and focus. Marker highlights mark citations. Nothing else
  is coloured, and there are no colour washes.
- Text contrast at least 4.5:1 in both themes, including captions. Don't fade
  text with opacity; use `--muted`.
- Weight 500 for labels and step titles, 400 everywhere else.

## What we borrow from the best technical blogs

- **Julia Evans:** short paragraphs, the question you had as the heading,
  saying what confused you.
- **Cloudflare's post-mortems:** a timeline, the numbers, the fix, and what
  changed afterwards, written plainly.
- **Stripe and Tailscale explainers:** one running example from start to end,
  and a diagram exactly where the text needs it.
- **Anthropic's engineering posts:** problem, approach, result, then the
  limits, with a contents rail for long reads.
- **Josh Comeau:** show it working before explaining it.
