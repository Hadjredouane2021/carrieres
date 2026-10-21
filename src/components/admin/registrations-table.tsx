"use client";

import * as Dropdown from "@radix-ui/react-dropdown-menu";
import { Ban, Check, Clock3, FileDown, FileText, Mail, MailCheck, MailWarning, MoreHorizontal, QrCode, Trash2, X } from "lucide-react";
import { useState } from "react";
import { STATUS_STYLE } from "@/lib/status-style";
import { cn, initials } from "@/lib/utils";
import { deleteRegistrations, resendRegistration, setRegistrationStatus } from "@/server/actions/admin";

export type RegistrationRow = {
  id: string;
  reference: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  type: string;
  organization: string;
  status: string;
  createdAt: string;
  emailSent: boolean;
  hasCv: boolean;
  token: string;
};


function StatusPill({ status }: { status: string }) {
  const style = STATUS_STYLE[status] ?? STATUS_STYLE.PENDING;
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset", style.tone)}>
      <span className={cn("size-1.5 rounded-full", style.dot)} />
      {style.label}
    </span>
  );
}

function Hidden({ ids, back }: { ids: string[]; back: string }) {
  return (
    <>
      {ids.map((id) => (
        <input key={id} type="hidden" name="id" value={id} />
      ))}
      <input type="hidden" name="back" value={back} />
    </>
  );
}

function confirmDelete(count: number) {
  return (event: React.FormEvent) => {
    const message = count > 1 ? `Supprimer définitivement ces ${count} inscriptions ?` : "Supprimer définitivement cette inscription ?";
    if (!window.confirm(`${message}\nLe billet et le CV associés seront perdus.`)) event.preventDefault();
  };
}

function StatusButton({ ids, back, status, children, className }: { ids: string[]; back: string; status: string; children: React.ReactNode; className?: string }) {
  return (
    <form action={setRegistrationStatus}>
      <Hidden ids={ids} back={back} />
      <input type="hidden" name="status" value={status} />
      <button className={className}>{children}</button>
    </form>
  );
}

function QuickActions({ row, back }: { row: RegistrationRow; back: string }) {
  const base = "inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition";
  return (
    <>
      {row.status !== "CONFIRMED" && row.status !== "CHECKED_IN" ? (
        <StatusButton ids={[row.id]} back={back} status="CONFIRMED" className={cn(base, "bg-night text-beige hover:bg-institution")}>
          <Check className="size-3.5" /> Confirmer
        </StatusButton>
      ) : null}
      {row.status !== "PENDING" ? (
        <StatusButton ids={[row.id]} back={back} status="PENDING" className={cn(base, "border border-night/10 text-night hover:border-amber-400 hover:bg-amber-50")}>
          <Clock3 className="size-3.5" /> En attente
        </StatusButton>
      ) : null}
    </>
  );
}

