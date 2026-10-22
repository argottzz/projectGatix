"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { CalendarDays, Pencil, Plus, Trash2 } from "lucide-react";
import { deleteEvent, listEvents } from "../../../services/event.service";
import type { EventItem } from "../../../types/event";
import { OrganizerSidebar } from "../../../components/layout/OrganizerSidebar";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Loading } from "../../../components/ui/Loading";

export default function OrganizerEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await listEvents({ limit: 50 });
        if (active) setEvents(res.data);
      } catch (err) {
        if (active) toast.error(err instanceof Error ? err.message : "Gagal memuat event");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="flex flex-col gap-6 md:flex-row">
      <OrganizerSidebar />
      <div className="flex min-w-0 flex-1 flex-col gap-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-col gap-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand">Ruang organizer</p>
            <h1 className="font-display text-3xl tracking-tight text-ink md:text-4xl">Event Saya</h1>
            <p className="text-sm text-muted">Kelola event, kuota, dan detail yang tampil di halaman publik.</p>
          </div>
          <Link href="/organizer/events/create">
            <Button>
              <Plus size={16} /> Tambah event
            </Button>
          </Link>
        </div>
        {loading ? (
          <Loading />
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-line bg-white px-6 py-14 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft text-brand">
              <CalendarDays size={22} />
            </span>
            <p className="font-semibold text-ink">Belum ada event</p>
            <p className="text-sm text-muted">Tambahkan event pertamamu untuk mulai menerima pendaftaran.</p>
          </div>
        ) : (
          <Card className="divide-y divide-line p-0">
            {events.map((e) => (
              <div
                key={e.id}
                className="flex flex-col gap-3 p-4 transition hover:bg-surface-alt sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                    <CalendarDays size={18} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-bold text-ink">{e.title}</p>
                    <p className="text-xs text-muted">
                      Kuota {Number(e.taken ?? 0)}/{e.quota} • Sisa {e.available_quota ?? "-"}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Link
                    href={`/organizer/events/${e.id}/edit`}
                    aria-label={`Edit ${e.title}`}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line text-muted transition hover:border-brand-line hover:bg-brand-soft hover:text-brand"
                  >
                    <Pencil size={16} />
                  </Link>
                  <button
                    aria-label={`Hapus ${e.title}`}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line text-danger transition hover:border-danger/20 hover:bg-danger-soft"
                    onClick={async () => {
                      if (!confirm(`Hapus "${e.title}"?`)) return;
                      try {
                        await deleteEvent(e.id);
                        toast.success("Event dihapus");
                        setEvents((prev) => prev.filter((item) => item.id !== e.id));
                      } catch (err) {
                        toast.error(err instanceof Error ? err.message : "Gagal menghapus");
                      }
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </Card>
        )}
      </div>
    </div>
  );
}
