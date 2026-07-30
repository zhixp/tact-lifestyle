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
    this.onScroll();
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
          button.querySelector("span").textContent = paused ? "▶" : "Ⅱ";
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
        if (this.header) {
          this.header.dataset.heroTone = slides[active]?.dataset.headerTone || "light";
          this.header.dataset.mobileHeroTone =
            slides[active]?.dataset.mobileHeaderTone ||
            slides[active]?.dataset.headerTone ||
            "light";
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
        const controller = new AbortController();
        const timeout = window.setTimeout(() => controller.abort(), 10000);
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
          const root = window.Shopify?.routes?.root || "/";
          const response = await fetch(`${root}cart/add.js`, {
            method: "POST",
            headers: { Accept: "application/json" },
            body: new FormData(form),
            signal: controller.signal,
          });
          if (!response.ok) throw new Error("Unable to add product");

          setState("is-added", "Added to bag");
          button.removeAttribute("aria-busy");

          fetch(`${root}cart.js`, { headers: { Accept: "application/json" } })
            .then((result) => {
              if (!result.ok) throw new Error("Unable to refresh cart");
              return result.json();
            })
            .then((cart) => {
              document.querySelectorAll("[data-cart-open]").forEach((bag) => {
                let count = bag.querySelector(".t-header__count");
                if (!count) {
                  count = document.createElement("span");
                  count.className = "t-header__count";
                  bag.appendChild(count);
                }
                count.textContent = cart.item_count;
                count.hidden = cart.item_count === 0;
                bag.setAttribute("aria-label", `Bag with ${cart.item_count} items`);
              });
              document.dispatchEvent(new CustomEvent("tact:cart-updated", { detail: cart }));
            })
            .catch(() => {});
        } catch (error) {
          setState("is-error", error?.name === "AbortError" ? "Timed out" : "Try again");
        } finally {
          window.clearTimeout(timeout);
          window.setTimeout(() => {
            button.disabled = false;
            form.classList.remove("is-loading", "is-added", "is-error");
            button.classList.remove("is-loading", "is-added", "is-error");
            button.removeAttribute("aria-busy");
            if (label) label.textContent = defaultLabel;
            if (status) status.textContent = "";
          }, 1800);
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
          const root = window.Shopify?.routes?.root || "/";
          const response = await fetch(`${root}cart/add.js`, {
            method: "POST",
            headers: { Accept: "application/json" },
            body: new FormData(form),
          });
          if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.description || "Unable to add this size");
          }

          if (label) label.textContent = "Added to bag";
          button.classList.remove("is-loading");
          button.classList.add("is-added");
          if (message) message.textContent = "Added to your bag.";
          document.dispatchEvent(new CustomEvent("tact:cart-updated", { detail: await this.fetchCart() }));
        } catch (error) {
          button.classList.remove("is-loading");
          button.classList.add("is-error");
          if (label) label.textContent = "Try again";
          if (message) message.textContent = error?.message || "We couldn’t add this item.";
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
      if (!event.detail) return;
      this.renderCartDrawer(event.detail);
      this.openCart(false);
    });
  }

  async fetchCart() {
    const root = window.Shopify?.routes?.root || "/";
    const response = await fetch(`${root}cart.js`, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error("Unable to refresh bag");
    return response.json();
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
      const root = window.Shopify?.routes?.root || "/";
      const response = await fetch(`${root}cart/change.js`, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ id: key, quantity }),
      });
      if (!response.ok) throw new Error("Unable to update bag");
      const cart = await response.json();
      this.renderCartDrawer(cart);
      document.dispatchEvent(new CustomEvent("tact:cart-changed", { detail: cart }));
    } finally {
      this.cartDrawer.classList.remove("is-busy");
    }
  }

  renderCartDrawer(cart) {
    if (!this.cartDrawer || !cart) return;
    const escape = (value = "") => String(value).replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    })[character]);
    const formatMoney = (cents) => new Intl.NumberFormat(document.documentElement.lang || "en-IN", {
      style: "currency",
      currency: cart.currency || "INR",
      maximumFractionDigits: 0,
    }).format(Number(cents || 0) / 100);
    const body = this.cartDrawer.querySelector("[data-cart-drawer-body]");
    const footer = this.cartDrawer.querySelector("[data-cart-drawer-footer]");
    const empty = this.cartDrawer.querySelector("[data-cart-empty-template]");

    this.cartDrawer.querySelectorAll("[data-cart-drawer-count]").forEach((count) => {
      count.textContent = `(${cart.item_count})`;
    });
    document.querySelectorAll("[data-cart-open]").forEach((bag) => {
      let count = bag.querySelector(".t-header__count");
      if (!count && cart.item_count > 0) {
        count = document.createElement("span");
        count.className = "t-header__count";
        bag.appendChild(count);
      }
      if (count) {
        count.textContent = cart.item_count;
        count.hidden = cart.item_count === 0;
      }
      bag.setAttribute("aria-label", `Bag with ${cart.item_count} items`);
    });

    if (body) {
      if (!cart.items?.length) {
        body.innerHTML = empty?.innerHTML || "";
      } else {
        body.innerHTML = `<div class="t-cart-drawer__lines">${cart.items.map((item) => `
          <article class="t-cart-drawer__line" data-cart-line="${escape(item.key)}">
            <a href="${escape(item.url)}">${item.image ? `<img src="${escape(item.image)}&width=180" alt="${escape(item.product_title)}">` : ""}</a>
            <div>
              <a href="${escape(item.url)}"><strong>${escape(item.product_title)}</strong></a>
              ${item.variant_title && item.variant_title !== "Default Title" ? `<small>${escape(item.variant_title)}</small>` : ""}
              <span>${formatMoney(item.final_line_price)}</span>
              <div class="t-cart-drawer__quantity">
                <button type="button" data-cart-quantity="-1" data-cart-key="${escape(item.key)}" aria-label="Reduce quantity">−</button>
                <b>${item.quantity}</b>
                <button type="button" data-cart-quantity="1" data-cart-key="${escape(item.key)}" aria-label="Increase quantity">+</button>
              </div>
            </div>
            <button class="t-cart-drawer__remove" type="button" data-cart-remove data-cart-key="${escape(item.key)}" aria-label="Remove ${escape(item.product_title)}">×</button>
          </article>
        `).join("")}</div>`;
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
        const stored = JSON.parse(window.localStorage.getItem(storageKey) || "[]");
        return Array.isArray(stored) ? stored : [];
      } catch {
        return [];
      }
    };
    const write = (items) => {
      if (!authenticated) return;
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(items));
      } catch {}
    };
    const escapeHtml = (value = "") => value.replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    })[character]);
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
        container.innerHTML = items.map((item) => `
          <article class="t-wishlist__item">
            <a href="${escapeHtml(item.url)}">
              ${item.image ? `<img src="${escapeHtml(item.image)}" alt="">` : ""}
              <span><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.price)}</small></span>
            </a>
            <button type="button" data-wishlist-remove="${escapeHtml(item.handle)}" aria-label="Remove ${escapeHtml(item.title)}">
              <span aria-hidden="true">×</span>
            </button>
          </article>
        `).join("");
      });
      document.querySelectorAll("[data-wishlist-empty]").forEach((empty) => {
        empty.hidden = items.length > 0;
      });
    };

    if (authenticated) {
      try {
        const pending = JSON.parse(window.localStorage.getItem(pendingKey) || "null");
        if (pending?.handle) {
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
              window.localStorage.setItem(pendingKey, JSON.stringify({
                handle: toggle.dataset.wishlistHandle,
                title: toggle.dataset.wishlistTitle || "",
                url: toggle.dataset.wishlistUrl || "#",
                image: toggle.dataset.wishlistImage || "",
                price: toggle.dataset.wishlistPrice || "",
              }));
            } catch {}
            this.openWishlist();
            return;
          }
          const items = read();
          const handle = toggle.dataset.wishlistHandle;
          const index = items.findIndex((item) => item.handle === handle);
          if (index >= 0) items.splice(index, 1);
          else items.unshift({
            handle,
            title: toggle.dataset.wishlistTitle || "",
            url: toggle.dataset.wishlistUrl || "#",
            image: toggle.dataset.wishlistImage || "",
            price: toggle.dataset.wishlistPrice || "",
          });
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
      document.querySelector('meta[name="theme-color"]')?.setAttribute(
        "content",
        theme === "dark" ? "#0c0c0d" : "#0b0b0c",
      );
      document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
        const next = theme === "dark" ? "light" : "dark";
        button.setAttribute("aria-label", `Use ${next} mode`);
        const label = button.querySelector("[data-theme-toggle-label]");
        if (label) label.textContent = `${next[0].toUpperCase()}${next.slice(1)} mode`;
      });
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
    price.innerHTML = `${compare ? `<s>${compare}</s>` : ""}<strong>${input.dataset.price || ""}</strong>`;
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
