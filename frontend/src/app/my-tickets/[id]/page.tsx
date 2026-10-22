"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { cancelRegistration, getRegistration } from "../../../services/registration.service";
import type { Registration } from "../../../types/registration";
import { TicketStatus } from "../../../components/tickets/TicketStatus";
import { PaymentProofForm } from "../../../components/booking/PaymentProofForm";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
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
    let active = true;
    (async () => {
      try {
        const res = await getRegistration(params.id);
        if (active) setTicket(res.data);
      } catch (err) {
        if (active) toast.error(err instanceof Error ? err.message : "Gagal memuat tiket");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [params.id]);

  if (loading) return <Loading text="Memuat tiket..." />;
  if (!ticket) return <p className="text-sm text-danger">Tiket tidak ditemukan.</p>;

  return (
    <div className="flex flex-col gap-5">
      <Link
        href="/my-tickets"
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted transition hover:text-brand"
      >
        <ArrowLeft size={16} /> Kembali ke tiket saya
      </Link>
      <div className="flex flex-col gap-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand">Detail tiket</p>
        <h1 className="font-display text-3xl tracking-tight text-ink md:text-4xl">
          {ticket.title ?? `Tiket #${ticket.id}`}
        </h1>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-4">
          <Card className="p-5">
            <dl className="flex flex-col divide-y divide-line text-sm">
              <div className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-muted">Tanggal</dt>
                <dd className="text-right font-medium text-ink">{ticket.date ? formatDate(ticket.date) : "-"}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-muted">Lokasi</dt>
                <dd className="text-right font-medium text-ink">{ticket.location ?? "-"}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-muted">Harga</dt>
                <dd className="text-right font-semibold text-brand">
                  {ticket.price !== undefined ? formatPrice(ticket.price) : "-"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-muted">Bukti pembayaran</dt>
                <dd className="text-right font-medium">
                  {ticket.payment_proof_url ? (
                    <a href={ticket.payment_proof_url} target="_blank" className="text-brand underline">
                      lihat bukti
                    </a>
                  ) : (
                    <span className="text-muted">belum ada</span>
                  )}
                </dd>
              </div>
            </dl>
          </Card>
          {ticket.status === "pending" && <PaymentProofForm registrationId={ticket.id} onDone={load} />}
        </div>
        <aside className="h-fit">
          <Card className="p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">Status tiket</p>
            <div className="mt-2">
              <TicketStatus status={ticket.status} />
            </div>
            <div className="my-4 border-t border-dashed border-line" />
            <p className="text-xs leading-relaxed text-muted">
              Status diperbarui oleh organizer setelah bukti pembayaran diperiksa.
            </p>
            {(ticket.status === "pending" || ticket.status === "approved") && (
              <Button
                variant="danger"
                className="mt-4 w-full"
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
            )}
          </Card>
        </aside>
      </div>
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
