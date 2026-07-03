"use client";

import { useEffect, useState } from "react";

import { CalendlyPopupButton } from "@/app/components/Calendly";
import { FORM_CARD, FORM_GRID } from "@/app/lib/ui";

// The email is stored in localStorage so the contact form can prefill it later;
// the UNLOCK is only kept for the tab session, so the estimator re-hides behind
// the email gate on each fresh visit.
export const ESTIMATE_EMAIL_KEY = "lows_estimate_email";
export const ESTIMATE_NAME_KEY = "lows_estimate_name";
const UNLOCK_KEY = "lows_estimate_unlocked";
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
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    try {
      // Only skip the gate within the same session.
      if (sessionStorage.getItem(UNLOCK_KEY)) setUnlocked(true);
    } catch {
      /* private mode / storage disabled — just show the gate */
    }
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = name.trim();
    const v = email.trim();
    if (!n) {
      setErr("Please enter your name.");
      return;
    }
    if (!EMAIL_RE.test(v)) {
      setErr("Please enter a valid email address.");
      return;
    }
    try {
      // both persist so the contact form can prefill them later
      localStorage.setItem(ESTIMATE_NAME_KEY, n);
      localStorage.setItem(ESTIMATE_EMAIL_KEY, v);
      sessionStorage.setItem(UNLOCK_KEY, "1"); // unlock only for this session
    } catch {
      /* ignore */
    }
    setUnlocked(true);
  };

  if (unlocked)
    return (
      // the calculator + detailed-estimate form card themselves (two cards)
      <div className="mx-auto w-full max-w-6xl">{children}</div>
    );

  return (
    <div className={FORM_GRID}>
      {/* Left — the ESTIMATOR card: this is the tool we want visitors to see,
          so it carries a gold accent — a slow, subtle breathing gold border. */}
      <div className={`estimator-card flex flex-col ${FORM_CARD}`}>
        <style>{`
          .estimator-card { animation: est-breathe 3.4s ease-in-out infinite; }
          @keyframes est-breathe {
            0%, 100% { border-color: rgba(169,126,31,.4); box-shadow: 0 0 0 0 rgba(169,126,31,0); }
            50% { border-color: rgba(169,126,31,.85); box-shadow: 0 0 24px -8px rgba(169,126,31,.35); }
          }
          @media (prefers-reduced-motion: reduce) {
            .estimator-card { animation: none; border-color: rgba(169,126,31,.6); }
          }
        `}</style>
        <p className="label mb-6 !text-copper-deep">View the estimator</p>
        <p className="max-w-sm text-base leading-relaxed text-muted">
          Pop in your name and email and we&apos;ll unlock the instant estimate
          calculator — we&apos;ll use them to send your figures across.
        </p>
        <form onSubmit={submit} className="mt-8 space-y-8">
          <label className="group block">
            <span className="mb-3 block text-sm font-semibold tracking-tight text-ink">
              Name
            </span>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErr("");
                }}
                required
                placeholder="John Smith"
                className="w-full border-0 border-b border-line bg-transparent pb-2 text-xl outline-none transition-colors placeholder:text-muted/40 sm:text-2xl"
              />
              <span className="pointer-events-none absolute -bottom-px left-0 h-[2px] w-full origin-left scale-x-0 bg-tertiary transition-transform duration-500 ease-out group-focus-within:scale-x-100" />
            </div>
          </label>
          <label className="group block">
            <span className="mb-3 block text-sm font-semibold tracking-tight text-ink">
              Email address
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

      {/* Right — skip the calculator and book a call. Same card as the email
          column, so the two options read as consistent siblings. */}
      <div className={`flex flex-col ${FORM_CARD}`}>
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
          // No link set yet — point at the Contact page's booking section.
          <a
            href="/contact"
            className="link link-underline is-tracked mt-8 block w-fit"
          >
            Book a call
          </a>
        )}
      </div>
    </div>
  );
}
