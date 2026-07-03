// Shared layout tokens — keep page gutters/width consistent everywhere.

// Near-full-width page padding: centred, capped, with narrow gutters.
export const PAD = "mx-auto w-full max-w-[1900px] px-4 sm:px-6";

// Bottom padding for the LAST section on a page — one generous, consistent gap
// between the final content and the footer, everywhere.
export const FOOT = "pb-[18vh]";

// Subtle card around forms (all breakpoints — matches the Calendly mock's
// framing): a hairline border + padding so a form separates cleanly from the
// surrounding text, especially when a page holds more than one form.
export const FORM_CARD =
  "rounded-sm border border-line bg-background p-6 sm:p-8";

// The shared two-column layout for the form pages (contact / estimate gate):
// identical width, columns and gap so both pages read the same.
export const FORM_GRID =
  "mx-auto grid w-full max-w-6xl grid-cols-1 gap-10 lg:grid-cols-2";
