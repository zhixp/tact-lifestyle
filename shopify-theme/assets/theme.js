class TactTheme {
  constructor() {
    this.header = document.querySelector("[data-site-header]");
    this.menu = document.querySelector("[data-menu]");
    this.overlay = document.querySelector("[data-overlay]");
    this.sizeGuide = document.querySelector("[data-size-guide]");
    this.sizeOverlay = document.querySelector(".t-size-overlay");
    this.lastScrollY = window.scrollY;
    this.bind();
    this.bindStoryVideos();
    this.bindHeroCarousels();
    this.bindHeroVideos();
    this.bindReviewStories();
    this.bindVideoQuickAdd();
    this.bindWishlist();
    this.bindThemeMode();
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
      }
    });
  }

  onScroll() {
    if (!this.header) return;
    const currentY = window.scrollY;
    const delta = currentY - this.lastScrollY;
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
    this.lastScrollY = currentY;
  }

  bindStoryVideos() {
    document.querySelectorAll("[data-video-stories]").forEach((section) => {
      if (section.dataset.videoBound === "true") return;
      section.dataset.videoBound = "true";

      const rail = section.querySelector("[data-video-rail]");
      const videos = section.querySelectorAll(".t-video-story__video");
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
      const autoplay = carousel.dataset.heroAutoplay === "true" && slides.length > 1;
      let active = 0;
      let timer;
      let touchStart = 0;

      carousel.style.setProperty("--hero-slide-duration", `${duration}ms`);

      const show = (index) => {
        active = (index + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
          const selected = slideIndex === active;
          slide.classList.toggle("is-active", selected);
          slide.setAttribute("aria-hidden", String(!selected));
          slide.querySelectorAll("video").forEach((video) => {
            if (selected) video.play().catch(() => {});
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
        const original = button.innerHTML;
        button.disabled = true;
        button.classList.add("is-loading");
        button.setAttribute("aria-busy", "true");
        try {
          const root = window.Shopify?.routes?.root || "/";
          const response = await fetch(`${root}cart/add.js`, {
            method: "POST",
            headers: { Accept: "application/json" },
            body: new FormData(form),
          });
          if (!response.ok) throw new Error("Unable to add product");
          button.classList.add("is-added");
          const label = button.querySelector("[data-quick-add-label]");
          if (label) label.textContent = "Added";
          const cart = await fetch(`${root}cart.js`).then((result) => result.json());
          document.querySelectorAll('a[href*="/cart"]').forEach((bag) => {
            let count = bag.querySelector("span");
            if (!count) {
              count = document.createElement("span");
              bag.appendChild(count);
            }
            count.textContent = cart.item_count;
            bag.setAttribute("aria-label", `Bag with ${cart.item_count} items`);
          });
          document.dispatchEvent(new CustomEvent("tact:cart-updated", { detail: cart }));
        } catch {
          button.classList.add("is-error");
        } finally {
          window.setTimeout(() => {
            button.innerHTML = original;
            button.disabled = false;
            button.classList.remove("is-loading", "is-added", "is-error");
            button.removeAttribute("aria-busy");
          }, 1400);
        }
      });
    });
  }

  bindWishlist() {
    const storageKey = "tact-wishlist";
    const read = () => {
      try {
        const stored = JSON.parse(window.localStorage.getItem(storageKey) || "[]");
        return Array.isArray(stored) ? stored : [];
      } catch {
        return [];
      }
    };
    const write = (items) => {
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

    if (!document.body.dataset.wishlistBound) {
      document.body.dataset.wishlistBound = "true";
      document.addEventListener("click", (event) => {
        const toggle = event.target.closest("[data-wishlist-toggle]");
        if (toggle) {
          event.preventDefault();
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

  bindThemeMode() {
    const root = document.documentElement;
    if (root.dataset.themeEnabled !== "true") return;

    const storageKey = "tact-theme";
    const system = window.matchMedia("(prefers-color-scheme: dark)");
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
    const stored = window.localStorage.getItem(storageKey);
    const preferred =
      root.dataset.themeDefault === "system"
        ? (system.matches ? "dark" : "light")
        : root.dataset.themeDefault;

    apply(stored || preferred || "light");
    document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
      button.addEventListener("click", () => {
        const next = root.dataset.theme === "dark" ? "light" : "dark";
        window.localStorage.setItem(storageKey, next);
        apply(next);
      });
    });
    system.addEventListener?.("change", (event) => {
      if (!window.localStorage.getItem(storageKey)) {
        apply(event.matches ? "dark" : "light");
      }
    });
  }

  openMenu() {
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
    const drawer = document.querySelector("[data-wishlist-drawer]");
    drawer?.classList.add("is-open");
    drawer?.setAttribute("aria-hidden", "false");
    document.querySelector(".t-wishlist-overlay")?.classList.add("is-open");
    document.body.classList.add("t-overlay-open");
  }

  closeWishlist() {
    const drawer = document.querySelector("[data-wishlist-drawer]");
    drawer?.classList.remove("is-open");
    drawer?.setAttribute("aria-hidden", "true");
    document.querySelector(".t-wishlist-overlay")?.classList.remove("is-open");
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
    theme.bindHeroCarousels();
    theme.bindHeroVideos();
    theme.bindReviewStories();
    theme.bindVideoQuickAdd();
    theme.bindWishlist();
  });
});
