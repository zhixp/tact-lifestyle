class TactTheme {
  constructor() {
    this.header = document.querySelector("[data-site-header]");
    this.menu = document.querySelector("[data-menu]");
    this.overlay = document.querySelector("[data-overlay]");
    this.sizeGuide = document.querySelector("[data-size-guide]");
    this.sizeOverlay = document.querySelector(".t-size-overlay");
    this.cartDrawer = document.querySelector("[data-cart-drawer]");
    this.cartOverlay = document.querySelector(".t-cart-drawer-overlay");
    this.mobileDock = document.querySelector("[data-mobile-dock]");
    this.dockIdleTimer = null;
    this.designMode =
      window.Shopify?.designMode === true ||
      document.documentElement.dataset.designMode === "true";
    this.lastScrollY = window.scrollY;
    this.bind();
    this.bindStoryVideos();
    this.bindCategoryDecks();
    this.bindHeroCarousels();
    this.bindHeroVideos();
    this.bindReviewStories();
    this.bindVideoQuickAdd();
    this.bindProductForms();
    this.bindCartDrawer();
    this.bindWishlist();
    this.bindProductCardMotion();
    this.bindRevealMotion();
    this.bindThemeMode();
    this.bindMobileDock();
    this.hydrateCart();
    this.onScroll();
  }

  shopifyPath(path) {
    const root = window.Shopify?.routes?.root || "/";
    return `${root}${String(path || "").replace(/^\/+/, "")}`;
  }

  async requestJson(path, options = {}, timeoutMs = 10000) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(this.shopifyPath(path), {
        ...options,
        headers: { Accept: "application/json", ...options.headers },
        signal: controller.signal,
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        const error = new Error(payload?.description || payload?.message || "The request could not be completed.");
        error.status = response.status;
        throw error;
      }
      return payload;
    } finally {
      window.clearTimeout(timeout);
    }
  }

  safeStoreUrl(value, fallback = "#") {
    try {
      const url = new URL(String(value || ""), window.location.origin);
      if (url.origin !== window.location.origin) return fallback;
      return `${url.pathname}${url.search}${url.hash}`;
    } catch {
      return fallback;
    }
  }

  safeImageUrl(value) {
    try {
      const url = new URL(String(value || ""), window.location.origin);
      if (url.protocol !== "https:" && url.origin !== window.location.origin) return "";
      return url.href;
    } catch {
      return "";
    }
  }

  normalizeWishlistItem(candidate) {
    if (!candidate || typeof candidate !== "object") return null;
    const handle = String(candidate.handle || "").trim().toLowerCase();
    if (!/^[a-z0-9][a-z0-9-]{0,254}$/.test(handle)) return null;
    return {
      handle,
      title: String(candidate.title || "").trim().slice(0, 160),
      price: String(candidate.price || "").trim().slice(0, 48),
      url: this.safeStoreUrl(candidate.url, `/products/${handle}`),
      image: this.safeImageUrl(candidate.image),
    };
  }

  bind() {
    window.addEventListener("scroll", () => this.onScroll(), { passive: true });

    document.querySelectorAll("[data-menu-open]").forEach((button) => {
      button.addEventListener("click", () => this.openMenu());
    });
    document.querySelectorAll("[data-menu-close], [data-overlay]").forEach((button) => {
      button.addEventListener("click", () => this.closeMenu());
    });
    document.querySelectorAll("[data-size-guide-open]").forEach((button) => {
      button.addEventListener("click", () => this.openSizeGuide());
    });
    document.querySelectorAll("[data-size-guide-close]").forEach((button) => {
      button.addEventListener("click", () => this.closeSizeGuide());
    });
    document.querySelectorAll(".t-variant-list input").forEach((input) => {
      input.addEventListener("change", (event) => this.updateVariant(event.target));
    });
    document.querySelectorAll("[data-quantity-minus]").forEach((button) => {
      button.addEventListener("click", () => this.changeQuantity(button, -1));
    });
    document.querySelectorAll("[data-quantity-plus]").forEach((button) => {
      button.addEventListener("click", () => this.changeQuantity(button, 1));
    });
    document.querySelectorAll("[data-product-tab]").forEach((button) => {
      button.addEventListener("click", () => this.changeProductTab(button));
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        this.closeMenu();
        this.closeSizeGuide();
        this.closeWishlist();
        this.closeCart();
      }
    });
  }

  onScroll() {
    const currentY = window.scrollY;
    const delta = currentY - this.lastScrollY;
    if (this.header) {
      this.header.classList.toggle("is-scrolled", currentY > 42);
      if (currentY < 90 || delta < -7) {
        this.header.classList.remove("is-hidden");
      } else if (
        delta > 7 &&
        currentY > 130 &&
        this.header.dataset.hideOnScroll !== "false" &&
        !document.body.classList.contains("t-overlay-open")
      ) {
        this.header.classList.add("is-hidden");
      }
    }
    this.updateMobileDock(currentY, delta);
    this.lastScrollY = currentY;
  }

  bindMobileDock() {
    this.mobileDock = document.querySelector("[data-mobile-dock]");
    if (!this.mobileDock || this.mobileDock.dataset.dockBound === "true") return;
    this.mobileDock.dataset.dockBound = "true";

    const expand = () => {
      window.clearTimeout(this.dockIdleTimer);
      this.mobileDock.classList.remove("is-compact");
    };
    const settle = () => {
      window.clearTimeout(this.dockIdleTimer);
      this.dockIdleTimer = window.setTimeout(() => {
        if (window.scrollY > 72 && !document.body.classList.contains("t-overlay-open")) {
          this.mobileDock?.classList.add("is-compact");
        }
      }, 1100);
    };

    this.mobileDock.addEventListener("pointerenter", expand);
    this.mobileDock.addEventListener("pointerleave", settle);
    this.mobileDock.addEventListener("focusin", expand);
    this.mobileDock.addEventListener("focusout", settle);
    this.mobileDock.addEventListener("pointerdown", (event) => {
      expand();
      const item = event.target.closest("a, button");
      if (!item) return;
      item.classList.add("is-pressed");
      window.setTimeout(() => item.classList.remove("is-pressed"), 180);
    });
  }

  updateMobileDock(currentY, delta) {
    if (!this.mobileDock) return;
    if (currentY < 72 || delta < -5 || document.body.classList.contains("t-overlay-open")) {
      this.mobileDock.classList.remove("is-compact");
    } else if (delta > 4) {
      this.mobileDock.classList.add("is-compact");
    }
  }

  bindStoryVideos() {
    document.querySelectorAll("[data-video-stories]").forEach((section) => {
      if (section.dataset.videoBound === "true") return;
      section.dataset.videoBound = "true";

      const rail = section.querySelector("[data-video-rail]");
      const videos = section.querySelectorAll(".t-video-story__video");
      if (!this.designMode && "IntersectionObserver" in window) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.play().catch(() => {});
              } else {
                entry.target.pause();
              }
            });
          },
          { threshold: 0.62 },
        );
        videos.forEach((video) => observer.observe(video));
      } else {
        videos.forEach((video) => video.pause());
      }

      const scrollRail = (direction) => {
        if (!rail) return;
        rail.scrollBy({
          left: direction * Math.max(280, rail.clientWidth * 0.72),
          behavior: "smooth",
        });
      };
      const edgeBack = section.querySelector("[data-video-edge-prev]");
      const edgeNext = section.querySelector("[data-video-edge-next]");
      const updateEdges = () => {
        if (!rail) return;
        const back = rail.scrollLeft > 8;
        const next = rail.scrollLeft + rail.clientWidth < rail.scrollWidth - 8;
        edgeBack?.classList.toggle("is-visible", back);
        edgeNext?.classList.toggle("is-visible", next);
        edgeBack?.setAttribute("aria-hidden", String(!back));
        edgeNext?.setAttribute("aria-hidden", String(!next));
      };
      section.querySelector("[data-video-rail-prev]")?.addEventListener("click", () => scrollRail(-1));
      section.querySelector("[data-video-rail-next]")?.addEventListener("click", () => scrollRail(1));
      edgeBack?.addEventListener("click", () => scrollRail(-1));
      edgeNext?.addEventListener("click", () => scrollRail(1));
      rail?.addEventListener("scroll", updateEdges, { passive: true });
      window.addEventListener("resize", updateEdges, { passive: true });
      updateEdges();
      rail?.addEventListener("keydown", (event) => {
        if (event.key === "ArrowLeft") scrollRail(-1);
        if (event.key === "ArrowRight") scrollRail(1);
      });

      section.querySelectorAll("[data-video-toggle]").forEach((button) => {
        const video = button.closest(".t-video-story")?.querySelector("video");
        if (!video) return;
        const sync = () => {
          const paused = video.paused;
          const playIcon = button.querySelector("[data-video-play]");
          const pauseIcon = button.querySelector("[data-video-pause]");
          if (playIcon) playIcon.hidden = !paused;
          if (pauseIcon) pauseIcon.hidden = paused;
          button.setAttribute("aria-label", `${paused ? "Play" : "Pause"} video`);
        };
        button.addEventListener("click", () => {
          if (video.paused) video.play().catch(() => {});
          else video.pause();
        });
        video.addEventListener("play", sync);
        video.addEventListener("pause", sync);
        sync();
      });
    });
  }

  bindHeroVideos() {
    document.querySelectorAll("[data-hero-speed]").forEach((hero) => {
      if (hero.dataset.heroBound === "true") return;
      hero.dataset.heroBound = "true";
      const speed = Math.min(2, Math.max(0.5, Number(hero.dataset.heroSpeed || 1)));
      hero.querySelectorAll("video").forEach((video) => {
        if (this.designMode) video.pause();
        const applySpeed = () => {
          video.defaultPlaybackRate = speed;
          video.playbackRate = speed;
        };
        applySpeed();
        video.addEventListener("loadedmetadata", applySpeed);
      });
    });
  }

  bindHeroCarousels() {
    document.querySelectorAll("[data-hero-carousel]").forEach((carousel) => {
      if (carousel.dataset.carouselBound === "true") return;
      carousel.dataset.carouselBound = "true";

      const slides = Array.from(carousel.querySelectorAll("[data-hero-slide]"));
      const dots = Array.from(carousel.querySelectorAll("[data-hero-dot]"));
      const counter = carousel.querySelector("[data-hero-counter]");
      const duration = Math.max(3000, Number(carousel.dataset.heroDuration || 7000));
      const autoplay =
        !this.designMode &&
        carousel.dataset.heroAutoplay === "true" &&
        slides.length > 1;
      let active = 0;
      let timer;
      let touchStart = 0;

      carousel.style.setProperty("--hero-slide-duration", `${duration}ms`);

      const show = (index) => {
        active = (index + slides.length) % slides.length;
        carousel.dataset.activeTone = slides[active]?.dataset.headerTone || "light";
        carousel.dataset.activeMobileTone =
          slides[active]?.dataset.mobileHeaderTone ||
          carousel.dataset.activeTone;
        if (this.header) {
          this.header.dataset.heroTone = carousel.dataset.activeTone;
          this.header.dataset.mobileHeroTone = carousel.dataset.activeMobileTone;
        }
        slides.forEach((slide, slideIndex) => {
          const selected = slideIndex === active;
          slide.classList.toggle("is-active", selected);
          slide.setAttribute("aria-hidden", String(!selected));
          slide.querySelectorAll("video").forEach((video) => {
            if (selected && !this.designMode) video.play().catch(() => {});
            else video.pause();
          });
        });
        dots.forEach((dot, dotIndex) => {
          dot.classList.toggle("is-active", dotIndex === active);
          if (dotIndex === active) dot.setAttribute("aria-current", "true");
          else dot.removeAttribute("aria-current");
        });
        if (counter) counter.textContent = `${String(active + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;
      };

      const stop = () => {
        window.clearInterval(timer);
        carousel.classList.add("is-paused");
      };
      const start = () => {
        window.clearInterval(timer);
        carousel.classList.remove("is-paused");
        if (autoplay && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          timer = window.setInterval(() => show(active + 1), duration);
        }
      };
      const move = (direction) => {
        show(active + direction);
        start();
      };

      carousel.querySelector("[data-hero-prev]")?.addEventListener("click", () => move(-1));
      carousel.querySelector("[data-hero-next]")?.addEventListener("click", () => move(1));
      dots.forEach((dot, index) => dot.addEventListener("click", () => {
        show(index);
        start();
      }));
      if (carousel.dataset.heroPause === "true") {
        carousel.addEventListener("mouseenter", stop);
        carousel.addEventListener("mouseleave", start);
        carousel.addEventListener("focusin", stop);
        carousel.addEventListener("focusout", start);
      }
      carousel.addEventListener("touchstart", (event) => {
        touchStart = event.changedTouches[0]?.clientX || 0;
      }, { passive: true });
      carousel.addEventListener("touchend", (event) => {
        const distance = (event.changedTouches[0]?.clientX || 0) - touchStart;
        if (Math.abs(distance) > 48) move(distance > 0 ? -1 : 1);
      }, { passive: true });

      show(0);
      start();
    });
  }

  bindReviewStories() {
    document.querySelectorAll("[data-review-stories]").forEach((section) => {
      if (section.dataset.reviewBound === "true") return;
      section.dataset.reviewBound = "true";
      const slides = Array.from(section.querySelectorAll("[data-review-slide]"));
      const dots = Array.from(section.querySelectorAll("[data-review-dot]"));
      if (!slides.length) return;
      let active = 0;
      let timer;

      const show = (index) => {
        active = (index + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
          slide.classList.toggle("is-active", slideIndex === active);
        });
        dots.forEach((dot, dotIndex) => {
          dot.classList.toggle("is-active", dotIndex === active);
          if (dotIndex === active) dot.setAttribute("aria-current", "true");
          else dot.removeAttribute("aria-current");
        });
      };
      const stop = () => window.clearInterval(timer);
      const start = () => {
        stop();
        if (this.designMode) return;
        const interval = Math.max(3000, Number(section.dataset.reviewInterval || 5000));
        timer = window.setInterval(() => show(active + 1), interval);
      };

      section.querySelector("[data-review-prev]")?.addEventListener("click", () => {
        show(active - 1);
        start();
      });
      section.querySelector("[data-review-next]")?.addEventListener("click", () => {
        show(active + 1);
        start();
      });
      dots.forEach((dot, index) => {
        dot.addEventListener("click", () => {
          show(index);
          start();
        });
      });
      section.addEventListener("mouseenter", stop);
      section.addEventListener("mouseleave", start);
      section.addEventListener("focusin", stop);
      section.addEventListener("focusout", start);
      show(0);
      start();
    });
  }

  bindVideoQuickAdd() {
    document.querySelectorAll("[data-quick-add], [data-video-quick-add]").forEach((form) => {
      if (form.dataset.quickAddBound === "true") return;
      form.dataset.quickAddBound = "true";
      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const button = form.querySelector("button");
        if (!button || button.disabled) return;
        const label = button.querySelector("[data-quick-add-label]");
        const status = form.querySelector("[data-quick-add-status]");
        const defaultLabel = label?.textContent || "";
        let resetDelay = 1300;
        const setState = (state, message) => {
          form.classList.remove("is-loading", "is-added", "is-error");
          button.classList.remove("is-loading", "is-added", "is-error");
          form.classList.add(state);
          button.classList.add(state);
          if (label && message) label.textContent = message;
          if (status) status.textContent = message || "";
        };

        button.disabled = true;
        setState("is-loading", "Adding…");
        button.setAttribute("aria-busy", "true");

        try {
          await this.requestJson("cart/add.js", {
            method: "POST",
            body: new FormData(form),
          });

          setState("is-added", "Added");
          button.removeAttribute("aria-busy");
          const cart = await this.fetchCart();
          this.updateCartIndicators(cart);
          document.dispatchEvent(new CustomEvent("tact:cart-updated", { detail: { cart, open: false } }));
        } catch (error) {
          resetDelay = 2400;
          setState("is-error", this.friendlyCartError(error));
        } finally {
          window.setTimeout(() => {
            button.disabled = false;
            form.classList.remove("is-loading", "is-added", "is-error");
            button.classList.remove("is-loading", "is-added", "is-error");
            button.removeAttribute("aria-busy");
            if (label) label.textContent = defaultLabel;
            if (status) status.textContent = "";
          }, resetDelay);
        }
      });
    });
  }

  bindProductForms() {
    document.querySelectorAll(".t-product-form").forEach((form) => {
      if (form.dataset.productFormBound === "true") return;
      form.dataset.productFormBound = "true";

      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const button = form.querySelector('button[name="add"]');
        const label = button?.querySelector("span");
        const message = form.querySelector("[data-product-message]");
        if (!button || button.disabled) return;

        const initialLabel = label?.textContent || "Add to bag";
        button.disabled = true;
        button.classList.add("is-loading");
        button.setAttribute("aria-busy", "true");
        if (label) label.textContent = "Adding…";
        if (message) message.textContent = "";

        try {
          await this.requestJson("cart/add.js", {
            method: "POST",
            body: new FormData(form),
          });

          if (label) label.textContent = "Added";
          button.classList.remove("is-loading");
          button.classList.add("is-added");
          if (message) message.textContent = "Added to your bag.";
          const cart = await this.fetchCart();
          this.updateCartIndicators(cart);
          document.dispatchEvent(new CustomEvent("tact:cart-updated", { detail: { cart, open: false } }));
        } catch (error) {
          button.classList.remove("is-loading");
          button.classList.add("is-error");
          if (label) label.textContent = this.friendlyCartError(error);
          if (message) message.textContent = error?.message || "This item could not be added.";
        } finally {
          button.removeAttribute("aria-busy");
          window.setTimeout(() => {
            button.disabled = false;
            button.classList.remove("is-loading", "is-added", "is-error");
            if (label) label.textContent = initialLabel;
          }, 1800);
        }
      });
    });
  }

  bindCategoryDecks() {
    document.querySelectorAll("[data-category-deck]").forEach((deck) => {
      if (deck.dataset.categoryBound === "true") return;
      deck.dataset.categoryBound = "true";

      const rail = deck.querySelector("[data-category-rail]");
      const progress = deck.querySelector("[data-category-progress]");
      if (!rail) return;

      const update = () => {
        const distance = Math.max(0, rail.scrollWidth - rail.clientWidth);
        const amount = distance ? Math.min(1, rail.scrollLeft / distance) : 1;
        if (progress) progress.style.transform = `scaleX(${Math.max(.12, amount)})`;
        deck.querySelector("[data-category-prev]")?.toggleAttribute("disabled", rail.scrollLeft < 8);
        deck
          .querySelector("[data-category-next]")
          ?.toggleAttribute("disabled", rail.scrollLeft >= distance - 8);
      };
      const move = (direction) => {
        const card = rail.querySelector(".t-collection-tile");
        const distance = card ? card.getBoundingClientRect().width + 12 : rail.clientWidth * .75;
        rail.scrollBy({ left: distance * direction, behavior: "smooth" });
      };

      deck.querySelector("[data-category-prev]")?.addEventListener("click", () => move(-1));
      deck.querySelector("[data-category-next]")?.addEventListener("click", () => move(1));
      rail.addEventListener("scroll", update, { passive: true });
      rail.addEventListener("keydown", (event) => {
        if (event.key === "ArrowLeft") move(-1);
        if (event.key === "ArrowRight") move(1);
      });
      window.addEventListener("resize", update, { passive: true });
      update();
    });
  }

  bindCartDrawer() {
    this.cartDrawer = document.querySelector("[data-cart-drawer]");
    this.cartOverlay = document.querySelector(".t-cart-drawer-overlay");
    if (!this.cartDrawer || document.body.dataset.cartDrawerBound === "true") return;
    document.body.dataset.cartDrawerBound = "true";

    document.addEventListener("click", (event) => {
      const opener = event.target.closest("[data-cart-open]");
      if (opener) {
        event.preventDefault();
        this.openCart(true);
        return;
      }
      if (event.target.closest("[data-cart-close]")) {
        this.closeCart();
        return;
      }
      const quantity = event.target.closest("[data-cart-quantity]");
      if (quantity) {
        const line = quantity.closest("[data-cart-line]");
        const current = Number(line?.querySelector(".t-cart-drawer__quantity b")?.textContent || 1);
        this.changeCartLine(quantity.dataset.cartKey, Math.max(0, current + Number(quantity.dataset.cartQuantity)));
        return;
      }
      const remove = event.target.closest("[data-cart-remove]");
      if (remove) this.changeCartLine(remove.dataset.cartKey, 0);
    });

    document.addEventListener("tact:cart-updated", (event) => {
      const cart = event.detail?.cart || event.detail;
      if (!cart) return;
      this.renderCartDrawer(cart);
      if (event.detail?.open === true) this.openCart(false);
    });
  }

  async fetchCart() {
    return this.requestJson("cart.js");
  }

  async hydrateCart() {
    try {
      const cart = await this.fetchCart();
      this.updateCartIndicators(cart);
      this.renderCartDrawer(cart);
    } catch {
      // Keep native cart links usable when the Ajax endpoint is temporarily unavailable.
    }
  }

  friendlyCartError(error) {
    const message = String(error?.message || "").toLowerCase();
    if (error?.name === "AbortError") return "Connection slow";
    if (error?.status === 422 || /sold out|unavailable|not available|inventory/.test(message)) {
      return "Unavailable";
    }
    return "Couldn’t add";
  }

  updateCartIndicators(cart) {
    const countValue = Math.max(0, Number(cart?.item_count) || 0);
    document.querySelectorAll("[data-cart-open]").forEach((bag) => {
      let count = bag.querySelector("[data-cart-count]");
      if (!count) {
        count = document.createElement("span");
        count.className = "t-header__count";
        count.dataset.cartCount = "";
        bag.appendChild(count);
      }
      count.textContent = String(countValue);
      count.hidden = countValue === 0;
      bag.setAttribute("aria-label", `Bag with ${countValue} ${countValue === 1 ? "item" : "items"}`);
    });
  }

  async openCart(refresh = false) {
    if (!this.cartDrawer) return;
    this.closeMenu();
    this.closeWishlist();
    this.header?.classList.remove("is-hidden");
    this.cartDrawer.classList.add("is-open");
    this.cartDrawer.setAttribute("aria-hidden", "false");
    this.cartOverlay?.classList.add("is-open");
    document.body.classList.add("t-overlay-open");
    if (!refresh) return;
    this.cartDrawer.classList.add("is-busy");
    try {
      this.renderCartDrawer(await this.fetchCart());
    } catch {
      window.location.assign(window.Shopify?.routes?.root ? `${window.Shopify.routes.root}cart` : "/cart");
    } finally {
      this.cartDrawer.classList.remove("is-busy");
    }
  }

  closeCart() {
    this.cartDrawer?.classList.remove("is-open");
    this.cartDrawer?.setAttribute("aria-hidden", "true");
    this.cartOverlay?.classList.remove("is-open");
    if (!this.menu?.classList.contains("is-open") && !this.sizeGuide?.classList.contains("is-open")) {
      document.body.classList.remove("t-overlay-open");
    }
  }

  async changeCartLine(key, quantity) {
    if (!key || !this.cartDrawer) return;
    this.cartDrawer.classList.add("is-busy");
    try {
      const cart = await this.requestJson("cart/change.js", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: key, quantity }),
      });
      this.renderCartDrawer(cart);
      document.dispatchEvent(new CustomEvent("tact:cart-changed", { detail: cart }));
    } finally {
      this.cartDrawer.classList.remove("is-busy");
    }
  }

  renderCartDrawer(cart) {
    if (!this.cartDrawer || !cart) return;
    const formatMoney = (cents) => new Intl.NumberFormat(document.documentElement.lang || "en-IN", {
      style: "currency",
      currency: cart.currency || "INR",
      maximumFractionDigits: 0,
    }).format(Number(cents || 0) / 100);
    const element = (tag, className, text) => {
      const node = document.createElement(tag);
      if (className) node.className = className;
      if (text !== undefined) node.textContent = text;
      return node;
    };
    const cartLine = (item) => {
      const article = element("article", "t-cart-drawer__line");
      article.dataset.cartLine = String(item.key || "");

      const productUrl = this.safeStoreUrl(item.url);
      const mediaLink = element("a");
      mediaLink.href = productUrl;
      const imageUrl = this.safeImageUrl(item.image);
      if (imageUrl) {
        const image = element("img");
        const sizedImage = new URL(imageUrl);
        sizedImage.searchParams.set("width", "180");
        image.src = sizedImage.href;
        image.alt = String(item.product_title || "");
        image.loading = "lazy";
        mediaLink.append(image);
      }

      const details = element("div");
      const titleLink = element("a");
      titleLink.href = productUrl;
      titleLink.append(element("strong", "", String(item.product_title || "")));
      details.append(titleLink);
      if (item.variant_title && item.variant_title !== "Default Title") {
        details.append(element("small", "", String(item.variant_title)));
      }
      details.append(element("span", "", formatMoney(item.final_line_price)));

      const quantity = element("div", "t-cart-drawer__quantity");
      const decrease = element("button", "", "−");
      decrease.type = "button";
      decrease.dataset.cartQuantity = "-1";
      decrease.dataset.cartKey = String(item.key || "");
      decrease.setAttribute("aria-label", "Reduce quantity");
      const amount = element("b", "", String(Math.max(0, Number(item.quantity) || 0)));
      const increase = element("button", "", "+");
      increase.type = "button";
      increase.dataset.cartQuantity = "1";
      increase.dataset.cartKey = String(item.key || "");
      increase.setAttribute("aria-label", "Increase quantity");
      quantity.append(decrease, amount, increase);
      details.append(quantity);

      const remove = element("button", "t-cart-drawer__remove", "×");
      remove.type = "button";
      remove.dataset.cartRemove = "";
      remove.dataset.cartKey = String(item.key || "");
      remove.setAttribute("aria-label", `Remove ${String(item.product_title || "item")}`);

      article.append(mediaLink, details, remove);
      return article;
    };
    const body = this.cartDrawer.querySelector("[data-cart-drawer-body]");
    const footer = this.cartDrawer.querySelector("[data-cart-drawer-footer]");
    const empty = this.cartDrawer.querySelector("[data-cart-empty-template]");

    this.cartDrawer.querySelectorAll("[data-cart-drawer-count]").forEach((count) => {
      count.textContent = `(${cart.item_count})`;
    });
    this.updateCartIndicators(cart);

    if (body) {
      body.replaceChildren();
      if (!cart.items?.length) {
        if (empty?.content) body.append(empty.content.cloneNode(true));
      } else {
        const lines = element("div", "t-cart-drawer__lines");
        cart.items.slice(0, 100).forEach((item) => lines.append(cartLine(item)));
        body.append(lines);
      }
    }
    if (footer) footer.hidden = cart.item_count === 0;
    const total = this.cartDrawer.querySelector("[data-cart-drawer-total]");
    if (total) total.textContent = formatMoney(cart.total_price);

    const target = Number(this.cartDrawer.dataset.freeShippingTarget || 0);
    const remaining = Math.max(0, target - Number(cart.total_price || 0));
    const progress = target > 0 ? Math.min(100, (Number(cart.total_price || 0) / target) * 100) : 100;
    const label = this.cartDrawer.querySelector("[data-cart-shipping-label]");
    const bar = this.cartDrawer.querySelector("[data-cart-shipping-progress]");
    if (label) {
      label.textContent = remaining > 0
        ? `${this.cartDrawer.dataset.shippingBefore || "Add"} ${formatMoney(remaining)} ${this.cartDrawer.dataset.shippingAfter || "for free shipping."}`
        : this.cartDrawer.dataset.shippingUnlocked || "Free shipping unlocked.";
    }
    if (bar) bar.style.width = `${progress}%`;
  }

  bindWishlist() {
    const authenticated = document.body.dataset.customerAuthenticated === "true";
    const customerId = document.body.dataset.customerId || "guest";
    const storageKey = `tact-wishlist:${customerId}`;
    const pendingKey = "tact-wishlist-pending";
    const read = () => {
      if (!authenticated) return [];
      try {
        const raw = window.localStorage.getItem(storageKey) || "[]";
        if (raw.length > 100000) return [];
        const stored = JSON.parse(raw);
        return Array.isArray(stored)
          ? stored.map((item) => this.normalizeWishlistItem(item)).filter(Boolean).slice(0, 48)
          : [];
      } catch {
        return [];
      }
    };
    const write = (items) => {
      if (!authenticated) return;
      try {
        const safeItems = items
          .map((item) => this.normalizeWishlistItem(item))
          .filter(Boolean)
          .slice(0, 48);
        window.localStorage.setItem(storageKey, JSON.stringify(safeItems));
      } catch {}
    };
    const wishlistItem = (item) => {
      const article = document.createElement("article");
      article.className = "t-wishlist__item";
      const link = document.createElement("a");
      link.href = item.url;
      if (item.image) {
        const image = document.createElement("img");
        image.src = item.image;
        image.alt = "";
        image.loading = "lazy";
        link.append(image);
      }
      const copy = document.createElement("span");
      const title = document.createElement("strong");
      title.textContent = item.title;
      const price = document.createElement("small");
      price.textContent = item.price;
      copy.append(title, price);
      link.append(copy);

      const remove = document.createElement("button");
      remove.type = "button";
      remove.dataset.wishlistRemove = item.handle;
      remove.setAttribute("aria-label", `Remove ${item.title || "item"}`);
      const icon = document.createElement("span");
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = "×";
      remove.append(icon);
      article.append(link, remove);
      return article;
    };
    const render = () => {
      const items = read();
      document.querySelectorAll("[data-wishlist-count]").forEach((count) => {
        count.textContent = items.length;
        count.hidden = items.length === 0;
      });
      document.querySelectorAll("[data-wishlist-toggle]").forEach((button) => {
        const saved = items.some((item) => item.handle === button.dataset.wishlistHandle);
        button.setAttribute("aria-pressed", String(saved));
      });
      document.querySelectorAll("[data-wishlist-items]").forEach((container) => {
        container.replaceChildren(...items.map(wishlistItem));
      });
      document.querySelectorAll("[data-wishlist-empty]").forEach((empty) => {
        empty.hidden = items.length > 0;
      });
    };

    if (authenticated) {
      try {
        const pendingRaw = window.localStorage.getItem(pendingKey) || "";
        const pending = pendingRaw.length < 10000
          ? this.normalizeWishlistItem(JSON.parse(pendingRaw || "null"))
          : null;
        if (pending) {
          const items = read();
          if (!items.some((item) => item.handle === pending.handle)) items.unshift(pending);
          write(items.slice(0, 48));
          window.localStorage.removeItem(pendingKey);
        }
      } catch {
        window.localStorage.removeItem(pendingKey);
      }
    }

    if (!document.body.dataset.wishlistBound) {
      document.body.dataset.wishlistBound = "true";
      document.addEventListener("click", (event) => {
        const toggle = event.target.closest("[data-wishlist-toggle]");
        if (toggle) {
          event.preventDefault();
          if (!authenticated) {
            try {
              const pending = this.normalizeWishlistItem({
                handle: toggle.dataset.wishlistHandle,
                title: toggle.dataset.wishlistTitle || "",
                url: toggle.dataset.wishlistUrl || "#",
                image: toggle.dataset.wishlistImage || "",
                price: toggle.dataset.wishlistPrice || "",
              });
              if (pending) window.localStorage.setItem(pendingKey, JSON.stringify(pending));
            } catch {}
            this.openWishlist();
            return;
          }
          const items = read();
          const candidate = this.normalizeWishlistItem({
            handle: toggle.dataset.wishlistHandle,
            title: toggle.dataset.wishlistTitle || "",
            url: toggle.dataset.wishlistUrl || "#",
            image: toggle.dataset.wishlistImage || "",
            price: toggle.dataset.wishlistPrice || "",
          });
          if (!candidate) return;
          const handle = candidate.handle;
          const index = items.findIndex((item) => item.handle === handle);
          if (index >= 0) items.splice(index, 1);
          else items.unshift(candidate);
          write(items.slice(0, 48));
          render();
        }
        const remove = event.target.closest("[data-wishlist-remove]");
        if (remove) {
          write(read().filter((item) => item.handle !== remove.dataset.wishlistRemove));
          render();
        }
        if (event.target.closest("[data-wishlist-open]")) this.openWishlist();
        if (event.target.closest("[data-wishlist-close]")) this.closeWishlist();
      });
    }
    render();
  }

  bindProductCardMotion() {
    if (this.productCardMotionBound) return;
    this.productCardMotionBound = true;
    const cards = () => document.querySelectorAll("[data-product-card]");
    const close = (except) => {
      cards().forEach((card) => {
        if (card === except) return;
        card.classList.remove("is-quick-open");
        card.querySelector("[data-card-quick-open]")?.setAttribute("aria-expanded", "false");
      });
    };

    document.addEventListener("click", (event) => {
      const trigger = event.target.closest("[data-card-quick-open]");
      const media = event.target.closest(".t-product-card__media");
      const card = event.target.closest("[data-product-card]");

      if (trigger && card) {
        event.preventDefault();
        close(card);
        card.classList.add("is-quick-open");
        trigger.setAttribute("aria-expanded", "true");
        return;
      }
      if (media && card && !card.classList.contains("is-quick-open")) {
        event.preventDefault();
        close(card);
        card.classList.add("is-quick-open");
        card.querySelector("[data-card-quick-open]")?.setAttribute("aria-expanded", "true");
        return;
      }
      if (!card) close();
    });
  }

  bindRevealMotion() {
    const targets = document.querySelectorAll(
      "#MainContent > section:not(.t-hero-carousel), #MainContent [data-product-card], #MainContent .t-collection-tile, .t-footer__support > a",
    );
    if (!targets.length) return;
    targets.forEach((target, index) => {
      target.dataset.reveal = "true";
      target.style.setProperty("--reveal-delay", `${(index % 4) * 45}ms`);
    });
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    ) {
      targets.forEach((target) => target.classList.add("is-revealed"));
      return;
    }

    document.documentElement.classList.add("t-motion-ready");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -7% 0px", threshold: 0.08 },
    );
    targets.forEach((target) => observer.observe(target));
  }

  bindThemeMode() {
    const root = document.documentElement;
    if (root.dataset.themeEnabled !== "true") return;

    const storageKey = "tact-theme";
    const system = window.matchMedia("(prefers-color-scheme: dark)");
    const readStored = () => {
      try {
        return window.localStorage.getItem(storageKey);
      } catch {
        return null;
      }
    };
    const writeStored = (value) => {
      try {
        window.localStorage.setItem(storageKey, value);
      } catch {}
    };
    const apply = (theme) => {
      root.dataset.theme = theme;
      root.style.colorScheme = theme;
      const pageColor = getComputedStyle(root)
        .getPropertyValue("--tact-paper")
        .trim();
      document.querySelector('meta[name="theme-color"]')?.setAttribute(
        "content",
        pageColor || (theme === "dark" ? "#0c0c0d" : "#f3f3f1"),
      );
      document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
        const next = theme === "dark" ? "light" : "dark";
        button.setAttribute("aria-label", `Use ${next} mode`);
        const label = button.querySelector("[data-theme-toggle-label]");
        if (label) label.textContent = `${next[0].toUpperCase()}${next.slice(1)} mode`;
      });
      window.dispatchEvent(
        new CustomEvent("tact:theme-changed", { detail: { theme } }),
      );
    };
    const stored = readStored();
    const preferred =
      root.dataset.themeDefault === "system"
        ? (system.matches ? "dark" : "light")
        : root.dataset.themeDefault;

    apply(stored || preferred || "light");
    document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
      if (button.dataset.themeBound === "true") return;
      button.dataset.themeBound = "true";
      button.addEventListener("click", () => {
        const next = root.dataset.theme === "dark" ? "light" : "dark";
        writeStored(next);
        apply(next);
      });
    });
    system.addEventListener?.("change", (event) => {
      if (!readStored()) {
        apply(event.matches ? "dark" : "light");
      }
    });
  }

  openMenu() {
    this.closeCart();
    this.closeWishlist();
    this.header?.classList.remove("is-hidden");
    this.menu?.classList.add("is-open");
    this.menu?.setAttribute("aria-hidden", "false");
    this.overlay?.classList.add("is-open");
    document.body.classList.add("t-overlay-open");
  }

  closeMenu() {
    this.menu?.classList.remove("is-open");
    this.menu?.setAttribute("aria-hidden", "true");
    this.overlay?.classList.remove("is-open");
    document.body.classList.remove("t-overlay-open");
  }

  openSizeGuide() {
    this.sizeGuide?.classList.add("is-open");
    this.sizeGuide?.setAttribute("aria-hidden", "false");
    this.sizeOverlay?.classList.add("is-open");
    document.body.classList.add("t-overlay-open");
  }

  closeSizeGuide() {
    this.sizeGuide?.classList.remove("is-open");
    this.sizeGuide?.setAttribute("aria-hidden", "true");
    this.sizeOverlay?.classList.remove("is-open");
    document.body.classList.remove("t-overlay-open");
  }

  openWishlist() {
    this.closeCart();
    this.closeMenu();
    const drawer = document.querySelector("[data-wishlist-drawer]");
    drawer?.classList.add("is-open");
    drawer?.setAttribute("aria-hidden", "false");
    document.querySelector(".t-wishlist-overlay")?.classList.add("is-open");
    this.mobileDock?.querySelector("[data-wishlist-open]")?.classList.add("is-active");
    this.mobileDock?.querySelector("[data-wishlist-open]")?.setAttribute("aria-pressed", "true");
    document.body.classList.add("t-overlay-open");
  }

  closeWishlist() {
    const drawer = document.querySelector("[data-wishlist-drawer]");
    drawer?.classList.remove("is-open");
    drawer?.setAttribute("aria-hidden", "true");
    document.querySelector(".t-wishlist-overlay")?.classList.remove("is-open");
    this.mobileDock?.querySelector("[data-wishlist-open]")?.classList.remove("is-active");
    this.mobileDock?.querySelector("[data-wishlist-open]")?.setAttribute("aria-pressed", "false");
    if (!this.menu?.classList.contains("is-open") && !this.sizeGuide?.classList.contains("is-open")) {
      document.body.classList.remove("t-overlay-open");
    }
  }

  updateVariant(input) {
    const price = document.querySelector("[data-product-price]");
    if (!price) return;
    const compare = input.dataset.compare;
    const nodes = [];
    if (compare) {
      const original = document.createElement("s");
      original.textContent = compare;
      nodes.push(original);
    }
    const current = document.createElement("strong");
    current.textContent = input.dataset.price || "";
    nodes.push(current);
    price.replaceChildren(...nodes);
  }

  changeQuantity(button, amount) {
    const purchase = button.closest(".t-product__quantity");
    const input = purchase?.querySelector('input[name="quantity"]');
    if (!input) return;
    input.value = Math.max(1, Number(input.value || 1) + amount);
  }

  changeProductTab(button) {
    const information = button.closest(".t-product__information");
    if (!information) return;
    const key = button.dataset.productTab;
    information.querySelectorAll("[data-product-tab]").forEach((tab) => {
      tab.classList.toggle("is-active", tab === button);
    });
    information.querySelectorAll("[data-product-panel]").forEach((panel) => {
      panel.classList.toggle("is-active", panel.dataset.productPanel === key);
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const theme = new TactTheme();
  document.addEventListener("shopify:section:load", () => {
    theme.bindStoryVideos();
    theme.bindCategoryDecks();
    theme.bindHeroCarousels();
    theme.bindHeroVideos();
    theme.bindReviewStories();
    theme.bindVideoQuickAdd();
    theme.bindProductForms();
    theme.bindCartDrawer();
    theme.bindWishlist();
    theme.bindProductCardMotion();
    theme.bindThemeMode();
    theme.bindMobileDock();
  });
});
