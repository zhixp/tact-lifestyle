"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { storeReviews } from "../reviews";
import { Arrow, Star } from "./Icons";

function Stars({ count }: { count: number }) {
  return (
    <span className="review-stars" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: count }).map((_, index) => (
        <Star key={index} />
      ))}
    </span>
  );
}

export function ReviewStories() {
  const reviews = storeReviews.filter((review) => review.name !== "Taranjeet");
  const [active, setActive] = useState(2);
  const [paused, setPaused] = useState(false);
  const review = reviews[active];

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(
      () => setActive((current) => (current + 1) % reviews.length),
      5200,
    );
    return () => window.clearInterval(timer);
  }, [paused]);

  function move(direction: -1 | 1) {
    setActive(
      (current) =>
        (current + direction + reviews.length) % reviews.length,
    );
  }

  return (
    <section
      className="review-stories"
      aria-labelledby="review-stories-title"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="review-stories-heading">
        <p className="kicker">06 / Customer reviews</p>
        <h2 id="review-stories-title">From the rotation.</h2>
        <p>Product reviews from TACT customers.</p>
        <div className="review-controls" aria-label="Review navigation">
          <button
            type="button"
            onClick={() => move(-1)}
            aria-label="Previous review"
          >
            <Arrow />
          </button>
          <button
            type="button"
            onClick={() => move(1)}
            aria-label="Next review"
          >
            <Arrow />
          </button>
        </div>
      </div>
      <article
        className="review-active"
        aria-live="polite"
        key={`${review.name}-${active}`}
      >
        <div className="review-active-topline">
          <Stars count={review.rating} />
          <span>
            {String(active + 1).padStart(2, "0")} /{" "}
            {String(reviews.length).padStart(2, "0")}
          </span>
        </div>
        <p>{review.title}</p>
        <blockquote>“{review.quote}”</blockquote>
        <footer>
          <span>— {review.name}</span>
          <Link href={`/products/${review.handle}`}>
            {review.product} <Arrow />
          </Link>
        </footer>
      </article>
      <div className="review-dots" aria-label="Choose a review">
        {reviews.map((item, index) => (
          <button
            className={index === active ? "is-active" : ""}
            type="button"
            onClick={() => setActive(index)}
            aria-label={`Show review from ${item.name}`}
            aria-current={index === active}
            key={`${item.name}-${item.handle}`}
          />
        ))}
      </div>
    </section>
  );
}
