"use client";

import type { EventItem } from "../../types/event";
import { FeaturedEvents } from "./FeaturedEvents";

export function PopularEvents({ events }: { events: EventItem[] }) {
  return (
    <FeaturedEvents
      title="Jangan Lewatkan Event Ini"
      subtitle="Event rekomendasi pilihan untukmu"
      events={events}
    />
  );
}
