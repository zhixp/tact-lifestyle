import catalog from "./catalog.json";

export type ProductVariant = {
  id: string;
  title: string;
  size: string;
  price: number;
  compareAt?: number;
  available: boolean;
  sku: string;
};

export type Product = {
  id: string;
  handle: string;
  name: string;
  vendor: string;
  price: number;
  compareAt?: number;
  category: string;
  tag?: string;
  color: string;
  sizes: string[];
  images: string[];
  imageSources: string[];
  intro: string;
  description: string;
  descriptionHtml: string;
  details: string[];
  tags: string[];
  collections: string[];
  publishedAt: string;
  has240Gsm: boolean;
  variants: ProductVariant[];
};

type CatalogProduct = Omit<Product, "compareAt" | "tag" | "variants"> & {
  compareAt: number | null;
  tag: string | null;
  variants: Array<
    Omit<ProductVariant, "compareAt"> & { compareAt: number | null }
  >;
};

export type Collection = {
  id: string;
  name: string;
  handle: string;
  description: string;
  image: string | null;
};

export const products: Product[] = (
  catalog.products as unknown as CatalogProduct[]
).map((product) => ({
  ...product,
  compareAt: product.compareAt ?? undefined,
  tag: product.tag ?? undefined,
  variants: product.variants.map((variant) => ({
    ...variant,
    compareAt: variant.compareAt ?? undefined,
  })),
}));

export const collections = catalog.collections as Collection[];

export const featuredCollections = [
  "men",
  "shop-womens",
  "unisex",
  "new-arrivals",
  "co-ord-set-women",
  "tact-joggers-men",
  "hoodies-men",
  "neon-rush-all-products",
  "sitcom",
]
  .map((handle) => collections.find((collection) => collection.handle === handle))
  .filter((collection): collection is Collection => Boolean(collection));

export const categories = [
  "All",
  ...Array.from(new Set(products.map((product) => product.category))).sort(),
];

export const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function getProduct(handle: string) {
  return products.find((product) => product.handle === handle);
}
