"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { deleteEvent, listEvents } from "../../../services/event.service";
import type { EventItem } from "../../../types/event";
import { OrganizerSidebar } from "../../../components/layout/OrganizerSidebar";
import { Button } from "../../../components/ui/Button";

export default function OrganizerEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await listEvents({ limit: 50 });
      setEvents(res.data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal memuat event");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="flex flex-col gap-4 md:flex-row">
      <OrganizerSidebar />
      <div className="flex flex-1 flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold">Event Saya</h1>
          <Link href="/organizer/events/create"><Button>Tambah event</Button></Link>
        </div>
        {loading ? (
          <p className="text-sm text-[#737373]">Memuat...</p>
        ) : (
          <div className="flex flex-col gap-2">
            {events.map((e) => (
              <div key={e.id} className="flex items-center justify-between rounded-xl border border-[#E5E7EB] bg-white p-3">
                <div>
                  <p className="font-bold">{e.title}</p>
                  <p className="text-xs text-[#737373]">Kuota {Number(e.taken ?? 0)}/{e.quota} • Sisa {e.available_quota ?? "-"}</p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/organizer/events/${e.id}/edit`} className="rounded-lg border border-[#E5E7EB] p-2 hover:bg-[#F7F8FA]">
                    <Pencil size={16} />
                  </Link>
                  <button
                    className="rounded-lg border border-[#E5E7EB] p-2 text-[#DC2626] hover:bg-[#F7F8FA]"
                    onClick={async () => {
                      if (!confirm(`Hapus "${e.title}"?`)) return;
                      try {
                        await deleteEvent(e.id);
                        toast.success("Event dihapus");
                        load();
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
          </div>
        )}
      </div>
    </div>
  );
}
