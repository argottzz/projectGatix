"use client";

import { CalendarX } from "lucide-react";
import type { EventItem } from "../../types/event";
import { EventCard } from "./EventCard";

export function EventGrid({ events, columns = 3 }: { events: EventItem[]; columns?: 3 | 4 }) {
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-line bg-white px-6 py-14 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft text-brand">
          <CalendarX size={22} />
        </span>
        <p className="font-semibold text-ink">Belum ada event</p>
        <p className="text-sm text-muted">Coba ubah kata kunci atau filter.</p>
      </div>
    );
  }
  return (
    <div
      className={
        columns === 4
          ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          : "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      }
    >
      {events.map((e) => (
        <EventCard key={e.id} event={e} />
      ))}
    </div>
  );
}
