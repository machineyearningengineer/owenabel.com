// Scans the visible copy of the built site (dist/) for writing patterns that
// docs/WRITING.md rules out. Contract findings fail the build; review findings
// are printed as leads for an editor. The patterns follow the Systems Learning
// books' prose scanner and Wikipedia's "Signs of AI writing". A match is a
// lead, not proof: fix the claim or the structure, not only the word.
//   node scripts/check-prose.mjs            report, exit 1 on contract findings
//   node scripts/check-prose.mjs --review   also list review findings
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const dist = fileURLToPath(new URL("../dist/", import.meta.url));
const showReview = process.argv.includes("--review");

const rules = [
  {
    id: "inflated-word",
    contract: true,
    pattern:
      /\b(delv(?:e|es|ed|ing)|tapestr(?:y|ies)|testament to|vibrant|showcas(?:e|es|ed|ing)|boasts?|nestled|groundbreaking|renowned|meticulous(?:ly)?|ever-evolving|evolving landscape|game[- ]changer|cutting-edge|revolutioni[sz](?:e|es|ed|ing)|seamless(?:ly)?|effortless(?:ly)?|unlock(?:s|ed|ing)? the (?:power|potential)|supercharg(?:e|es|ed|ing)|harness(?:es|ed|ing)? the power)\b/gi,
    advice: "Name the concrete property or remove the word.",
  },
  {
    id: "significance",
    contract: true,
    pattern:
      /\b(plays? an? (?:crucial|pivotal|vital|key|significant) role|(?:a|the) (?:crucial|pivotal) (?:moment|role|step)|underscor(?:es|ed|ing) (?:the|its) (?:importance|significance)|it is (?:important|worth|crucial) (?:to note|noting)|it'?s (?:important|worth) (?:to note|noting)|cannot be overstated|stands as a|serves as a (?:testament|reminder))\b/gi,
    advice: "Say what fails or changes, and for whom.",
  },
  {
    id: "formulaic-closer",
    contract: true,
    pattern:
      /(?:^|[.!?]\s+)(In conclusion|In summary|To sum up|Overall|Ultimately|Despite these challenges|Looking ahead|The future of)\b/g,
    advice: "End on the result or the next step.",
  },
  {
    id: "slogan",
    contract: true,
    pattern: /\b(not (?:just|only|merely|simply) [^.;:!?]{1,60}?,? but(?: also)?)\b/gi,
    advice: "State the positive claim directly.",
  },
  {
    id: "slogan-heading",
    contract: true,
    headings: true,
    pattern: /^(.*(?:[,;—–]\s*not\b|\bnot (?:just|only|merely|simply)\b|\brather than\b).*)$/gim,
    advice: "Name the thing or the action instead.",
  },
  {
    id: "dismissive",
    contract: true,
    pattern: /\b(obviously|simply put|of course,)\b/gi,
    advice: "Remove words that dismiss real difficulty.",
  },
  {
    id: "vague-authority",
    contract: true,
    pattern:
      /\b(experts (?:say|agree|argue|believe)|(?:some|many) (?:critics|people|developers|engineers) (?:say|argue|believe)|studies (?:show|suggest|have shown)|research (?:shows|suggests) that|it is widely (?:believed|accepted|known))\b/gi,
    advice: "Cite the source or say it as Owen's own view.",
  },
  {
    id: "comma-not",
    pattern: /(?:^|[.!?:]\s+)([A-Z][^.!?\n]{2,48}, not [^.!?\n,;]{2,40}[.!?])/g,
    advice: "Fine if it states a scope; rewrite if it's a slogan.",
  },
  {
    id: "stacked-opener",
    pattern:
      /(?:^|[.!?]\s+)(Additionally|Furthermore|Moreover|Notably|Importantly|Crucially|Indeed),/g,
    advice: "Usually removable.",
  },
  {
    id: "ing-tail",
    pattern:
      /,\s(highlighting|underscoring|emphasi[sz]ing|reflecting|symboli[sz]ing|fostering|cultivating|showcasing|contributing to|paving the way)\b[^.]{0,80}\./gi,
    advice: "Make the consequence its own sentence, or cut it.",
  },
  {
    id: "serves-as",
    pattern:
      /\b(serves as|stands as|functions as|acts as a (?:bridge|cornerstone|catalyst)|represents a (?:shift|leap|step))\b/gi,
    advice: "Prefer 'is', or name the job.",
  },
  {
    id: "intensifier",
    pattern:
      /\b(crucial|pivotal|robust|powerful|incredibly|extremely|truly|deeply|profound(?:ly)?|transformative|unparalleled|holistic)\b/gi,
    advice: "Keep only when the sentence says what makes it so.",
  },
];

const LONG_PARAGRAPH = 60; // words; about eight lines on a phone
const WALL = 80; // words; fails the build
const LONG_SENTENCE = 30;

const plain = (html) =>
  html
    .replace(/<(script|style|svg|code|pre)\b[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&apos;|&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
const words = (text) => (text ? text.split(/\s+/).length : 0);

const pages = [];
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path);
    else if (name.endsWith(".html")) pages.push(path);
  }
};
walk(dist);

let contract = 0;
let review = 0;
for (const page of pages.sort()) {
  const html = readFileSync(page, "utf8");
  const main = (html.match(/<main[\s\S]*<\/main>/i) ?? [""])[0];
  const found = [];
  for (const match of main.matchAll(
    /<(p|figcaption|h[1-4]|td|summary)\b[^>]*>([\s\S]*?)<\/\1>/gi,
  )) {
    const text = plain(match[2]);
    if (!text) continue;
    const heading = /^h/i.test(match[1]);
    for (const rule of rules) {
      if (Boolean(rule.headings) !== heading) continue;
      rule.pattern.lastIndex = 0;
      for (const hit of text.matchAll(rule.pattern)) {
        found.push({
          contract: Boolean(rule.contract),
          id: rule.id,
          match: (hit[1] ?? hit[0]).trim(),
          advice: rule.advice,
        });
      }
    }
    if (heading) continue;
    const count = words(text);
    if (count > WALL)
      found.push({
        contract: true,
        id: "wall-of-text",
        match: `${count} words: ${text.slice(0, 60)}…`,
        advice: "Split at the turn in the argument.",
      });
    else if (count > LONG_PARAGRAPH)
      found.push({
        contract: false,
        id: "long-paragraph",
        match: `${count} words: ${text.slice(0, 60)}…`,
        advice: "About 60 words is eight lines on a phone.",
      });
    for (const sentence of text.split(/(?<=[.!?])\s+/)) {
      if (words(sentence) > LONG_SENTENCE)
        found.push({
          contract: false,
          id: "long-sentence",
          match: sentence.slice(0, 80) + "…",
          advice: "Split it, or keep it for a reason.",
        });
    }
  }
  const shown = found.filter((item) => item.contract || showReview);
  contract += found.filter((item) => item.contract).length;
  review += found.filter((item) => !item.contract).length;
  if (!shown.length) continue;
  console.log(`\n${relative(dist, page)}`);
  for (const item of shown)
    console.log(
      `  [${item.contract ? "fail" : "review"}] ${item.id}: "${item.match}" (${item.advice})`,
    );
}

console.log(
  `\nProse: ${pages.length} pages, ${contract} failing, ${review} review leads${showReview ? "" : " (--review to list)"}. See docs/WRITING.md.`,
);
if (contract) process.exit(1);
