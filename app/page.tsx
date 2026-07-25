"use client";

import { FormEvent, useMemo, useState } from "react";

type Product = {
  name: string;
  price: number;
  image: string;
  href: string;
  tag?: string;
};

type Category = {
  name: string;
  image: string;
  href: string;
  className: string;
};

const products: Product[] = [
  {
    name: "Web of Madison Oversized Tee",
    price: 1599,
    image: "/assets/product-web-madison.webp",
    href: "https://www.tactlifestyle.store/products/web-of-madison-oversized-tee",
    tag: "New",
  },
  {
    name: "Pacman Oversized Tee — Lavender",
    price: 1399,
    image: "/assets/product-pacman.webp",
    href: "https://www.tactlifestyle.store/products/pacman-oversized-tee-lavender",
  },
  {
    name: "Enchantment Chain Sleeveless Tee",
    price: 1799,
    image: "/assets/product-enchantment.webp",
    href: "https://www.tactlifestyle.store/products/enchantment-chain-sleeveless-tee",
    tag: "Just landed",
  },
  {
    name: "Cosmic Vision Sleeveless Tee",
    price: 1099,
    image: "/assets/product-cosmic.webp",
    href: "https://www.tactlifestyle.store/products/cosmic-vision-sleeveless-tee",
  },
  {
    name: "Classic TACT Tee — Black",
    price: 1299,
    image: "/assets/product-classic-black.webp",
    href: "https://www.tactlifestyle.store/products/classic-tact-tee-black",
  },
  {
    name: "Confused Puzzle Emboss Tee",
    price: 1499,
    image: "/assets/product-puzzle.webp",
    href: "https://www.tactlifestyle.store/products/confused-puzzle-emboss-tee",
  },
];

