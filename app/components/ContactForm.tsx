"use client";

import { useEffect, useRef, useState } from "react";

import { site } from "@/app/lib/site";
import { submitEnquiry } from "@/app/lib/submitEnquiry";

// Same keys EstimateGate saves the visitor's details under, so we can prefill.
const ESTIMATE_EMAIL_KEY = "lows_estimate_email";
const ESTIMATE_NAME_KEY = "lows_estimate_name";

/**
 * An editorial, less-traditional contact form: no boxes — each field is an
 * oversized line of type over a hairline that a gold underline draws across on
 * focus. The submit fills gold on hover.
 */
function Field({
  label,
  name,
  type = "text",
  required = false,
  placeholder,
  textarea = false,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  textarea?: boolean;
}) {
  const base =
    "w-full border-0 border-b border-line bg-transparent pb-2 text-xl outline-none transition-colors placeholder:text-muted/40 sm:text-2xl";
  return (
    <label className="group block">
      {/* field title kept a level below section headings: sentence case + small,
          matching the calculator form so the two read consistently */}
      <span className="mb-3 block text-sm font-semibold tracking-tight text-ink">
        {label}
      </span>
      <div className="relative">
        {textarea ? (
          <textarea
            name={name}
            required={required}
            placeholder={placeholder}
            rows={3}
            className={`${base} resize-none`}
          />
        ) : (
          <input
            name={name}
            type={type}
            required={required}
            placeholder={placeholder}
            className={base}
          />
        )}
        {/* gold underline draws left→right while the field is focused */}
        <span className="pointer-events-none absolute -bottom-px left-0 h-[2px] w-full origin-left scale-x-0 bg-tertiary transition-transform duration-500 ease-out group-focus-within:scale-x-100" />
      </div>
    </label>
  );
}

export default function ContactForm({
  email = site.email,
  accessKey,
}: {
  email?: string;
  accessKey?: string;
}) {
  const [sent, setSent] = useState<"" | "sent" | "mailto">("");
  const formRef = useRef<HTMLFormElement>(null);

  // Prefill the email + name from the estimator gate (if they unlocked it).
  useEffect(() => {
    try {
      const form = formRef.current;
      if (!form) return;
      const fill = (sel: string, value: string | null) => {
        const input = form.querySelector<HTMLInputElement>(sel);
        if (value && input && !input.value) input.value = value;
      };
      fill('input[name="email"]', localStorage.getItem(ESTIMATE_EMAIL_KEY));
      const name = localStorage.getItem(ESTIMATE_NAME_KEY)?.trim();
      if (name) {
        const [first, ...rest] = name.split(/\s+/);
        fill('input[name="firstName"]', first);
        fill('input[name="lastName"]', rest.join(" ") || null);
      }
    } catch {
      /* storage disabled — nothing to prefill */
    }
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = `${data.get("firstName")} ${data.get("lastName")}`.trim();
    const body = [
      `Name: ${name}`,
      `Email: ${data.get("email")}`,
      `Phone: ${data.get("phone")}`,
      "",
      `${data.get("message")}`,
    ].join("\n");
    const result = await submitEnquiry({
      accessKey,
      recipient: email,
      replyTo: String(data.get("email") || ""),
      subject: `Project enquiry from ${name}`,
      message: body,
    });
    setSent(result === "failed" ? "mailto" : result);
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-11">
      <div className="grid grid-cols-1 gap-11 sm:grid-cols-2">
        <Field label="First name" name="firstName" required placeholder="John" />
        <Field label="Last name" name="lastName" required placeholder="Smith" />
      </div>
      <div className="grid grid-cols-1 gap-11 sm:grid-cols-2">
        <Field
          label="Email"
          name="email"
          type="email"
          required
          placeholder="john@email.com"
        />
        <Field label="Phone" name="phone" placeholder="Optional" />
      </div>
      <Field
        label="Your project"
        name="message"
        required
        textarea
        placeholder="Tell us what you're dreaming up…"
      />

      {/* shared link token (Space Mono, uppercase) — same as every other link */}
      <button type="submit" className="link link-underline is-tracked w-fit">
        Send enquiry
      </button>

      {sent === "sent" && (
        <p className="text-sm text-muted">
          Thanks — your message is on its way to us. We&apos;ll be in touch
          shortly.
        </p>
      )}
      {sent === "mailto" && (
        <p className="text-sm text-muted">
          Thanks. Your email app should have opened with your message ready to
          send. If not, email us directly at {email}.
        </p>
      )}
    </form>
  );
}
