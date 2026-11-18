# Cloudflare Workers migration

Completed on 2026-09-30 with the user's explicit authorization to migrate the
entire deployment. **Production is entirely on Workers Static Assets.** Both
portfolio domains are attached to the Worker. The former `owenabel-com` Pages
project was deleted after successful live checks; cf confirms it returns 404.

## Live deployment

- Production: https://owenabel.com, WWW redirects to apex.
- Cloudflare account: the personal account (`Owen Personal`). On 2026-11-18 the zone, both Workers, the redirect rules and the bot settings moved there from the Receipts account; the old zone and Workers were deleted. DNSSEC is off.
- Production Worker: `owenabel-com`, https://owenabel-com.owen-personal.workers.dev.
- Preview Worker: `owenabel-com-preview`, https://owenabel-com-preview.owen-personal.workers.dev.
- Final production version: `91dcca05-083e-4193-9613-411db12ce7d6`.
- Custom-domain DNS: Workers-managed, proxied AAAA `100::` records; old Pages CNAMEs removed.
- Edge redirects: existing WWW-to-apex 301 preserved; hostname-specific HTTP-to-HTTPS 301 added with path/query preservation. Source: `workers/https-redirect.rule.json`.
- Final triggers: both custom domains and workers.dev; temporary fetch routes removed.

## Inventory and preserved settings

| Area         | Result                                                                                                                                                                                         |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Astro        | Pinned 7.0.7, static output, file-format HTML, trailingSlash never, sitemap and canonical https://owenabel.com preserved                                                                       |
| Assets       | 45 built files packaged byte for byte; 14 HTML pages including custom 404, CV, OG images, sitemap. `_redirects` is a parsed control file; 44 public files uploaded                             |
| Runtime      | No Pages variables/bindings/functions existed. No application entrypoint, SSR, bindings, secrets or schedules added. Verified original compatibility date 2026-05-12 and empty flags preserved |
| Routing      | cf inspected deployed asset config: drop-trailing-slash, 404-page, run_worker_first false, base_path /                                                                                         |
| Dependencies | Exact pins: cf 1.0.0-beta.5, Vite 8.1.4, Cloudflare Vite plugin 2.0.0-beta.sha-ad79608dd. Wrangler removed after successful Workers builds                                                     |
| Scripts      | Astro authoring retained; cf/Vite packaging, production preview, guarded deployment wrapper, credential and routing checks                                                                     |
| Types        | Astro check and tsgo validate typed config. cf generates ignored workers/.cloudflare/types/index.d.ts; no application Env bindings need importing                                              |
| CI           | No build/deployment workflow existed; Dependabot remains. No unattended production workflow introduced                                                                                         |
| Docker       | No Dockerfile/container build existed; none added                                                                                                                                              |
| MCP          | Project Codex TOML and MCP JSON contain only Cloudflare documentation MCP                                                                                                                      |
| Docs         | README, AGENTS.md, migration report and dated audit updated                                                                                                                                    |

`cf migrate --dry-run` reports no original Wrangler config and exits 1. This was
configless Pages: no converter input, fabricated config or required TODO.
cf beta.5 cannot upload directories to legacy Pages; the new Workers target
removes that limitation. No unresolved migration/build warning remains.

## Build and deployment commands

```sh
pnpm install --frozen-lockfile
pnpm run build
pnpm run test:deploy
pnpm run test:routing
pnpm run preview:workers
pnpm run cf:project
pnpm run deploy:cf --dry-run --cutover
```

Astro renders to intermediate dist/. The dedicated workers workspace uses
Vite publicDir ../dist and typed cloudflare.config.ts to emit the Build Output
Specification at workers/.cloudflare/output/v0/. cf deploy uses --prebuilt.
Running cf build at repo root bypasses package build hooks and risks Astro's
automatic server-adapter setup; always use the root pipeline.

The cf-compatible Vite 2 beta has no Wrangler dependency. The workers lockfile
symlink points to the single root lockfile, resolving cf's workspace detection
warning. Native install scripts are explicitly allowed for esbuild, sharp,
workerd. The pinned runtime supports the preserved compatibility date.

Explicit redirects preserve Pages' trailing-slash and directory-index 301s and
HTML 308s. Vite development uses temporary redirects; production preview tests
the built Cloudflare asset runtime.

Authorized preview deployment:

```sh
pnpm run deploy:cf --execute --profile personal-deploy
```

Authorized production deployment:

```sh
pnpm run deploy:cf --execute --cutover --profile personal-deploy
```

Alternatively provide a distinct CLOUDFLARE_WORKERS_WRITE_TOKEN and account ID
and omit --profile. Default mode targets a separate preview Worker, preventing
preview deployments from altering production domains. --bridge exists only for
explicitly authorized transition/recovery operations, not normal deployment.

## Authentication and command verification

