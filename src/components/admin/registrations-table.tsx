"use client";

import { flexRender, type SortingState } from "@tanstack/react-table";
import { getCoreRowModel, getSortedRowModel, useLegacyTable, type LegacyColumnDef } from "@tanstack/react-table/legacy";
import { useState } from "react";
import { labelOf, STATUSES } from "@/lib/constants";
import { resendRegistration, setRegistrationStatus } from "@/server/actions/admin";

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

const statuses = [
  ["PENDING", "En attente"],
  ["CONFIRMED", "Confirmée"],
  ["CHECKED_IN", "Présent"],
  ["CANCELLED", "Annulée"],
] as const;

const pill = "inline-flex items-center rounded-full border border-night/15 bg-white px-2.5 py-1 text-xs font-medium text-night transition hover:border-night/35";

const statusTone: Record<string, string> = {
  PENDING: "bg-sun/15 text-sun-ink",
  CONFIRMED: "bg-sky-50 text-sky-800",
  CHECKED_IN: "bg-emerald-50 text-emerald-800",
  CANCELLED: "bg-red-50 text-red-800",
};

export function RegistrationsTable({ rows }: { rows: RegistrationRow[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const columns: LegacyColumnDef<RegistrationRow>[] = [
    { accessorKey: "reference", header: "Référence" },
    { accessorKey: "name", header: "Participant" },
    { accessorKey: "email", header: "E-mail" },
    { accessorKey: "type", header: "Profil" },
    { accessorKey: "city", header: "Ville" },
    {
      accessorKey: "status",
      header: "Statut",
      cell: ({ row }) => (
        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusTone[row.original.status] ?? "bg-night/[0.06] text-muted"}`}>
          {labelOf(STATUSES, row.original.status, "fr")}
        </span>
      ),
    },
    { accessorKey: "createdAt", header: "Date" },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-2">
          <form action={setRegistrationStatus} className="flex gap-1">
            <input type="hidden" name="id" value={row.original.id} />
            <select name="status" defaultValue={row.original.status} aria-label={`Statut de ${row.original.name}`} className="rounded-lg border border-night/15 bg-white px-2 py-1 text-xs">
              {statuses.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <button className={pill}>Appliquer</button>
          </form>
          <form action={resendRegistration}>
            <input type="hidden" name="id" value={row.original.id} />
            <button className={pill} title="Renvoyer l'e-mail de confirmation et le billet">Renvoyer</button>
          </form>
          <a className={pill} href={`/api/billet/${row.original.token}`}>PDF</a>
          {row.original.hasCv ? <a className={pill} href={`/api/admin/cv/${row.original.id}`}>CV</a> : null}
          <span className={`inline-flex items-center rounded-full px-2 py-1 text-[11px] font-medium ${row.original.emailSent ? "text-emerald-700" : "text-sun-ink"}`}>
            {row.original.emailSent ? "E-mail envoyé" : "E-mail en attente"}
          </span>
        </div>
      ),
    },
  ];

  const table = useLegacyTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="overflow-x-auto rounded-2xl bg-white ring-1 ring-night/[0.07]">
      <table className="w-full min-w-[960px] text-start text-sm">
        <thead className="border-b border-night/10 bg-mist/60 text-[11px] uppercase tracking-[0.12em] text-muted">
          {table.getHeaderGroups().map((group) => (
            <tr key={group.id}>
              {group.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-3 py-3 font-semibold"
                  aria-sort={header.column.getIsSorted() === "asc" ? "ascending" : header.column.getIsSorted() === "desc" ? "descending" : undefined}
                >
                  {header.isPlaceholder ? null : header.column.getCanSort() && header.column.id !== "actions" ? (
                    <button type="button" className="inline-flex items-center gap-1 text-start hover:text-night" onClick={header.column.getToggleSortingHandler()}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      <span aria-hidden="true">{header.column.getIsSorted() === "asc" ? "↑" : header.column.getIsSorted() === "desc" ? "↓" : "↕"}</span>
                    </button>
                  ) : (
                    flexRender(header.column.columnDef.header, header.getContext())
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-b border-night/5 align-top transition hover:bg-mist/40">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-3 py-3">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
          {rows.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-3 py-10 text-center text-muted">Aucune inscription pour ces filtres.</td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
