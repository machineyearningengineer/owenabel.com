# Repository instructions

Don't use Python for edits; use editing tools and JavaScript tooling.

The live portfolio runs entirely on **Cloudflare Workers Static Assets**,
Worker `owenabel-com`, custom domains `owenabel.com` and `www.owenabel.com`.
The former Pages project was retired after live verification on 2026-09-30.
Preserve static Astro rendering, file-format routes, canonical metadata,
generated redirects, root 404.html, sitemap, CV and OG assets. No SSR,
application Worker entrypoint, binding or secret is required. Keep assets-first
routing and runWorkerFirst false. Compatibility date 2026-05-12 and empty flags
carry forward the verified former Pages settings.

Use Node.js >=22.18 and pnpm@11.17.0. Pin direct dependencies and commit the
root lockfile. The workers workspace packages Astro output with cf's compatible
Vite 2 beta plugin and Vite 8. Its lockfile symlink references the root lockfile
for cf's package-manager detection. Keep the explicit native install allowlist.

Run pnpm run build, test:deploy and test:routing after hosting changes.
The build generates OG assets, checks formatting/lint/types, builds Astro,
generates redirects, packages with cf/Vite and validates unchanged static files.
Use cf project commands in workers/, not automatic configuration at repo root:
Astro auto-configuration introduces a server adapter. dev is Astro authoring;
dev:workers is Vite development; preview:workers tests the production asset
runtime. Development redirects can differ from production. No old Wrangler
config exists for cf migrate to convert; do not fabricate one.

Discover commands with cf cli search using anonymous action/resource queries.
cf search is a product namespace. Inspect discovered help and cf schema,
including the HTTP method, before API calls. Project commands lack API schemas.
Use real dry runs before writes. Resolve generated TODOs/warnings before builds.

Cloudflare MCP defaults are docs-only at https://docs.mcp.cloudflare.com/mcp,
in .codex/config.toml and .mcp.json. Do not add operational MCP by default.

Keep routine reads separate from writes. The ambient CLOUDFLARE_API_TOKEN
failed Worker reads during cutover, while the saved default read profile worked.
The cf:project script deliberately removes that override and selects default.
cf auth whoami reports credential source; never print tokens. Dotenv can also
override profiles: keep credentials out of .env and .dev.vars files.

The deployment wrapper strips read/write/global-key variables from builds and
dry runs. Writes require either a distinct CLOUDFLARE_WORKERS_WRITE_TOKEN or
an explicit named operational --profile, plus CLOUDFLARE_ACCOUNT_ID. Only the
actual deploy child gets write credentials/profile selection. Default profile
is refused for writes. personal-deploy is the separately authorized operational
profile used for this migration; never bind it as the ambient/default profile.

Deployments, DNS/domain changes, setting changes, provisioning, secret uploads
and deletions require explicit authorization for the operation. The migration
was authorized; that is not blanket permission for future production changes.
--dry-run is safe and invokes cf's real no-request prebuilt deployment preview.
Default --execute targets the separate owenabel-com-preview workers.dev Worker.
--execute --cutover updates production Worker and both custom domains. --bridge
is a recovery/transition mode that applies temporary fetch routes; do not use it
for normal deployments or alongside --cutover. Production has no bridge routes.

Preserve the existing WWW-to-apex edge rule and the portfolio_force_https edge
rule (reviewable source: workers/https-redirect.rule.json). The latter replaces
Pages' automatic HTTP redirect and applies only to the two portfolio hosts.
Workers asset \_redirects does not support hostname redirects. Do not change
unrelated zones or mail DNS as part of a portfolio deployment.

Raw migration/rollback metadata is in ignored .cloudflare/audit. The Pages
project/history no longer exists; rollback should use Workers versions and the
preserved source/asset build. Review docs/cloudflare-migration.md for deployment
IDs, verification and limitations; docs/cloudflare-audit.md contains the dated
cross-account audit, whose unrelated findings remain unresolved.

Run `pnpm run check:redirects` after authorized hosting/redirect changes. It is
a read-only live check of portfolio URLs, covering both schemes/hosts, legacy
paths, assets, queries and 404s; it rejects loops or chains over three redirects.
Keep redirect rules one-way toward HTTPS, apex and extensionless page paths.
