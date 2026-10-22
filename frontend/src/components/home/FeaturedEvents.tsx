"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { EventItem } from "../../types/event";
import { EventGrid } from "../events/EventGrid";

export function FeaturedEvents({
  title,
  subtitle,
  events,
  ctaHref = "/events",
  columns = 4,
}: {
  title: string;
  subtitle?: string;
  events: EventItem[];
  ctaHref?: string;
  columns?: 3 | 4;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          {title && <h2 className="font-display text-2xl tracking-tight text-ink md:text-3xl">{title}</h2>}
          {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
        </div>
        {title && (
          <Link
            href={ctaHref}
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand transition hover:gap-2"
          >
            Lihat Semua <ArrowRight size={15} />
          </Link>
        )}
      </div>
      <EventGrid events={events} columns={columns} />
    </section>
  );
}
