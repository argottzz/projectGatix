"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { getEvent } from "../../../services/event.service";
import { createRegistration } from "../../../services/registration.service";
import type { EventItem } from "../../../types/event";
import { useAuth } from "../../../hooks/useAuth";
import { formatDate, formatPrice } from "../../../lib/utils";
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
  if (!event) return <p className="text-sm text-[#DC2626]">Event tidak ditemukan.</p>;

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-4">
        <div className="relative h-64 w-full overflow-hidden rounded-2xl bg-[#F7F8FA] md:h-80">
          {event.banner_url ? (
            <Image src={event.banner_url} alt={event.title} fill className="object-cover" sizes="100vw" />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-[#737373]">Tanpa banner</div>
          )}
        </div>
        <h1 className="text-2xl font-extrabold md:text-3xl">{event.title}</h1>
        <div className="flex flex-wrap gap-4 text-sm text-[#737373]">
          <span className="inline-flex items-center gap-1"><CalendarDays size={15} /> {formatDate(event.date)}</span>
          <span className="inline-flex items-center gap-1"><MapPin size={15} /> {event.location}</span>
          <span className="inline-flex items-center gap-1"><Users size={15} /> Sisa kuota: {event.available_quota ?? "-"}</span>
        </div>
        <p className="text-2xl font-extrabold text-[#FF6A00]">{formatPrice(event.price)}</p>
        <p className="whitespace-pre-line text-sm leading-relaxed">{event.description}</p>
        <p className="text-xs text-[#737373]">Penyelenggara: {event.organizer_name ?? "-"} ({event.organizer_email ?? "-"})</p>
        {notice && (
          <div className="rounded-xl border border-[#F59E0B]/40 bg-[#F59E0B]/10 p-3 text-sm">
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
  );
}

export default function EventDetailPage() {
  return (
    <Suspense fallback={<Loading text="Memuat detail event..." />}>
      <EventDetail />
    </Suspense>
  );
}
