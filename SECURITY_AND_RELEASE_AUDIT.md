# TACT Security and Release Audit

Last verified: 2026-08-01

Theme version: 1.4.5

This is the release boundary for the Shopify theme in `shopify-theme/` and the
Next.js presentation build in `app/`. It records what was checked, what was
fixed, and which responsibilities remain with Shopify or installed apps.

## Release result

- No tracked API keys, access tokens, private keys or Shopify credentials were
  found by the repository secret-pattern scan.
- `pnpm audit --prod --audit-level high` reports no known production
  dependency vulnerabilities.
- Shopify Theme Check reports zero offences across 71 checked theme files.
- The contract validator accepts all 28 JSON templates and section groups.
- The Next.js build type-checks and generates all 82 routes.
- Desktop and mobile storefront checks completed without JavaScript page errors
  on the homepage, product page, cart drawer, dark mode and order-tracking
  template.
- The uploaded target is an unpublished Shopify draft. This audit does not
  authorize publishing it over the live theme.

## Security changes

### Rich content

Product descriptions and policy HTML in the Next.js build pass through
`app/lib/sanitizeRichHtml.ts` before React renders them. The allowlist excludes
scripts, event handlers, embedded objects, inline styles and unsafe URL
schemes. External links receive `noopener noreferrer`.

Shopify product and policy content continues to be rendered by Liquid, where
Shopify owns the content model and output boundary.

### Browser storage

- Cart and wishlist values are parsed as untrusted input.
- Stored arrays, string lengths, product handles, item counts and quantities
  are capped before use.
- Wishlist keys for authenticated Shopify customers use a SHA-256 derivative
  instead of exposing the raw Shopify customer ID in local storage.
- The Vercel preview hashes its mock member identifier and removes the legacy
  raw phone-number key. This preview login is not production authentication.

### DOM and Ajax

- Cart and wishlist drawers build nodes with `textContent` and validated URLs;
  they do not inject server JSON with `innerHTML`.
- Shopify Ajax calls use same-origin locale-aware paths, JSON response checks,
  request timeouts and controlled error states.
- No `eval`, `new Function`, `document.write`, `javascript:` URLs or direct
  `innerHTML` assignment remains in application or theme browser code.

### Response headers

The Next.js preview now emits a restrictive Content Security Policy plus
permissions, referrer, MIME-sniffing and framing protections. Any future
third-party script must be reviewed and deliberately added to the policy.

Shopify controls the production storefront response headers. Advertising and
analytics integrations should use Shopify Customer Events, an official app or
an approved custom pixel instead of pasting secrets into Liquid.

## UI and commerce parity

`editorial-system.css` is loaded after the legacy foundation and is the single
final layer for new design decisions. It restores the stronger Vercel visual
language without replacing Shopify's native commerce data:

- transparent hero header with a semantic frosted state after scroll;
- full-width editorial hero and responsive desktop/mobile media handling;
- one horizontal category deck instead of stacked category blocks;
- tactile product hover, touch reveal and quick-add states;
- compact product typography, size controls, offers and purchase hierarchy;
- compact review rail on phones;
- semantic dark mode that changes surfaces and text without inverting product
  imagery;
- reduced-motion behavior for visitors who request it;
- compact mobile navigation with no duplicate profile action.

Products, variants, inventory, prices, customers, orders and checkout remain
owned by Shopify Admin. The theme reads that data; it does not create or clone
catalog records.

## Operational trust boundaries

The following cannot be secured by theme code alone:

- Shopify staff permissions and two-factor authentication;
- product, inventory, customer and order permissions;
- Ekwik or another express-checkout app configuration;
- Judge.me, KiwiPass and other app embeds after a theme switch;
- Meta Pixel access, consent rules and event configuration;
- abandoned-checkout WhatsApp automation and its data-processing consent;
- domain, DNS and storefront password settings.

Grant the client Shopify staff roles for Products, Inventory, Orders, Customers,
Content and Themes as needed. Do not share owner credentials or place app
secrets in theme settings.

## Required release commands

```powershell
pnpm install --frozen-lockfile
pnpm audit --prod --audit-level high
pnpm typecheck
pnpm build
pnpm theme:check
powershell -ExecutionPolicy Bypass -File scripts/validate-shopify-theme.ps1 -ThemePath shopify-theme
pnpm theme:package
```

The package script rejects archives missing the layout, design-system CSS,
theme JavaScript, product template, 404 template or order-tracking contract.
After packaging, record the ZIP SHA-256 digest before upload.

## Browser release checklist

Test both light and dark mode at 390 x 844 and 1440 x 900:

1. hero image/video, heading contrast, arrows and autoplay;
2. category deck horizontal scrolling;
3. product-card hover, touch reveal, wishlist and quick add;
4. product gallery, variant selection, stock state, add to bag and buy now;
5. cart quantity, removal, upsell and checkout handoff;
6. `/search?q=order&view=track-order`;
7. privacy, FAQ, shipping, returns and contact links;
8. customer login and account links;
9. mobile dock expansion/collapse and safe-area spacing;
10. console errors, failed requests and broken media.

If an integration needs a new external origin, update the CSP intentionally and
repeat the full build and browser checks.
