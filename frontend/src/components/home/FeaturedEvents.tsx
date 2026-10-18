"use client";

import Link from "next/link";
import type { EventItem } from "../../types/event";
import { EventGrid } from "../events/EventGrid";

export function FeaturedEvents({ title, subtitle, events, ctaHref = "/events", columns = 4 }: { title: string; subtitle?: string; events: EventItem[]; ctaHref?: string; columns?: 3 | 4 }) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-[#161616]">{title}</h2>
          {subtitle && <p className="text-sm text-[#737373]">{subtitle}</p>}
        </div>
        <Link href={ctaHref} className="text-sm font-semibold text-[#FF6A00] hover:underline">
          Lihat Semua
        </Link>
      </div>
      <EventGrid events={events} columns={columns} />
    </section>
  );
}
