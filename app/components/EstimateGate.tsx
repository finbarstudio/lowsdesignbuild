"use client";

import { useEffect, useState } from "react";

import { CalendlyPopupButton } from "@/app/components/Calendly";

// Where we stash the visitor's email so the contact form can prefill it later.
export const ESTIMATE_EMAIL_KEY = "lows_estimate_email";
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/**
 * Gates the estimate calculator behind an email. Two columns: enter your email
 * to unlock the estimator on the left, or — if you already know your scope —
 * book a call (Calendly) on the right. The email is saved to localStorage so the
 * contact form can prefill it. Once entered (or on a return visit), the gate is
 * replaced by the calculator (`children`).
 */
export default function EstimateGate({
  calendlyUrl,
  children,
}: {
  calendlyUrl?: string | null;
  children: React.ReactNode;
}) {
  const [unlocked, setUnlocked] = useState(false);
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    try {
      if (localStorage.getItem(ESTIMATE_EMAIL_KEY)) setUnlocked(true);
    } catch {
      /* private mode / storage disabled — just show the gate */
    }
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = email.trim();
    if (!EMAIL_RE.test(v)) {
      setErr("Please enter a valid email address.");
      return;
    }
    try {
      localStorage.setItem(ESTIMATE_EMAIL_KEY, v);
    } catch {
      /* ignore */
    }
    setUnlocked(true);
  };

  if (unlocked) return <>{children}</>;

  return (
    <div className="mx-auto grid max-w-4xl grid-cols-1 gap-14 md:grid-cols-2 md:gap-16">
      {/* Left — unlock the estimator with your email */}
      <div className="flex flex-col">
        <p className="label mb-6 !text-ink">View the estimator</p>
        <p className="max-w-sm text-base leading-relaxed text-muted">
          Pop in your email and we&apos;ll unlock the instant estimate
          calculator — we&apos;ll use it to send your figures across.
        </p>
        <form onSubmit={submit} className="mt-8">
          <label className="group block">
            <span className="mb-3 flex items-center gap-3">
              <span className="font-mono text-xs text-tertiary">01</span>
              <span className="text-sm font-semibold tracking-tight text-ink">
                Email address
              </span>
            </span>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErr("");
                }}
                required
                placeholder="you@email.com"
                className="w-full border-0 border-b border-line bg-transparent pb-2 text-xl outline-none transition-colors placeholder:text-muted/40 sm:text-2xl"
              />
              <span className="pointer-events-none absolute -bottom-px left-0 h-[2px] w-full origin-left scale-x-0 bg-tertiary transition-transform duration-500 ease-out group-focus-within:scale-x-100" />
            </div>
          </label>
          <button
            type="submit"
            className="link link-underline is-tracked mt-7 block w-fit"
          >
            View estimator
          </button>
          {err && <p className="mt-3 text-sm text-tertiary">{err}</p>}
        </form>
      </div>

      {/* Right — skip the calculator and book a call */}
      <div className="flex flex-col md:border-l md:border-line md:pl-16">
        <p className="label mb-6 !text-ink">Or already know your scope?</p>
        <p className="max-w-sm text-base leading-relaxed text-muted">
          Skip the calculator and book a call — we&apos;ll talk through your
          project and give you a proper steer.
        </p>
        {calendlyUrl ? (
          <CalendlyPopupButton
            url={calendlyUrl}
            className="link link-underline is-tracked mt-8 block w-fit"
          >
            Book a call
          </CalendlyPopupButton>
        ) : (
          <a
            href="/contact"
            className="link link-underline is-tracked mt-8 block w-fit"
          >
            Get in touch
          </a>
        )}
      </div>
    </div>
  );
}
