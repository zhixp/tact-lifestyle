# TACT Shopify theme handoff

`tact-shopify-theme.zip` is an Online Store 2.0 theme for Shopify Basic.

Upload it from **Shopify admin → Online Store → Themes → Import theme → Upload zip file**. Keep it unpublished while testing.

## What the client controls without code

From **Online Store → Themes → Customize**, the client can:

- add, remove and reorder homepage sections;
- upload separate desktop/mobile hero images, GIFs or Shopify-hosted videos;
- create up to six hero slides and control height, crop, focal point, overlay, typography, copy, links, autoplay and navigation;
- change global Shopify fonts, typography scale, colors, page width, spacing, button/card radius and icon sizing;
- configure the storefront light/dark palette and let shoppers switch modes from the header;
- upload dark/light logos, resize desktop/mobile logos and upload replacement navigation icons;
- edit the announcement marquee, messages, icons, direction, speed, spacing and colors;
- edit header menus, action visibility, mobile dock, sticky behavior and mega-menu campaign tile;
- add/reorder/resize homepage categories and connect each tile to a collection;
- choose product collections, columns, mobile product rails, quick add and wishlist;
- add/reorder video stories and connect products worn in each video;
- show automatic edge arrows on long video rails so touch and mouse users can discover more stories;
- edit, add, remove and reorder continuous customer-review cards;
- edit all product-page offer, highlight, size guide, care, shipping and returns content;
- toggle product information, offers, dynamic checkout, wishlist and complementary products;
- select up to eight “Pairs well with” products per product template;
- edit the empty-cart showcase, cart note and collection-based cart upsell;
- change footer logo, content, newsletter, support cards, menus, colors and spacing.

The mobile dock is a five-action layout for Home, Search, Wishlist, Account and Bag. Its visibility and individual header actions remain controlled from the header section settings.

Products, titles, descriptions, variants, sizes, inventory and product media remain managed from **Products**. Collections remain managed from **Products → Collections**. The owner does not edit theme code when adding normal products.

## Customer accounts

The account icon uses Shopify’s native `routes.account_url`. The package includes legacy Shopify templates for:

- login and registration;
- account profile and order history;
- addresses;
- individual order details;
- password reset and account activation.

For current Shopify customer accounts, enable them in **Settings → Customer accounts** and turn on **Show sign-in links**. Shopify can host the account experience and still use the theme’s account link. If TACT keeps KiwiPass for phone OTP, re-enable its app embed after changing themes; KiwiPass—not the theme—owns that modal and authentication data.

The header editor includes independent toggles for the account, search, wishlist, cart and mobile navigation dock. Hiding the account icon does not delete customer data.

## Cart and checkout

The theme includes a native `/cart` page with:

- line-item editing and removal;
- cart notes;
- an editable empty-bag campaign;
- collection-based upsells with size-aware quick add;
- a native Shopify checkout submission.

The product page uses a native Shopify product form plus `payment_button`, so accelerated methods supported by the store can appear as **Buy it now**.

Checkout is Shopify-hosted on Shopify Basic. It is intentionally not duplicated as a Liquid page: a fake theme checkout would break payments, order creation, discount logic, inventory reservation, checkout events and recovery automation. Configure checkout branding and payment methods under **Settings → Checkout** and **Settings → Payments**. The cart, product forms and dynamic checkout preserve Shopify order and abandoned-checkout data.

## Meta Pixel and ad tracking

Do not paste the same Meta Pixel into `theme.liquid`. That commonly duplicates `PageView`, misses sandboxed checkout events or creates inconsistent attribution.

Preferred setup:

1. In Shopify admin, open **Sales channels** and install/open **Facebook & Instagram by Meta**.
2. Connect the correct Meta Business Manager, ad account and Pixel/Dataset.
3. In that channel’s **Settings → Data sharing**, choose the level approved by the client.
4. Verify events with Meta Events Manager’s Test Events view.

If the client has a custom tracking stack, use **Settings → Customer events → Add custom pixel** instead. Shopify Customer Events is the supported place for storefront and checkout event subscriptions. Use only one implementation per Meta dataset and remove old duplicate scripts/app embeds.

Because the theme submits native Shopify cart and checkout forms, standard events and checkout state remain available to Shopify’s Meta integration. The six-hour WhatsApp recovery should be triggered from Shopify’s abandoned-checkout/cart automation or the client’s approved recovery app—not browser-only theme JavaScript.

## Included pages and templates

The ZIP includes templates for home, product, collection, list of collections, cart, search, standard pages, FAQ, contact, blog, article, 404 and all legacy customer-account routes. Shopify checkout itself is not a theme template.

Policy links read from **Settings → Policies**, so privacy, shipping, refund and terms content stays centrally managed. Create a page with handle `faq` and assign the `faq` template if it does not already exist.

## Before presenting or publishing

1. Duplicate the current live theme.
2. Upload this ZIP and preview it unpublished.
3. Select the approved hero media and check focal points at desktop and mobile sizes.
4. Connect homepage collections and product-grid collections.
5. Select “Pairs well with” products in the product template.
6. Select an upsell collection in the cart template.
7. Re-enable required app embeds: KiwiPass, Judge.me and any recovery/WhatsApp app.
8. Confirm customer accounts are enabled and test login, registration, orders and addresses.
9. Test every size, add-to-cart, quick add, cart update, discount, dynamic checkout and payment method.
10. Connect Meta through the official channel or Customer Events and verify no duplicate events.
11. Check all policy copy and shipping/return claims against the live checkout configuration.
12. Publish only after phone and desktop QA.

The built-in wishlist requires customer sign-in and separates browser storage by Shopify customer ID, so saved items are not exposed as one shared anonymous list. It persists on the same browser. For a wishlist synchronized across devices and customer sessions, connect a Shopify wishlist app or app-backed customer metafield and replace or disable the built-in storage layer.
