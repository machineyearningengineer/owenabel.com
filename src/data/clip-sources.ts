// Where each project's public clips were recorded, for the provenance line
// under a clip. Clips from staff or signed-in screens are recorded on a local
// build with made-up data instead, and say so.
export const RECORDED_ON = "18 Nov 2026";

export const liveSources: Record<string, { host: string; href: string }> = {
  "fete-finder": {
    host: "fete.outofofficecollective.co.uk",
    href: "https://fete.outofofficecollective.co.uk",
  },
  "milk-and-henny": { host: "milkandhenny.com", href: "https://milkandhenny.com" },
  receipts: { host: "receipts.beauty", href: "https://receipts.beauty" },
  "open-policy-finder": {
    host: "openpolicyfinder.jisc.ac.uk",
    href: "https://openpolicyfinder.jisc.ac.uk",
  },
  "jisc-website": { host: "jisc.ac.uk", href: "https://www.jisc.ac.uk" },
};
