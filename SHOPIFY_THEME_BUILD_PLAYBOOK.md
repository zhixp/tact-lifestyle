# Shopify Theme Build and Recovery Playbook

Last verified: 2026-08-01

Known-good package: `tact-editorial-catalog-ready-1.4.6.zip`

Source of truth: `shopify-theme/`
Shopify draft used for verification: `157168992421`

This document records the failures encountered while converting the TACT
storefront into a native Shopify Online Store 2.0 theme. It is intended to stop
future theme projects from repeating the same eight-hour debugging cycle.

## The rules that matter most

1. A browser demo is not a Shopify theme. React/Next.js code can be a visual
   reference, but Shopify must receive Liquid, JSON templates, section schemas,
   assets and configuration files in its supported directory structure.
2. The ZIP root must contain `layout`, `templates`, `sections`, `snippets`,
   `assets`, `config` and `locales`. Never put those folders inside another
   `shopify-theme/` folder in the ZIP.
3. `layout/theme.liquid` must exist and must output both
   `{{ content_for_header }}` and `{{ content_for_layout }}`.
4. A JSON template is a contract. Every section type, setting, block type and
   order entry referenced by the template must exist in the corresponding
   section schema.
5. Products, variants, prices, stock, collections, customers and orders belong
   to the Shopify store. A theme ZIP does not create catalog data.
6. Always validate, package, upload as an unpublished draft, and test with real
   store data before publishing.
7. Use a unique versioned ZIP name for every handoff. Do not keep uploading a
   generic `theme.zip` and guessing which build Shopify received.

Official references:

