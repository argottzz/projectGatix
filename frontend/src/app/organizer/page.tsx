"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays, Users } from "lucide-react";
import { listEvents } from "../../services/event.service";
import { listEventRegistrations } from "../../services/registration.service";
import type { EventItem } from "../../types/event";
import type { Registration } from "../../types/registration";
import { OrganizerSidebar } from "../../components/layout/OrganizerSidebar";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { StatusBadge } from "../../components/ui/StatusBadge";

interface PendingItem extends Registration {
  event_title: string;
}

export default function OrganizerDashboard() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [totalEvents, setTotalEvents] = useState(0);
  const [totalPeserta, setTotalPeserta] = useState(0);
  const [pending, setPending] = useState<PendingItem[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await listEvents({ limit: 50 });
        setEvents(res.data.slice(0, 5));
        setTotalEvents(res.pagination.total);
        setTotalPeserta(res.data.reduce((s, e) => s + Number(e.taken ?? 0), 0));
        const results = await Promise.all(
          res.data.slice(0, 10).map(async (e) => {
            try {
              const r = await listEventRegistrations(e.id);
              return r.data
                .filter((reg) => reg.status === "pending")
                .map((reg) => ({ ...reg, event_title: e.title }));
            } catch {
              // lewati event yang gagal dimuat (mis. bukan milik organizer ini)
              return [];
            }
          }),
        );
        setPending(results.flat().slice(0, 5));
      } catch {
        setEvents([]);
      }
    })();
  }, []);

  return (
    <div className="flex flex-col gap-6 md:flex-row">
      <OrganizerSidebar />
      <div className="flex min-w-0 flex-1 flex-col gap-5">
        <div className="flex flex-col gap-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand">Ruang organizer</p>
          <h1 className="font-display text-3xl tracking-tight text-ink md:text-4xl">Dashboard Organizer</h1>
          <p className="text-sm text-muted">Ringkasan event dan pendaftaran yang perlu diperiksa.</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <Card className="p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand">
              <CalendarDays size={18} />
            </span>
            <p className="mt-3 text-2xl font-extrabold text-ink">{totalEvents}</p>
            <p className="text-xs text-muted">Total event</p>
          </Card>
          <Card className="p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand">
              <Users size={18} />
            </span>
            <p className="mt-3 text-2xl font-extrabold text-ink">{totalPeserta}</p>
            <p className="text-xs text-muted">Total peserta</p>
          </Card>
          <Card className="flex flex-col justify-between gap-3 border-brand-line bg-brand-soft p-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand">Kelola</p>
              <p className="mt-1 font-display text-2xl leading-tight text-ink">Siap bikin event baru?</p>
            </div>
            <Link href="/organizer/events/create">
              <Button className="w-full">Tambah event</Button>
            </Link>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="p-5">
            <div className="flex items-center justify-between gap-2">
              <p className="font-bold text-ink">Menunggu pemeriksaan</p>
              <Link href="/organizer/registrations" className="text-xs font-semibold text-brand hover:underline">
                Lihat semua
              </Link>
            </div>
            {pending.length === 0 ? (
              <p className="mt-3 text-sm text-muted">Tidak ada pendaftaran menunggu.</p>
            ) : (
              <ul className="mt-2 flex flex-col divide-y divide-line">
                {pending.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-alt text-xs font-bold text-brand">
                        {(p.user_name ?? "U").slice(0, 1).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink">
                          {p.user_name ?? `User #${p.user_id}`}
                        </p>
                        <p className="truncate text-xs text-muted">{p.event_title}</p>
                      </div>
                    </div>
                    <Link href="/organizer/registrations">
                      <StatusBadge status={p.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between gap-2">
              <p className="font-bold text-ink">Event terbaru yang dikelola</p>
              <Link href="/organizer/events" className="text-xs font-semibold text-brand hover:underline">
                Event saya
              </Link>
            </div>
            {events.length === 0 ? (
              <p className="mt-3 text-sm text-muted">Belum ada event yang dikelola.</p>
            ) : (
              <ul className="mt-2 flex flex-col divide-y divide-line">
                {events.map((e) => {
                  const taken = Number(e.taken ?? 0);
                  const percent = Math.min(100, (taken / Math.max(1, e.quota)) * 100);
                  return (
                    <li key={e.id} className="py-3">
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="truncate font-medium text-ink">{e.title}</span>
                        <span className="shrink-0 text-xs text-muted">
                          {taken}/{e.quota} peserta
                        </span>
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-alt">
                        <div className="h-full rounded-full bg-brand" style={{ width: `${percent}%` }} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
