"use client";

import Image from "next/image";
import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";
import type { EventItem } from "../../types/event";
import { formatDate, formatPrice } from "../../lib/utils";
import { Button } from "../ui/Button";

export function EventCard({ event }: { event: EventItem }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-card transition hover:-translate-y-1 hover:border-brand-line hover:shadow-lift">
      <div className="relative h-44 w-full overflow-hidden bg-surface-alt">
        {event.banner_url ? (
          <Image
            src={event.banner_url}
            alt={event.title}
            fill
            className="object-cover transition duration-500 group-hover:scale-[1.04]"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted">Tanpa banner</div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-brand shadow-card backdrop-blur">
          {formatPrice(event.price)}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-5">
        <h3 className="line-clamp-1 text-base font-bold text-ink">{event.title}</h3>
        <p className="flex items-center gap-1.5 text-xs text-muted">
          <CalendarDays size={14} /> {formatDate(event.date)}
        </p>
        <p className="flex items-center gap-1.5 text-xs text-muted">
          <MapPin size={14} /> {event.location}
        </p>
        <div className="mt-auto pt-3">
          <Link href={`/events/${event.id}`}>
            <Button className="w-full">Lihat Detail</Button>
          </Link>
        </div>
      </div>
    </article>
  );
}
