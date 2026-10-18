"use client";

import Image from "next/image";
import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";
import type { EventItem } from "../../types/event";
import { formatDate, formatPrice } from "../../lib/utils";
import { Button } from "../ui/Button";

export function EventCard({ event }: { event: EventItem }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">
      <div className="relative h-40 w-full bg-[#F7F8FA]">
        {event.banner_url ? (
          <Image src={event.banner_url} alt={event.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-[#737373]">Tanpa banner</div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-1 text-base font-bold text-[#161616]">{event.title}</h3>
        <p className="flex items-center gap-1 text-xs text-[#737373]">
          <CalendarDays size={14} /> {formatDate(event.date)}
        </p>
        <p className="flex items-center gap-1 text-xs text-[#737373]">
          <MapPin size={14} /> {event.location}
        </p>
        <p className="text-sm font-extrabold text-[#FF6A00]">{formatPrice(event.price)}</p>
        <div className="mt-auto pt-2">
          <Link href={`/events/${event.id}`}>
            <Button className="w-full">Lihat Detail</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
