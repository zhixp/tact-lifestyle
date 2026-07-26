"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Arrow } from "./Icons";

export function AccountAccess() {
  const [step, setStep] = useState<"phone" | "code" | "done">("phone");

  function submitPhone(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStep("code");
  }

  function submitCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStep("done");
  }

  return (
    <div className="account-access-card">
      {step === "phone" ? (
        <>
          <p className="kicker">Member access</p>
          <h1>Your TACT account.</h1>
          <p>
            Sign in to track orders, save addresses and receive 10% off your
            first eligible order.
          </p>
          <form onSubmit={submitPhone}>
            <label htmlFor="login-phone">Mobile number</label>
            <div className="account-phone-field">
              <span>🇮🇳 +91</span>
              <input
                id="login-phone"
                type="tel"
                inputMode="numeric"
                pattern="[0-9]{10}"
                placeholder="Enter 10-digit number"
                required
              />
            </div>
            <label className="account-consent">
              <input type="checkbox" name="marketing" />
              Notify me about offers, drops and restocks
            </label>
            <button className="button button-dark" type="submit">
              Continue <Arrow />
            </button>
          </form>
        </>
      ) : null}

      {step === "code" ? (
        <>
          <p className="kicker">Secure sign in</p>
          <h1>Check your phone.</h1>
          <p>Enter the six-digit code sent to your mobile number.</p>
          <form onSubmit={submitCode}>
            <label htmlFor="login-code">Six-digit code</label>
            <input
              className="account-code-field"
              id="login-code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              placeholder="000000"
              required
            />
            <button className="button button-dark" type="submit">
              Sign in <Arrow />
            </button>
            <button
              className="account-back"
              type="button"
              onClick={() => setStep("phone")}
            >
              Change number
            </button>
          </form>
        </>
      ) : null}

      {step === "done" ? (
        <>
          <p className="kicker">Demo complete</p>
          <h1>Account flow ready.</h1>
          <p>
            The uploaded Shopify theme connects this screen to Shopify Customer
            Accounts or the store&apos;s KiwiPass login app.
          </p>
          <Link className="button button-dark" href="/account">
            View profile <Arrow />
          </Link>
        </>
      ) : null}

      <p className="account-legal">
        By continuing, you agree to TACT&apos;s{" "}
        <Link href="/policies/privacy-policy">Privacy Policy</Link> and terms.
      </p>
    </div>
  );
}
