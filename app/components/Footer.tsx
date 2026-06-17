"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";

import { site } from "@/app/lib/site";

const YEAR = 2026;

function EnquiryForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const body = encodeURIComponent(`${message}\n\nFrom: ${email}`);
    window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(
      "Website enquiry",
    )}&body=${body}`;
  };

  const field =
    "w-full border-b border-ink/25 bg-transparent py-2 text-sm outline-none transition-colors placeholder:text-muted focus:border-ink";

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <p className="text-sm">Ask us anything and we&apos;ll get back to you</p>
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="name@email.com"
        className={field}
      />
      <textarea
        required
        rows={2}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Message…"
        className={`${field} resize-none`}
      />
      <button type="submit" className="link-underline self-start text-sm">
        Submit
      </button>
    </form>
  );
}

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/studio")) return null;

  return (
    <footer className="overflow-hidden">
      <div className="mx-auto w-full max-w-[1900px] px-4 pb-6 pt-24 sm:px-6 sm:pt-32">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* credit */}
          <div className="text-sm">
            <p>Family-run design &amp; build</p>
            <p className="mt-2 text-muted">
              © {site.name} {YEAR}
            </p>
          </div>

          {/* location + contact */}
          <div className="text-sm">
            <p>
              We work across South London
              <br />
              &amp; the surrounding areas.
            </p>
            <a
              href={`mailto:${site.email}`}
              className="link-underline mt-5 block"
            >
              {site.email}
            </a>
            <a href={site.phoneHref} className="link-underline block">
              {site.phone}
            </a>
          </div>

          {/* social */}
          <div className="text-sm">
            <a
              href={site.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="link-underline block"
            >
              Instagram
            </a>
          </div>

          {/* enquiry form */}
          <EnquiryForm />
        </div>

        {/* oversized wordmark */}
        <p className="mt-20 select-none whitespace-nowrap font-sans text-[9vw] font-bold leading-[0.8] tracking-tighter text-ink">
          Lows Design &amp; Build
        </p>
      </div>
    </footer>
  );
}
