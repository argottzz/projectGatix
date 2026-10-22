"use client";

import { useEffect, useState } from "react";
import { TicketX } from "lucide-react";
import { myTickets } from "../../services/registration.service";
import type { Registration, RegistrationStatus } from "../../types/registration";
import { TicketCard } from "../../components/tickets/TicketCard";
import { Loading } from "../../components/ui/Loading";
import { cn } from "../../lib/utils";

type Tab = "all" | RegistrationStatus;

const TABS: { key: Tab; label: string }[] = [
  { key: "all", label: "Semua" },
  { key: "pending", label: "Menunggu" },
  { key: "approved", label: "Disetujui" },
  { key: "cancelled", label: "Dibatalkan" },
];

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState<Registration[]>([]);
  const [tab, setTab] = useState<Tab>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await myTickets();
        setTickets(res.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal memuat tiket");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = tab === "all" ? tickets : tickets.filter((t) => t.status === tab);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand">Akun saya</p>
        <h1 className="font-display text-3xl tracking-tight text-ink md:text-4xl">Tiket Saya</h1>
        <p className="text-sm text-muted">Pantau status tiket dan kelola bukti pembayaranmu di sini.</p>
      </div>
      <div className="flex gap-1 overflow-x-auto rounded-full border border-line bg-white p-1 shadow-card sm:w-fit">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-semibold transition",
              tab === t.key ? "bg-brand text-white shadow-lift" : "text-muted hover:bg-surface-alt hover:text-ink",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      {loading ? (
        <Loading text="Memuat tiket..." />
      ) : error ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-line bg-white px-6 py-14 text-center shadow-card">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-danger-soft text-danger">
            <TicketX size={22} />
          </span>
          <p className="font-semibold text-danger">{error}</p>
          <p className="text-sm text-muted">Login dulu untuk melihat tiket.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-line bg-white px-6 py-14 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft text-brand">
            <TicketX size={22} />
          </span>
          <p className="font-semibold text-ink">Belum ada tiket pada tab ini</p>
          <p className="text-sm text-muted">Jelajahi event dan daftar sekarang.</p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {filtered.map((t) => (
            <TicketCard key={t.id} ticket={t} />
          ))}
        </div>
      )}
    </div>
  );
}
