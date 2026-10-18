"use client";

import type { EventItem } from "../../types/event";
import { EventCard } from "./EventCard";

export function EventGrid({ events, columns = 3 }: { events: EventItem[]; columns?: 3 | 4 }) {
  if (events.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[#E5E7EB] bg-white p-10 text-center">
        <p className="font-semibold text-[#161616]">Belum ada event</p>
        <p className="mt-1 text-sm text-[#737373]">Coba ubah kata kunci atau filter.</p>
      </div>
    );
  }
  return (
    <div className={columns === 4 ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-4" : "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"}>
      {events.map((e) => (
        <EventCard key={e.id} event={e} />
      ))}
    </div>
  );
}
