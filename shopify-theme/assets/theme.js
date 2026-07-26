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
    this.bindHeroVideos();
    this.bindReviewStories();
    this.bindVideoQuickAdd();
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
      section.querySelector("[data-video-rail-prev]")?.addEventListener("click", () => scrollRail(-1));
      section.querySelector("[data-video-rail-next]")?.addEventListener("click", () => scrollRail(1));
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
    document.querySelectorAll("[data-video-quick-add]").forEach((form) => {
      if (form.dataset.quickAddBound === "true") return;
      form.dataset.quickAddBound = "true";
      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const button = form.querySelector("button");
        if (!button || button.disabled) return;
        const original = button.textContent;
        button.disabled = true;
        button.textContent = "…";
        try {
          const root = window.Shopify?.routes?.root || "/";
          const response = await fetch(`${root}cart/add.js`, {
            method: "POST",
            headers: { Accept: "application/json" },
            body: new FormData(form),
          });
          if (!response.ok) throw new Error("Unable to add product");
          button.textContent = "✓";
          const cart = await fetch(`${root}cart.js`).then((result) => result.json());
          const bag = document.querySelector('.t-header__actions a[href*="/cart"]');
          if (bag) {
            let count = bag.querySelector("span");
            if (!count) {
              count = document.createElement("span");
              bag.appendChild(count);
            }
            count.textContent = cart.item_count;
            bag.setAttribute("aria-label", `Bag with ${cart.item_count} items`);
          }
        } catch {
          button.textContent = "!";
        } finally {
          window.setTimeout(() => {
            button.textContent = original;
            button.disabled = false;
          }, 1400);
        }
      });
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
    theme.bindHeroVideos();
    theme.bindReviewStories();
    theme.bindVideoQuickAdd();
  });
});
