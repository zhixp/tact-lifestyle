# TACT Shopify Theme Implementation Guide

Last verified: 2026-08-01

Theme version: 1.4.5
Production source: `shopify-theme/`

This document explains how the working storefront elements are built, where
their data comes from, what the merchant can edit, and what a developer must
preserve when extending the theme.

## Rendering architecture

`layout/theme.liquid` is the application shell:

```text
announcement bar
header
content_for_layout
footer
```

It also:

- renders Shopify's required `content_for_header`;
- loads `base.css`, `refinement.css`, then `editorial-system.css`;
- defines editable global design tokens;
- loads `theme.js` with `defer`;
- stores customer/authentication context in body data attributes;
- initializes the saved light/dark preference before paint.

The CSS order is intentional:

1. `base.css` contains the foundational layout and component styling.
2. `refinement.css` contains current responsive polish, motion, commerce
   refinements and semantic dark-mode mappings.
3. `editorial-system.css` is the concise final visual contract shared by the
   hero, header, rails, product page, reviews and mobile dock. New visual
   overrides belong here so they do not become scattered across old selectors.
4. the merchant's Theme settings custom CSS is emitted last.

Do not reorder these files without retesting the whole storefront.

## Homepage section map

`templates/index.json` defines the default homepage:

| Order | Section | Source file | Purpose |
|---|---|---|---|
| 1 | Editorial hero slideshow | `sections/hero-editorial.liquid` | Responsive campaign slides |
| 2 | Collection categories | `sections/collection-tiles.liquid` | One-deck horizontal category discovery |
| 3 | Product showcase | `sections/product-grid.liquid` | New arrivals with quick add |
| 4 | Editorial image and text | `sections/editorial-image-text.liquid` | Campaign storytelling |
| 5 | TACT video stories | `sections/video-reels.liquid` | Shoppable campaign video rail |
| 6 | Product showcase | `sections/product-grid.liquid` | Current rotation |
| 7 | Moving customer reviews | `sections/reviews-story.liquid` | Continuous review marquee |
| 8 | Service strip | `sections/service-strip.liquid` | Shipping, savings, returns and support |

Sections with a schema preset can be added, removed and reordered in the Shopify
theme editor. Header, announcement bar and footer are statically rendered as a
stable recovery architecture; their content remains editable through their
section settings.

## Global design system

Theme settings in `config/settings_schema.json` control:

- dark and light logos;
- desktop/mobile logo width;
- body, heading and accent fonts;
- type scale, line height and letter spacing;
- page width and desktop/mobile padding;
- section spacing and grid gaps;
- card and button radius;
- button height;
- icon size and stroke;
- light palette;
- dark palette;
- custom icons;
- social links;
- custom CSS.

The design system uses semantic variables rather than hardcoded global black and
white:

```css
--tact-ink: foreground text and icons;
--tact-paper: main page background;
--tact-surface: elevated cards and panels;
--tact-muted: secondary copy;
--tact-accent: emphasis and progress;
--tact-button: strong action background;
--tact-button-text: strong action foreground;
--tact-line: borders and dividers;
--tact-soft: subtle surfaces;
--tact-shadow: elevation;
```

Section schemas can still expose art-directed colors. Dark mode maps those local
variables back to semantic tokens so inline light colors do not create white
islands or black-on-black text.

## Light and dark mode

The mode controller lives in `theme.js` under `bindThemeMode()`.

Behavior:

1. `layout/theme.liquid` reads `tact-theme` from `localStorage` before the page
   paints.
2. If no saved mode exists, it uses the merchant's default: light, dark or
   system preference.
3. Toggle buttons update `html[data-theme]`.
4. The browser `color-scheme` and `<meta name="theme-color">` are updated.
5. All toggle labels update for accessibility.
6. A `tact:theme-changed` event is dispatched for future integrations.

Important rules:

- never use `filter: invert()` on the site or a large container;
- do not invert product images, campaign media, videos or logos;
- action foreground and background must be separate settings;
- any new section with custom colors must receive a dark-mode mapping;
- test both dark-to-light and light-to-dark after reload.

## Header and announcement bar

Source:

- `sections/announcement-bar.liquid`
- `sections/header.liquid`

Working behavior:

- continuous announcement ticker;
- logo swaps between dark/light assets when the header tone changes;
- header can sit over the hero without a faded white border;
- scroll state gives the header a stable readable surface;
- desktop navigation and actions remain compact;
- mobile removes duplicate profile access from the top when the dock supplies it;
- menu panel uses animated open/close behavior and blocks background scrolling;
- menu includes navigation, customer care, collections, mode switch and an
  editable promotional tile.

The hero exposes separate desktop and mobile header tones per slide. Preserve
this connection when changing header colors; otherwise icons can disappear over
light or dark campaign artwork.

## Hero slideshow

Source:

- `sections/hero-editorial.liquid`
- `theme.js` method `bindHeroCarousels()`
- `theme.js` method `bindHeroVideos()`

