"use client";

import Link from "next/link";
import { TouchEvent, useEffect, useRef, useState } from "react";
import { Arrow } from "./Icons";

const slides = [
  {
    id: "rotation",
    eyebrow: "Everyday streetwear",
    title: "Wear Your Flex",
    cta: "Explore the edit",
    href: "/collections/all",
    desktopImage: "/assets/hero/tact-editorial-desktop-v2.webp",
    mobileVideo: "/assets/hero/tact-current-mobile.mp4",
    alt: "TACT models wearing the current collection",
  },
  {
    id: "madison",
    eyebrow: "New release",
    title: "Web of Madison",
    cta: "Shop the story",
    href: "/products/web-of-madison-oversized-tee",
    desktopImage: "/assets/drive/madison-1.png",
    mobileImage: "/assets/drive/madison-1.png",
    alt: "Blue Web of Madison graphic tee by TACT",
  },
  {
    id: "signature",
    eyebrow: "TACT signature",
    title: "Made to move",
    cta: "Shop signature",
    href: "/products/tact-all-over-signature-tee",
    desktopImage: "/assets/hero-signature.jpg",
    mobileImage: "/assets/hero-signature.jpg",
    alt: "TACT all-over signature co-ord",
  },
] as const;

export function HeroCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  function move(direction: -1 | 1) {
    setActive(
      (current) => (current + direction + slides.length) % slides.length,
    );
  }

  useEffect(() => {
    if (
      paused ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, 6200);

    return () => window.clearInterval(timer);
  }, [paused]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.defaultPlaybackRate = 1.5;
    video.playbackRate = 1.5;

    if (active === 0) {
      void video.play().catch(() => undefined);
    } else {
      video.pause();
    }
  }, [active]);

  function handleTouchStart(event: TouchEvent<HTMLElement>) {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  }

  function handleTouchEnd(event: TouchEvent<HTMLElement>) {
    if (touchStartX.current === null) return;
    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
    const distance = endX - touchStartX.current;
    touchStartX.current = null;

    if (Math.abs(distance) > 45) {
      move(distance > 0 ? -1 : 1);
    }
  }

  return (
    <section
      className={`home-hero home-hero-live home-hero-carousel ${
        paused ? "is-paused" : ""
      }`}
      aria-label="Featured TACT campaigns"
      aria-roledescription="carousel"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="hero-carousel-viewport">
        {slides.map((slide, index) => (
          <article
            className={`hero-carousel-slide hero-carousel-slide--${slide.id} ${
              index === active ? "is-active" : ""
            }`}
            aria-hidden={index !== active}
            key={slide.id}
          >
            <div className="hero-slide-media">
              <img
                className="hero-slide-desktop-image"
                src={slide.desktopImage}
                alt={index === active ? slide.alt : ""}
              />
              {"mobileVideo" in slide ? (
                <video
                  ref={videoRef}
                  className="hero-slide-mobile-video"
                  src={slide.mobileVideo}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  aria-label={slide.alt}
                />
              ) : (
                <img
                  className="hero-slide-mobile-image"
                  src={slide.mobileImage}
                  alt={index === active ? slide.alt : ""}
                />
              )}
            </div>
            <div className="hero-carousel-shade" />
            <div className="hero-carousel-copy">
              <p>{slide.eyebrow}</p>
              {index === 0 ? (
                <h1>{slide.title}</h1>
              ) : (
                <h2>{slide.title}</h2>
              )}
              <Link href={slide.href} tabIndex={index === active ? 0 : -1}>
                {slide.cta} <Arrow />
              </Link>
            </div>
          </article>
        ))}
      </div>

      <div className="hero-carousel-navigation">
        <span aria-live="polite">
          {String(active + 1).padStart(2, "0")} /{" "}
          {String(slides.length).padStart(2, "0")}
        </span>
        <div className="hero-carousel-dots" aria-label="Choose a campaign">
          {slides.map((slide, index) => (
            <button
              className={index === active ? "is-active" : ""}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Show ${slide.title}`}
              aria-current={index === active}
              key={slide.id}
            />
          ))}
        </div>
        <div className="hero-carousel-arrows">
          <button type="button" onClick={() => move(-1)} aria-label="Previous">
            <Arrow />
          </button>
          <button type="button" onClick={() => move(1)} aria-label="Next">
            <Arrow />
          </button>
        </div>
      </div>
    </section>
  );
}
