import Image from "next/image";
import Link from "next/link";
import type { Registration } from "../../types/registration";
import { formatDate, formatPrice } from "../../lib/utils";
import { StatusBadge } from "../ui/StatusBadge";
import { Button } from "../ui/Button";

export function TicketCard({ ticket }: { ticket: Registration }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">
      <div className="relative h-40 w-full bg-[#F7F8FA]">
        {ticket.banner_url ? (
          <Image src={ticket.banner_url} alt={ticket.title ?? `Tiket #${ticket.id}`} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-[#737373]">Tanpa banner</div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 font-bold text-[#161616]">{ticket.title ?? `Event #${ticket.event_id}`}</h3>
          <StatusBadge status={ticket.status} />
        </div>
        <p className="text-xs text-[#737373]">{ticket.date ? formatDate(ticket.date) : ""} {ticket.location ? `• ${ticket.location}` : ""}</p>
        <p className="text-sm font-bold text-[#FF6A00]">{ticket.price !== undefined ? formatPrice(ticket.price) : ""}</p>
        <div className="mt-auto pt-2">
          <Link href={`/my-tickets/${ticket.id}`}>
            <Button className="w-full">Detail</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