Merchant controls:

- up to six slides;
- desktop image, mobile image, GIF or Shopify-hosted video;
- fallback TACT campaign media;
- full or split layout;
- independent desktop/mobile fit and focal position;
- height and mobile height;
- edition, eyebrow, heading, CTA and destination;
- desktop/mobile text color;
- desktop/mobile header tone;
- overlay color and independent opacity;
- heading sizes;
- autoplay interval;
- transition speed;
- video playback rate;
- pause on hover;
- arrows, dots and counter.

Implementation notes:

- the carousel uses data attributes instead of framework state;
- only the active slide is exposed to assistive technology;
- autoplay pauses when configured and resets after manual navigation;
- reduced-motion users are not forced through animated transitions;
- mobile media is independently art directed to prevent aggressive desktop crop.

## Category deck

Source:

- `sections/collection-tiles.liquid`
- `theme.js` method `bindCategoryDecks()`

The old stacked grid consumed several mobile screens. The working version uses a
single horizontal deck:

- fixed card width controlled by the section;
- touch/trackpad scrolling;
- previous/next controls;
- progress indicator;
- disabled state at rail edges;
- configurable collection, fallback handle, title and image;
- compact mobile image width.

Collections themselves remain Shopify data. The section selects or references
them; it does not own collection inventory.

## Product cards and quick add

Source:

- `snippets/product-card.liquid`
- `sections/product-grid.liquid`
- `theme.js` methods `bindProductCardMotion()` and `bindVideoQuickAdd()`

Working behavior:

- primary image with alternate-image hover;
- touch-friendly quick-action reveal;
- size choices appear inside the card;
- Add control expands instead of permanently covering the image;
- loading state changes to `Adding…`;
- success state changes to `Added`;
- accessible live status reports the result;
- the native Shopify variant ID is posted to `/cart/add.js`;
- cart count and drawer refresh from `/cart.js`;
- wishlist control remains separate from the product link;
- cards use lightweight CSS transforms, not a heavy animation runtime.

When extending quick add:

- always submit a valid available variant ID;
- disable the action during the request;
- restore the control after failure;
- never leave an infinite spinner;
- update both visual text and an ARIA live region;
- refresh the native cart state after success.

## Wishlist

Source:

- wishlist markup in `sections/header.liquid`;
- product toggles in `snippets/product-card.liquid` and
  `sections/main-product.liquid`;
- controller in `theme.js` method `bindWishlist()`.

Behavior:

- guests are directed to Shopify customer login before using persistent saved
  items;
- authenticated members receive a per-customer browser storage key;
- the drawer lists saved product handle, title, image and URL;
- header/dock counts update immediately;
- removal works inside the drawer;
- wishlist access is in the mobile dock rather than duplicated in the top
  header.

Current limitation: browser storage is scoped to that browser. For true
cross-device persistence, add a customer metafield or wishlist app and replace
the storage adapter while preserving the UI contract.

## Product page

Source:

- `templates/product.json`
- `sections/main-product.liquid`

The page renders real Shopify product data:

- complete media gallery;
- title, product type, current price and compare-at price;
- sale percentage;
- tax/shipping note;
- compact available-size selector;
- size guide drawer;
- quantity selector;
- native Add to bag form;
- native dynamic Buy it now button;
- special offer card;
- benefit icons;
- Size & fit, Fabric & care, About, Shipping and Returns panels;
- configurable complementary collection (“Pairs well with”).

The product page must retain Shopify's product form and variant selector. Styling
can change, but bypassing native variant IDs breaks inventory, cart attribution
and checkout.

## Cart drawer and cart page

Source:

- `snippets/cart-drawer.liquid`
- `sections/main-cart.liquid`
- `theme.js` methods `bindCartDrawer()`, `renderCartDrawer()` and `closeCart()`

The drawer uses Shopify Ajax Cart endpoints:

- `/cart.js` to read cart state;
- `/cart/add.js` to add variants;
- `/cart/change.js` to change quantity or remove a line.

Working drawer states:

- rich empty bag panel with recommendations and collections;
- line-item image, variant, quantity and remove controls;
- free-shipping progress;
- collection-based upsells;
- subtotal;
- native checkout link;
- readable light/dark styling;
- body scroll lock while open.

Checkout remains Shopify checkout. Express checkout/payment apps can enhance the
flow, but the theme must not replace order creation with an untracked external
form.

## Video stories

Source:

- `sections/video-reels.liquid`
- `snippets/video-product-chip.liquid`
- `theme.js` method `bindStoryVideos()`

Features:

- merchant-addable video blocks;
- Shopify-hosted video or TACT fallback media;
- horizontal scroll rail;
- desktop controls and mobile edge arrows;
- arrow visibility follows the current scroll position;
- pause/play per card;
- product chip with image, price and quick add;
- optional product association per video;
- reduced-motion friendly behavior.

The product association is configured as a Shopify product picker or fallback
handle. This keeps pricing and availability live.

