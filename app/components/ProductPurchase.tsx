"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { money, Product } from "../data";
import {
  Arrow,
  Card,
  Close,
  Fabric,
  Minus,
  Plus,
  ReturnBox,
  Ruler,
  Star,
  Tag,
  Truck,
} from "./Icons";
import { ProductCard, useStore } from "./Storefront";
import { storeReviews } from "../reviews";

const sizeMeasurements: Record<
  string,
  { chest: string; length: string; fit: string }
> = {
  XS: { chest: "40 in", length: "26 in", fit: "Oversized fit" },
  S: { chest: "42 in", length: "27 in", fit: "Oversized fit" },
  M: { chest: "44 in", length: "28 in", fit: "Oversized fit" },
  L: { chest: "46 in", length: "29 in", fit: "Oversized fit" },
  XL: { chest: "48 in", length: "30 in", fit: "Oversized fit" },
  XXL: { chest: "50 in", length: "31 in", fit: "Oversized fit" },
  XXXL: { chest: "52 in", length: "32 in", fit: "Oversized fit" },
};

type DetailKey = "fit" | "care" | "about" | "shipping" | "returns";

export function ProductPurchase({
  product,
  recommendations,
}: {
  product: Product;
  recommendations: Product[];
}) {
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [sizeError, setSizeError] = useState(false);
  const [activeDetail, setActiveDetail] = useState<DetailKey>("fit");
  const [stickyPurchaseVisible, setStickyPurchaseVisible] = useState(false);
  const purchaseActionsRef = useRef<HTMLDivElement>(null);
  const { addToCart } = useStore();

  const saving = product.compareAt
    ? Math.max(0, Math.round((1 - product.price / product.compareAt) * 100))
    : 0;
  const selectedMeasurement = useMemo(
    () => sizeMeasurements[selectedSize.toUpperCase()],
    [selectedSize],
  );
  const productReviews = useMemo(() => {
    const direct = storeReviews.filter(
      (review) => review.handle === product.handle,
    );
    return direct.length ? direct : storeReviews.slice(2, 5);
  }, [product.handle]);

  useEffect(() => {
    const target = purchaseActionsRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(([entry]) => {
      const hasPassedPurchase = entry.boundingClientRect.bottom < 68;
      setStickyPurchaseVisible(!entry.isIntersecting && hasPassedPurchase);
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  function addSelected() {
    if (product.sizes.length > 0 && !selectedSize) {
      setSizeError(true);
      return false;
    }
    setSizeError(false);
    addToCart(product, selectedSize || product.sizes[0] || "One size", quantity);
    return true;
  }

  function buyNow() {
    addSelected();
  }

  const detailContent: Record<DetailKey, React.ReactNode> = {
    fit: (
      <>
        <h3>Size & fit</h3>
        <p>
          Select your usual size for the intended TACT silhouette. Use the
          measurements as a quick fit reference and check the size guide before
          ordering.
        </p>
        {selectedMeasurement ? (
          <ul className="detail-facts">
            <li>Chest: {selectedMeasurement.chest}</li>
            <li>Length: {selectedMeasurement.length}</li>
            <li>{selectedMeasurement.fit}</li>
          </ul>
        ) : (
          <p className="detail-muted">Choose a size above to see its fit guide.</p>
        )}
      </>
    ),
    care: (
      <>
        <h3>Fabric & care</h3>
        <p>
          Follow the wash and care information supplied with the garment.
          Wash similar colours together, turn decorated pieces inside out, and
          avoid direct heat on prints or embroidery.
        </p>
        {product.has240Gsm ? (
          <p className="detail-highlight">240 GSM fabric construction</p>
        ) : null}
      </>
    ),
    about: (
      <>
        <h3>Product details</h3>
        <div
          className="product-description-rich"
          dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
        />
      </>
    ),
    shipping: (
      <>
        <h3>Shipping</h3>
        <p>
          Free standard shipping is available on Indian orders over ₹499.
          Orders are normally processed within two business days and standard
          delivery generally takes 3–4 business days.
        </p>
        <Link href="/policies/shipping-policy">Read the shipping policy</Link>
      </>
    ),
    returns: (
      <>
        <h3>Returns & exchange</h3>
        <p>
          Eligible unworn and unwashed items with original tags can be returned
          within seven days. A ₹125 return-shipping fee applies and exchanges
          are subject to availability.
        </p>
        <Link href="/policies/refund-policy">Read the return policy</Link>
      </>
    ),
  };

  return (
    <>
      <section className="product-view product-view-v2">
        <div className="product-gallery product-gallery-v2">
          {product.images.map((image, index) => (
            <figure
              className={index === 0 ? "product-image-primary" : ""}
              key={`${image}-${index}`}
            >
              <img
                src={image}
                alt={`${product.name} — view ${index + 1}`}
                loading={index < 2 ? "eager" : "lazy"}
              />
              <figcaption>
                {String(index + 1).padStart(2, "0")} /{" "}
                {String(product.images.length).padStart(2, "0")}
              </figcaption>
            </figure>
          ))}
        </div>

        <aside className="product-detail product-detail-v2">
          <div className="product-detail-top">
            <p className="product-category">{product.category}</p>
            <h1>{product.name}</h1>
            <div className="product-price-row">
              <p className="product-price">
                {product.compareAt ? (
                  <s>{money.format(product.compareAt)}</s>
                ) : null}
                <strong>{money.format(product.price)}</strong>
              </p>
              {saving > 0 ? <span className="saving-badge">Save {saving}%</span> : null}
            </div>
            <p className="tax-note">MRP inclusive of all taxes</p>
            <p className="shipping-note">Shipping calculated at checkout.</p>
          </div>

          {product.sizes.length > 0 ? (
            <>
              <div className="size-heading">
                <span>
                  Size: <strong>{selectedSize || "Select"}</strong>
                </span>
                <button type="button" onClick={() => setSizeGuideOpen(true)}>
                  <Ruler size={16} /> Sizing guide
                </button>
              </div>
              {selectedMeasurement ? (
                <div className="measurement-chips" aria-live="polite">
                  <span>Chest {selectedMeasurement.chest}</span>
                  <span>Length {selectedMeasurement.length}</span>
                </div>
              ) : null}
              <div className="size-selector size-selector-v2">
                {product.sizes.map((size) => (
                  <button
                    className={selectedSize === size ? "is-active" : ""}
                    type="button"
                    onClick={() => {
                      setSelectedSize(size);
                      setSizeError(false);
                    }}
                    key={size}
                    aria-pressed={selectedSize === size}
                  >
                    {size}
                  </button>
                ))}
              </div>
              {sizeError ? (
                <p className="size-error" role="alert">
                  Select an available size to continue.
                </p>
              ) : null}
            </>
          ) : null}

          <div className="purchase-actions" ref={purchaseActionsRef}>
            <div className="product-quantity" aria-label="Quantity">
              <button
                type="button"
                aria-label="Decrease quantity"
                disabled={quantity === 1}
                onClick={() => setQuantity((current) => Math.max(1, current - 1))}
              >
                <Minus />
              </button>
              <span>{quantity}</span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => setQuantity((current) => current + 1)}
              >
                <Plus />
              </button>
            </div>
            <button className="product-add product-add-outline" type="button" onClick={addSelected}>
              Add to cart
            </button>
          </div>
          <button className="product-buy-now" type="button" onClick={buyNow}>
            Buy it now <Arrow />
          </button>

          <section className="product-offers" aria-label="Current offers">
            <div className="product-offers-heading">
              <span>Special offers</span>
              <small>Available now</small>
            </div>
            <article>
              <Tag />
              <div>
                <strong>Extra 5% off prepaid orders</strong>
                <p>Applied to eligible prepaid orders at checkout.</p>
              </div>
            </article>
            <div className="offer-foot">
              <span>Free standard shipping over ₹499</span>
              <span>7-day eligible returns</span>
            </div>
          </section>

          <section className="product-value">
            <div className="product-value-heading">
              <p className="kicker">What you get</p>
              <h2>Built into every order.</h2>
            </div>
            <div className="product-value-list">
              <article>
                <Fabric />
                <div>
                  <strong>
                    {product.has240Gsm
                      ? "240 GSM fabric"
                      : "Premium construction"}
                  </strong>
                  <span>Designed for everyday structure and comfort</span>
                </div>
              </article>
              <article>
                <Card />
                <div>
                  <strong>Flexible payment options</strong>
                  <span>Prepaid savings available at checkout</span>
                </div>
              </article>
              <article>
                <Truck />
                <div>
                  <strong>Fast domestic delivery</strong>
                  <span>Standard delivery generally in 3–4 business days</span>
                </div>
              </article>
              <article>
                <ReturnBox />
                <div>
                  <strong>Seven-day returns</strong>
                  <span>For eligible unworn pieces with original tags</span>
                </div>
              </article>
            </div>
          </section>

          <section className="product-detail-tabs">
            <div className="detail-tab-list" role="tablist" aria-label="Product information">
              {(
                [
                  ["fit", "Size & fit"],
                  ["care", "Fabric & care"],
                  ["about", "About"],
                  ["shipping", "Shipping"],
                  ["returns", "Returns"],
                ] as Array<[DetailKey, string]>
              ).map(([key, label]) => (
                <button
                  className={activeDetail === key ? "is-active" : ""}
                  type="button"
                  role="tab"
                  aria-selected={activeDetail === key}
                  onClick={() => setActiveDetail(key)}
                  key={key}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="detail-tab-panel" role="tabpanel">
              {detailContent[activeDetail]}
            </div>
          </section>
        </aside>

        <div
          className={`mobile-product-add mobile-product-add-v2 ${
            stickyPurchaseVisible ? "is-visible" : ""
          }`}
        >
          <span>
            <small>{selectedSize ? `Size ${selectedSize}` : "Select size"}</small>
            <strong>{money.format(product.price)}</strong>
          </span>
          <button type="button" onClick={addSelected}>
            Add to cart
          </button>
        </div>
      </section>

      <section className="product-review-proof">
        <div>
          <p className="kicker">Verified social proof</p>
          <h2>What TACT customers say.</h2>
          <p>
            Approved reviews already published through TACT&apos;s live
            Judge.me account.
          </p>
        </div>
        <div className="product-review-proof-rail">
          {productReviews.map((review) => (
            <article key={`${review.name}-${review.handle}`}>
              <span className="review-stars">
                {Array.from({ length: review.rating }).map((_, index) => (
                  <Star key={index} />
                ))}
              </span>
              <blockquote>“{review.quote}”</blockquote>
              <footer>
                <span>— {review.name}</span>
                <span>{review.product}</span>
              </footer>
            </article>
          ))}
        </div>
      </section>

      <section className="section product-recommendations">
        <div className="section-title section-title-compact">
          <div>
            <p className="kicker">Complete the rotation</p>
            <h2>You may also like.</h2>
          </div>
          <Link className="text-link" href="/collections/all">
            Shop all <Arrow />
          </Link>
        </div>
        <div className="product-grid product-grid-related">
          {recommendations.map((item) => (
            <ProductCard product={item} key={item.handle} />
          ))}
        </div>
      </section>

      <button
        className={`modal-backdrop ${sizeGuideOpen ? "is-visible" : ""}`}
        type="button"
        aria-label="Close size guide"
        onClick={() => setSizeGuideOpen(false)}
      />
      <aside
        className={`size-guide ${sizeGuideOpen ? "is-open" : ""}`}
        aria-hidden={!sizeGuideOpen}
      >
        <div className="drawer-heading">
          <span>TACT size guide</span>
          <button
            type="button"
            aria-label="Close size guide"
            onClick={() => setSizeGuideOpen(false)}
          >
            <Close />
          </button>
        </div>
        <div className="size-guide-body">
          <Ruler size={28} />
          <h2>Find your intended fit.</h2>
          <p>
            Garment measurements in inches. Oversized styles are intentionally
            cut with extra room through the body.
          </p>
          <div className="size-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Size</th>
                  <th>Chest</th>
                  <th>Length</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(sizeMeasurements).map(([size, values]) => (
                  <tr key={size}>
                    <td>{size}</td>
                    <td>{values.chest.replace(" in", "")}</td>
                    <td>{values.length.replace(" in", "")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small>
            Measurement values are a fit guide. Confirm the garment-specific
            production chart in Shopify before launch.
          </small>
        </div>
      </aside>
    </>
  );
}
