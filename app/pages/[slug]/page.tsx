import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { aboutContent } from "../../content";
import { Arrow } from "../../components/Icons";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return [
    { slug: "about-us" },
    { slug: "contact" },
    { slug: "shipping-policy" },
    { slug: "returns" },
  ];
}

export default async function InfoPage({ params }: PageProps) {
  const { slug } = await params;

  if (slug === "shipping-policy") redirect("/policies/shipping-policy");
  if (slug === "returns") redirect("/policies/refund-policy");
  if (slug !== "about-us" && slug !== "contact") notFound();

  if (slug === "about-us") {
    const paragraphs = aboutContent.text
      .replace(/^Who We Are\s*/i, "")
      .split(/\n\s*\n/)
      .filter(Boolean);

    return (
      <main id="main" className="inner-main about-page">
        <header className="about-hero">
          <p className="kicker">About TACT</p>
          <h1>Experience behind every expression.</h1>
          <p>{paragraphs[0]}</p>
        </header>
        <section className="about-story">
          <div className="about-story-heading">
            <span>35+</span>
            <p>years of print craft behind the label</p>
          </div>
          <div className="about-story-copy">
            {paragraphs.slice(1).map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </section>
        <section className="about-cta">
          <p className="kicker">The current chapter</p>
          <h2>Stories you can wear.</h2>
          <Link className="button button-light" href="/collections/all">
            Explore the collection <Arrow />
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main id="main" className="inner-main contact-page">
      <header className="contact-hero">
        <p className="kicker">TACT / Customer care</p>
        <h1>Let’s talk.</h1>
        <p>
          Whether it’s about your order, styling, sizing or a collaboration,
          the TACT team is one message away.
        </p>
      </header>

      <section className="contact-layout">
        <div className="contact-details">
          <a href="mailto:info@tactlifestyle.store">
            <small>Email</small>
            info@tactlifestyle.store <Arrow />
          </a>
          <a href="tel:+919893789469">
            <small>Call</small>
            +91 98937 89469 <Arrow />
          </a>
          <address>
            <small>Studio</small>
            TACT Enterprises<br />
            60-1 SFTF, New Dewas Road<br />
            Indore, Madhya Pradesh 452003
          </address>
          <p className="contact-legal">
            Legal name: Tarun Kumariya<br />
            GSTIN: 23CPVPK9292J1Z0
          </p>
        </div>

        <form className="contact-form">
          <div>
            <label htmlFor="contact-name">Name</label>
            <input id="contact-name" name="name" type="text" required />
          </div>
          <div>
            <label htmlFor="contact-email">Email</label>
            <input id="contact-email" name="email" type="email" required />
          </div>
          <div>
            <label htmlFor="contact-phone">Phone</label>
            <input id="contact-phone" name="phone" type="tel" />
          </div>
          <div>
            <label htmlFor="contact-message">Message</label>
            <textarea id="contact-message" name="message" rows={6} required />
          </div>
          <button className="button button-dark" type="submit">
            Send enquiry <Arrow />
          </button>
          <small>
            The demo form is visual. Shopify will connect this to the store
            contact form.
          </small>
        </form>
      </section>
    </main>
  );
}
