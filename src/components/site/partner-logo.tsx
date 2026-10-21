"use client";

import { useCallback, useState } from "react";

// Logo absent ou introuvable sur le serveur (lien mort, volume d'uploads non restauré) : le nom prend sa place.
export function PartnerLogo({ src, name }: { src: string | null; name: string }) {
  const [failed, setFailed] = useState(false);

  // Une image déjà en échec avant l'hydratation ne déclenche plus onError.
  const watch = useCallback((node: HTMLImageElement | null) => {
    if (node?.complete && node.naturalWidth === 0) setFailed(true);
  }, []);

  if (!src || failed) {
    return <span className="display text-base leading-tight text-night sm:text-lg">{name}</span>;
  }
  return (
    // Logos déposés depuis le back-office, éventuellement sur un hôte https externe.
    // eslint-disable-next-line @next/next/no-img-element
    <img ref={watch} src={src} alt={name} loading="lazy" onError={() => setFailed(true)} className="max-h-14 max-w-full object-contain" />
  );
}
