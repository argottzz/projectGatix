"use client";

import type { EventItem } from "../../types/event";
import { formatDate, formatPrice } from "../../lib/utils";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

export function BookingSummary({
  event,
  registering,
  onBook,
}: {
  event: EventItem;
  registering: boolean;
  onBook: () => void;
}) {
  const soldOut = (event.available_quota ?? 1) <= 0;
  return (
    <Card className="overflow-hidden p-0 lg:sticky lg:top-24">
      <div className="bg-brand px-5 py-5 text-white">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">
          Ringkasan pemesanan
        </p>
        <p className="mt-2 font-display text-3xl leading-none">{formatPrice(event.price)}</p>
        <p className="mt-1 text-xs text-white/70">
          {Number(event.price) === 0 ? "Event gratis" : "Event berbayar"}
        </p>
      </div>
      <div className="flex flex-col gap-3 p-5">
        <p className="line-clamp-2 text-sm font-bold text-ink">{event.title}</p>
        <p className="text-xs text-muted">
          {formatDate(event.date)} • {event.location}
        </p>
        <div className="border-t border-dashed border-line" />
        <div className="flex items-center justify-between text-xs text-muted">
          <span>Harga tiket</span>
          <span className="font-semibold text-ink">{formatPrice(event.price)}</span>
        </div>
        <div className="flex items-center justify-between text-xs text-muted">
          <span>Sisa kuota</span>
          <span className="font-semibold text-ink">{event.available_quota ?? "-"}</span>
        </div>
        <p className="text-xs leading-relaxed text-muted">
          {Number(event.price) === 0
            ? "Event gratis — pendaftaran langsung disetujui."
            : "Event berbayar — unggah bukti pembayaran setelah mendaftar."}
        </p>
        <Button className="mt-1 w-full" loading={registering} disabled={soldOut} onClick={onBook}>
          {soldOut ? "Kuota Habis" : "Daftar Sekarang"}
        </Button>
      </div>
    </Card>
  );
}
