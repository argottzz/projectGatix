import Image from "next/image";
import Link from "next/link";
import type { Registration } from "../../types/registration";
import { formatDate, formatPrice } from "../../lib/utils";
import { StatusBadge } from "../ui/StatusBadge";
import { Button } from "../ui/Button";

export function TicketCard({ ticket }: { ticket: Registration }) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-card transition hover:border-brand-line hover:shadow-lift sm:flex-row">
      <div className="relative h-40 w-full shrink-0 bg-surface-alt sm:h-auto sm:w-44">
        {ticket.banner_url ? (
          <Image
            src={ticket.banner_url}
            alt={ticket.title ?? `Tiket #${ticket.id}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 200px"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted">Tanpa banner</div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 font-bold text-ink">{ticket.title ?? `Event #${ticket.event_id}`}</h3>
          <StatusBadge status={ticket.status} />
        </div>
        <p className="text-xs text-muted">
          {ticket.date ? formatDate(ticket.date) : ""} {ticket.location ? `• ${ticket.location}` : ""}
        </p>
        <p className="text-sm font-bold text-brand">
          {ticket.price !== undefined ? formatPrice(ticket.price) : ""}
        </p>
        <div className="mt-auto pt-2">
          <Link href={`/my-tickets/${ticket.id}`}>
            <Button variant="secondary" className="w-full">Detail</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
