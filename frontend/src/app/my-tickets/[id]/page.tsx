"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { cancelRegistration, getRegistration } from "../../../services/registration.service";
import type { Registration } from "../../../types/registration";
import { TicketStatus } from "../../../components/tickets/TicketStatus";
import { PaymentProofForm } from "../../../components/booking/PaymentProofForm";
import { Button } from "../../../components/ui/Button";
import { Loading } from "../../../components/ui/Loading";
import { formatDate, formatPrice } from "../../../lib/utils";

function TicketDetail() {
  const params = useParams<{ id: string }>();
  const [ticket, setTicket] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await getRegistration(params.id);
      setTicket(res.data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal memuat tiket");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <Loading text="Memuat tiket..." />;
  if (!ticket) return <p className="text-sm text-[#DC2626]">Tiket tidak ditemukan.</p>;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">{ticket.title ?? `Tiket #${ticket.id}`}</h1>
        <TicketStatus status={ticket.status} />
      </div>
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 text-sm">
        <p>Tanggal: {ticket.date ? formatDate(ticket.date) : "-"}</p>
        <p>Lokasi: {ticket.location ?? "-"}</p>
        <p>Harga: {ticket.price !== undefined ? formatPrice(ticket.price) : "-"}</p>
        <p className="mt-2 text-xs text-[#737373]">Bukti pembayaran: {ticket.payment_proof_url ? <a href={ticket.payment_proof_url} target="_blank" className="text-[#FF6A00] underline">lihat bukti</a> : "belum ada"}</p>
      </div>
      {ticket.status === "pending" && (
        <PaymentProofForm registrationId={ticket.id} onDone={load} />
      )}
      {(ticket.status === "pending" || ticket.status === "approved") && (
        <div>
          <Button
            variant="danger"
            onClick={async () => {
              try {
                await cancelRegistration(ticket.id);
                toast.success("Pendaftaran dibatalkan");
                load();
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Gagal membatalkan");
              }
            }}
          >
            Batalkan pendaftaran
          </Button>
        </div>
      )}
    </div>
  );
}

export default function TicketDetailPage() {
  return (
    <Suspense fallback={<Loading text="Memuat tiket..." />}>
      <TicketDetail />
    </Suspense>
  );
}
