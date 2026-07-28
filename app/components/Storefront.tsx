"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FormEvent,
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { featuredCollections, money, Product, products } from "../data";
import {
  Arrow,
  Bag,
  Close,
  Heart,
  Home,
  Menu,
  Moon,
  Plus,
  Search,
  Sun,
  User,
} from "./Icons";

type CartLine = {
  product: Product;
  size: string;
  quantity: number;
};

type StoreContextValue = {
  cart: CartLine[];
  cartCount: number;
  cartSubtotal: number;
  addToCart: (product: Product, size?: string, quantity?: number) => void;
  updateCartLine: (index: number, amount: number) => void;
  wishlist: string[];
  wishlistCount: number;
  isWishlisted: (product: Product) => boolean;
  toggleWishlist: (product: Product) => void;
  openCart: () => void;
  openSearch: () => void;
  openWishlist: () => void;
};

const StoreContext = createContext<StoreContextValue | null>(null);

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used inside StorefrontShell");
  }
  return context;
}

export function StorefrontShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [headerHidden, setHeaderHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [accountStep, setAccountStep] = useState<"phone" | "code">("phone");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [storeReady, setStoreReady] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const lastScrollY = useRef(0);

  useEffect(() => {
    try {
      const savedCart = JSON.parse(
        window.localStorage.getItem("tact-cart") ?? "[]",
      ) as Array<{ handle: string; size: string; quantity: number }>;
      const savedWishlist = JSON.parse(
        window.localStorage.getItem("tact-wishlist") ?? "[]",
      ) as string[];
      const savedTheme = window.localStorage.getItem("tact-theme");

      setCart(
        savedCart.flatMap((line) => {
          const product = products.find((item) => item.handle === line.handle);
          return product ? [{ ...line, product }] : [];
        }),
      );
      setWishlist(savedWishlist);
      setDarkMode(
        savedTheme
          ? savedTheme === "dark"
          : window.matchMedia("(prefers-color-scheme: dark)").matches,
      );
    } catch {
      window.localStorage.removeItem("tact-cart");
      window.localStorage.removeItem("tact-wishlist");
    }
    setStoreReady(true);
  }, []);

  useEffect(() => {
    if (!storeReady) return;
    window.localStorage.setItem(
      "tact-cart",
      JSON.stringify(
        cart.map(({ product, size, quantity }) => ({
          handle: product.handle,
          size,
          quantity,
        })),
      ),
    );
  }, [cart, storeReady]);

  useEffect(() => {
    if (!storeReady) return;
    window.localStorage.setItem("tact-wishlist", JSON.stringify(wishlist));
  }, [storeReady, wishlist]);

  useEffect(() => {
    if (!storeReady) return;
    document.documentElement.dataset.theme = darkMode ? "dark" : "light";
    window.localStorage.setItem("tact-theme", darkMode ? "dark" : "light");
  }, [darkMode, storeReady]);

  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastScrollY.current;

      setScrolled(currentY > 42);
      if (currentY < 90 || delta < -7) {
        setHeaderHidden(false);
      } else if (delta > 7 && currentY > 130) {
        setHeaderHidden(true);
      }
      lastScrollY.current = currentY;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
    setWishlistOpen(false);
    setAccountOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.classList.toggle(
      "has-overlay",
      menuOpen || searchOpen || cartOpen || wishlistOpen || accountOpen,
    );
    return () => document.body.classList.remove("has-overlay");
  }, [menuOpen, searchOpen, cartOpen, wishlistOpen, accountOpen]);

  const cartCount = cart.reduce((count, line) => count + line.quantity, 0);
  const subtotal = cart.reduce(
    (sum, line) => sum + line.product.price * line.quantity,
    0,
  );
  const shippingTarget = 499;
  const shippingProgress = Math.min(100, (subtotal / shippingTarget) * 100);
  const overlayActive =
    menuOpen || searchOpen || cartOpen || wishlistOpen || accountOpen;
  const overlayHeader = pathname === "/" && !scrolled && !menuOpen;
  const menuPromo =
    products.find((product) => product.handle === "pacman-oversized-tee-mocha") ??
    products[0];
  const cartSuggestions = products
    .filter(
      (product) =>
        !cart.some((line) => line.product.handle === product.handle),
    )
    .slice(0, 5);
  const wishlistProducts = wishlist
    .map((handle) => products.find((product) => product.handle === handle))
    .filter((product): product is Product => Boolean(product));

  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return products.slice(0, 4);
    return products.filter((product) =>
      [product.name, product.category, product.color]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [searchQuery]);

  function closeAll() {
    setMenuOpen(false);
    setSearchOpen(false);
    setCartOpen(false);
    setWishlistOpen(false);
    setAccountOpen(false);
  }

  function openAccount() {
    setAccountStep("phone");
    setAccountOpen(true);
  }

  function addToCart(
    product: Product,
    size = product.sizes[0],
    quantity = 1,
  ) {
    setCart((current) => {
      const match = current.find(
        (line) => line.product.handle === product.handle && line.size === size,
      );
      if (match) {
        return current.map((line) =>
          line === match
            ? { ...line, quantity: line.quantity + quantity }
            : line,
        );
      }
      return [...current, { product, size, quantity }];
    });
    setCartOpen(true);
  }

  function updateQuantity(index: number, amount: number) {
    setCart((current) =>
      current
        .map((line, lineIndex) =>
          lineIndex === index
            ? { ...line, quantity: line.quantity + amount }
            : line,
        )
        .filter((line) => line.quantity > 0),
    );
  }

  function toggleWishlist(product: Product) {
    setWishlist((current) =>
      current.includes(product.handle)
        ? current.filter((handle) => handle !== product.handle)
        : [...current, product.handle],
    );
  }

  const storeValue = {
    cart,
    cartCount,
    cartSubtotal: subtotal,
    addToCart,
    updateCartLine: updateQuantity,
    wishlist,
    wishlistCount: wishlist.length,
    isWishlisted: (product: Product) => wishlist.includes(product.handle),
    toggleWishlist,
    openCart: () => setCartOpen(true),
    openSearch: () => setSearchOpen(true),
    openWishlist: () => setWishlistOpen(true),
  };

  return (
    <StoreContext.Provider value={storeValue}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <aside className="announcement-bar" aria-label="Store announcements">
        <div className="announcement-track">
          {Array.from({ length: 2 }).map((_, group) => (
            <div
              className="announcement-group"
              aria-hidden={group > 0}
              key={group}
            >
              <span>Free delivery over ₹499</span>
              <i aria-hidden="true">•</i>
              <span>Extra 5% off prepaid orders</span>
              <i aria-hidden="true">•</i>
              <span>New drops from TACT</span>
              <i aria-hidden="true">•</i>
            </div>
          ))}
        </div>
      </aside>

      <header
        className={`site-header ${overlayHeader ? "is-over-hero" : "is-solid"} ${
          headerHidden && !overlayActive ? "is-hidden" : ""
        }`}
      >
        <nav className="header-links" aria-label="Primary navigation">
          <Link href="/collections/all?collection=new-arrivals">New in</Link>
          <Link href="/collections/all?collection=men">Men</Link>
          <Link href="/collections/all?collection=shop-womens">Women</Link>
          <button type="button" onClick={() => setMenuOpen(true)}>
            Collections
          </button>
        </nav>

        <button
          className="header-menu-trigger mobile-only"
          type="button"
          aria-label="Open menu"
          onClick={() => setMenuOpen(true)}
        >
          <Menu />
        </button>

        <Link className="site-logo" href="/" aria-label="TACT Lifestyle home">
          <img
            src={
              overlayHeader
                ? "/assets/logo-white.png"
                : "/assets/logo-black.png"
            }
            alt="TACT Lifestyle"
          />
        </Link>

        <div className="header-actions">
          <button
            type="button"
            aria-label="Search"
            onClick={() => setSearchOpen(true)}
          >
            <Search />
          </button>
          <button
            className="header-theme-toggle"
            type="button"
            aria-label={`Use ${darkMode ? "light" : "dark"} mode`}
            onClick={() => setDarkMode((current) => !current)}
          >
            {darkMode ? <Sun /> : <Moon />}
          </button>
          <button type="button" aria-label="Account" onClick={openAccount}>
            <User />
          </button>
          <button
            className="header-wishlist"
            type="button"
            aria-label={`Open wishlist with ${wishlist.length} items`}
            onClick={() => setWishlistOpen(true)}
          >
            <Heart />
            {wishlist.length > 0 ? <span>{wishlist.length}</span> : null}
          </button>
          <button
            type="button"
            aria-label={`Open bag with ${cartCount} items`}
            onClick={() => setCartOpen(true)}
          >
            <Bag />
            {cartCount > 0 ? <span>{cartCount}</span> : null}
          </button>
          <button
            className="desktop-menu-trigger"
            type="button"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
          >
            <Menu />
          </button>
        </div>
      </header>

      {children}

      <Footer />

      <button
        className={`overlay-scrim ${overlayActive ? "is-visible" : ""}`}
        aria-label="Close overlay"
        type="button"
        onClick={closeAll}
      />

      <section
        className={`mega-menu ${menuOpen ? "is-open" : ""}`}
        aria-hidden={!menuOpen}
      >
        <div className="mega-menu-bar">
          <Link className="mega-logo" href="/" onClick={closeAll}>
            <img src="/assets/logo-black.png" alt="TACT Lifestyle" />
          </Link>
          <button type="button" aria-label="Close menu" onClick={closeAll}>
            <Close />
          </button>
        </div>

        <div className="mega-menu-content">
          <nav className="mega-primary" aria-label="Shop">
            <Link href="/collections/all?collection=new-arrivals" onClick={closeAll}>
              <small>01</small>
              New arrivals
            </Link>
            <Link href="/collections/all?collection=men" onClick={closeAll}>
              <small>02</small>
              Men
            </Link>
            <Link href="/collections/all?collection=shop-womens" onClick={closeAll}>
              <small>03</small>
              Women
            </Link>
            <Link href="/collections/all?collection=unisex" onClick={closeAll}>
              <small>04</small>
              Unisex
            </Link>
          </nav>

          <div className="mega-secondary">
            <div>
              <p>Explore</p>
              <Link href="/collections/all" onClick={closeAll}>
                Shop all
              </Link>
              <Link href="/collections/all?collection=co-ord-set-women" onClick={closeAll}>
                Co-ords
              </Link>
              <Link href="/collections/all?collection=tact-joggers-men" onClick={closeAll}>
                Joggers
              </Link>
              <Link href="/collections/all?collection=hoodies-men" onClick={closeAll}>
                Hoodies
              </Link>
              <Link href="/pages/about-us" onClick={closeAll}>
                About us
              </Link>
              <Link href="/pages/contact" onClick={closeAll}>
                Contact
              </Link>
            </div>
            <div>
              <p>Customer care</p>
              <Link href="/pages/faq" onClick={closeAll}>
                FAQ
              </Link>
              <Link href="/policies/shipping-policy" onClick={closeAll}>
                Shipping
              </Link>
              <Link href="/policies/refund-policy" onClick={closeAll}>
                Returns & exchange
              </Link>
              <a href="https://www.tactlifestyle.store/pages/track-your-order">
                Track your order
              </a>
              <button
                className="menu-theme-toggle"
                type="button"
                onClick={() => setDarkMode((current) => !current)}
              >
                {darkMode ? <Sun /> : <Moon />}
                {darkMode ? "Light mode" : "Dark mode"}
              </button>
            </div>
            <div className="menu-feature">
              <img
                src={menuPromo.images[0]}
                alt={menuPromo.name}
              />
              <Link
                href={`/products/${menuPromo.handle}`}
                onClick={closeAll}
              >
                <span>
                  <small>Latest from TACT</small>
                  8-Bit Attitude
                </span>
                <Arrow />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <aside
        className={`side-drawer search-drawer ${searchOpen ? "is-open" : ""}`}
        aria-hidden={!searchOpen}
      >
        <div className="drawer-heading">
          <span>Search TACT</span>
          <button type="button" aria-label="Close search" onClick={closeAll}>
            <Close />
          </button>
        </div>
        <label className="search-input">
          <Search />
          <input
            type="search"
            placeholder="Search products"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            autoFocus={searchOpen}
          />
        </label>
        <div className="drawer-results">
          <p>{searchQuery ? "Results" : "Popular now"}</p>
          {searchResults.map((product) => (
            <Link
              href={`/products/${product.handle}`}
              key={product.handle}
              onClick={closeAll}
            >
              <img src={product.images[0]} alt="" />
              <span>
                {product.name}
                <small>{money.format(product.price)}</small>
              </span>
              <Arrow />
            </Link>
          ))}
          {searchResults.length === 0 ? (
            <div className="empty-search">No pieces match that search.</div>
          ) : null}
        </div>
      </aside>

      <aside
        className={`side-drawer wishlist-drawer ${
          wishlistOpen ? "is-open" : ""
        }`}
        aria-hidden={!wishlistOpen}
      >
        <div className="drawer-heading">
          <span>Saved pieces ({wishlist.length})</span>
          <button type="button" aria-label="Close wishlist" onClick={closeAll}>
            <Close />
          </button>
        </div>
        {wishlistProducts.length ? (
          <div className="wishlist-lines">
            {wishlistProducts.map((product) => (
              <article className="wishlist-line" key={product.handle}>
                <Link href={`/products/${product.handle}`} onClick={closeAll}>
                  <img src={product.images[0]} alt="" />
                  <span>
                    <strong>{product.name}</strong>
                    <small>{money.format(product.price)}</small>
                  </span>
                </Link>
                <button
                  type="button"
                  aria-label={`Remove ${product.name} from wishlist`}
                  onClick={() => toggleWishlist(product)}
                >
                  <Close />
                </button>
              </article>
            ))}
          </div>
        ) : (
          <div className="wishlist-empty">
            <Heart size={28} />
            <h2>Save it for the next rotation.</h2>
            <p>Tap the heart on any piece to keep it close.</p>
            <Link
              className="button button-dark"
              href="/collections/all"
              onClick={closeAll}
            >
              Explore the collection <Arrow />
            </Link>
          </div>
        )}
      </aside>

      <aside
        className={`side-drawer cart-drawer ${cartOpen ? "is-open" : ""}`}
        aria-hidden={!cartOpen}
      >
        <div className="drawer-heading">
          <span>Your bag ({cartCount})</span>
          <button type="button" aria-label="Close bag" onClick={closeAll}>
            <Close />
          </button>
        </div>
        {cart.length ? (
          <div className="shipping-progress">
            <p>
              {subtotal >= shippingTarget
                ? "Free shipping unlocked."
                : `${money.format(shippingTarget - subtotal)} away from free shipping.`}
            </p>
            <span>
              <i style={{ width: `${shippingProgress}%` }} />
            </span>
          </div>
        ) : null}

        {cart.length === 0 ? (
          <div className="empty-cart empty-cart-showcase">
            <div className="empty-cart-intro">
              <h2>Your bag is empty.</h2>
              <p>Let&apos;s find your next everyday flex.</p>
              <Link href="/collections/all" onClick={closeAll}>
                Shop now <Arrow />
              </Link>
            </div>
            <section className="empty-cart-products">
              <h3>Pieces you may like</h3>
              <div>
                {cartSuggestions.map((product) => (
                  <Link
                    href={`/products/${product.handle}`}
                    key={product.handle}
                    onClick={closeAll}
                  >
                    <img src={product.images[0]} alt={product.name} />
                  </Link>
                ))}
              </div>
            </section>
            <section className="empty-cart-collections">
              <h3>Collections</h3>
              {featuredCollections.slice(0, 4).map((collection) => (
                <Link
                  href={`/collections/all?collection=${collection.handle}`}
                  key={collection.handle}
                  onClick={closeAll}
                >
                  {collection.image ? (
                    <img src={collection.image} alt="" />
                  ) : null}
                  <span>{collection.name}</span>
                  <Arrow />
                </Link>
              ))}
            </section>
          </div>
        ) : (
          <>
            <div className="cart-lines">
              {cart.map((line, index) => (
                <article
                  className="cart-line"
                  key={`${line.product.handle}-${line.size}`}
                >
                  <img src={line.product.images[0]} alt="" />
                  <div>
                    <h3>{line.product.name}</h3>
                    <p>Size {line.size}</p>
                    <strong>{money.format(line.product.price)}</strong>
                    <div className="quantity-stepper">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        onClick={() => updateQuantity(index, -1)}
                      >
                        −
                      </button>
                      <span>{line.quantity}</span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() => updateQuantity(index, 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <section className="cart-upsell">
              <div className="cart-upsell-heading">
                <span>Pairs well with</span>
                <small>Quick add</small>
              </div>
              <div className="cart-upsell-rail">
                {cartSuggestions.slice(0, 3).map((product) => (
                  <article key={product.handle}>
                    <Link href={`/products/${product.handle}`} onClick={closeAll}>
                      <img src={product.images[0]} alt="" />
                      <span>
                        <strong>{product.name}</strong>
                        <small>{money.format(product.price)}</small>
                      </span>
                    </Link>
                    <button
                      type="button"
                      aria-label={`Add ${product.name}`}
                      onClick={() => addToCart(product)}
                    >
                      <Plus /> Add
                    </button>
                  </article>
                ))}
              </div>
            </section>
            <div className="cart-summary">
              <p>
                Subtotal <strong>{money.format(subtotal)}</strong>
              </p>
              <a
                className="button button-dark"
                href="https://www.tactlifestyle.store/cart"
              >
                Continue to checkout <Arrow />
              </a>
              <small>Taxes included. Shipping calculated at checkout.</small>
            </div>
          </>
        )}
      </aside>

      <section
        className={`account-modal ${accountOpen ? "is-open" : ""}`}
        aria-hidden={!accountOpen}
        aria-modal="true"
        role="dialog"
        aria-labelledby="account-modal-title"
      >
        <button
          className="account-modal-close"
          type="button"
          aria-label="Close account login"
          onClick={closeAll}
        >
          <Close />
        </button>
        <img src="/assets/logo-black.png" alt="TACT Lifestyle" />
        {accountStep === "phone" ? (
          <>
            <p className="kicker">Member access</p>
            <h2 id="account-modal-title">Login now to avail 10% off.</h2>
            <p className="account-modal-copy">
              Sign in to track orders, save addresses and move through checkout
              faster.
            </p>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                setAccountStep("code");
              }}
            >
              <label htmlFor="account-phone">Mobile number</label>
              <div className="account-phone-field">
                <span>🇮🇳 +91</span>
                <input
                  id="account-phone"
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]{10}"
                  placeholder="Enter 10-digit number"
                  required
                />
              </div>
              <label className="account-consent">
                <input type="checkbox" name="marketing" />
                Notify me about drops, offers and restocks
              </label>
              <button className="button button-dark" type="submit">
                Continue <Arrow />
              </button>
            </form>
            <p className="account-legal">
              By continuing, you agree to TACT&apos;s{" "}
              <Link href="/policies/privacy-policy" onClick={closeAll}>
                Privacy Policy
              </Link>{" "}
              and terms.
            </p>
            <Link className="account-full-link" href="/account/login" onClick={closeAll}>
              Open full login
            </Link>
          </>
        ) : (
          <>
            <p className="kicker">One last step</p>
            <h2 id="account-modal-title">Enter your secure code.</h2>
            <p className="account-modal-copy">
              In Shopify, the connected customer-account or KiwiPass app sends
              this code to the customer.
            </p>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                closeAll();
              }}
            >
              <label htmlFor="account-code">Six-digit code</label>
              <input
                className="account-code-field"
                id="account-code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                placeholder="000000"
                required
              />
              <button className="button button-dark" type="submit">
                Sign in <Arrow />
              </button>
              <button
                className="account-back"
                type="button"
                onClick={() => setAccountStep("phone")}
              >
                Change number
              </button>
            </form>
          </>
        )}
      </section>

      {!pathname.startsWith("/products/") ? (
        <nav className="mobile-dock" aria-label="Mobile navigation">
          <Link
            className={pathname === "/" ? "is-active" : ""}
            href="/"
            aria-label="Home"
          >
            <Home />
            <span>Home</span>
          </Link>
          <button type="button" aria-label="Search" onClick={() => setSearchOpen(true)}>
            <Search />
            <span>Search</span>
          </button>
          <button
            type="button"
            aria-label="Wishlist"
            onClick={() => setWishlistOpen(true)}
          >
            <Heart />
            {wishlist.length ? <i>{wishlist.length}</i> : null}
            <span>Saved</span>
          </button>
          <button type="button" aria-label="Account" onClick={openAccount}>
            <User />
            <span>Account</span>
          </button>
          <button type="button" aria-label="Open bag" onClick={() => setCartOpen(true)}>
            <Bag />
            {cartCount ? <i>{cartCount}</i> : null}
            <span>Bag{cartCount ? ` · ${cartCount}` : ""}</span>
          </button>
        </nav>
      ) : null}
    </StoreContext.Provider>
  );
}