const categories: Category[] = [
  {
    name: "Men",
    image: "/assets/category-men.jpg",
    href: "https://www.tactlifestyle.store/collections/men",
    className: "category-card--hero",
  },
  {
    name: "Co-ords",
    image: "/assets/category-coords.jpg",
    href: "https://www.tactlifestyle.store/collections/co-ords",
    className: "category-card--wide",
  },
  {
    name: "Joggers",
    image: "/assets/category-joggers.jpg",
    href: "https://www.tactlifestyle.store/collections/joggers",
    className: "category-card--small",
  },
  {
    name: "Hoodies",
    image: "/assets/category-hoodies.jpg",
    href: "https://www.tactlifestyle.store/collections/hoodies",
    className: "category-card--small",
  },
  {
    name: "Neon Rush",
    image: "/assets/category-neon.jpg",
    href: "https://www.tactlifestyle.store/collections/neon-rush",
    className: "category-card--medium",
  },
  {
    name: "Sitcom",
    image: "/assets/category-sitcom.jpg",
    href: "https://www.tactlifestyle.store/collections/sitcom",
    className: "category-card--medium",
  },
];

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h13M13 6l6 6-6 6" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 7h18M3 12h18M3 17h18" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 8h14l-1 12H6L5 8Z" />
      <path d="M9 9V6a3 3 0 0 1 6 0v3" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m5 5 14 14M19 5 5 19" />
    </svg>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [bagOpen, setBagOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [bag, setBag] = useState<Product[]>([]);
  const [notice, setNotice] = useState("");
  const [signedUp, setSignedUp] = useState(false);

  const filteredProducts = useMemo(
    () =>
      products.filter((product) =>
        product.name.toLowerCase().includes(query.toLowerCase()),
      ),
    [query],
  );

  const bagTotal = bag.reduce((sum, product) => sum + product.price, 0);

  function addToBag(product: Product) {
    setBag((current) => [...current, product]);
    setNotice(`${product.name} added to the concept bag.`);
    window.setTimeout(() => setNotice(""), 2600);
  }

  function handleNewsletter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSignedUp(true);
  }

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to main content
      </a>

      <div className="announcement" aria-label="Store offers">
        <span>New arrivals, live now</span>
        <span>Free delivery on all orders</span>
        <span>Extra 5% off prepaid orders</span>
      </div>

      <header className="site-header">
        <button
          className="icon-button menu-button"
          type="button"
          aria-label="Open menu"
          onClick={() => setMenuOpen(true)}
        >
          <MenuIcon />
        </button>

        <nav className="desktop-nav" aria-label="Primary navigation">
          <a href="#new">New in</a>
          <a href="https://www.tactlifestyle.store/collections/men">Men</a>
          <a href="https://www.tactlifestyle.store/collections/women">Women</a>
          <a href="#collections">Collections</a>
        </nav>

        <a className="brand" href="#top" aria-label="TACT Lifestyle home">
          <img src="/assets/logo-black.png" alt="TACT Lifestyle" />
        </a>

        <div className="header-actions">
          <button
            className="icon-button"
            type="button"
            aria-label="Search products"
            onClick={() => setSearchOpen(true)}
          >
            <SearchIcon />
          </button>
          <button
            className="icon-button bag-button"
            type="button"
            aria-label={`Open concept bag with ${bag.length} items`}
            onClick={() => setBagOpen(true)}
          >
            <BagIcon />
            <span>{bag.length}</span>
          </button>
        </div>
      </header>

      <main id="main">
        <section className="hero" id="top">
          <img
            className="hero-media"
            src="/assets/hero-signature.jpg"
            alt="Model wearing the TACT all-over Signature set"
          />
          <div className="hero-wash" />
          <div className="hero-topline">
            <span>TACT / Signature</span>
            <span>Drop 06 — 2026</span>
          </div>
          <div className="hero-content">
            <div>
              <p className="eyebrow eyebrow--light">Everyday streetwear, re-cut</p>
              <h1>
                Own your
                <span>flex.</span>
              </h1>
            </div>
            <div className="hero-cta-block">
              <p>Everyday pieces made to flex, effortlessly.</p>
              <a className="pill-button pill-button--light" href="#new">
                Shop the edit <ArrowIcon />
              </a>
            </div>
          </div>
        </section>

        <div className="ticker" aria-hidden="true">
          <div>
            TACT LIFESTYLE <i>✦</i> MEN <i>✦</i> WOMEN <i>✦</i> UNISEX{" "}
            <i>✦</i> TACT LIFESTYLE <i>✦</i> MEN <i>✦</i> WOMEN <i>✦</i>{" "}
            UNISEX <i>✦</i>
          </div>
        </div>

        <section className="product-section section-shell" id="new">
          <div className="section-heading">
            <div>
              <p className="eyebrow">01 / Just landed</p>
              <h2>The current<br />rotation.</h2>
            </div>
            <div className="section-intro">
              <p>
                New silhouettes. Strong graphics. Clean presentation that lets
                every piece earn its place.
              </p>
              <a href="https://www.tactlifestyle.store/collections/all">
                View all pieces <ArrowIcon />
              </a>
            </div>
          </div>

          <div className="product-grid">
            {products.map((product, index) => (
              <article className="product-card" key={product.name}>
                <a
                  className="product-image"
                  href={product.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`View ${product.name} on TACT Lifestyle`}
                >
                  {product.tag ? <span>{product.tag}</span> : null}
                  <img
                    src={product.image}
                    alt={product.name}
                    loading={index < 4 ? "eager" : "lazy"}
                  />
                </a>
                <div className="product-info">
                  <div>
                    <h3>{product.name}</h3>
                    <p>{money.format(product.price)}</p>
                  </div>
                  <button
                    type="button"
                    aria-label={`Add ${product.name} to concept bag`}
                    onClick={() => addToBag(product)}
                  >
                    +
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="manifesto">
          <div className="manifesto-copy">
            <p className="eyebrow eyebrow--light">02 / Signature language</p>
            <h2>
              Not made
              <span>to blend in.</span>
            </h2>
            <p className="manifesto-body">
              TACT already has the color, characters, and product energy. The
              new system gives those ingredients room to feel intentional.
            </p>
            <a
              className="pill-button pill-button--light"
              href="https://www.tactlifestyle.store/collections/signature"
            >
              Enter Signature <ArrowIcon />
            </a>
          </div>
          <div className="manifesto-art">
            <img
              src="/assets/campaign-banner.webp"
              alt="TACT models wearing pieces from multiple collections"
              loading="lazy"
            />
            <span>One label. Every mood.</span>
          </div>
        </section>

        <section className="collection-section section-shell" id="collections">
          <div className="section-heading section-heading--collections">
            <div>
              <p className="eyebrow">03 / Shop your mood</p>
              <h2>Collections<br />with character.</h2>
            </div>
            <p className="section-number">06 worlds / one TACT</p>
          </div>

          <div className="category-grid">
            {categories.map((category, index) => (
              <a
                className={`category-card ${category.className}`}
                href={category.href}
                target="_blank"
                rel="noreferrer"
                key={category.name}
              >
                <img src={category.image} alt="" loading="lazy" />
                <span className="category-index">0{index + 1}</span>
                <span className="category-name">
                  {category.name}
                  <ArrowIcon />
                </span>
              </a>
            ))}
          </div>
        </section>

        <section className="lookbook">
          <div className="lookbook-video">
            <video
              src="/assets/lookbook.mp4"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-label="TACT Lifestyle lookbook film"
            />
            <span>TACT in motion / 00:12</span>
          </div>
          <div className="lookbook-copy">
            <p className="eyebrow">04 / In motion</p>
            <h2>Built for the<br />full frame.</h2>
            <p>
              Campaign film sits inside the shopping journey—not above it,
              below it, or behind a pop-up.
            </p>
            <a
              className="pill-button"
              href="https://www.tactlifestyle.store/collections"
            >
              Explore all collections <ArrowIcon />
            </a>
          </div>
        </section>

        <section className="newsletter">
          <p className="eyebrow eyebrow--light">Members get first look</p>
          <h2>10% off your first flex.</h2>
          {signedUp ? (
            <p className="newsletter-success" role="status">
              You&apos;re on the list. Welcome to TACT.
            </p>
          ) : (
            <form onSubmit={handleNewsletter}>
              <label className="sr-only" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="YOUR EMAIL ADDRESS"
                required
              />
              <button type="submit">
                Join the list <ArrowIcon />
              </button>
            </form>
          )}
        </section>
      </main>

      <footer className="footer">
        <div className="footer-brand">
          <img src="/assets/logo-white.png" alt="TACT Lifestyle" />
          <p>Wear your flex.</p>
        </div>
        <div className="footer-links">
          <div>
            <h3>Shop</h3>
            <a href="https://www.tactlifestyle.store/collections/neon-rush">
              Neon Rush
            </a>
            <a href="https://www.tactlifestyle.store/collections/signature">
              Signature
            </a>
            <a href="https://www.tactlifestyle.store/collections/hoodies">
              Hoodies
            </a>
          </div>
          <div>
            <h3>Info</h3>
            <a href="https://www.tactlifestyle.store/pages/about-us">About</a>
            <a href="https://www.tactlifestyle.store/pages/contact">Contact</a>
            <a href="https://www.tactlifestyle.store/policies/shipping-policy">
              Shipping
            </a>
          </div>
          <div>
            <h3>Follow</h3>
            <a href="https://www.instagram.com/tactlifestyle/">Instagram</a>
            <a href="https://www.youtube.com/@tactlifestyle">YouTube</a>
            <a href="mailto:info@tactlifestyle.store">
              info@tactlifestyle.store
            </a>
          </div>
        </div>
        <div className="footer-base">
          <span>© 2026 TACT Lifestyle</span>
          <span>Storefront concept / all media belongs to TACT</span>
        </div>
      </footer>

      <div
        className={`drawer-backdrop ${menuOpen || searchOpen || bagOpen ? "is-open" : ""}`}
        onClick={() => {
          setMenuOpen(false);
          setSearchOpen(false);
          setBagOpen(false);
        }}
        aria-hidden="true"
      />

      <aside
        className={`drawer drawer--left ${menuOpen ? "is-open" : ""}`}
        aria-hidden={!menuOpen}
      >
        <div className="drawer-header">
          <span>Menu</span>
          <button
            className="icon-button"
            type="button"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          >
            <CloseIcon />
          </button>
        </div>
        <nav className="drawer-nav">
          <a href="#new" onClick={() => setMenuOpen(false)}>
            <small>01</small> New in
          </a>
          <a href="https://www.tactlifestyle.store/collections/men">
            <small>02</small> Men
          </a>
          <a href="https://www.tactlifestyle.store/collections/women">
            <small>03</small> Women
          </a>
          <a href="https://www.tactlifestyle.store/collections/unisex">
            <small>04</small> Unisex
          </a>
          <a href="#collections" onClick={() => setMenuOpen(false)}>
            <small>05</small> Collections
          </a>
        </nav>
        <div className="drawer-contact">
          <a href="mailto:info@tactlifestyle.store">
            info@tactlifestyle.store
          </a>
          <a href="tel:+919893789469">+91 98937 89469</a>
        </div>
      </aside>

      <aside
        className={`drawer drawer--right search-drawer ${searchOpen ? "is-open" : ""}`}
        aria-hidden={!searchOpen}
      >
        <div className="drawer-header">
          <span>Search the edit</span>
          <button
            className="icon-button"
            type="button"
            aria-label="Close search"
            onClick={() => setSearchOpen(false)}
          >
            <CloseIcon />
          </button>
        </div>
        <div className="search-field">
          <SearchIcon />
          <input
            type="search"
            placeholder="TRY “OVERSIZED”"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div className="search-results">
          {filteredProducts.map((product) => (
            <a href={product.href} key={product.name}>
              <img src={product.image} alt="" />
              <span>
                {product.name}
                <small>{money.format(product.price)}</small>
              </span>
            </a>
          ))}
        </div>
      </aside>

      <aside
        className={`drawer drawer--right bag-drawer ${bagOpen ? "is-open" : ""}`}
        aria-hidden={!bagOpen}
      >
        <div className="drawer-header">
          <span>Concept bag ({bag.length})</span>
          <button
            className="icon-button"
            type="button"
            aria-label="Close bag"
            onClick={() => setBagOpen(false)}
          >
            <CloseIcon />
          </button>
        </div>
        {bag.length === 0 ? (
          <div className="empty-bag">
            <p>Your bag is ready for a new mood.</p>
            <button
              type="button"
              className="pill-button"
              onClick={() => {
                setBagOpen(false);
                document.querySelector("#new")?.scrollIntoView();
              }}
            >
              Shop the edit <ArrowIcon />
            </button>
          </div>
        ) : (
          <>
            <div className="bag-items">
              {bag.map((product, index) => (
                <div className="bag-item" key={`${product.name}-${index}`}>
                  <img src={product.image} alt="" />
                  <div>
                    <p>{product.name}</p>
                    <span>{money.format(product.price)}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setBag((current) =>
                          current.filter((_, itemIndex) => itemIndex !== index),
                        )
                      }
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="bag-summary">
              <p>
                Subtotal <span>{money.format(bagTotal)}</span>
              </p>
              <a
                className="pill-button"
                href="https://www.tactlifestyle.store/cart"
              >
                Continue on live store <ArrowIcon />
              </a>
              <small>
                This is a design demo. Checkout continues on the current TACT
                store.
              </small>
            </div>
          </>
        )}
      </aside>

      <div className={`toast ${notice ? "is-visible" : ""}`} role="status">
        {notice}
      </div>
    </>
  );
}