## Reviews

Source:

- `sections/reviews-story.liquid`
- `theme.js` method `bindReviewStories()`

Behavior:

- continuous, slow horizontal motion;
- direction and speed settings;
- pause on hover;
- compact mobile card dimensions;
- manual controls where applicable;
- review copy, rating, customer and product fields are editable blocks.

The default reviews are content blocks, not a replacement for a verified-review
app. Judge.me or another app can be rendered through the Apps section while the
editorial review rail remains optional.

## Mobile dock

Source:

- markup in `sections/header.liquid`;
- controller in `theme.js` methods `bindMobileDock()` and
  `updateMobileDock()`.

The dock provides:

- Home;
- Shop;
- Search;
- Wishlist;
- Account.

It is translucent, rounded and compact. It shrinks/hides subtly during scroll
and restores when the user changes direction. The header does not repeat the
same profile function on mobile.

Keep:

- safe-area padding for iOS;
- visible focus states;
- readable active state;
- cart/wishlist counts;
- sufficient touch target size even when visually compact.

## Theme motion system

Source:

- `theme.js` method `bindRevealMotion()`;
- interactive component methods in `theme.js`;
- motion rules in `refinement.css`.

The motion strategy is deliberately small:

- Intersection Observer reveals;
- CSS transforms and opacity;
- scroll-aware dock/header state;
- hover image switching;
- carousel/rail scroll;
- no React runtime in the Shopify theme;
- no large animation library.

All motion must honor `prefers-reduced-motion`. Functionality must still work
when animation is disabled.

## Page and account templates

The theme includes:

- 404;
- article and blog;
- cart;
- collection and collection list;
- contact;
- FAQ;
- generic page;
- privacy;
- shipping;
- returns;
- terms;
- track order;
- search;
- password;
- gift card;
- customer login;
- customer registration;
- account;
- order;
- addresses;
- activate account;
- reset password.

Creating the template file is only half the work. For alternate page templates,
the merchant must create a Shopify Page and assign the template in Admin.

Customer authentication remains native Shopify/KiwiPass. Customer and order data
must never be simulated in theme JavaScript.

## Footer

Source:

- `sections/footer.liquid`

The working footer contains:

- customer-care cards for FAQ, Shipping and Returns;
- TACT logo and brand statement;
- newsletter form;
- Shop, Help, TACT and Connect link groups;
- contact email, phone and address settings;
- social links;
- privacy and policy destinations through Shopify menus/pages;
- mobile-safe spacing above the dock.

The footer uses authored black artwork in both modes; dark mode does not invert
it.

## Content ownership

Use this rule to decide where a change belongs:

| Content | Owner |
|---|---|
| Product images, title, description, price, stock, sizes | Shopify Product |
| Collection membership and image | Shopify Collection |
| Navigation destinations | Shopify Menus |
| Hero campaigns and homepage storytelling | Theme section settings |
| Global typography, spacing and colors | Theme settings |
| FAQ/review editorial blocks | Section blocks |
| Customer login, profile, addresses and orders | Shopify Customer Accounts |
| Checkout, taxes, shipping and payments | Shopify Checkout/settings/apps |
| Tracking provider | Tracking app or tracking section setting |
| Meta Pixel | Shopify Customer Events or supported app |

Avoid copying product facts into section text. That creates two sources of truth.

## Adding a new editable section

1. Create `sections/section-name.liquid`.
2. Build semantic HTML and scope styles to the section class.
3. Add a complete `{% schema %}` document.
4. Give the section a preset if merchants should add it from the editor.
5. Use Shopify setting types such as product, collection, image, video, richtext,
   URL, range and color.
6. Use only alphanumeric IDs in JSON template instances.
7. Add the section to a JSON template or let the merchant add it.
8. Add dark-mode token mapping.
9. Add mobile rules and reduced-motion behavior.
10. Run `pnpm run theme:check` and `pnpm run theme:package`.

## Regression checklist

For every meaningful theme change:

- [ ] Home works at 390 px and 1440 px.
- [ ] No horizontal overflow.
- [ ] Header is readable over every hero slide.
- [ ] Hero desktop and mobile assets crop correctly.
- [ ] Category deck scrolls and controls disable at edges.
- [ ] Quick add reports loading, success and error.
- [ ] Product variant and quantity reach the cart.
- [ ] Cart drawer refreshes and checkout link works.
- [ ] Wishlist guest flow reaches login.
- [ ] Menu traps the visual interaction and closes correctly.
- [ ] Video rail scrolls and shoppable chips work.
- [ ] Reviews move without creating an excessively tall mobile section.
- [ ] Light and dark mode cover every page and component.
- [ ] Product imagery is never inverted.
- [ ] FAQ, Privacy, Shipping, Returns and Contact render real content.
- [ ] Customer templates remain native.
- [ ] Theme Check reports no offenses.
- [ ] The packaged ZIP has a valid root and version.
