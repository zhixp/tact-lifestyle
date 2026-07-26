# TACT Lifestyle — storefront audit and redesign direction

## The short version

TACT already has strong products, art direction and color. The current
storefront does not frame those assets with the same confidence. The biggest
gap is not the catalog—it is hierarchy, consistency and the path from first
impression to product decision.

The proposed redesign gives TACT a quieter, more premium interface so the
graphics and garments remain the loudest part of the experience.

## Where the current storefront loses impact

### 1. Typography does not behave like one system

Type sizes, weights, capitalization, spacing and alignment change too often
between the announcement, hero, product cards and supporting sections. This
makes good content feel assembled rather than art-directed.

**Opportunity:** define a small type scale with one display voice, one body
voice, consistent line heights and repeatable labels. Large type should mark a
real hierarchy change, not appear simply because space is available.

### 2. The first screen does not resolve cleanly

The hero can extend beyond the user's useful viewing area. Its content, header
and call to action do not always land inside one intentional frame, particularly
on phones with shorter screens.

**Opportunity:** use `svh`-aware hero sizing, separate desktop/mobile crops and
a protected copy area. The header begins transparent, then becomes a readable
white navigation surface after scrolling.

### 3. Product alignment feels incidental

Uneven image crops and inconsistent card treatment make product rows feel less
deliberate. The eye has to work harder to compare names, prices and silhouettes.

**Opportunity:** one media ratio, controlled crops, stable text positions and a
predictable two-column mobile/four-column desktop rhythm. Secondary imagery can
appear on hover without moving the card.

### 4. The navigation competes with campaign artwork

A permanent heavy header takes attention from the hero, while a conventional
drawer does not give the collections much personality.

**Opportunity:** a transparent-to-solid header, a rounded animated desktop mega
menu and a focused mobile menu. The floating mobile dock keeps Home, Shop,
Search and Bag reachable without covering purchase controls.

### 5. The product page needs a stronger decision sequence

Product pages should answer, in order: What is it? What does it cost? Which
sizes are available? Why is it special? When will it arrive? What else works
with it? When those answers are visually mixed together, confidence drops.

**Opportunity:** pair a large gallery with a sticky purchase panel, clear
variant controls, size guide, product story, composition, delivery, returns and
recommendations. On mobile, use a swipeable gallery and a sticky add-to-bag bar.

### 6. Supporting pages should not feel like another website

About, contact, shipping, returns, search, collection and cart pages need the
same spacing, typography, header and footer as the homepage. Redesigning only
the home and product templates would make the brand break as soon as a customer
asks a practical question.

**Opportunity:** apply the design tokens and navigation shell across every
Shopify template, even when the content itself remains simple.

### 7. Mobile needs to be designed, not compressed

Shrinking desktop layouts creates cramped navigation, buried calls to action
and crops that miss the garment detail.

**Opportunity:** give mobile its own image sources, swipe behavior, menu
structure, sticky purchase controls, touch targets and safe-area spacing. The
demo is verified at 320 × 568, 390 × 844 and standard desktop widths.

### 8. The client needs control after launch

A beautiful custom site becomes a burden if the team needs a developer for
every product image, size or hero change.

**Opportunity:** use Shopify's native product, variant, inventory and media
objects. Expose the logo, desktop/mobile hero, editorial graphics, headings,
buttons, featured collection, menus, service messages, colors and corner
radius through the Shopify theme editor.

## What the proposed system changes

- Restrained, consistent typography that lets TACT's graphics lead.
- Full-frame campaign presentation with device-specific image crops.
- Transparent header that “comes to life” after scroll.
- Smooth rounded menu inspired by premium editorial commerce.
- Product discovery and card rhythm designed for fast visual comparison.
- Product pages shaped around fit, story, benefits and buying confidence.
- A detailed, useful cart rather than a checkout afterthought.
- One visual language across home, collection, product, search, cart and
  information pages.
- Shopify Basic compatibility with routine content owned by the client.

The result is not a copy of either reference site. It combines the clarity and
navigation restraint that work in editorial commerce with TACT's own artwork,
products, language and energy.
