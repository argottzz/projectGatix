"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, CalendarDays, MapPin, Users } from "lucide-react";
import { getEvent } from "../../../services/event.service";
import { createRegistration } from "../../../services/registration.service";
import type { EventItem } from "../../../types/event";
import { useAuth } from "../../../hooks/useAuth";
import { formatDate } from "../../../lib/utils";
import { BookingSummary } from "../../../components/booking/BookingSummary";
import { Loading } from "../../../components/ui/Loading";

function EventDetail() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await getEvent(params.id);
        setEvent(res.data);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Event tidak ditemukan");
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id]);

  if (loading) return <Loading text="Memuat detail event..." />;
  if (!event) return <p className="text-sm text-danger">Event tidak ditemukan.</p>;

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/events"
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted transition hover:text-brand"
      >
        <ArrowLeft size={16} /> Kembali ke daftar event
      </Link>
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-5">
          <div className="relative h-64 w-full overflow-hidden rounded-3xl bg-surface-alt md:h-80">
            {event.banner_url ? (
              <Image src={event.banner_url} alt={event.title} fill className="object-cover" sizes="100vw" />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted">Tanpa banner</div>
            )}
          </div>
          <div className="flex flex-col gap-3">
            <h1 className="font-display text-3xl leading-tight tracking-tight text-ink md:text-4xl">
              {event.title}
            </h1>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1.5 font-medium text-brand">
                <CalendarDays size={14} /> {formatDate(event.date)}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-alt px-3 py-1.5 font-medium text-muted">
                <MapPin size={14} /> {event.location}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-alt px-3 py-1.5 font-medium text-muted">
                <Users size={14} /> Sisa kuota: {event.available_quota ?? "-"}
              </span>
            </div>
          </div>
          <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">Tentang event</p>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink">{event.description}</p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface-alt p-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
              {(event.organizer_name ?? "G").slice(0, 1).toUpperCase()}
            </span>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">Penyelenggara</p>
              <p className="text-sm font-semibold text-ink">{event.organizer_name ?? "-"}</p>
              <p className="text-xs text-muted">{event.organizer_email ?? "-"}</p>
            </div>
          </div>
          {notice && (
            <div className="rounded-2xl border border-brand-line bg-brand-soft p-4 text-sm leading-relaxed text-ink">
              {notice}
            </div>
          )}
        </div>
        <div>
          <BookingSummary
            event={event}
            registering={registering}
            onBook={async () => {
              if (!user) {
                router.push("/login");
                return;
              }
              setRegistering(true);
              try {
                const res = await createRegistration(event.id);
                if (res.data.status === "pending") {
                  setNotice("Pendaftaran diterima (menunggu). Untuk event berbayar, buka Tiket Saya dan unggah bukti pembayaran. Status baru disetujui setelah diperiksa organizer.");
                } else {
                  toast.success(res.message);
                  router.push("/my-tickets");
                }
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Gagal mendaftar");
              } finally {
                setRegistering(false);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default function EventDetailPage() {
  return (
    <Suspense fallback={<Loading text="Memuat detail event..." />}>
      <EventDetail />
    </Suspense>
  );
}
