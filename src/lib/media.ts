export function youtubeId(url: string) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      const id = parsed.pathname.split("/").filter(Boolean)[0] ?? "";
      return /^[\w-]{11}$/.test(id) ? id : null;
    }
    if (host === "youtube.com" || host === "m.youtube.com") {
      const fromQuery = parsed.searchParams.get("v") ?? "";
      if (/^[\w-]{11}$/.test(fromQuery)) return fromQuery;
      const embed = parsed.pathname.match(/\/embed\/([\w-]{11})/);
      return embed?.[1] ?? null;
    }
  } catch {
    return null;
  }
  return null;
}

export function vimeoId(url: string) {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.replace(/^www\./, "").endsWith("vimeo.com")) return null;
    const id = parsed.pathname.split("/").filter(Boolean).pop() ?? "";
    return /^\d+$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

export function safeAssetUrl(url: string) {
  if (!url) return null;
  if (url.startsWith("/uploads/") && !url.includes("..")) return url;
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "https:") return parsed.toString();
  } catch {
    return null;
  }
  return null;
}
