/** One story page in src/pages/work/. Its hero, the Work page and the share block read from here. */
export type CaseStudy = {
  label: string;
  href: string;
  /** The hook: two sentences, shown under the title and on the Work page. */
  summary: string;
  role: string;
  years: string;
  team: { label: "Client" | "Team"; value: string };
  stage: string;
  stack: string[];
  /** One standout fact for the Work page. */
  fact: string;
  live: { label: string; href: string };
  exhibit: { src: string; caption: string };
};

export type WorkItem = {
  year: string;
  name: string;
  featuredName?: string;
  href: string;
  /** Homepage line. */
  detail: string;
  featuredDetail?: string;
  role: string;
  stack: string;
  exhibit: { src: string; alt: string };
  caseNotes: CaseStudy[];
};

export const work: WorkItem[] = [
  {
    year: "2025–26",
    name: "Fête Finder",
    href: "https://fete.outofofficecollective.co.uk",
    detail:
      "Search, maps, and saved routes that help people turn the Fête de la Musique programme into a night out.",
    featuredDetail:
      "Event discovery and route planning: about 10,900 unique visitors and 2,601 sign-ups in June 2026.",
    caseNotes: [
      {
        label: "Fête Finder",
        href: "/work/fete-finder",
        summary:
          "Fête de la Musique fills Paris with free music for one night, and Fête Finder helps people find their night, plan a route and keep it when the signal drops. In June 2026 it had about 10,900 unique visitors, and 2,601 people had signed up.",
        role: "Product Engineer",
        years: "2025–26",
        team: { label: "Client", value: "Out Of Office Collective" },
        stage: "Live, 2026 archive",
        stack: ["Next.js", "Postgres", "MapLibre", "Railway"],
        fact: "About 10,900 unique visitors and 2,601 sign-ups, June 2026",
        live: {
          label: "fete.outofofficecollective.co.uk",
          href: "https://fete.outofofficecollective.co.uk",
        },
        exhibit: {
          src: "/exhibits/fete-recap.webp",
          caption: "The 2026 recap page, with the route of the night drawn over Paris.",
        },
      },
    ],
    role: "Product Engineer",
    stack: "Next.js · MapLibre · Postgres",
    exhibit: {
      src: "/exhibits/fete-recap.webp",
      alt: "Fête Finder 2026 recap page: a paper map of Paris with the route of the night",
    },
  },
  {
    year: "2025–26",
    name: "Milk & Henny",
    featuredDetail:
      "An events platform that brings ticketing, multiplayer games, and photo sharing together for organisers and guests.",
    href: "https://milkandhenny.com",
    detail:
      "An events platform for ticketing, check-in, multiplayer games, and photo sharing, with tools for both guests and event staff.",
    caseNotes: [
      {
        label: "Milk & Henny",
        href: "/work/milk-and-henny",
        summary:
          "One site runs the whole night: the ticket, the door, games on the TV with phones as controllers, and the photos afterwards. I host the parties, so I built it not to break when the night gets messy.",
        role: "Founder, host and engineer",
        years: "2025–26",
        team: { label: "Client", value: "My own parties" },
        stage: "Live",
        stack: ["TanStack Start", "Postgres", "Redis", "Stripe", "Railway"],
        fact: "119 tickets, offline door scanning",
        live: { label: "milkandhenny.com", href: "https://milkandhenny.com" },
        exhibit: {
          src: "/exhibits/milk-event.webp",
          caption: "An event page: details, tickets and, once it sells out, a waitlist.",
        },
      },
    ],
    role: "Founder & Host",
    stack: "TanStack Start · Effect · Postgres · Redis",
    exhibit: {
      src: "/exhibits/milk-pitch.webp",
      alt: "Milk & Henny Pitch Night event page with a ticket button",
    },
  },
  {
    year: "2026",
    name: "Receipts",
    href: "https://receipts.beauty",
    detail:
      "A beauty discovery platform helping people judge providers using reviews, images, and the source of each claim.",
    featuredDetail:
      "A beauty discovery platform combining portfolios, reviews, and visual search to help people find a provider.",
    caseNotes: [
      {
        label: "Receipts",
        href: "/work/receipts",
        summary:
          "Show Receipts a hairstyle, keep the details you care about, like the cornrows or the colour, and it finds stylists whose real work matches. Every result says why it appeared.",
        role: "Lead engineer",
        years: "2026",
        team: { label: "Team", value: "Me, leading coding agents" },
        stage: "Preview access, 100 beta users",
        stack: ["Go", "ConnectRPC", "Postgres", "pgvector", "Voyage"],
        fact: "2,091 labelled eval cases",
        live: { label: "receipts.beauty", href: "https://receipts.beauty" },
        exhibit: {
          src: "/exhibits/receipts-photo-search.webp",
          caption: "Searching with a photo: pick a look, then see who has done that work.",
        },
      },
    ],
    role: "Lead Engineer",
    stack: "Go · ConnectRPC · Postgres · visual search",
    exhibit: {
      src: "/exhibits/receipts-feed.webp",
      alt: "Receipts discovery feed: a mosaic of beauty work with search by photo",
    },
  },
  {
    year: "2024–26",
    name: "Jisc",
    featuredName: "Open Policy Finder at Jisc",
    href: "https://www.jisc.ac.uk",
    detail:
      "Search and data quality for Open Policy Finder, alongside publishing tools and AWS migration work for the main Jisc website.",
    featuredDetail:
      "Helping researchers find publishing policies, and content teams keep the guidance up to date.",
    caseNotes: [
      {
        label: "Open Policy Finder",
        href: "/work/open-policy-finder",
        summary:
          "Researchers use Open Policy Finder to check where they can publish open access, and on what terms. At Jisc I led its data and search work: search moved from Elasticsearch into PostgreSQL, and the help pages moved onto a small CMS the content team runs themselves.",
        role: "Senior Software Developer",
        years: "At Jisc, 2024–26",
        team: { label: "Team", value: "Jisc · Sherpa" },
        stage: "Live service",
        stack: ["Next.js", "React", "PostgreSQL", "Directus"],
        fact: "Data quality above 90%, Elasticsearch retired",
        live: {
          label: "openpolicyfinder.jisc.ac.uk",
          href: "https://openpolicyfinder.jisc.ac.uk",
        },
        exhibit: {
          src: "/exhibits/opf-home.webp",
          caption: "The Open Policy Finder home page and journal search.",
        },
      },
      {
        label: "The Jisc website",
        href: "/work/jisc-website",
        summary:
          "Most people meet Jisc through jisc.ac.uk, and it was going down at least once a day. I led its move to AWS Fargate, then built the Wagtail components, migrations and homepage carousel the content team publishes with.",
        role: "Senior Software Developer",
        years: "At Jisc, 2024–26",
        team: { label: "Team", value: "Jisc · Digital Experience" },
        stage: "Live service",
        stack: ["Wagtail", "Next.js", "ECS Fargate", "RDS", "Terraform", "Playwright"],
        fact: "No downtime after the Fargate move",
        live: { label: "jisc.ac.uk", href: "https://www.jisc.ac.uk" },
        exhibit: {
          src: "/exhibits/jisc-home.webp",
          caption: "The jisc.ac.uk home page: edited in Wagtail, presented by Next.js.",
        },
      },
    ],
    role: "Senior Software Developer",
    stack: "PostgreSQL search · Next.js · AWS Fargate · Terraform",
    exhibit: {
      src: "/exhibits/opf-home.webp",
      alt: "Open Policy Finder home page with journal and publisher search",
    },
  },
];

