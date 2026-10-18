/**
 * Returns the URL only if it uses a safe scheme (http/https/mailto) or is a
 * relative/hash link; otherwise '#'. Prevents javascript:/data: links from
 * user- or API-supplied content executing on click.
 */
export function safeHref(url: string | null | undefined): string {
  if (!url) return '#';
  const trimmed = url.trim();
  if (/^(https?:|mailto:)/i.test(trimmed)) return trimmed;
  if (/^(#|\/(?!\/)|\.{0,2}\/)/.test(trimmed)) return trimmed;
  return '#';
}
