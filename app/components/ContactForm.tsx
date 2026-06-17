"use client";

import { useState } from "react";

import { site } from "@/app/lib/site";

const field =
  "w-full rounded-lg border border-line bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-copper";

export default function ContactForm() {
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
    window.location.href = `mailto:${site.email}?subject=${subject}&body=${encodeURIComponent(
      body,
    )}`;
    setSent(true);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <input name="firstName" required placeholder="First name" className={field} />
        <input name="lastName" required placeholder="Last name" className={field} />
      </div>
      <input name="email" type="email" required placeholder="Email" className={field} />
      <input name="phone" placeholder="Phone (optional)" className={field} />
      <textarea
        name="message"
        required
        rows={5}
        placeholder="Tell us about your project…"
        className={field}
      />
      <button
        type="submit"
        className="rounded-full bg-copper px-7 py-3 text-sm font-medium text-white transition-colors hover:bg-copper-deep"
      >
        Send enquiry
      </button>
      {sent && (
        <p className="text-sm text-muted">
          Thanks. Your email app should have opened with your message ready to
          send. If not, email us directly at {site.email}.
        </p>
      )}
    </form>
  );
}
