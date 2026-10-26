"use client";

import { useCallback, useState } from "react";

// Taille optique : chaque logo occupe la même surface visuelle, qu'il soit très large ou presque carré.
const AREA = 120 * 44;
const MAX_WIDTH = 150;
const MAX_HEIGHT = 64;

function opticalSize(width: number, height: number) {
  const ratio = width / height;
  let w = Math.sqrt(AREA * ratio);
  let h = w / ratio;
  if (w > MAX_WIDTH) [w, h] = [MAX_WIDTH, MAX_WIDTH / ratio];
  if (h > MAX_HEIGHT) [w, h] = [MAX_HEIGHT * ratio, MAX_HEIGHT];
  return { width: Math.round(w), height: Math.round(h) };
}

// Logo absent ou introuvable sur le serveur (lien mort, volume d'uploads non restauré) : le nom prend sa place.
export function PartnerLogo({ src, name }: { src: string | null; name: string }) {
  const [failed, setFailed] = useState(false);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);

  const measure = useCallback((node: HTMLImageElement) => {
    if (node.naturalWidth && node.naturalHeight) setSize(opticalSize(node.naturalWidth, node.naturalHeight));
  }, []);

  // Une image déjà chargée (ou en échec) avant l'hydratation ne déclenche plus onLoad / onError.
  const watch = useCallback(
    (node: HTMLImageElement | null) => {
      if (!node?.complete) return;
      if (node.naturalWidth === 0) setFailed(true);
      else measure(node);
    },
    [measure],
  );

  if (!src || failed) {
    return <span className="display text-base leading-tight text-night sm:text-lg">{name}</span>;
  }
  return (
    // Logos déposés depuis le back-office, éventuellement sur un hôte https externe.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={watch}
      src={src}
      alt={name}
      loading="lazy"
      onLoad={(event) => measure(event.currentTarget)}
      onError={() => setFailed(true)}
      style={size ?? undefined}
      className={size ? "max-w-full object-contain" : "max-h-12 max-w-[70%] object-contain"}
    />
  );
}
