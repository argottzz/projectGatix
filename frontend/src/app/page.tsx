"use client";

import { useEffect, useState } from "react";
import { listEvents } from "../services/event.service";
import type { EventItem } from "../types/event";
import { HeroSection } from "../components/home/HeroSection";
import { CategoryList } from "../components/home/CategoryList";
import { FeaturedEvents } from "../components/home/FeaturedEvents";
import { PopularEvents } from "../components/home/PopularEvents";
import { Loading } from "../components/ui/Loading";

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
    if (!city.trim()) {
      setNearby([]);
      return;
    }
    (async () => {
      setLoadingNearby(true);
      try {
        const res = await listEvents({ location: city.trim(), limit: 4, sort_by: "date", order: "asc" });
        setNearby(res.data);
      } catch {
        setNearby([]);
      } finally {
        setLoadingNearby(false);
      }
    })();
  }, [city]);

  if (loading) return <Loading text="Memuat event..." />;
  if (error) {
    return (
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 text-center">
        <p className="font-semibold text-[#DC2626]">Gagal memuat event</p>
        <p className="text-sm text-[#737373]">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <HeroSection />
      <CategoryList />
      <FeaturedEvents title="Event Pilihan" subtitle="Pilihan terbaik minggu ini" events={featured} />
      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-xl font-extrabold text-[#161616]">Cari Event di Sekitarmu</h2>
            <p className="text-sm text-[#737373]">Pilih lokasimu untuk melihat event terdekat</p>
          </div>
          <input
            placeholder="Ketik kota, mis. Depok"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm outline-none focus:border-[#FF6A00] focus:ring-2 focus:ring-[#FF6A00]/30"
          />
        </div>
        {loadingNearby ? (
          <Loading text="Mencari event di lokasimu..." />
        ) : city.trim() ? (
          <FeaturedEvents title="" events={nearby} />
        ) : (
          <p className="text-sm text-[#737373]">Masukkan kota untuk mulai mencari.</p>
        )}
      </section>
      <PopularEvents events={popular} />
    </div>
  );
}
