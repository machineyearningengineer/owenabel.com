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
        label: "Fête Finder: finding a night out",
        href: "/work/fete-finder-discovery",
        summary:
          "Fête de la Musique fills Paris with free gigs for one night. I built the search, maps and saved routes that turn the programme into a plan: 54,295 page views in June 2026.",
        exhibit: {
          src: "/exhibits/fete-recap.webp",
          caption: "The 2026 recap page, with the route of the night drawn over Paris.",
        },
      },
      {
        label: "Fête Finder: running the programme",
        href: "/work/fete-finder-operations",
        summary:
          "The programme kept changing after launch. I built the tools to edit, review and recover every listing, and a bot that took the ticket exchange into a WhatsApp chat of about 2,000 people.",
        exhibit: {
          src: "/exhibits/fete-archive.webp",
          caption: "The archive of Paris listings that the operations tools keep up to date.",
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
        label: "Milk & Henny: running the night",
        href: "/work/milk-and-henny-operations",
        summary:
          "I host the parties and build the software that runs them. Tickets, check-in at the door, games in the room and the photos afterwards all live in one app.",
        exhibit: {
          src: "/exhibits/milk-event.webp",
          caption: "An event page: details, tickets and, once it sells out, a waitlist.",
        },
      },
      {
        label: "Milk & Henny: games for the room",
        href: "/work/milk-and-henny-games",
        summary:
          "Party games that send people back to each other instead of their phones. Each screen has one job: the board for the room, the answers for the host, a buzzer for the team.",
        exhibit: {
          src: "/exhibits/milk-things.webp",
          caption: "The games and tools index at milkandhenny.com/things.",
        },
      },
      {
        label: "Milk & Henny: keeping the photos",
        href: "/work/milk-and-henny-media",
        summary:
          "It started with “can you send me the photos?” after every party. Now there are public albums to browse, and private transfers that expire for everything else.",
        exhibit: {
          src: "/exhibits/milk-pics.webp",
          caption: "Published albums at milkandhenny.com/pics.",
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
        label: "Open Policy Finder: search and data quality",
        href: "/work/open-policy-finder",
        summary:
          "Researchers type half a journal title and expect the right publishing policy. I built the search, moved it from Elasticsearch onto PostgreSQL, and set up a loop with data stewards to fix the records behind it.",
        exhibit: {
          src: "/exhibits/opf-home.webp",
          caption: "The Open Policy Finder home page and journal search.",
        },
      },
      {
        label: "Jisc website: moving to Fargate",
        href: "/work/jisc-website",
        summary:
          "Jisc’s main website had scaling and downtime problems. I led its move to AWS ECS Fargate and RDS, with Terraform preview environments and release checks so every change is seen before it ships.",
        exhibit: {
          src: "/exhibits/jisc-home.webp",
          caption: "The Jisc home page, served from AWS ECS Fargate since the migration.",
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
        label: "Receipts: search you can check",
        href: "/work/receipts-discovery",
        summary:
          "Search for a beauty provider with words or a photo, and see why each one appears. Every result names its evidence: a portfolio piece, a client review, or only a visual resemblance.",
        exhibit: {
          src: "/exhibits/receipts-photo-search.webp",
          caption: "Searching with a photo: pick a look, then see who has done that work.",
        },
      },
      {
        label: "Receipts: the Go platform",
        href: "/work/receipts-platform",
        summary:
          "An upload can succeed while its processing fails. I built a Go platform where every image has a recorded state, failed jobs retry on a policy, and nothing half-processed goes public.",
        exhibit: {
          src: "/exhibits/receipts-feed.webp",
          caption: "The discovery feed, which only shows media that has finished processing.",
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

export const getCaseStudy = (href: string) =>
  work.flatMap((item) => item.caseNotes).find((caseNote) => caseNote.href === href);

export const getRelatedCaseStudies = (href: string) => {
  const parent = work.find((item) => item.caseNotes.some((caseNote) => caseNote.href === href));

  return parent?.caseNotes.filter((caseNote) => caseNote.href !== href) ?? [];
};
