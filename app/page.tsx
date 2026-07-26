import Link from "next/link";
import { Arrow } from "./components/Icons";
import { ProductCard } from "./components/Storefront";
import { ReviewStories } from "./components/ReviewStories";
import { VideoStories } from "./components/VideoStories";
import { HeroCarousel } from "./components/HeroCarousel";
import { featuredCollections, products } from "./data";

const latest = [...products]
  .sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  )
  .slice(0, 8);

const mostLovedHandles = [
  "tact-all-over-signature-tee",
  "big-bang-sweatshirt-men",
  "ghost-of-tsushima-beige-men",
  "all-over-signature-jogger-men",
];

const mostLoved = mostLovedHandles
  .map((handle) => products.find((product) => product.handle === handle))
  .filter((product): product is (typeof products)[number] => Boolean(product));

const homeCollections = featuredCollections.slice(0, 4);
const collectionRail = featuredCollections.slice(4);

export default function Home() {
  return (
    <main id="main">
      <HeroCarousel />

      <section className="section category-intro">
        <div className="section-title">
          <div>
            <p className="kicker">01 / Find your everyday drip</p>
            <h2>Explore streetwear by category.</h2>
          </div>
          <div className="section-title-side">
            <p>Men, women, and unisex fits — find your everyday drip.</p>
            <Link className="text-link" href="/collections/all">
              Shop all products <Arrow />
            </Link>
          </div>
        </div>
        <div className="collection-grid collection-grid-live">
          {homeCollections.map((collection, index) => (
            <Link
              className="collection-card"
              href={`/collections/all?collection=${collection.handle}`}
              key={collection.handle}
            >
              {collection.image ? (
                <img src={collection.image} alt="" loading="lazy" />
              ) : null}
              <span className="collection-number">0{index + 1}</span>
              <span className="collection-copy">
                <strong>{collection.name}</strong>
                <small>
                  {collection.description || "Discover the TACT edit."}
                </small>
              </span>
              <i>
                <Arrow />
              </i>
            </Link>
          ))}
        </div>
      </section>

      <section className="section product-feature">
        <div className="section-title">
          <div>
            <p className="kicker">02 / Selected pieces</p>
            <h2>The current rotation.</h2>
          </div>
          <div className="section-title-side">
            <p>Graphic layers, clean basics and easy everyday fits.</p>
            <Link className="text-link" href="/collections/all">
              View the full catalog <Arrow />
            </Link>
          </div>
        </div>
        <div className="product-grid product-grid-home">
          {mostLoved.map((product, index) => (
            <ProductCard
              key={product.handle}
              product={product}
              priority={index < 2}
            />
          ))}
        </div>
      </section>

      <section className="campaign-panel campaign-panel-current">
        <img
          src={
            products.find(
              (product) => product.handle === "tact-all-over-signature-tee",
            )?.images[1] ?? latest[0].images[0]
          }
          alt="TACT Signature collection"
          loading="lazy"
        />
        <div className="campaign-panel-shade" />
        <div className="campaign-panel-copy">
          <p className="kicker">03 / New arrivals</p>
          <h2>Latest.</h2>
          <Link className="button button-light" href="/collections/all">
            Shop new arrivals <Arrow />
          </Link>
        </div>
      </section>

      <VideoStories />

      <section className="section most-loved">
        <div className="section-title section-title-compact">
          <div>
            <p className="kicker">05 / New arrivals</p>
            <h2>Just landed.</h2>
          </div>
          <Link className="text-link" href="/collections/all">
            Explore all 67 products <Arrow />
          </Link>
        </div>
        <div className="product-grid product-grid-home">
          {latest.slice(0, 8).map((product) => (
            <ProductCard key={product.handle} product={product} />
          ))}
        </div>
      </section>

      <ReviewStories />

      <section className="section collections-section home-collection-rail">
        <div className="section-title section-title-compact">
          <div>
            <p className="kicker">07 / Collections</p>
            <h2>Shop the full edit.</h2>
          </div>
          <span>Co-Ords / Joggers / Hoodies / Neon Rush / Sitcom</span>
        </div>
        <div className="collection-rail">
          {collectionRail.map((collection) => (
            <Link
              href={`/collections/all?collection=${collection.handle}`}
              key={collection.handle}
            >
              {collection.image ? (
                <img src={collection.image} alt="" loading="lazy" />
              ) : null}
              <span>
                <strong>{collection.name}</strong>
                <Arrow />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="service-strip" aria-label="Shopping benefits">
        <article>
          <small>01</small>
          <h3>Free delivery</h3>
          <p>Free standard shipping on orders over ₹499 across India.</p>
        </article>
        <article>
          <small>02</small>
          <h3>Five percent off</h3>
          <p>Extra 5% savings when you choose a prepaid payment method.</p>
        </article>
        <article>
          <small>03</small>
          <h3>Seven-day returns</h3>
          <p>Eligible unworn pieces can be returned within seven days.</p>
        </article>
      </section>
    </main>
  );
}
