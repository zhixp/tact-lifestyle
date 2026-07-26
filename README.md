# TACT Lifestyle storefront

A responsive editorial storefront demo and Shopify Online Store 2.0 theme for
TACT Lifestyle.

## Local preview

```powershell
pnpm dev
```

Open `http://localhost:3000`.

The demo now includes:

- an edited TACT desktop campaign hero and current dedicated mobile campaign
  video;
- all 67 live products, 292 variants, 408 product images and 29 collections;
- collection/category filtering, product search and a working demo cart;
- large contain-fit product galleries with every available product image;
- size selection, quantity, Add to cart, Buy it now, current offers, benefits,
  product information and recommendations;
- FAQ, exact live shipping/refund/privacy policies, About and Contact pages;
- scroll-aware navigation, animated mega menu, compact mobile navigation;
- TACT’s six current shoppable campaign films, rotating live customer reviews,
  account login/profile pages and a rebuilt responsive footer.

## Shopify delivery

The production Shopify theme is in `shopify-theme`. Upload
`tact-shopify-theme.zip` to Shopify Basic and follow `SHOPIFY_HANDOFF.md`.

The client can manage without touching code:

- logo, independent desktop/mobile image, GIF or video, hero crop, playback
  speed, overlay, heading, eyebrow, CTA and destination;
- homepage products, editorial graphics, copy, services and menus;
- compact category tiles, up to 16 shoppable video blocks and a rotating
  customer-review carousel;
- announcement ticker content and mega-menu promotion media/product;
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
```

Media provenance is documented in `ASSET_SOURCES.md`.
