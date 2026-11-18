import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const defaultCard = {
  name: "Owen Abel Amenze",
  role: "Engineer / London",
  email: "hello@owenabel.com",
  document: "INDEX-ABEL",
  issued: "May 2026",
  site: "owenabel.com",
  status: "Present",
  sectionLabel: "Current practice",
  rows: [
    ["01", "Product systems", "Help people find what they came for"],
    ["02", "Data work", "Make messy records useful"],
    ["03", "Reliability", "Keep things working when people depend on them"],
  ],
};

const caseCard = ({ slug, name, area, document, issued, method, rows }) => ({
  slug,
  name,
  role: `${area} / Case study`,
  email: `owenabel.com/work/${slug}`,
  document,
  issued,
  method,
  site: "owenabel.com",
  status: "Case study",
  sectionLabel: "Case study",
  rows,
});

const cards = [
  defaultCard,
  caseCard({
    slug: "fete-finder",
    name: "Fête Finder",
    area: "Discovery & operations",
    document: "CASE-FF",
    issued: "2025–26",
    method: "Find, plan, share",
    rows: [
      ["01", "Discovery", "Narrow by date, place, and taste"],
      ["02", "Plans", "Save stops and arrival times"],
      ["03", "Operations", "Back up and recover live records"],
    ],
  }),
  caseCard({
    slug: "milk-and-henny",
    name: "Milk & Henny",
    area: "Events, games & photos",
    document: "CASE-MH",
    issued: "2025–26",
    method: "Arrive, join in, return",
    rows: [
      ["01", "Getting in", "Connect tickets and door check-in"],
      ["02", "Joining in", "Give each screen a job"],
      ["03", "Following up", "Keep the photos and stories together"],
    ],
  }),
  caseCard({
    slug: "receipts",
    name: "Receipts",
    area: "Discovery & platform",
    document: "CASE-RCPT",
    issued: "2026",
    method: "Evidence before claims",
    rows: [
      ["01", "Visual search", "Use an image to express a desired look"],
      ["02", "Evidence model", "Label the source behind a match"],
      ["03", "Platform", "Keep incomplete media private"],
    ],
  }),
  caseCard({
    slug: "jisc",
    name: "Jisc",
    area: "Search, data & infrastructure",
    document: "CASE-JISC",
    issued: "2024–26",
    method: "Find, fix, stabilise",
    rows: [
      ["01", "Policy search", "Retire Elasticsearch for PostgreSQL"],
      ["02", "Data quality", "Send record gaps back to stewards"],
      ["03", "Main website", "Move to Fargate after daily outages"],
    ],
  }),
];

const escapeXml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

export const createLedgerOgSvg = ({
  name,
  role,
  email,
  document,
  issued,
  method,
  site,
  status,
  sectionLabel,
  rows,
}) => {
  const rowMarkup = rows
    .map(
      ([no, area, use], index) => `
    <text x="92" y="${344 + index * 46}" font-size="20">${escapeXml(no)}</text>
    <text x="158" y="${344 + index * 46}" font-size="20">${escapeXml(area)}</text>
    <text x="458" y="${344 + index * 46}" font-size="20">${escapeXml(use)}</text>`,
    )
    .join("\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#efefec" />
  <g fill="#111111" font-family="Courier New, Courier, monospace">
    <text x="78" y="92" font-size="22">${escapeXml(name)}</text>
    <text x="78" y="124" font-size="22">${escapeXml(role)}</text>
    <text x="78" y="156" font-size="22">${escapeXml(email)}</text>

    <g font-size="22">
      <rect x="748" y="70" width="374" height="86" fill="none" stroke="#111111" stroke-width="1" />
      <text x="764" y="104">Document:      ${escapeXml(document)}</text>
      <text x="764" y="134">Issued:        ${escapeXml(issued)}</text>
    </g>

    <text x="78" y="230" font-size="18">${escapeXml(sectionLabel)}</text>
    <line x1="78" y1="262" x2="1122" y2="262" stroke="#111111" stroke-width="1" />
    <text x="92" y="292" font-size="20">#</text>
    <text x="158" y="292" font-size="20">Area</text>
    <text x="458" y="292" font-size="20">Use</text>
    <line x1="78" y1="310" x2="1122" y2="310" stroke="#111111" stroke-width="1" />
${rowMarkup}

    <line x1="78" y1="478" x2="1122" y2="478" stroke="#111111" stroke-width="1" />
    <line x1="78" y1="482" x2="1122" y2="482" stroke="#111111" stroke-width="1" />

${method ? `    <text x="78" y="536" font-size="22">Method: ${escapeXml(method)}</text>` : ""}
    <text x="78" y="574" font-size="18">${escapeXml(site)}</text>
    <text x="960" y="574" font-size="18">Status: ${escapeXml(status)}</text>
  </g>
</svg>
`;
};

await mkdir(new URL("../public/og/", import.meta.url), { recursive: true });

await Promise.all(
  cards.map(async ({ slug, ...card }) => {
    const output = slug
      ? {
          svg: new URL(`../public/og/${slug}.svg`, import.meta.url),
          png: new URL(`../public/og/${slug}.png`, import.meta.url),
        }
      : {
          svg: new URL("../public/og.svg", import.meta.url),
          png: new URL("../public/og.png", import.meta.url),
        };
    const svg = createLedgerOgSvg(card);

    await writeFile(output.svg, svg);
    await sharp(Buffer.from(svg)).png().toFile(fileURLToPath(output.png));

    console.log(`Generated ${output.svg.pathname}`);
    console.log(`Generated ${output.png.pathname}`);
  }),
);