function RowMenu({ row, back, isAdmin }: { row: RegistrationRow; back: string; isAdmin: boolean }) {
  const item = "flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-night outline-none data-[highlighted]:bg-mist";
  return (
    <Dropdown.Root modal={false}>
      <Dropdown.Trigger className="grid size-8 place-items-center rounded-full text-institution hover:bg-mist hover:text-night data-[state=open]:bg-mist" aria-label={`Actions pour ${row.name}`}>
        <MoreHorizontal className="size-4" />
      </Dropdown.Trigger>
      <Dropdown.Portal>
        <Dropdown.Content align="end" sideOffset={6} className="z-50 min-w-52 rounded-2xl border border-night/10 bg-white/95 p-1.5 shadow-xl shadow-night/10 backdrop-blur">
          {row.status !== "CHECKED_IN" ? (
            <StatusButton ids={[row.id]} back={back} status="CHECKED_IN" className={item}>
              <QrCode className="size-4 text-emerald-600" /> Marquer présent
            </StatusButton>
          ) : null}
          {row.status !== "CANCELLED" ? (
            <StatusButton ids={[row.id]} back={back} status="CANCELLED" className={item}>
              <Ban className="size-4 text-zinc-500" /> Annuler l'inscription
            </StatusButton>
          ) : null}
          <Dropdown.Separator className="my-1 h-px bg-night/[0.06]" />
          <form action={resendRegistration}>
            <input type="hidden" name="id" value={row.id} />
            <input type="hidden" name="back" value={back} />
            <button className={item}>
              <Mail className="size-4 text-institution" /> Renvoyer le billet par e-mail
            </button>
          </form>
          <Dropdown.Item asChild>
            <a className={item} href={`/api/billet/${row.token}`}>
              <FileDown className="size-4 text-institution" /> Télécharger le billet
            </a>
          </Dropdown.Item>
          {row.hasCv ? (
            <Dropdown.Item asChild>
              <a className={item} href={`/api/admin/cv/${row.id}`}>
                <FileText className="size-4 text-institution" /> Télécharger le CV
              </a>
            </Dropdown.Item>
          ) : null}
          {isAdmin ? (
            <>
              <Dropdown.Separator className="my-1 h-px bg-night/[0.06]" />
              <form action={deleteRegistrations} onSubmit={confirmDelete(1)}>
                <Hidden ids={[row.id]} back={back} />
                <button className={cn(item, "text-red-700 data-[highlighted]:bg-red-50 hover:bg-red-50")}>
                  <Trash2 className="size-4" /> Supprimer
                </button>
              </form>
            </>
          ) : null}
        </Dropdown.Content>
      </Dropdown.Portal>
    </Dropdown.Root>
  );
}

function MailBadge({ sent }: { sent: boolean }) {
  return sent ? (
    <span title="Billet envoyé par e-mail" className="text-emerald-600"><MailCheck className="size-4" /></span>
  ) : (
    <span title="Billet pas encore envoyé" className="text-amber-500"><MailWarning className="size-4" /></span>
  );
}

