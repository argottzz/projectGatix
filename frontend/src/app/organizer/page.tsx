"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
        const all: PendingItem[] = [];
        for (const e of res.data.slice(0, 10)) {
          try {
            const r = await listEventRegistrations(e.id);
            for (const reg of r.data) {
              if (reg.status === "pending") all.push({ ...reg, event_title: e.title });
            }
          } catch {
            // lewati event yang gagal dimuat (mis. bukan milik organizer ini)
          }
        }
        setPending(all.slice(0, 5));
      } catch {
        setEvents([]);
      }
    })();
  }, []);

  return (
    <div className="flex flex-col gap-4 md:flex-row">
      <OrganizerSidebar />
      <div className="flex flex-1 flex-col gap-4">
        <h1 className="text-2xl font-extrabold text-[#161616]">Dashboard Organizer</h1>
        <div className="grid gap-3 sm:grid-cols-3">
          <Card className="p-4">
            <p className="text-xs text-[#737373]">Total event</p>
            <p className="text-2xl font-extrabold">{totalEvents}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-[#737373]">Total peserta</p>
            <p className="text-2xl font-extrabold">{totalPeserta}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-[#737373]">Kelola</p>
            <Link href="/organizer/events/create"><Button className="mt-2">Tambah event</Button></Link>
          </Card>
        </div>
        <Card className="p-4">
          <p className="font-bold">Menunggu pemeriksaan</p>
          {pending.length === 0 ? (
            <p className="mt-1 text-sm text-[#737373]">Tidak ada pendaftaran menunggu.</p>
          ) : (
            <ul className="mt-2 flex flex-col gap-1 text-sm">
              {pending.map((p) => (
                <li key={p.id} className="flex items-center justify-between border-b border-[#F7F8FA] py-1">
                  <span>{p.user_name ?? `User #${p.user_id}`} • {p.event_title}</span>
                  <Link href="/organizer/registrations">
                    <StatusBadge status={p.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card className="p-4">
          <p className="font-bold">Event terbaru yang dikelola</p>
          <ul className="mt-2 flex flex-col gap-1 text-sm">
            {events.map((e) => (
              <li key={e.id} className="flex justify-between border-b border-[#F7F8FA] py-1">
                <span>{e.title}</span>
                <span className="text-[#737373]">{Number(e.taken ?? 0)}/{e.quota} peserta</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
