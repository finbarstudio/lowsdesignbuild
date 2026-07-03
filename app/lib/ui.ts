// Shared layout tokens — keep page gutters/width consistent everywhere.

// Near-full-width page padding: centred, capped, with narrow gutters.
export const PAD = "mx-auto w-full max-w-[1900px] px-4 sm:px-6";

// Bottom padding for the LAST section on a page — one generous, consistent gap
// between the final content and the footer, everywhere.
export const FOOT = "pb-[18vh]";

// MOBILE-ONLY subtle card around single-column forms (matches the Calendly
// mock's framing): a hairline border + padding so a form separates cleanly from
// the surrounding text — especially when a page holds more than one form.
export const FORM_CARD =
  "max-sm:rounded-sm max-sm:border max-sm:border-line max-sm:bg-background max-sm:p-6";
