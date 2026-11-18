# Cloudflare settings audit

Repository follow-up: production is now entirely Workers Static Assets. Both
portfolio domains use Workers-managed DNS; Pages was retired after live checks
on 2026-09-30. A scoped HTTP-to-HTTPS edge redirect preserves the behavior formerly
provided by Pages, and the existing WWW redirect is unchanged. Unrelated findings
below remain a historical read-only audit; see [the completed migration report](cloudflare-migration.md).

Read-only audit on 30 September 2026 with pinned `cf@1.0.0-beta.5`.
No settings, tokens, DNS records, projects, deployments, or production resources
were changed. This report distinguishes observed behavior from recommendations
and inaccessible configuration. It cannot certify every Cloudflare setting.

## Coverage

The current identity exposes one account and three active, unpaused full zones:
`owenabel.com`, `milkandhenny.com`, and `receipts.beauty`. Checked zone DNS, DNSSEC,
24 individual zone settings, ruleset inventories, accessible cache rule details,
email routing status, account details, Worker search, and 11 R2 buckets' public
access/custom domains/CORS. Commands were discovered through `cf cli search` and
the local schema catalog, and gated on a GET schema before network execution.
Raw results are in ignored `.cloudflare/audit/`, separate from committed docs.

Representative repeatable reads:

```sh
pnpm run cf:auth
pnpm run cf:project
pnpm exec cf zones list --per-page 50
pnpm exec cf dns records list --zone owenabel.com --per-page 5000
pnpm exec cf dns dnssec get --zone owenabel.com
pnpm exec cf zones settings get ssl --zone owenabel.com
pnpm exec cf zones settings get min_tls_version --zone owenabel.com
pnpm exec cf rulesets account-rulesets list --zone owenabel.com
pnpm exec cf r2 buckets list
```

Some generated commands take option flags where others take positional names;
inspect help rather than extrapolating. In particular, `cf accounts get` takes no
account positional, and `cf pages projects domains list` uses `--project-name`.
Initial argument errors on those two checks were corrected and retried.

## Zone findings

| Observed zone setting         | owenabel.com | milkandhenny.com | receipts.beauty                                 |
| ----------------------------- | ------------ | ---------------- | ----------------------------------------------- |
| SSL mode                      | Full         | Full             | Full (strict)                                   |
| Minimum TLS                   | 1.0          | 1.0              | 1.2                                             |
| TLS 1.3                       | On           | On               | On                                              |
| Always Use HTTPS              | Off          | Off              | On                                              |
| Zone HSTS                     | Disabled     | Disabled         | Enabled, 1 year, include subdomains, no preload |
| DNSSEC                        | Disabled     | Disabled         | Active                                          |
| Development mode              | Off          | Off              | Off                                             |
| Brotli / HTTP2 / HTTP3 / IPv6 | On           | On               | On                                              |
| Rocket Loader                 | Off          | Off              | Off                                             |
| Browser cache TTL setting     | 4 hours      | 4 hours          | Respect origin (0)                              |