/** Every story page in reading order; a page's exhibit letter is its place here (A, B, …). */
export const caseStudies = work.flatMap((item) => item.caseNotes);

export const exhibitMark = (href: string) =>
  String.fromCharCode(
    65 +
      Math.max(
        0,
        caseStudies.findIndex((note) => note.href === href),
      ),
  );

export const getFeaturedWork = () =>
  work.map((item) => ({
    year: item.year,
    name: item.featuredName ?? item.name,
    href: item.caseNotes[0]?.href ?? item.href,
    detail: item.featuredDetail ?? item.detail,
    role: item.role,
    stack: item.stack,
    exhibit: item.exhibit,
  }));

/**
 * Old case-study URLs and where they live now; the build turns this into 301s
 * (scripts/generate-redirects.mjs) and <Cite> resolves it. The nine topic
 * pages merged into one story per project in November 2026; the Jisc story
 * then split into Open Policy Finder and the Jisc website.
 */
export const legacyCaseStudies: Record<string, string> = {
  "/work/fete-finder-discovery": "/work/fete-finder#how-it-works",
  "/work/fete-finder-operations": "/work/fete-finder#under-the-hood",
  "/work/milk-and-henny-operations": "/work/milk-and-henny#how-it-works",
  "/work/milk-and-henny-games": "/work/milk-and-henny#games",
  "/work/milk-and-henny-media": "/work/milk-and-henny#photos",
  "/work/receipts-discovery": "/work/receipts#how-it-works",
  "/work/receipts-platform": "/work/receipts#under-the-hood",
  "/work/jisc": "/work/open-policy-finder",
};

/** Resolves a case-study path, or a legacy one, to its note and the exact link to use. */
export const resolveCaseStudy = (href: string) => {
  const target = legacyCaseStudies[href] ?? href;
  const path = target.split("#")[0];
  const note = caseStudies.find((caseNote) => caseNote.href === path);
  return note ? { note, href: target } : undefined;
};

export const getCaseStudy = (href: string) => resolveCaseStudy(href)?.note;

export const getRelatedCaseStudies = (href: string) => {
  const parent = work.find((item) => item.caseNotes.some((caseNote) => caseNote.href === href));

  return parent?.caseNotes.filter((caseNote) => caseNote.href !== href) ?? [];
};
