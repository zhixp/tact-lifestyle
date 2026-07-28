"use client";

import Link from "next/link";
import { featuredCollections, money, products } from "../data";
import { Arrow, Minus, Plus } from "../components/Icons";
import { ProductCard, useStore } from "../components/Storefront";

export default function CartPage() {
  const { cart, cartCount, cartSubtotal, updateCartLine } = useStore();
  const suggestions = products
    .filter(
      (product) =>
        !cart.some((line) => line.product.handle === product.handle),
    )
    .slice(0, 4);

  return (
    <main className="cart-page" id="main">
      <header>
        <p className="kicker">Your rotation</p>
        <h1>Bag ({cartCount})</h1>
      </header>

      {cart.length ? (
        <>
          <div className="cart-page-layout">
            <section className="cart-page-lines" aria-label="Bag items">
              {cart.map((line, index) => (
                <article key={`${line.product.handle}-${line.size}`}>
                  <Link href={`/products/${line.product.handle}`}>
                    <img src={line.product.images[0]} alt="" />
                  </Link>
                  <div>
                    <Link href={`/products/${line.product.handle}`}>
                      <h2>{line.product.name}</h2>
                    </Link>
                    <p>Size {line.size}</p>
                    <strong>{money.format(line.product.price)}</strong>
                    <div className="quantity-stepper">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        onClick={() => updateCartLine(index, -1)}
                      >
                        <Minus />
                      </button>
                      <span>{line.quantity}</span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() => updateCartLine(index, 1)}
                      >
                        <Plus />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </section>
            <aside className="cart-page-summary">
              <p>
                Subtotal <strong>{money.format(cartSubtotal)}</strong>
              </p>
              <a
                className="button button-dark"
                href="https://www.tactlifestyle.store/cart"
              >
                Continue to checkout <Arrow />
              </a>
              <small>
                Taxes included. Shipping and payment are confirmed in Shopify
                checkout.
              </small>
            </aside>
          </div>
          <section className="section cart-page-upsell">
            <div className="section-title section-title-compact">
              <div>
                <p className="kicker">Pairs well with</p>
                <h2>Complete the rotation.</h2>
              </div>
            </div>
            <div className="product-grid product-grid-home">
              {suggestions.map((product) => (
                <ProductCard product={product} key={product.handle} />
              ))}
            </div>
          </section>
        </>
      ) : (
        <section className="cart-page-empty">
          <div>
            <p className="kicker">Nothing here yet</p>
            <h2>Your next rotation starts here.</h2>
            <Link className="button button-dark" href="/collections/all">
              Explore new arrivals <Arrow />
            </Link>
          </div>
          <div className="cart-page-empty-collections">
            {featuredCollections.slice(0, 4).map((collection) => (
              <Link
                href={`/collections/all?collection=${collection.handle}`}
                key={collection.handle}
              >
                {collection.image ? <img src={collection.image} alt="" /> : null}
                <span>{collection.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
