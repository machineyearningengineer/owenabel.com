type RelationText = {
  text: string;
  key?: string;
};

type WorkStream = {
  label: string;
  key: string;
  body: string;
};

export type CaseStudy = {
  label: string;
  href: string;
  summary: string;
  exhibit: { src: string; caption: string };
};

export type WorkItem = {
  year: string;
  name: string;
  featuredName?: string;
  href: string;
  detail: string;
  featuredDetail?: string;
  tension: string | RelationText[];
  owned: string;
  streams?: WorkStream[];
  signal: string | RelationText[];
  signalLabel?: string;
  links: Array<{
    label: string;
    href: string;
    key?: string;
  }>;
  caseNotes: CaseStudy[];
  role: string;
  stack: string;
  exhibit: { src: string; alt: string };
};

export const work: WorkItem[] = [
  {
    year: "2025–26",
    name: "Fête Finder",
    href: "https://fete.outofofficecollective.co.uk",
    detail:
      "Search, maps, and saved routes that help people turn the Fête de la Musique programme into a night out.",
    featuredDetail:
      "Event discovery and route planning, with 54,295 page views recorded in June 2026.",
    tension:
      "People need to find events by place, time, and taste, then make a plan they can share and return to.",
    owned:
      "Discovery, planning, identity, submissions, ticket exchange, partner operations, data workflows, and the seasonal lifecycle.",
    signalLabel: "Recorded activity",
    signal: "The June 2026 recap records 54,295 page views and 10,270 outbound clicks.",
    links: [
      {
        label: "fete.outofofficecollective.co.uk",
        href: "https://fete.outofofficecollective.co.uk",
      },
    ],
    caseNotes: [
      {
        label: "Fête Finder",
        href: "/work/fete-finder",
        summary:
          "Fête de la Musique fills Paris with free music for one night, and Fête Finder helps people find their night, plan a route and keep it when the signal drops. The June 2026 recap counted 54,295 page views.",
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
    tension:
      "Hosting means thinking about the whole night: how people get in, what brings them together, and how they find the photos afterwards.",
    owned:
      "Event pages, ticketing and check-in, attendee tools, multiplayer games, event scoring, Pitch Night, galleries, writing, and private transfers.",
    signal:
      "Guests can find event information and photos in one place; hosts have tools for admission, participation, and follow-up.",
    links: [{ label: "milkandhenny.com", href: "https://milkandhenny.com" }],
    caseNotes: [
      {
        label: "Milk & Henny",
        href: "/work/milk-and-henny",
        summary:
          "One site runs the whole night: the ticket, the door, games on the TV with phones as controllers, and the photos afterwards. I host the parties, so I built it not to break when the night gets messy.",
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
    tension:
      "A provider claim, a client review, and a similar-looking image tell people different things. Search needs to make those differences visible.",
    owned:
      "Product architecture, search and evidence semantics, provider and review workflows, media and AI pipelines, generated API contracts, and release operations.",
    signal:
      "Results distinguish provider claims, reviews, and media evidence so people can see the basis for a recommendation.",
    links: [{ label: "receipts.beauty", href: "https://receipts.beauty" }],
    caseNotes: [
      {
        label: "Receipts",
        href: "/work/receipts",
        summary:
          "Show Receipts a hairstyle, keep the details you care about, like the cornrows or the colour, and it finds stylists whose real work matches. Every result says why it appeared.",
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
    tension: [
      {
        text: "Researchers need to find the policy or agreement relevant to their journal",
        key: "open-policy-finder",
      },
      { text: "; " },
      {
        text: "content teams need to update the main website and check changes before release",
        key: "digital-experience",
      },
      { text: "." },
    ],
    owned:
      "Led Open Policy Finder data and search work; later maintained the main site's publishing system and led its serverless AWS migration with the Digital Experience Team.",
    streams: [
      {
        label: "Open Policy Finder · Sherpa Team",
        key: "open-policy-finder",
        body: "Built search and help pages for policy, journal, and agreement discovery. Led data work with a feedback loop to data stewards. Retired Elasticsearch when PostgreSQL met the product's scale without a separate search synchronisation layer.",
      },
      {
        label: "Jisc website · Digital Experience Team",
        key: "digital-experience",
        body: "Maintained the Wagtail and Next.js publishing system. After scaling and downtime issues, led a move of the main site to serverless AWS ECS Fargate, and helped build Terraform-managed preview environments and release checks.",
      },
    ],
    signal: [
      {
        text: "Search changes and steward feedback connect source data to policy discovery",
        key: "open-policy-finder",
      },
      { text: ", while " },
      {
        text: "preview environments and release checks help the team inspect website changes",
        key: "digital-experience",
      },
      { text: "." },
    ],
    links: [
      {
        label: "openpolicyfinder.jisc.ac.uk",
        href: "https://openpolicyfinder.jisc.ac.uk",
        key: "open-policy-finder",
      },
      { label: "jisc.ac.uk", href: "https://www.jisc.ac.uk", key: "digital-experience" },
    ],
    caseNotes: [
      {
        label: "Jisc: Open Policy Finder and jisc.ac.uk",
        href: "/work/jisc",
        summary:
          "At Jisc I worked on two public services: Open Policy Finder, where researchers check publishing policies, and the main jisc.ac.uk website. I led the first's move from Elasticsearch to PostgreSQL, and the second's move to AWS Fargate after daily outages.",
        exhibit: {
          src: "/exhibits/opf-home.webp",
          caption: "The Open Policy Finder home page and journal search.",
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

export const getCaseNotes = (item: WorkItem) => item.caseNotes;

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
 * The nine case studies became one story page per project in November 2026.
 * Each old URL points at the chapter that now tells its part; the build turns
 * this into 301s (scripts/generate-redirects.mjs) and <Cite> resolves it.
 */
export const legacyCaseStudies: Record<string, string> = {
  "/work/fete-finder-discovery": "/work/fete-finder#how-it-works",
  "/work/fete-finder-operations": "/work/fete-finder#under-the-hood",
  "/work/milk-and-henny-operations": "/work/milk-and-henny#how-it-works",
  "/work/milk-and-henny-games": "/work/milk-and-henny#live-rooms",
  "/work/milk-and-henny-media": "/work/milk-and-henny#photos",
  "/work/receipts-discovery": "/work/receipts#how-it-works",
  "/work/receipts-platform": "/work/receipts#under-the-hood",
  "/work/open-policy-finder": "/work/jisc#open-policy-finder",
  "/work/jisc-website": "/work/jisc#jisc-website",
};

/** Resolves a case-study path, or a legacy one, to its note and the exact link to use. */
export const resolveCaseStudy = (href: string) => {
  const target = legacyCaseStudies[href] ?? href;
  const path = target.split("#")[0];
  const note = work.flatMap((item) => item.caseNotes).find((caseNote) => caseNote.href === path);
  return note ? { note, href: target } : undefined;
};

export const getCaseStudy = (href: string) => resolveCaseStudy(href)?.note;

export const getRelatedCaseStudies = (href: string) => {
  const parent = work.find((item) => item.caseNotes.some((caseNote) => caseNote.href === href));

  return parent?.caseNotes.filter((caseNote) => caseNote.href !== href) ?? [];
};
