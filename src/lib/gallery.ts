import type { GalleryEntry } from "@/components/site/gallery-grid";
import { tx, type Locale } from "@/lib/i18n";
import { safeAssetUrl, vimeoId, youtubeId } from "@/lib/media";
import type { SiteData } from "@/lib/site-types";

// Seuls les éléments dotés d'un média réel sont publiés : une galerie sans média reste vide.
export function galleryEntries(site: SiteData, locale: Locale): GalleryEntry[] {
  return site.gallery.flatMap((item): GalleryEntry[] => {
    const caption = tx(locale, item.caption.fr, item.caption.ar);
    if (item.type === "VIDEO") {
      const youtube = youtubeId(item.url);
      if (youtube) return [{ id: item.id, kind: "youtube", src: `https://www.youtube-nocookie.com/embed/${youtube}`, caption }];
      const vimeo = vimeoId(item.url);
      return vimeo ? [{ id: item.id, kind: "vimeo", src: `https://player.vimeo.com/video/${vimeo}`, caption }] : [];
    }
    const image = safeAssetUrl(item.url);
    return image ? [{ id: item.id, kind: "image", src: image, caption }] : [];
  });
}
