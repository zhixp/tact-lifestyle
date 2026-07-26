import Link from "next/link";
import { Arrow } from "../components/Icons";

export default function AccountPage() {
  return (
    <main id="main" className="inner-main account-dashboard">
      <header>
        <p className="kicker">Customer account</p>
        <h1>Welcome to TACT.</h1>
        <p>Orders, addresses and personal details—kept in one clean place.</p>
      </header>
      <div className="account-dashboard-grid">
        <section>
          <div className="account-dashboard-heading">
            <h2>Orders</h2>
            <span>0 orders</span>
          </div>
          <div className="account-empty">
            <p>Your rotation is waiting.</p>
            <Link className="button button-dark" href="/collections/all">
              Shop new arrivals <Arrow />
            </Link>
          </div>
        </section>
        <aside>
          <h2>Account details</h2>
          <dl>
            <div>
              <dt>Name</dt>
              <dd>TACT member</dd>
            </div>
            <div>
              <dt>Mobile</dt>
              <dd>+91 ••••• •••••</dd>
            </div>
            <div>
              <dt>Default address</dt>
              <dd>Add an address after secure sign-in</dd>
            </div>
          </dl>
          <Link href="/account/login">
            Manage account <Arrow />
          </Link>
        </aside>
      </div>
    </main>
  );
}
