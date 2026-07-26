import Link from "next/link";
import { ProductCard } from "../../components/Storefront";
import {
  categories,
  collections,
  featuredCollections,
  products,
} from "../../data";

type CollectionPageProps = {
  searchParams: Promise<{ category?: string; collection?: string }>;
};

export default async function CollectionPage({
  searchParams,
}: CollectionPageProps) {
  const { category, collection } = await searchParams;
  const activeCategory = category
    ? decodeURIComponent(category.replace(/\+/g, " "))
    : "All";
  const activeCollection = collection
    ? collections.find((item) => item.handle === collection)
    : undefined;
  const visibleProducts = products.filter((product) => {
    if (activeCollection) {
      return product.collections.includes(activeCollection.handle);
    }
    return activeCategory === "All" || product.category === activeCategory;
  });

  return (
    <main id="main" className="inner-main">
      <header className="collection-hero">
        <p className="kicker">TACT / Shop</p>
        <h1>{activeCollection?.name ?? activeCategory}.</h1>
        <p>
          {activeCollection?.description ||
            "Everyday streetwear, cut with bold graphic language and an easy oversized attitude."}
        </p>
      </header>

      <section className="collection-toolbar" aria-label="Product filters">
        <div className="filter-groups">
          <div className="filter-chips">
            {categories.map((item) => (
              <Link
                className={
                  !activeCollection && activeCategory === item ? "is-active" : ""
                }
                href={
                  item === "All"
                    ? "/collections/all"
                    : `/collections/all?category=${encodeURIComponent(item)}`
                }
                key={item}
              >
                {item}
              </Link>
            ))}
          </div>
          <div className="filter-chips filter-chips-secondary">
            {featuredCollections.map((item) => (
              <Link
                className={
                  activeCollection?.handle === item.handle ? "is-active" : ""
                }
                href={`/collections/all?collection=${item.handle}`}
                key={item.handle}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
        <p>
          {visibleProducts.length}{" "}
          {visibleProducts.length === 1 ? "piece" : "pieces"}
        </p>
      </section>

      <section className="collection-products">
        <div className="product-grid product-grid-collection">
          {visibleProducts.map((product, index) => (
            <ProductCard
              product={product}
              key={product.handle}
              priority={index < 4}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
