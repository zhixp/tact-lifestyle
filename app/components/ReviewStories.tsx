import Link from "next/link";
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
  return (
    <section
      className="review-stories review-stories-marquee"
      aria-labelledby="review-stories-title"
    >
      <div className="review-stories-heading">
        <div>
          <p className="kicker">06 / Customer reviews</p>
          <h2 id="review-stories-title">Worn. Rated. Repeated.</h2>
        </div>
        <p>Real words from TACT customers, moving with the rotation.</p>
      </div>

      <div className="review-marquee-window">
        <div className="review-marquee-track">
          {Array.from({ length: 2 }).map((_, copyIndex) => (
            <div
              className="review-marquee-group"
              aria-hidden={copyIndex > 0}
              key={copyIndex}
            >
              {storeReviews.map((review) => (
                <article
                  className="review-marquee-card"
                  key={`${copyIndex}-${review.name}-${review.handle}`}
                >
                  <div className="review-marquee-card-topline">
                    <Stars count={review.rating} />
                    <span>{review.rating}.0</span>
                  </div>
                  <p>{review.title}</p>
                  <blockquote>“{review.quote}”</blockquote>
                  <footer>
                    <span>— {review.name}</span>
                    <Link
                      href={`/products/${review.handle}`}
                      tabIndex={copyIndex > 0 ? -1 : undefined}
                    >
                      {review.product} <Arrow />
                    </Link>
                  </footer>
                </article>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