export function RegistrationsTable({ rows, back, isAdmin }: { rows: RegistrationRow[]; back: string; isAdmin: boolean }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const visibleIds = rows.map((row) => row.id);
  const selectedIds = visibleIds.filter((id) => selected.has(id));
  const allSelected = rows.length > 0 && selectedIds.length === rows.length;

  const toggle = (id: string) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(visibleIds));
  const checkbox = "size-4 cursor-pointer rounded border-night/20 accent-[#0B1B3A]";

  if (rows.length === 0) {
    return (
      <div className="admin-card grid place-items-center gap-2 px-6 py-16 text-center">
        <span className="grid size-12 place-items-center rounded-2xl bg-mist text-institution"><Mail className="size-5" /></span>
        <p className="font-medium text-night">Aucune inscription pour ces filtres</p>
        <p className="text-sm text-institution">Changez de statut ou effacez la recherche.</p>
      </div>
    );
  }

  return (
    <>
      {/* Bureau */}
      <div className="admin-card hidden overflow-hidden lg:block">
        <table className="w-full text-start text-sm">
          <thead className="bg-mist/50 text-[11px] uppercase tracking-[0.14em] text-institution">
            <tr>
              <th className="w-12 px-4 py-3">
                <input type="checkbox" className={checkbox} checked={allSelected} onChange={toggleAll} aria-label="Tout sélectionner" />
              </th>
              <th className="px-3 py-3 text-start font-medium">Participant</th>
              <th className="px-3 py-3 text-start font-medium">Profil</th>
              <th className="px-3 py-3 text-start font-medium">Statut</th>
              <th className="px-3 py-3 text-start font-medium">Inscrit le</th>
              <th className="px-4 py-3 text-end font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-night/[0.05]">
            {rows.map((row) => (
              <tr key={row.id} className={cn("transition", selected.has(row.id) ? "bg-gold/[0.07]" : "hover:bg-mist/40")}>
                <td className="px-4 py-3">
                  <input type="checkbox" className={checkbox} checked={selected.has(row.id)} onChange={() => toggle(row.id)} aria-label={`Sélectionner ${row.name}`} />
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-mist to-beige text-xs font-semibold text-institution">{initials(row.name)}</span>
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 font-medium text-night">
                        <span className="truncate">{row.name}</span>
                        <MailBadge sent={row.emailSent} />
                      </p>
                      <p className="truncate text-xs text-institution">{row.email} · <span className="font-mono">{row.reference}</span></p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3">
                  <p className="text-night">{row.type}</p>
                  <p className="max-w-48 truncate text-xs text-institution">{[row.organization, row.city].filter(Boolean).join(" · ")}</p>
                </td>
                <td className="px-3 py-3"><StatusPill status={row.status} /></td>
                <td className="whitespace-nowrap px-3 py-3 text-institution">{row.createdAt}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1.5">
                    <QuickActions row={row} back={back} />
                    <RowMenu row={row} back={back} isAdmin={isAdmin} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile et tablette */}
      <div className="grid gap-3 lg:hidden">
        <label className="flex items-center gap-2 px-1 text-sm text-institution">
          <input type="checkbox" className={checkbox} checked={allSelected} onChange={toggleAll} /> Tout sélectionner
        </label>
        {rows.map((row) => (
          <article key={row.id} className={cn("admin-card p-4 transition", selected.has(row.id) && "ring-2 ring-gold/60")}>
            <div className="flex items-start gap-3">
              <input type="checkbox" className={cn(checkbox, "mt-2.5")} checked={selected.has(row.id)} onChange={() => toggle(row.id)} aria-label={`Sélectionner ${row.name}`} />
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-mist to-beige text-xs font-semibold text-institution">{initials(row.name)}</span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 font-medium text-night">
                  <span className="truncate">{row.name}</span>
                  <MailBadge sent={row.emailSent} />
                </p>
                <p className="truncate text-xs text-institution">{row.email}</p>
                <p className="mt-0.5 font-mono text-xs text-institution/80">{row.reference}</p>
              </div>
              <RowMenu row={row} back={back} isAdmin={isAdmin} />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-institution">
              <StatusPill status={row.status} />
              <span className="rounded-full bg-mist px-2.5 py-1">{row.type}</span>
              {row.city ? <span className="rounded-full bg-mist px-2.5 py-1">{row.city}</span> : null}
              <span className="ms-auto">{row.createdAt}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 border-t border-night/[0.06] pt-3 empty:hidden">
              <QuickActions row={row} back={back} />
            </div>
          </article>
        ))}
      </div>

      {/* Barre d'actions groupées */}
      {selectedIds.length > 0 ? (
        <div className="fixed inset-x-3 bottom-4 z-30 mx-auto flex max-w-3xl flex-wrap items-center gap-2 rounded-2xl bg-night/95 p-2 ps-4 text-beige shadow-2xl shadow-night/40 backdrop-blur md:inset-x-auto md:start-1/2 md:-translate-x-1/2 md:ps-5 rtl:md:translate-x-1/2">
          <p className="me-auto text-sm">
            <span className="font-semibold text-white">{selectedIds.length}</span> sélectionnée{selectedIds.length > 1 ? "s" : ""}
          </p>
          <StatusButton ids={selectedIds} back={back} status="CONFIRMED" className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-gold px-3 text-sm font-medium text-night hover:bg-gold-bright">
            <Check className="size-4" /> Confirmer
          </StatusButton>
          <StatusButton ids={selectedIds} back={back} status="PENDING" className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-white/10 px-3 text-sm hover:bg-white/15">
            <Clock3 className="size-4" /> En attente
          </StatusButton>
          <StatusButton ids={selectedIds} back={back} status="CANCELLED" className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-white/10 px-3 text-sm hover:bg-white/15">
            <Ban className="size-4" /> Annuler
          </StatusButton>
          {isAdmin ? (
            <form action={deleteRegistrations} onSubmit={confirmDelete(selectedIds.length)}>
              <Hidden ids={selectedIds} back={back} />
              <button className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-red-500/90 px-3 text-sm font-medium text-white hover:bg-red-500">
                <Trash2 className="size-4" /> Supprimer
              </button>
            </form>
          ) : null}
          <button type="button" onClick={() => setSelected(new Set())} className="grid size-9 place-items-center rounded-xl text-beige/70 hover:bg-white/10" aria-label="Vider la sélection">
            <X className="size-4" />
          </button>
        </div>
      ) : null}
    </>
  );
}