- [Shopify theme architecture](https://shopify.dev/docs/storefronts/themes/architecture)
- [Layouts](https://shopify.dev/docs/storefronts/themes/architecture/layouts)
- [JSON templates](https://shopify.dev/docs/storefronts/themes/architecture/templates/json-templates)
- [Sections](https://shopify.dev/docs/storefronts/themes/architecture/sections)
- [Shopify CLI for themes](https://shopify.dev/docs/storefronts/themes/tools/cli)
- [Theme Check](https://shopify.dev/docs/storefronts/themes/tools/theme-check/index)

## Repository layout

The repository contains two different products:

- `app/` is the Next.js demonstration storefront.
- `shopify-theme/` is the production Shopify theme.

Only `shopify-theme/` is packaged or passed to Shopify CLI. Do not connect the
repository root directly to Shopify's GitHub theme integration because the
repository root is not a theme root.

The production theme root is:

```text
shopify-theme/
├── assets/
├── config/
├── layout/
├── locales/
├── sections/
├── snippets/
└── templates/
```

## What failed, why it failed, and how it was fixed

### 1. “Missing template `layout/theme.liquid`” during ZIP upload

**Symptom**

Shopify rejected the ZIP with:

```text
zip does not contain a valid theme: missing template "layout/theme.liquid"
```

**Root cause**

The archive contained a wrapper folder:

```text
shopify-theme/layout/theme.liquid
```

Shopify expected:

```text
layout/theme.liquid
```

**Fix**

Package the contents of the theme root, never the wrapper directory. This
repository does that deterministically with:

```powershell
pnpm run theme:package
```

The build script includes only Shopify's supported theme directories, then
reopens the archive and rejects it if required files are absent or nested under
a wrapper directory. Shopify CLI is still used for Theme Check, development
preview and draft upload.

### 2. Theme uploaded, but Shopify showed its generic 404 page

**Symptoms**

- The theme editor opened on “404 page”.
- The editor said the page had no sections.
- The storefront showed Shopify's small generic “Not Found” card.
- Clicking Home page sometimes returned to the same screen.

**Root causes encountered**

- The editor was previewing the 404 template, not the home template.
- Earlier JSON templates referenced section IDs, settings or block types that
  did not match the section schemas.
- Stale ZIPs were uploaded after a newer build had been created.
- A bare `.myshopify.com` URL was opened without an unpublished theme preview
  parameter.
- Browser cookies, password protection, or editor iframe behavior could make a
  working draft appear incompatible.

**Fixes**

1. In the editor page selector, explicitly choose **Home page**.
2. Use the draft preview URL:

   ```text
   https://STORE.myshopify.com/?preview_theme_id=THEME_ID
   ```

3. Validate all JSON contracts before packaging.
4. Upload a uniquely versioned archive and verify the version under Theme
   settings.
5. Test in a clean Chrome profile with Shopify cookies allowed.
6. If the store is password protected, test whether the password redirect is
   breaking the editor iframe.

### 3. Header and footer rendered, but homepage sections were missing

**Root cause**

The layout was valid enough to render statically included sections, but the
`templates/index.json` contract was not valid enough for Shopify to ingest all
dynamic sections.

**Fix**

`scripts/validate-shopify-theme.ps1` now checks:

- every section file has parseable schema JSON;
- every JSON template has `sections` and `order`;
- every ordered section ID exists;
- every referenced section type has a matching `.liquid` file;
- section and block IDs are alphanumeric;
- every setting used in a template exists in the section schema;
- select/radio values are allowed;
- range values respect minimum, maximum and step;
- every block type exists in the section schema;
- block order references real blocks;
- JSON templates stay within Shopify's section and block limits;
- `theme.liquid` contains both required content outputs.

This was the turning point that made template failures deterministic instead of
trial and error.

### 4. Raw CSS/font code appeared above the header

**Symptom**

The storefront printed `@font-face` declarations as visible page text.

**Root cause**

Generated font output was placed outside, or escaped from, a valid `<style>`
element during an earlier layout rewrite.

**Fix**

Keep all `font_face` output and CSS custom properties inside one valid style
block in `layout/theme.liquid`:

```liquid
<style>
  {{ settings.body_font | font_face: font_display: 'swap' }}
  {{ settings.heading_font | font_face: font_display: 'swap' }}
  :root {
    /* theme tokens */
  }
</style>
```

Do not concatenate a generated CSS file into Liquid markup without checking
where the opening and closing style tags land.

### 5. Products, categories and pages appeared empty

**Root cause**

The initial theme treated copied demo content as if a ZIP could carry Shopify
resources. It cannot. Product sections render the store's `product`,
`collection`, `collections` and search objects.

**Fix**

- Import products into Shopify Admin separately.
- Set product titles, descriptions, media, prices, variants, sizes and inventory
  in **Products**.
- Create collections in **Products → Collections**.
- Select collections/products in the theme editor, or use the configured
  fallback handles.
- Create Page resources in **Online Store → Pages**, then assign the desired
  template such as `page.privacy`, `page.faq` or `page.track-order`.
- Keep navigation destinations in Shopify menus rather than hardcoded HTML.

The theme now uses native Shopify objects and gracefully falls back to configured
handles for the TACT catalog.

### 6. Privacy or track-order markup existed but the route did not

**Root cause**

Creating `templates/page.privacy.json` does not create a Shopify Page. The
merchant must create the page resource and assign that template. Querying
`/search?view=privacy` was useful as a temporary preview fallback, but it is not
the canonical public URL.

**Fix**

1. Create a page named Privacy Policy.
2. Assign the `page.privacy` template.
3. Create a page named Track Your Order.
4. Assign the `page.track-order` template.
5. Add both pages to the footer menu.
6. Put the real tracking provider URL or app embed into the tracking section
   settings.

The theme also includes a no-page fallback at
`/search?q=order&view=track-order`. Keep the non-empty `q` parameter: Shopify's
search endpoint can return a 503 response when an alternate search template is
requested without a query. The canonical merchant page remains
`/pages/track-your-order`.

### 7. Theme editor said the page was incompatible

**Symptoms**

```text
Page is redirecting to an unsupported URL
Page failed to load due to an error
```

**Possible non-code causes**

- storefront password redirect;
- blocked third-party Shopify cookies;
- browser privacy extensions;
- a stale preview token;
- a URL redirect involving `/404`;
- a third-party app redirecting inside the editor iframe.

**Isolation procedure**

1. Open an untouched Shopify reference theme in the same editor.
2. If the reference theme also fails, fix the store/browser state first.
3. Use Chrome Guest mode with extensions disabled.
4. Allow cookies for `shopify.com` and `myshopify.com`.
5. Test the unpublished theme from its generated preview link.
6. Inspect **Content → Menus → URL redirects** for `/404` redirects.
7. Temporarily disable storefront password protection only if approved.

Do not rebuild the entire theme until an untouched reference theme works in the
same environment.

### 8. Theme looked different from the GitHub demo

**Root cause**

The Next.js demo and Liquid theme had diverged. The demo's local data and React
components were not automatically translated into Shopify sections.

**Fix**

- Treat `shopify-theme/` as the production source of truth.
- Port each approved behavior deliberately into Liquid, CSS and `theme.js`.
- Test against real Shopify products.
- Never assume updating `app/` changes the Shopify theme.

### 9. Header/footer group changes caused fragile ingestion

Some failed iterations mixed direct static sections with section-group JSON in
ways that were not consistently ingested by this store. The stable recovery
version renders:

```liquid
{% section 'announcement-bar' %}
{% section 'header' %}
{{ content_for_layout }}
{% section 'footer' %}
```

This is less flexible than fully dynamic header/footer groups, but it gave a
stable baseline while the store was being recovered. Homepage content remains
reorderable through `templates/index.json`. If section groups are reintroduced,
do it in a separate draft and validate the layout/group contract before
replacing this known-good structure.

### 10. Dark mode inverted imagery or changed only a few elements

**Failed approaches**

- applying CSS `filter: invert(...)` to a large container;
- changing only body/header colors while sections kept inline light colors;
- using one token for both backgrounds and text;
- making buttons inherit black text on a black surface.

**Fix**

The theme uses semantic tokens:

```css
--tact-ink;
--tact-paper;
--tact-surface;
--tact-muted;
--tact-accent;
--tact-button;
--tact-button-text;
--tact-line;
--tact-soft;
--tact-shadow;
```

Dark mode swaps tokens and explicitly maps section-level color variables. Media,
campaign artwork and logos are not inverted. The mode is saved in
`localStorage`, updates `color-scheme` and the browser theme color, and exposes
editable dark action colors in Theme settings.

### 11. Shopify CLI could not resolve the development store

**Symptom**

CLI network calls failed for the `.myshopify.com` host while the browser still
worked.

**Fix used on this Windows machine**

`scripts/shopify-dns-preload.cjs` provides a narrow DNS fallback for the known
development store:

```js
const dns = require("node:dns");
const edgeIp = "23.227.38.65";
const allowedHosts = new Set(["STORE.myshopify.com"]);
const originalLookup = dns.lookup.bind(dns);

dns.lookup = (hostname, options, callback) => {
  if (typeof options === "function") {
    callback = options;
    options = {};
  }
  if (!allowedHosts.has(hostname)) {
    return originalLookup(hostname, options, callback);
  }
  const result = { address: edgeIp, family: 4 };
  return process.nextTick(() =>
    options?.all
      ? callback(null, [result])
      : callback(null, result.address, result.family),
  );
};
```

If the CLI path uses `dns.promises.lookup`, patch that method with the same
allowlist as well. Keep the override restricted to the affected store host.

```powershell
$env:NODE_OPTIONS='--require C:\path\to\scripts\shopify-dns-preload.cjs'
pnpm dlx @shopify/cli@latest theme push `
  --path shopify-theme `
  --store STORE.myshopify.com `
  --theme THEME_ID `
  --nodelete
```

This is a machine-specific emergency workaround, not a general deployment
requirement. Prefer fixing local DNS and use the preload only when name
resolution is demonstrably the problem. Never add arbitrary hosts or tokens to
the preload file.

### 12. `pnpm dlx` failed with `EPERM ... realpath C:\Users\...`

**Root cause**

The CLI process could not access its user-level package cache from the restricted
execution environment.

**Fix**

- the package script no longer downloads or invokes Shopify CLI;
- it creates a deterministic archive from the seven supported theme directories
  and validates the archive before success;
- Theme Check and draft push can use an installed Shopify CLI from a normal
  developer terminal;
- keep the repository and package cache out of over-restrictive synced folders
  when possible.

### 13. Git failed to create `.git/index.lock`

**Symptom**

```text
fatal: Unable to create '.git/index.lock': Permission denied
```

**Likely causes**

- OneDrive holding the repository metadata;
- another Git process;
- a stale lock file;
- restricted write permission on `.git`.

**Recovery**

1. Close editors or Git clients actively using the repository.
2. Confirm no Git process is running.
3. Check whether `.git/index.lock` exists.
4. Delete only the stale `index.lock`, never the whole `.git` directory.
5. If the repository is repeatedly locked by OneDrive, move the working clone to
   a normal local development directory and push from there.

## The known-good build workflow

Run from the repository root:

```powershell
pnpm run theme:check
pnpm run theme:package
```

The package command performs this sequence:

1. resolve `shopify-theme/`;
2. run the custom semantic validator;
3. read theme name/version from `config/settings_schema.json`;
4. create an archive from `assets`, `config`, `layout`, `locales`, `sections`,
   `snippets` and `templates`;
5. open the ZIP and verify required entries;
6. print entry count, file size and SHA-256.

Expected final checks:

```text
Shopify semantic validation passed
Theme Check Summary: no offenses found
Has layout/theme.liquid
Has templates/index.json
No nested shopify-theme/ root
```

Inspect an archive manually:

```powershell
$entries = tar -tf .\theme-name-version.zip
$entries -contains 'layout/theme.liquid'
$entries -contains 'templates/index.json'
$entries | Where-Object { $_ -like 'shopify-theme/*' }
Get-FileHash .\theme-name-version.zip -Algorithm SHA256
```

The first two expressions must return `True`. The wrapper-folder query must
return nothing.

## Safe deployment workflow

### Development preview

```powershell
pnpm run theme:dev
```

This uses `shopify-theme/shopify.theme.toml` and a temporary development theme
with real store data.

### Upload/update an unpublished draft

```powershell
shopify theme push `
  --path shopify-theme `
  --store STORE.myshopify.com `
  --theme THEME_ID `
  --nodelete
```

Omit `--theme` and use `--unpublished` when creating a new draft. Do not run
`theme publish` during routine QA.

### Verify after upload

1. Confirm the CLI reports the intended theme ID.
2. Open the generated preview link.
3. Verify the theme version under Theme settings.
4. Test Home, Collection, Product, Cart, Search, FAQ, Privacy, Contact, Account
   and 404 templates.
5. Test at 390 px and 1440 px.
6. Test light and dark modes in both directions.
7. Add a real variant to cart and change quantity.
8. Confirm no horizontal overflow.
9. Re-enable and test required app embeds.
10. Publish only after client approval and a rollback theme is available.

## Apps and integrations after a theme switch

Theme files do not automatically activate every installed app on a new draft.
Check these manually:

- KiwiPass or the chosen customer login/OTP app;
- Judge.me or the chosen review app;
- Ekwik/express checkout integration;
- Meta Pixel through Shopify's supported Customer Events/app integration;
- order tracking app;
- WhatsApp abandoned-checkout automation.

Do not hardcode private keys, Admin API tokens, payment credentials or Meta
access tokens into Liquid, JavaScript, JSON settings or Git.

## New-project checklist

Before writing visual polish:

- [ ] Start from a Shopify-compatible theme directory.
- [ ] Add `layout/theme.liquid` with required outputs.
- [ ] Add `templates/index.json`, `product.json`, `collection.json`,
      `cart.json`, `search.json` and `404.json`.
- [ ] Add matching section schemas before referencing sections.
- [ ] Build product forms with native Shopify Liquid forms and variant IDs.
- [ ] Separate catalog import from theme packaging.
- [ ] Add semantic color tokens from the start.
- [ ] Add versioned packaging and semantic validation scripts.
- [ ] Connect a development store through `shopify.theme.toml`.
- [ ] Test a minimal “Hello World” theme first if the store/editor environment is
      suspect.
- [ ] Keep the first successful draft as a rollback baseline.

Before every delivery:

- [ ] Bump the theme version.
- [ ] Run custom semantic validation.
- [ ] Run Shopify Theme Check.
- [ ] Package with `pnpm run theme:package`.
- [ ] Inspect ZIP root and required entries.
- [ ] Record SHA-256.
- [ ] Push to an unpublished draft.
- [ ] Test mobile, desktop, cart and account flows.
- [ ] Commit the exact ZIP and exact source used to produce it.
