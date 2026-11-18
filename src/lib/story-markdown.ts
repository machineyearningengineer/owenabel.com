// Turns a story page's rendered chapters into clean Markdown at build time,
// for the share block's "Copy markdown". It knows the handful of elements the
// story components emit; anything decorative (aria-hidden, buttons, video,
// diagrams' SVG) is dropped, and a diagram keeps its written summary.
import { ELEMENT_NODE, TEXT_NODE, parse } from "ultrahtml";

type Node = {
  type: number;
  name?: string;
  value?: string;
  attributes?: Record<string, string>;
  children?: Node[];
};

const named: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};
const decode = (text: string) =>
  text.replace(/&(#x[0-9a-f]+|#\d+|\w+);/gi, (match, code: string) => {
    if (code[0] === "#") {
      const value =
        code[1].toLowerCase() === "x" ? parseInt(code.slice(2), 16) : Number(code.slice(1));
      return String.fromCodePoint(value);
    }
    return named[code.toLowerCase()] ?? match;
  });

const SKIP = new Set(["script", "style", "svg", "video", "button", "template", "kbd", "summary"]);
const classes = (node: Node) => (node.attributes?.class ?? "").split(/\s+/);
const hidden = (node: Node) =>
  node.attributes?.["aria-hidden"] === "true" ||
  node.attributes?.hidden !== undefined ||
  classes(node).includes("visually-hidden");
const kids = (node: Node) => node.children ?? [];

/** Inline content: text, links, emphasis and code, on one line. */
const inline = (node: Node, origin: string): string => {
  if (node.type === TEXT_NODE) return decode(node.value ?? "").replace(/\s+/g, " ");
  if (node.type !== ELEMENT_NODE || !node.name) return "";
  if (SKIP.has(node.name) || hidden(node)) return "";
  const inner = kids(node)
    .map((child) => inline(child, origin))
    .join("");
  switch (node.name) {
    case "a": {
      const href = node.attributes?.href;
      return href ? `[${inner.trim()}](${new URL(decode(href), origin).href})` : inner;
    }
    case "strong":
    case "b":
      return `**${inner.trim()}**`;
    case "em":
    case "i":
      return `*${inner.trim()}*`;
    case "code":
      return `\`${inner.trim()}\``;
    case "br":
      return "  \n";
    default:
      return inner;
  }
};

const text = (node: Node, origin: string) =>
  kids(node)
    .map((child) => inline(child, origin))
    .join("")
    .trim();

const cell = (node: Node, origin: string) =>
  kids(node)
    .filter((child) => child.type === ELEMENT_NODE && child.name === "p")
    .map((child) => text(child, origin))
    .join(" ")
    .trim() || text(node, origin);

const elements = (node: Node, name: string): Node[] =>
  kids(node).flatMap((child) =>
    child.type !== ELEMENT_NODE ? [] : child.name === name ? [child] : elements(child, name),
  );

const table = (node: Node, origin: string) => {
  const rows = elements(node, "tr").map((row) =>
    kids(row)
      .filter(
        (child) => child.type === ELEMENT_NODE && (child.name === "th" || child.name === "td"),
      )
      .map((child) => cell(child, origin).replaceAll("|", "\\|")),
  );
  if (!rows.length) return [];
  const width = Math.max(...rows.map((row) => row.length));
  const hasHead = elements(node, "thead").length > 0;
  const caption = elements(node, "caption")[0];
  const head = hasHead
    ? rows.shift()!
    : [caption ? text(caption, origin) : "", ...Array(width - 1).fill("")];
  const line = (cells: string[]) =>
    `| ${[...cells, ...Array(width - cells.length).fill("")].join(" | ")} |`;
  return [[line(head), line(Array(width).fill("---")), ...rows.map(line)].join("\n")];
};

/** Block content: one string per Markdown block. */
const blocks = (node: Node, origin: string): string[] => {
  if (node.type === TEXT_NODE) {
    const value = decode(node.value ?? "").trim();
    return value ? [value] : [];
  }
  if (node.type !== ELEMENT_NODE || !node.name)
    return kids(node).flatMap((child) => blocks(child, origin));
  if (SKIP.has(node.name) || hidden(node)) return [];
  const name = node.name;
  if (/^h[1-6]$/.test(name)) {
    const number = elements(node, "span").find((span) => classes(span).includes("journey-n"));
    const label = text(node, origin);
    return [`${"#".repeat(Number(name[1]))} ${number ? `${text(number, origin)}. ` : ""}${label}`];
  }
  if (name === "p") {
    const value = text(node, origin);
    return value ? [value] : [];
  }
  if (name === "table") return table(node, origin);
  if (name === "blockquote")
    return blocks({ ...node, name: "div" }, origin).map((block) => block.replace(/^/gm, "> "));
  if (name === "figure" && classes(node).includes("journey-clip")) {
    const caption = elements(node, "figcaption")[0];
    return caption ? [`*Clip: ${text(caption, origin)}*`] : [];
  }
  if (name === "details" && classes(node).includes("case-architecture")) {
    const caption = elements(node, "figcaption")[0];
    return caption ? [`*Architecture: ${text(caption, origin)}*`] : [];
  }
  if ((name === "ol" || name === "ul") && !classes(node).includes("journey")) {
    return [
      kids(node)
        .filter((child) => child.type === ELEMENT_NODE && child.name === "li")
        .map((child, index) => `${name === "ol" ? `${index + 1}.` : "-"} ${text(child, origin)}`)
        .join("\n"),
    ];
  }
  return kids(node).flatMap((child) => blocks(child, origin));
};

export const storyMarkdown = ({
  title,
  summary,
  url,
  facts,
  body,
}: {
  title: string;
  summary: string;
  url: string;
  facts: string[];
  body: string;
}) => {
  const origin = new URL(url).origin;
  const content = blocks(parse(body) as Node, origin);
  return (
    [`# ${title}`, summary, facts.join(" · "), ...content, `Source: ${url}`].join("\n\n") + "\n"
  );
};
