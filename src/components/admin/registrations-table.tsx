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
      cell: ({ row }) => labelOf(STATUSES, row.original.status, "fr"),
    },
    { accessorKey: "createdAt", header: "Date" },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-2">
          <form action={setRegistrationStatus} className="flex gap-1">
            <input type="hidden" name="id" value={row.original.id} />
            <select name="status" defaultValue={row.original.status} className="rounded-lg border border-night/10 px-2 py-1 text-xs">
              {statuses.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <button className="text-xs text-institution">OK</button>
          </form>
          <form action={resendRegistration}>
            <input type="hidden" name="id" value={row.original.id} />
            <button className="text-xs text-institution">E-mail</button>
          </form>
          <a className="text-xs text-institution" href={`/api/billet/${row.original.token}`}>PDF</a>
          <span className="text-xs text-institution">{row.original.emailSent ? "Mail ok" : "Mail en attente"}</span>
          {row.original.hasCv ? <a className="text-xs text-institution" href={`/api/admin/cv/${row.original.id}`}>CV</a> : null}
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
    <div className="overflow-x-auto rounded-3xl bg-white">
      <table className="w-full min-w-[860px] text-start text-sm">
        <thead className="border-b border-night/10 text-xs uppercase tracking-[0.12em] text-institution">
          {table.getHeaderGroups().map((group) => (
            <tr key={group.id}>
              {group.headers.map((header) => (
                <th key={header.id} className="px-3 py-3 font-medium">
                  {header.isPlaceholder ? null : (
                    <button type="button" className="text-start" onClick={header.column.getToggleSortingHandler()}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </button>
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-b border-night/5 align-top">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-3 py-3">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
          {rows.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-3 py-8 text-center text-institution">Aucune inscription pour ces filtres.</td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
