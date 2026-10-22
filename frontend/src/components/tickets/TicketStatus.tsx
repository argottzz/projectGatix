import type { RegistrationStatus } from "../../types/registration";
import { StatusBadge } from "../ui/StatusBadge";

const text: Record<RegistrationStatus, string> = {
  pending: "Menunggu pemeriksaan pembayaran",
  approved: "Disetujui — tiket berlaku",
  cancelled: "Dibatalkan",
};

export function TicketStatus({ status }: { status: RegistrationStatus }) {
  return (
    <div className="flex flex-col gap-1.5">
      <StatusBadge status={status} />
      <span className="text-xs text-muted">{text[status]}</span>
    </div>
  );
}