export function ProductCard({
  product,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {
  const { addToCart, isWishlisted, toggleWishlist } = useStore();
  const cardSizes = Array.from(
    new Set(
      product.variants
        .filter((variant) => variant.available)
        .map((variant) => variant.size),
    ),
  );
  const selectableSizes = cardSizes.length
    ? cardSizes
    : product.sizes.length
      ? product.sizes
      : ["One size"];
  const [selectedSize, setSelectedSize] = useState(selectableSizes[0]);
  const [added, setAdded] = useState(false);

  function quickAdd() {
    addToCart(product, selectedSize);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1200);
  }

  return (
    <article className="product-card">
      <div className="product-card-visual">
        <Link
          className="product-card-media"
          href={`/products/${product.handle}`}
          aria-label={`View ${product.name}`}
        >
          {product.tag ? <span className="product-badge">{product.tag}</span> : null}
          <img
            className="product-card-primary"
            src={product.images[0]}
            alt={product.name}
            loading={priority ? "eager" : "lazy"}
          />
          <img
            className="product-card-secondary"
            src={product.images[1] ?? product.images[0]}
            alt=""
            loading="lazy"
          />
        </Link>
        <button
          className={`product-card-wishlist ${
            isWishlisted(product) ? "is-active" : ""
          }`}
          type="button"
          aria-label={`${
            isWishlisted(product) ? "Remove" : "Add"
          } ${product.name} ${isWishlisted(product) ? "from" : "to"} wishlist`}
          aria-pressed={isWishlisted(product)}
          onClick={() => toggleWishlist(product)}
        >
          <Heart />
        </button>
        <div className="product-card-quick">
          <div className="product-card-sizes" aria-label="Choose size">
            {selectableSizes.slice(0, 4).map((size) => (
                <button
                  className={selectedSize === size ? "is-active" : ""}
                  type="button"
                  aria-pressed={selectedSize === size}
                  onClick={() => setSelectedSize(size)}
                  key={size}
                >
                  {size === "One size" ? "OS" : size}
                </button>
              ))}
          </div>
          <button
            className={added ? "is-added" : ""}
            type="button"
            onClick={quickAdd}
            aria-label={`Add ${product.name} in ${selectedSize}`}
          >
            <span>{added ? "Added" : "Add"}</span>
            <i>{added ? "✓" : <Plus />}</i>
          </button>
        </div>
      </div>
      <div className="product-card-info">
        <Link href={`/products/${product.handle}`}>
          <h3>{product.name}</h3>
          <p>
            {product.compareAt ? <s>{money.format(product.compareAt)}</s> : null}
            {money.format(product.price)}
          </p>
          <small>{product.color}</small>
        </Link>
      </div>
    </article>
  );
}

function Footer() {
  const [joined, setJoined] = useState(false);

  function submitNewsletter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setJoined(true);
  }

  return (
    <footer className="site-footer">
      <div className="footer-support">
        <div className="footer-support-heading">
          <p className="kicker">Customer care</p>
          <h2>Help, when you need it.</h2>
        </div>
        <Link href="/pages/faq">
          <span>01</span>
          FAQ <Arrow />
        </Link>
        <Link href="/policies/shipping-policy">
          <span>02</span>
          Shipping <Arrow />
        </Link>
        <Link href="/policies/refund-policy">
          <span>03</span>
          Returns <Arrow />
        </Link>
      </div>

      <div className="footer-main">
        <div className="footer-brand">
          <img src="/assets/logo-white.png" alt="TACT Lifestyle" />
          <h2>Wear your flex.</h2>
          <p>Designed and printed in-house in India since 1989.</p>
        </div>

        <div className="footer-newsletter">
          <p>Drops, restocks and stories—sent first.</p>
          {joined ? (
            <strong>Welcome to TACT.</strong>
          ) : (
            <form onSubmit={submitNewsletter}>
              <label className="sr-only" htmlFor="footer-email">
                Email address
              </label>
              <input
                id="footer-email"
                type="email"
                placeholder="Email address"
                required
              />
              <button type="submit" aria-label="Join newsletter">
                Join <Arrow />
              </button>
            </form>
          )}
          <small>By joining, you agree to receive TACT updates.</small>
        </div>
      </div>

      <div className="footer-navigation">
        <div>
          <h3>Shop</h3>
          <Link href="/collections/all?collection=new-arrivals">New arrivals</Link>
          <Link href="/collections/all?collection=men">Men</Link>
          <Link href="/collections/all?collection=shop-womens">Women</Link>
          <Link href="/collections/all?collection=unisex">Unisex</Link>
        </div>
        <div>
          <h3>Help</h3>
          <Link href="/pages/faq">FAQ</Link>
          <Link href="/policies/shipping-policy">Shipping</Link>
          <Link href="/policies/refund-policy">Returns & exchange</Link>
          <a href="https://www.tactlifestyle.store/pages/track-your-order">
            Track your order
          </a>
        </div>
        <div>
          <h3>TACT</h3>
          <Link href="/pages/about-us">About us</Link>
          <Link href="/pages/contact">Contact</Link>
          <Link href="/policies/privacy-policy">Privacy policy</Link>
        </div>
        <div>
          <h3>Connect</h3>
          <a href="https://www.instagram.com/tactlifestyle/">Instagram</a>
          <a href="mailto:info@tactlifestyle.store">
            info@tactlifestyle.store
          </a>
          <a href="tel:+919893789469">+91 98937 89469</a>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 TACT Lifestyle</span>
        <span>Free delivery over ₹499 / India</span>
      </div>
    </footer>
  );
}
