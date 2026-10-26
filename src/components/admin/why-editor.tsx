"use client";

import { useState } from "react";
import { AdminField, BilingualFields } from "@/components/admin/kit";
import { WhyCardVisual } from "@/components/admin/why-card";
import { cn } from "@/lib/utils";
import { WHY_TONE_LABELS } from "@/lib/why-bento";

const BODY_IDEAL = 120;

// Champs d'une carte avec aperçu en direct, dans le style de la position qu'elle occupera sur le site.
export function WhyEditorFields({
  position,
  initial,
}: {
  position: number;
  initial: { titleFr: string; titleAr: string; bodyFr: string; bodyAr: string; icon: string };
}) {
  const [title, setTitle] = useState(initial.titleFr);
  const [body, setBody] = useState(initial.bodyFr);
  const icon = initial.icon;
  const place = position === 0 ? "Citation" : `Carte ${WHY_TONE_LABELS[(position - 1) % WHY_TONE_LABELS.length]}`;

  return (
    <div className="grid gap-5">
      <div className="grid gap-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold uppercase tracking-[0.2em] text-sun-ink">Aperçu sur le site</span>
          <span className="rounded-full bg-mist px-2 py-0.5 text-muted">
            Position {position + 1} · {place}
          </span>
        </div>
        <WhyCardVisual position={position} title={title} body={body} />
      </div>

      <BilingualFields
        fr={
          <AdminField label="Titre">
            <input className="field" name="titleFr" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ex. Rencontrer les employeurs" required />
          </AdminField>
        }
        ar={
          <AdminField label="Titre (arabe)">
            <input className="field" name="titleAr" dir="rtl" defaultValue={initial.titleAr} />
          </AdminField>
        }
      />
      <BilingualFields
        fr={
          <label className="grid content-start gap-1.5 text-sm">
            <span className="font-medium text-night">Texte</span>
            <textarea className="field min-h-24" name="bodyFr" value={body} onChange={(event) => setBody(event.target.value)} required />
            <span className={cn("text-xs tabular-nums", body.trim().length > BODY_IDEAL ? "text-amber-700" : "text-muted")}>
              {body.trim().length} / {BODY_IDEAL} caractères conseillés
            </span>
          </label>
        }
        ar={
          <AdminField label="Texte (arabe)">
            <textarea className="field min-h-24" name="bodyAr" dir="rtl" defaultValue={initial.bodyAr} />
          </AdminField>
        }
      />

      {/* Les icônes ne sont plus affichées sur le site : la valeur actuelle est conservée. */}
      <input type="hidden" name="icon" value={icon} />
    </div>
  );
}
