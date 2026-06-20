// Sends an enquiry. If a Web3Forms access key is configured (in the CMS), the
// message is POSTed and emailed straight to the business — reliably, server-free,
// with the full calculator data in the body. Without a key it falls back to a
// pre-filled mailto (the visitor's mail app), so nothing is ever lost.
export async function submitEnquiry({
  accessKey,
  recipient,
  subject,
  message,
}: {
  accessKey?: string;
  recipient: string;
  subject: string;
  message: string;
}): Promise<"sent" | "mailto"> {
  if (accessKey) {
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: accessKey,
          subject,
          message,
          from_name: "Lows Design & Build website",
        }),
      });
      const json = await res.json().catch(() => null);
      if (json?.success) return "sent";
    } catch {
      // fall through to mailto
    }
  }
  window.location.href = `mailto:${recipient}?subject=${encodeURIComponent(
    subject,
  )}&body=${encodeURIComponent(message)}`;
  return "mailto";
}
