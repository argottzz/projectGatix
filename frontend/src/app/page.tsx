"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Compass, ShieldCheck, TicketCheck } from "lucide-react";
import { listEvents } from "../services/event.service";
import type { EventItem } from "../types/event";
import { HeroSection } from "../components/home/HeroSection";
import { CategoryList } from "../components/home/CategoryList";
import { FeaturedEvents } from "../components/home/FeaturedEvents";
import { PopularEvents } from "../components/home/PopularEvents";
import { Loading } from "../components/ui/Loading";
import { Button } from "../components/ui/Button";

const steps = [
  {
    icon: Compass,
    title: "Jelajahi event",
    text: "Cari berdasarkan nama, kota, tanggal, atau kategori yang kamu suka.",
  },
  {
    icon: TicketCheck,
    title: "Daftar & bayar",
    text: "Daftar langsung untuk event gratis; untuk event berbayar unggah bukti pembayaran.",
  },
  {
    icon: ShieldCheck,
    title: "Amankan tiket",
    text: "Organizer memeriksa pembayaran, lalu tiket aktif di akunmu.",
  },
];

export default function HomePage() {
  const [featured, setFeatured] = useState<EventItem[]>([]);
  const [nearby, setNearby] = useState<EventItem[]>([]);
  const [popular, setPopular] = useState<EventItem[]>([]);
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingNearby, setLoadingNearby] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [a, b] = await Promise.all([
          listEvents({ limit: 4, sort_by: "date", order: "asc" }),
          listEvents({ limit: 4, sort_by: "date", order: "desc" }),
        ]);
        setFeatured(a.data);
        setPopular(b.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal memuat event");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const value = city.trim();
    if (!value) return;
    let active = true;
    (async () => {
      try {
        const res = await listEvents({ location: value, limit: 4, sort_by: "date", order: "asc" });
        if (active) setNearby(res.data);
      } catch {
        if (active) setNearby([]);
      } finally {
        if (active) setLoadingNearby(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [city]);

  if (loading) return <Loading text="Memuat event..." />;
  if (error) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-line bg-white px-6 py-14 text-center shadow-card">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-danger-soft text-danger">
          <ShieldCheck size={22} />
        </span>
        <p className="font-semibold text-danger">Gagal memuat event</p>
        <p className="text-sm text-muted">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-12">
      <HeroSection />
      <CategoryList />
      <FeaturedEvents title="Event Pilihan" subtitle="Pilihan terbaik minggu ini" events={featured} />

      <section className="rounded-3xl border border-line bg-surface-alt p-6 md:p-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl tracking-tight text-ink md:text-3xl">Cari Event di Sekitarmu</h2>
            <p className="text-sm text-muted">Pilih lokasimu untuk melihat event terdekat</p>
          </div>
          <input
            placeholder="Ketik kota, mis. Depok"
            value={city}
            onChange={(e) => {
              const value = e.target.value;
              setCity(value);
              if (value.trim()) {
                setLoadingNearby(true);
              } else {
                setNearby([]);
                setLoadingNearby(false);
              }
            }}
            className="h-11 w-full rounded-xl border border-line bg-white px-3.5 text-sm text-ink placeholder:text-muted/70 outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10 md:w-72"
          />
        </div>
        <div className="mt-5">
          {loadingNearby ? (
            <Loading text="Mencari event di lokasimu..." />
          ) : city.trim() ? (
            <FeaturedEvents title="" events={nearby} columns={4} />
          ) : (
            <p className="text-sm text-muted">Masukkan kota untuk mulai mencari.</p>
          )}
        </div>
      </section>

      <PopularEvents events={popular} />

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="font-display text-2xl tracking-tight text-ink md:text-3xl">Cara kerja GATIX</h2>
          <p className="text-sm text-muted">Tiga langkah dari menemukan event sampai tiket aman di tanganmu.</p>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.title} className="rounded-2xl border border-line bg-white p-5 shadow-card">
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                  <s.icon size={20} />
                </span>
                <span className="font-display text-3xl leading-none text-brand-line">0{i + 1}</span>
              </div>
              <p className="mt-4 font-bold text-ink">{s.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden rounded-3xl border border-brand-line bg-brand-soft px-6 py-10 md:px-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full border border-brand-line"
        />
        <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand">Untuk organizer</p>
            <h2 className="mt-2 font-display text-2xl tracking-tight text-ink md:text-3xl">
              Punya event? Publikasikan di GATIX.
            </h2>
            <p className="mt-1 max-w-xl text-sm text-muted">
              Buat event, atur kuota dan harga, lalu verifikasi pembayaran peserta dari satu dashboard.
            </p>
          </div>
          <Link href="/organizer/profile" className="shrink-0">
            <Button>Mulai jadi organizer</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
