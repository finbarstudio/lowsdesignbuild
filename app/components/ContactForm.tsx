"use client";

import { useState } from "react";

import { site } from "@/app/lib/site";

/**
 * An editorial, less-traditional contact form: no boxes — each field is an
 * oversized line of type over a hairline that a gold underline draws across on
 * focus, prefixed with a monospace index. The submit fills gold on hover.
 */
function Field({
  n,
  label,
  name,
  type = "text",
  required = false,
  placeholder,
  textarea = false,
}: {
  n: string;
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
      <span className="mb-3 flex items-center gap-3">
        <span className="font-mono text-xs text-tertiary">{n}</span>
        <span className="text-sm font-semibold tracking-tight text-ink">
          {label}
        </span>
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

export default function ContactForm({ email = site.email }: { email?: string }) {
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
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
    const subject = encodeURIComponent(`Project enquiry from ${name}`);
    window.location.href = `mailto:${email}?subject=${subject}&body=${encodeURIComponent(
      body,
    )}`;
    setSent(true);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-11">
      <div className="grid grid-cols-1 gap-11 sm:grid-cols-2">
        <Field n="01" label="First name" name="firstName" required placeholder="Jane" />
        <Field n="02" label="Last name" name="lastName" required placeholder="Low" />
      </div>
      <div className="grid grid-cols-1 gap-11 sm:grid-cols-2">
        <Field
          n="03"
          label="Email"
          name="email"
          type="email"
          required
          placeholder="jane@email.com"
        />
        <Field n="04" label="Phone" name="phone" placeholder="Optional" />
      </div>
      <Field
        n="05"
        label="Your project"
        name="message"
        required
        textarea
        placeholder="Tell us what you're dreaming up…"
      />

      {/* same link-underline token as every other link on the site */}
      <button type="submit" className="link-underline w-fit text-base">
        Send enquiry →
      </button>

      {sent && (
        <p className="text-sm text-muted">
          Thanks. Your email app should have opened with your message ready to
          send. If not, email us directly at {email}.
        </p>
      )}
    </form>
  );
}