Discover through cf cli search with anonymous queries, then help and schema.
Schemas identify HTTP methods; handwritten project commands have no API schema.
Real cf build/deploy/trigger dry runs preceded the migration operations.

The ambient CLOUDFLARE_API_TOKEN override rejected new Worker deployment/version
reads. Removing it and explicitly selecting the saved default read profile
resolved both APIs. cf:project encodes that working read path. Don't reuse or
silently widen the ambient token. cf auth whoami verifies identity/source;
identity alone is not proof of effective API access.

A separate personal-deploy OAuth profile, limited to the personal account, is
used for deploys. (The original migration used an equivalent profile on the
former account.)
It is selected explicitly, never bound as the default or ambient profile. The
initial preview used a pre-existing separate operational profile. No token is
stored in this repository or printed. The wrapper rejects dotenv credential
assignments, removes credentials from build/dry-run children, rejects default
profile for writes and passes explicit write access only to the deploy child.
Guard tests use dummy tokens and intercepted pnpm, never a real network upload.

cf GET inspections now verify the active deployment/version, preserved runtime
date, asset routing, certificate pack, Pages absence, DNS ownership and redirects.
The version API works with fresh read-profile credentials; its earlier 403 was
caused by the ambient override. Discovery/help/schema also validated all domain,
DNS and Pages retirement commands before execution.

## Cutover and verification

The existing Pages project, deployment, domain attachments, DNS and redirect
rules were snapshotted under ignored .cloudflare/audit before writes. Remote
Pages had no environment variables, bindings or application code; its date was
2026-05-12, with no compatibility flags. Portfolio mail/verification records
were preserved.

A live workers.dev preview passed all-page, redirect, 404 and asset checks.
Production was first served through temporary Worker fetch routes over the old
DNS. A scoped edge HTTPS rule replaced Pages' automatic redirect. Pages domain
attachments were removed; external DNS records conflicted with custom-domain
creation, so those were removed and cf attached Workers custom domains. The
site continued serving through the bridge routes during the staged transition.
The final cf trigger deployment removed both temporary routes. Active universal
certificate covers apex and wildcard; HTTPS fetches validated certificates.

Production passed 61 live assertions: every page matches the build, canonical
301/308 redirects preserve query strings, root/nested custom 404s have HTTP 404,
PDF/images/sitemap/robots match the artifacts, HTTP upgrades to HTTPS, and WWW
redirects to apex. Frozen install, format, type-aware lint, Astro check, tsgo,
static and cf/Vite builds, configuration/file validation, routing tests and
credential/profile/dotenv guards pass. Workers version metadata confirms the
final asset settings. The old Pages project was then retired and cf verified
404 Project not found; production was rechecked afterward.

## Rollback and limitations

Use Workers deployment/version rollback or redeploy preserved source/build
artifacts. The retired Pages project and its deployment history cannot be used
as a live rollback target; recreating Pages would be a separate migration.
Raw pre-cutover metadata and operation logs remain locally in ignored
.cloudflare/audit/, without credentials.

Static asset requests remain free/unlimited; no application Worker execution,
paid Workers Cache, extra binding or paid subscription was introduced. cf and
its compatible Vite plugin remain pinned betas. The cross-account audit's
unrelated TLS/email/DNSSEC findings and denied security reads were not changed
by this portfolio migration; they are documented separately. New deployments
and changes still need explicit authorization.

## Official references

- [Wrangler to cf migration](https://developers.cloudflare.com/cf/wrangler/migrate/)
- [cf project workflows](https://developers.cloudflare.com/cf/projects/)
- [Typed configuration](https://developers.cloudflare.com/cf/projects/cloudflare-config/)
- [Pages to Workers](https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/)
- [Asset redirects](https://developers.cloudflare.com/workers/static-assets/redirects/)
- [Custom domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)
- [Static asset billing](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/)
- [cf authentication](https://developers.cloudflare.com/cf/get-started/)

## Redirect loop review

After cutover, `pnpm run check:redirects` checked 704 live URL variants across
HTTP/HTTPS and apex/WWW: every built page, legacy HTML/directory/slash form,
asset, internal link and missing-route case, with and without complex queries.
No loops occurred; all requests reached the expected HTTPS apex destination
with query strings preserved. The maximum chain is three redirects for an
HTTP WWW legacy path; canonical HTTPS links resolve directly. The script
fails on repeated URLs, more than three redirects, incorrect final destinations,
query loss, Refresh response headers or HTML meta-refresh redirects.

The live edge rules only upgrade HTTP to HTTPS and WWW to apex; static redirects
only remove legacy path forms. Full SSL is enabled, with no origin downgrade or
application runtime redirect. No production rule needed changing for this review.
Unrelated legacy Page Rules were not fully readable during the earlier audit;
the live checks verify the effective behavior of the tested portfolio URLs.
