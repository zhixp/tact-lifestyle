# TACT Lifestyle storefront

A responsive editorial storefront demo and Shopify Online Store 2.0 theme for
TACT Lifestyle.

## Local preview

```powershell
pnpm dev
```

Open `http://localhost:3000`.

The demo now includes:

- a three-slide, auto-playing TACT campaign hero with responsive desktop and
  mobile art direction;
- all 67 live products, 292 variants, 408 product images and 29 collections;
- collection/category filtering, product search, login-gated per-member wishlist
  state, persistent cart state, plus a complete local `/cart` route;
- large contain-fit product galleries with every available product image;
- compact size selection, quantity, Add to cart, Buy it now, current offers,
  benefits, product information and “Pairs well with” recommendations;
- Modevelle-inspired quick add, alternate-image hover, touch-friendly controls,
  empty-bag recommendations and cart upsells;
- FAQ, exact live shipping/refund/privacy policies, About and Contact pages;
- scroll-aware navigation, animated mega menu, five-action mobile dock and
  persistent light/dark mode;
- TACT’s six current shoppable campaign films with discoverable rail controls,
  rotating live customer reviews, account pages and a responsive footer.

## Shopify delivery

The production Shopify theme is in `shopify-theme`. Upload
`tact-editorial-catalog-ready-1.4.4.zip` to Shopify Basic and follow
`SHOPIFY_HANDOFF.md`.

Reusable engineering documentation:

- `SHOPIFY_THEME_BUILD_PLAYBOOK.md` records the installation failures, root
  causes, fixes, safe packaging workflow and recovery checklist.
- `SHOPIFY_THEME_IMPLEMENTATION_GUIDE.md` maps every working storefront element
  to its Liquid, JavaScript, CSS, Shopify data source and merchant controls.

This exact source is also deployed to unpublished Shopify draft `157168992421`.
It has passed Shopify Theme Check and desktop/mobile storefront QA against the
store's real catalog. Older rebuilt, recovery and 1.6.x archives are superseded.

The client can manage without touching code:

- logo, independent desktop/mobile image, GIF or video, hero crop, playback
  speed, overlay, heading, eyebrow, CTA and destination;
- homepage products, editorial graphics, copy, services and menus;
- compact category tiles, up to 16 shoppable video blocks and a rotating
  customer-review carousel;
- announcement ticker content and mega-menu promotion media/product;
- native cart drawer content, free-shipping target, empty-bag copy and
  collection-based "Pairs well with" quick adds;
- complete semantic light/dark palettes, editable contrast-safe action colors
  and the persistent customer-facing theme switcher;
- product images, descriptions, prices, sizes, stock and variants;
- product-page offer copy, benefit copy, size guide, care, shipping and return
  summaries;
- FAQ questions, footer links, pages and Shopify policies.
- login, registration, account, order, address, activation and reset-password
  templates, while authentication remains native to Shopify/KiwiPass.

## Validation

```powershell
pnpm typecheck
pnpm build
pnpm theme:check
pnpm theme:package
```

Media provenance is documented in `ASSET_SOURCES.md`.