These are zone settings, not a claim that every hostname or managed product
uses them. In particular, Cloudflare documents that
[minimum TLS cannot be configured for Pages hostnames](https://developers.cloudflare.com/ssl/edge-certificates/additional-options/minimum-tls/).
The Pages portfolio's effective TLS policy cannot be inferred from its zone's
`1.0` setting alone. The R2 public custom domains each independently report a
minimum TLS of 1.2 and active ownership/SSL.

### Portfolio: correct observed routing, remaining hardening gaps

- Apex and `www` are proxied CNAMEs to `owenabel-com.pages.dev`, matching the
  repository's target; automatic TTL and apex CNAME flattening are appropriate.
- Live GETs confirm HTTP-to-HTTPS redirects for both hosts, `www` to apex on
  `/work`, `/work/` and `/work/index.html` to `/work`, `/work` returning 200,
  and an unknown path returning a real 404. All tested HTTPS connections pass
  the client's certificate validation.
- `/work` sends `public, max-age=0, must-revalidate`; the missing page sends
  `no-store`. No portfolio cache rules appear in the readable ruleset inventory.
  This supports the existing static Pages behavior. Avoid adding blanket cache
  overrides: [Pages advises against custom caching](https://developers.cloudflare.com/pages/configuration/serving-pages/)
  because it can leave old content after deployments.
- HTTPS redirects already work although the zone switch is off. A dynamic
  redirect ruleset exists; its details are permission-blocked, so the exact
  source of all redirects is unverified. Do not label the off switch alone as
  broken HTTPS enforcement.
- HSTS is absent on the tested HTTPS response. Consider a reviewed, gradual
  HSTS rollout after verifying all covered hosts; do not blindly enable preload
  or `includeSubDomains`.
- DNSSEC is disabled. Enabling it requires coordination with the registrar and
  publication of the DS record; the
  [official DNSSEC procedure](https://developers.cloudflare.com/dns/dnssec/)
  describes both sides. That operation was not performed.
- DNS has a Google Workspace MX but no observed apex SPF, Google DKIM, or DMARC
  TXT records. If the domain sends mail, confirm the real senders and selector
  with the mail administrator before publishing SPF/DKIM/DMARC. MX alone does
  not establish an outbound email policy.

### Other zones

`milkandhenny.com` uses Railway origins, and the tested HTTPS homepage returns
200 with a one-year HSTS header. HTTP apex and `www` both redirect to HTTPS even
though the zone switch is off. Its origin-provided HSTS is effective on the
tested page despite the disabled Cloudflare HSTS setting. Review minimum TLS 1.0
for those web origins and prefer Full (strict) once their origin certificates
are verified. [Full](https://developers.cloudflare.com/ssl/origin-configuration/ssl-modes/full/)
does not provide strict origin certificate validation; it is not equivalent to
an unencrypted connection. DNSSEC is disabled. The MX/SPF setup uses Google,
but apex Google DKIM and DMARC records were not observed; Cloudflare email-sending
subdomains have DKIM, SPF, and reject DMARC policies. Do not confuse subdomain
policies with apex coverage. Existing cache rules bypass `/sw.js` and respect
origin behavior for feed/sitemap discovery documents.

`receipts.beauty` already reports Full (strict), minimum TLS 1.2, TLS 1.3, active
DNSSEC, HTTPS enforcement, and one-year HSTS. Live GETs confirm a working HTTPS
homepage and HTTP redirect. Google MX/SPF/DKIM and a monitoring DMARC policy
(`p=none`) are present; its DNS comment explicitly says to review aggregate
reports before increasing enforcement. Accessible cache rules respect origin
headers for hashed assets and public R2 media, and exclude general application
HTML. These observations support the current settings, but custom firewall
details and the full application authorization behavior remain unverified.

## R2 and account resources

All 11 discovered buckets have their managed public `r2.dev` domain disabled.
Only the two public media buckets have enabled custom domains, both with active
SSL/ownership and minimum TLS 1.2. Buckets used for private media, backups, state,
and private packets have no public custom-domain exposure in the inspected
configuration. Accessible CORS policies do not themselves grant public access;
seven buckets return the expected 404 for an absent CORS policy. No object
contents were downloaded.

This checks bucket public exposure, not all possible S3 credentials, signed
URLs, Worker-mediated access, retention, locks, or application authorization.
DNS shows a managed Worker origin for private media, so a zero-result Worker
search must not be read as proof that there are no legacy Workers. cf's current
Worker search returned no matching inventory; legacy Worker settings/bindings
were not fully enumerable with this interface and identity.

The account detail read succeeded. The account does not globally enforce
two-factor authentication (`enforce_twofactor: false`); this does not reveal
whether individual users have MFA. Review account membership/MFA policy with
the account owner rather than changing it during this audit.

## Permission and verification gaps

Authentication is valid with both the current environment override and the saved
cf OAuth login when the shell override is removed. Neither can read the Pages
project. The credential's reported scopes do not guarantee access to all products
and should not be treated as proof of every effective permission. A dedicated
read token is the intended default; do not supply the operational write token
to make an audit succeed.

Denied or incomplete reads include:

- Pages project/list/custom-domain configuration: 403; remote build settings,
  production branch, compatibility settings, bindings, deployment controls, and
  domain associations cannot be confirmed from the API.
- Certificate pack details and legacy Page Rules on all three zones: 403.
- Dynamic redirect details, rate-limit details, custom firewall details, and Bot
  Management: 403 where probed. Visible managed-rule inventory is not proof
  that every desired rule is enabled or correctly configured.
- Queues: 403; D1 inventory: 401 despite valid general authentication.
- Account membership: 403; individual MFA and role assignments are unverified.
- Other products and settings such as account membership, billing, Zero Trust,
  integrations, S3 keys, origin certificates, and application runtime controls
  require additional suitable read permissions and project-specific intent.

To complete the audit, provide separate read credentials for the denied
products, verify remote Pages settings against the preserved local project,
and review the hardening/email findings with the owners of each zone. No
production fixes were applied under the explicit no-mutation constraint.

## Authorized portfolio migration follow-up

The cutover profile resolved Pages, DNS, redirect and certificate access for this
portfolio. The former Pages date 2026-05-12 and empty flags were carried forward;
there were no variables or bindings. cf now confirms Workers-managed proxied AAAA
records, both custom domains, no temporary fetch routes, active TLS certificate,
assets-first routing and the custom 404. Production passed 61 live checks. The
retired Pages project returns 404. Removing the ambient API token override also
resolved Worker reads through the saved default read profile. No other zone,
mail record, bucket, account setting or security finding was changed.
