import { AccountAccess } from "../../components/AccountAccess";

export default function AccountLoginPage() {
  return (
    <main id="main" className="account-page">
      <section className="account-page-visual" aria-label="TACT campaign">
        <img
          src="/assets/products/pretty-annoying-cropped-top-women/1.webp"
          alt="TACT Lifestyle campaign"
        />
        <div>
          <p>Customer account</p>
          <h2>One login. Every order.</h2>
        </div>
      </section>
      <section className="account-page-panel">
        <AccountAccess />
      </section>
    </main>
  );
}
