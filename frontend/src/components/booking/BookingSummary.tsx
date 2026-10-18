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
    <Card className="sticky top-20 p-4">
      <p className="text-sm font-bold text-[#161616]">Ringkasan Pemesanan</p>
      <p className="mt-2 line-clamp-1 text-sm text-[#737373]">{event.title}</p>
      <p className="text-xs text-[#737373]">{formatDate(event.date)} • {event.location}</p>
      <div className="mt-3 flex items-center justify-between border-t border-[#E5E7EB] pt-3">
        <span className="text-sm text-[#737373]">Harga tiket</span>
        <span className="text-lg font-extrabold text-[#FF6A00]">{formatPrice(event.price)}</span>
      </div>
      <p className="mt-1 text-xs text-[#737373]">
        {Number(event.price) === 0 ? "Event gratis — pendaftaran langsung disetujui." : "Event berbayar — unggah bukti pembayaran setelah mendaftar."}
      </p>
      <p className="mt-1 text-xs text-[#737373]">Sisa kuota: {event.available_quota ?? "-"}</p>
      <Button className="mt-3 w-full" loading={registering} disabled={soldOut} onClick={onBook}>
        {soldOut ? "Kuota Habis" : "Daftar Sekarang"}
      </Button>
    </Card>
  );
}
