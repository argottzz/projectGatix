"use client";

import { useEffect, useState } from "react";
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
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-extrabold text-[#161616]">Tiket Saya</h1>
      <div className="flex gap-2 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-semibold",
              tab === t.key ? "border-[#FF6A00] bg-[#FF6A00]/10 text-[#FF6A00]" : "border-[#E5E7EB] bg-white text-[#161616]",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      {loading ? (
        <Loading text="Memuat tiket..." />
      ) : error ? (
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 text-center">
          <p className="font-semibold text-[#DC2626]">{error}</p>
          <p className="text-sm text-[#737373]">Login dulu untuk melihat tiket.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#E5E7EB] bg-white p-10 text-center">
          <p className="font-semibold">Belum ada tiket pada tab ini</p>
          <p className="text-sm text-[#737373]">Jelajahi event dan daftar sekarang.</p>
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
