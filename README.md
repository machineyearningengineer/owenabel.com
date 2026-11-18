# owenabel.com

Personal portfolio site for Owen Abel Amenze, targeting Cloudflare Workers Static Assets.
Live site: https://owenabel.com. The Pages project was retired after successful
Workers deployment and domain cutover on 2026-09-30.

## Stack and setup

Static Astro, TypeScript/tsgo, Oxlint and Oxfmt. A dedicated `workers/` workspace
packages Astro's output with pinned Vite 8 and Cloudflare's cf-compatible Vite 2
beta plugin. No SSR, runtime application code or Wrangler.

Use Node.js >=22.18 and pinned pnpm:

```sh
pnpm install --frozen-lockfile
pnpm run dev
pnpm run build
pnpm run test:deploy
pnpm run test:routing
pnpm run check:redirects
pnpm run preview:workers
```

The build checks formatting, lint and types, generates OG images and canonical
redirects, builds 9 static pages, packages them with cf, and verifies packaged
files byte for byte. Output is `workers/.cloudflare/output/v0/`, not just Astro's
intermediate `dist/`. `preview` previews Astro; `dev:workers` runs cf/Vite against
the latest Astro build. `preview:workers` and routing tests use the built
Cloudflare asset runtime, including production redirects and custom 404s.

Direct dependencies and the single pnpm lockfile are pinned. The workers
lockfile symlink references the root lockfile for cf's package-manager detection.
Native install permissions are explicit in `pnpm-workspace.yaml`. Bun is
unsupported by cf. If Portless routes this repo, its URL is
`https://owenabel.localhost`; `dev` and `dev:raw` both run Astro directly.

## Cloudflare commands and credentials

```sh
pnpm run cf:auth
pnpm run cf:project
pnpm run deploy:cf --dry-run
pnpm run deploy:cf --dry-run --cutover
```

Both previews build and invoke cf's actual `deploy --prebuilt --dry-run`, which
makes no API requests. Default mode targets Worker `owenabel-com-preview` on workers.dev
only. Explicit `cutover` mode targets production Worker `owenabel-com` and both portfolio custom domains. Static
requests remain free and unlimited; this assets-only target needs no paid
Workers subscription. `runWorkerFirst` stays false.

For an explicitly authorized deployment, supply a distinct account-scoped
Workers write token as `CLOUDFLARE_WORKERS_WRITE_TOKEN` and set
`CLOUDFLARE_ACCOUNT_ID`. `pnpm run deploy:cf --execute` publishes the Worker only;
`--execute --cutover` updates the production Worker and its custom domains.
Both modes were deployed and verified during the authorized migration. An explicit
operational profile can replace the token: `pnpm run deploy:cf --execute --cutover
--profile personal-deploy`. Default profile is refused for writes.

Use a dedicated scoped read token in ambient `CLOUDFLARE_API_TOKEN` for audits.
It overrides cf profiles. A valid identity does not prove product permissions.
To inspect saved cf identity, unset the shell token; dotenv may also override it.
Keep credentials out of dotenv files: the wrapper rejects Cloudflare credential
assignments there, strips credentials from build/dry-run children, and passes
the separate write token only to the deploy child. It accepts only an explicit named operational
profile or separate token for writes. Never commit or log secrets.

Only Cloudflare documentation MCP is configured by default in
`.codex/config.toml` and `.mcp.json`. Reopen the agent session to load it;
host-level connections are separate.

See [migration inventory, verification and cutover checklist](docs/cloudflare-migration.md)
and [dated Cloudflare settings audit](docs/cloudflare-audit.md).
The `cf:project` read command removes the ambient token override and selects the
saved default read profile; that override failed Worker reads during migration.
The separate `personal-deploy` operational profile is used only for authorized writes.

## URLs and hosting

Astro retains static file-format output, extensionless links, sitemap and
canonical metadata. Workers uses `htmlHandling: drop-trailing-slash` and
`notFoundHandling: 404-page`. Generated `_redirects` preserves trailing-slash
and legacy `/page/index.html` redirects (301), and explicit HTML redirects (308).
Unknown paths return the custom 404 with HTTP 404, never the homepage.
Asset filenames, CV and social images are unchanged.

Workers asset redirects do not support hostname redirects. Preserve the zone's
WWW-to-apex and HTTP-to-HTTPS rules during cutover and verify them live. The
original audit had permission gaps; the authorized cutover inspected the Pages
settings and redirects, confirmed Workers-managed DNS and valid TLS, and retired
the old project. The HTTPS edge rule is recorded in `workers/https-redirect.rule.json`.
The static output stays portable to other static hosts.

## Showcasing work on a subdomain

Public work goes on its own subdomain, `<name>.owenabel.com`, never a path on this
site, so each project deploys and fails independently. The `owenabel.com` zone is
on the personal Cloudflare account, and HTTP-to-HTTPS covers every subdomain.

- **A Cloudflare Worker on the personal account:** add
  `domains: ['<name>.owenabel.com']` to its `cloudflare.config.ts`, then run
  `pnpm exec cf workers triggers deploy --profile personal-deploy` with
  `CLOUDFLARE_ACCOUNT_ID` set to the personal account. That attaches the domain
  without uploading a new version; Cloudflare creates the DNS record and certificate.
- **Hosted elsewhere (Railway, Vercel, …):** add a proxied `CNAME <name>` record
  pointing at the host's target, and add the domain in that host's settings.

- **Client previews or anything not ready to be found:** add the host to the zone's
  response-header rule "Keep client previews out of search engines"
  (`http_response_headers_transform`), which sends `X-Robots-Tag: noindex, nofollow`.
  Leave public showcases out of it so they can be indexed.

Current showcases: `nairaandchill.owenabel.com` (NAIRAA & Chill client preview, noindex).

## CV and work content

The CV source and supporting career evidence live in `~/dev/work/resume`. The
portfolio serves a generated copy at `public/owen-abel-amenze-cv.pdf`; it does
not maintain separate CV wording. To refresh it, run `make build-website` in
the resume repository, copy `output/owen-abel-cv-website.pdf` to the public
path here, then run `pnpm run build`. That variant omits the phone number.
The homepage and contact-page CV links include a short content hash query so a
new upload bypasses cached copies on the custom domain; update that query when
replacing the PDF.

Project summaries and story facts are in `src/data/work.ts`: each story's hook,
role, years, team, stage, stack, standout fact, live link and exhibit feed its
hero, the Work page and its share links. Each story has one page in
`src/pages/work/` (`StoryLayout`): hook, problem, a demo journey, what happened,
then "Under the hood". The share block's "Copy markdown" text is generated at
build time from the rendered chapters (`src/lib/story-markdown.ts`). Old
case-study URLs, including `/work/jisc` from before the Jisc story split, are
listed in `legacyCaseStudies` in `src/data/work.ts`, which drives their 301s and
lets `<Cite>` keep accepting them. Journey clips are recorded from the live
products into `public/journeys/<project>/<beat>.{webm,mp4,jpg}` (960px wide,
silent, under about 600 KB each). Share images are generated from
`scripts/generate-og.mjs` during the build. Keep claims aligned with the
attributed records in the resume repository before publishing updates.
