# TACT media provenance

The storefront contains only TACT Lifestyle content from:

1. the approved Drive folder:
   `https://drive.google.com/drive/folders/1-bvIinmrVqSPadekVdenvn2rckYmhfpa`
2. the live store:
   `https://www.tactlifestyle.store/`

BLUORNG and Bonkers Corner were used only to study layout, navigation and
commerce interaction patterns. Their media, code, legal text, product copy and
branding are not bundled.

## Live catalogue import

The public Shopify catalogue feeds were used to capture the live store state:

- 67 products;
- 292 variants;
- 408 product images;
- 29 collections;
- 265 product-to-collection memberships.

`scripts/import-tact-store.mjs` stores the catalogue in `app/catalog.json` and
optimizes the live media to local WebP files:

- `public/assets/products/<product-handle>/<image-number>.webp`
- `public/assets/collections/<collection-handle>.webp`

Each product retains its live title, vendor, description HTML, prices,
compare-at price, available sizes, SKU/variant information, tags and collection
memberships.

## Hero and logos

- Desktop campaign: `public/assets/hero/tact-current-desktop.png`
- Edited desktop derivative:
  `public/assets/hero/tact-editorial-desktop-v2.webp`
- Current mobile campaign: `public/assets/hero/tact-current-mobile.mp4`
- Six current vertical campaign films:
  `public/assets/videos/reel-01.mp4` through
  `public/assets/videos/reel-06.mp4`
- TACT black/white logos: `public/assets/logo-black.png` and
  `public/assets/logo-white.png`

The edited desktop derivative was produced from the TACT desktop campaign only:
the people, garments and ordering were preserved while the sticker outlines
and split background were replaced with a single studio scene. No reference
brand media was used. The Shopify fallback is
`shopify-theme/assets/hero-editorial-v2.webp`; the original source remains
untouched.

The 58.8 MB mobile video is not embedded in the ZIP because it would be
inappropriate as a theme asset; the hero section provides desktop and mobile
Shopify video pickers plus a live TACT mobile-video fallback.

The six reel files are used by the local demo. They are intentionally not
bundled into the theme ZIP; the Shopify video-story section supports up to 16
video blocks with current TACT CDN fallbacks and two product pickers per block.

## Reviews

Homepage and demo product-page proof uses only approved Judge.me review records
published by TACT on its live store. Bonkers Corner review copy is not used.
The Shopify product template provides an app-block location for TACT’s existing
Judge.me integration.

## Policies and company copy

`app/content.json` contains the exact live TACT privacy, shipping, refund, About
and Contact content captured on 26 July 2026. Legal pages display TACT’s own
published text. The Shopify theme continues to render the store’s native policy
objects, so future edits in Shopify Admin appear automatically.
