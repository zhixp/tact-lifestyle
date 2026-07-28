"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { money, products } from "../data";
import { Arrow, Pause, Play, Plus } from "./Icons";
import { useStore } from "./Storefront";

const films = [
  {
    src: "/assets/videos/reel-01.mp4",
    label: "Pretty Annoying",
    products: ["pretty-annoying-cropped-top-women"],
  },
  {
    src: "/assets/videos/reel-02.mp4",
    label: "Graphic state",
    products: ["distracted-skull-sleeveless-tee"],
  },
  {
    src: "/assets/videos/reel-03.mp4",
    label: "Move in TACT",
    products: ["ribbed-top-signature-shorts-co-ord-set-onion-women"],
  },
  {
    src: "/assets/videos/reel-04.mp4",
    label: "Two ways to flex",
    products: [
      "embrace-yourself-oversized-cropped-tee",
      "neon-skull-pop-oversized-tee-men",
    ],
  },
  {
    src: "/assets/videos/reel-05.mp4",
    label: "Built to stand out",
    products: ["ghost-of-tsushima-cream-men"],
  },
  {
    src: "/assets/videos/reel-06.mp4",
    label: "Outside the lines",
    products: ["tact-all-over-signature-tee"],
  },
];

export function VideoStories() {
  const railRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState<Record<number, boolean>>({});
  const [railPosition, setRailPosition] = useState({
    canGoBack: false,
    canGoForward: true,
  });
  const { addToCart } = useStore();

  useEffect(() => {
    const videos = Array.from(
      railRef.current?.querySelectorAll("video") ?? [],
    );
    if (!videos.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          const index = Number(video.dataset.videoIndex);
          if (entry.isIntersecting) {
            video.play().catch(() => undefined);
          } else {
            video.pause();
          }
          setPlaying((current) => ({
            ...current,
            [index]: entry.isIntersecting,
          }));
        });
      },
      { threshold: 0.62 },
    );

    videos.forEach((video) => observer.observe(video));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    const update = () => {
      setRailPosition({
        canGoBack: rail.scrollLeft > 8,
        canGoForward:
          rail.scrollLeft + rail.clientWidth < rail.scrollWidth - 8,
      });
    };

    update();
    rail.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    return () => {
      rail.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  function toggleVideo(index: number) {
    const video = railRef.current?.querySelector<HTMLVideoElement>(
      `[data-video-index="${index}"]`,
    );
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => undefined);
    } else {
      video.pause();
    }
  }

  function scrollRail(direction: -1 | 1) {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollBy({
      left: direction * Math.max(280, rail.clientWidth * 0.72),
      behavior: "smooth",
    });
  }

  return (
    <section className="video-stories" aria-labelledby="video-stories-title">
      <div className="video-stories-intro">
        <p className="kicker">04 / In motion</p>
        <h2 id="video-stories-title">TACT in motion.</h2>
        <p>Campaign films, close-up details and the pieces in each look.</p>
        <Link className="text-link" href="/pages/about-us">
          Meet TACT <Arrow />
        </Link>
        <div className="video-story-controls" aria-label="Browse campaign films">
          <button
            type="button"
            onClick={() => scrollRail(-1)}
            aria-label="Previous films"
          >
            <Arrow />
          </button>
          <button
            type="button"
            onClick={() => scrollRail(1)}
            aria-label="Next films"
          >
            <Arrow />
          </button>
        </div>
      </div>
      <div className="video-story-rail-shell">
        <div
          className="video-story-rail"
          ref={railRef}
          role="region"
          aria-label="Shoppable campaign films"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") scrollRail(-1);
            if (event.key === "ArrowRight") scrollRail(1);
          }}
        >
          {films.map((film, index) => {
          const linkedProducts = film.products
            .map((handle) =>
              products.find((product) => product.handle === handle),
            )
            .filter(
              (product): product is (typeof products)[number] =>
                Boolean(product),
            );

            return (
              <article className="video-story-card" key={film.src}>
              <video
                src={film.src}
                data-video-index={index}
                muted
                loop
                playsInline
                preload="metadata"
                onPlay={() =>
                  setPlaying((current) => ({ ...current, [index]: true }))
                }
                onPause={() =>
                  setPlaying((current) => ({ ...current, [index]: false }))
                }
              />
              <div className="video-story-shade" />
              <span>
                0{index + 1} / {film.label}
              </span>
              <button
                className="video-story-play"
                type="button"
                aria-label={`${playing[index] ? "Pause" : "Play"} ${film.label}`}
                onClick={() => toggleVideo(index)}
              >
                {playing[index] ? <Pause /> : <Play />}
              </button>
              <div className="video-story-products">
                {linkedProducts.map((product) => (
                  <div className="video-story-product" key={product.handle}>
                    <Link href={`/products/${product.handle}`}>
                      <img src={product.images[0]} alt="" loading="lazy" />
                      <span>
                        <strong>{product.name}</strong>
                        <small>{money.format(product.price)}</small>
                      </span>
                    </Link>
                    <button
                      type="button"
                      aria-label={`Quick add ${product.name}`}
                      onClick={() => addToCart(product)}
                    >
                      <Plus />
                    </button>
                  </div>
                ))}
              </div>
              </article>
            );
          })}
        </div>
        <button
          className={`video-rail-edge video-rail-edge--back ${
            railPosition.canGoBack ? "is-visible" : ""
          }`}
          type="button"
          aria-label="Previous campaign films"
          aria-hidden={!railPosition.canGoBack}
          tabIndex={railPosition.canGoBack ? 0 : -1}
          onClick={() => scrollRail(-1)}
        >
          <Arrow />
        </button>
        <button
          className={`video-rail-edge video-rail-edge--forward ${
            railPosition.canGoForward ? "is-visible" : ""
          }`}
          type="button"
          aria-label="More campaign films"
          aria-hidden={!railPosition.canGoForward}
          tabIndex={railPosition.canGoForward ? 0 : -1}
          onClick={() => scrollRail(1)}
        >
          <Arrow />
          <span>More</span>
        </button>
      </div>
    </section>
  );
}
