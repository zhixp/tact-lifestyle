export type StoreReview = {
  name: string;
  rating: 4 | 5;
  title: string;
  quote: string;
  product: string;
  handle: string;
};

// Customer reviews collected from the live TACT store.
export const storeReviews: StoreReview[] = [
  {
    name: "Taranjeet",
    rating: 5,
    title: "I loved it",
    quote: "😻 I LOVED IT",
    product: "Classic Tact Tee — Black",
    handle: "classic-tact-tee-black",
  },
  {
    name: "Gautam",
    rating: 5,
    title: "Best and minimalistic",
    quote: "BESTTTT AND MINIMALISTIC",
    product: "Classic Tact Tee — White",
    handle: "classic-tact-tee-white",
  },
  {
    name: "Ritesh Jain",
    rating: 5,
    title: "Absolutely loved it",
    quote: "Absolutely loved it",
    product: "Ghost of Tsushima Oversized Tee — Cream",
    handle: "ghost-of-tsushima-cream-men",
  },
  {
    name: "Shahid",
    rating: 5,
    title: "Amazing quality",
    quote: "Amazinnggggg Quality!!! Loved every bit",
    product: "Enchantment Chain Sleeveless Tee",
    handle: "enchantment-chain-sleeveless-tee",
  },
  {
    name: "Keval",
    rating: 5,
    title: "Worth it",
    quote: "Goood and worth 100%",
    product: "Ghost of Tsushima Oversized Tee — Beige",
    handle: "ghost-of-tsushima-beige-men",
  },
  {
    name: "Darsh",
    rating: 4,
    title: "Fit and design",
    quote: "Very good fit and slick design!",
    product: "Confused Puzzle Emboss Tee",
    handle: "confused-puzzle-emboss-tee",
  },
];
