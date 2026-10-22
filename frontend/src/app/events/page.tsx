"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, ShieldCheck } from "lucide-react";
import { listEvents } from "../../services/event.service";
import type { EventItem } from "../../types/event";
import { EventGrid } from "../../components/events/EventGrid";
import { EMPTY_FILTER, EventFilters, type EventFilter } from "../../components/events/EventFilters";
import { Loading } from "../../components/ui/Loading";
import { Button } from "../../components/ui/Button";

function EventsContent() {
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get("search") ?? "";
  const urlLocation = searchParams.get("location") ?? "";
  const urlFrom = searchParams.get("date_from") ?? "";
  const urlTo = searchParams.get("date_to") ?? "";
  const [filter, setFilter] = useState<EventFilter>(() => ({
    ...EMPTY_FILTER,
    search: urlSearch,
    location: urlLocation,
    date_from: urlFrom,
    date_to: urlTo,
  }));
  const [events, setEvents] = useState<EventItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setPage(1);
    setFilter((f) =>
      f.search === urlSearch &&
      f.location === urlLocation &&
      f.date_from === urlFrom &&
      f.date_to === urlTo
        ? f
        : { ...f, search: urlSearch, location: urlLocation, date_from: urlFrom, date_to: urlTo },
    );
  }, [urlSearch, urlLocation, urlFrom, urlTo]);

  const load = useCallback(async (f: EventFilter, p: number) => {
    setLoading(true);
    setError("");
    try {
      const res = await listEvents({
        search: f.search,
        location: f.location,
        date_from: f.date_from ? new Date(f.date_from).toISOString() : undefined,
        date_to: f.date_to ? new Date(f.date_to).toISOString() : undefined,
        sort_by: f.sort_by,
        order: f.order,
        page: p,
        limit: 9,
      });
      setEvents(res.data);
      setTotalPages(res.pagination.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat event");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(filter, page);
  }, [filter, page, load]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand">Katalog event</p>
        <h1 className="font-display text-3xl tracking-tight text-ink md:text-4xl">Jelajahi Event</h1>
        <p className="text-sm text-muted">
          Temukan acara yang cocok untukmu berdasarkan kata kunci, lokasi, dan tanggal.
        </p>
      </div>
      <EventFilters initial={filter} onSearch={(f) => { setPage(1); setFilter(f); }} />
      {loading ? (
        <Loading text="Memuat event..." />
      ) : error ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-line bg-white px-6 py-14 text-center shadow-card">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-danger-soft text-danger">
            <ShieldCheck size={22} />
          </span>
          <p className="font-semibold text-danger">Gagal memuat event</p>
          <p className="text-sm text-muted">{error}</p>
        </div>
      ) : (
        <>
          <EventGrid events={events} />
          <div className="flex items-center justify-between gap-3 text-sm">
            <Button variant="secondary" type="button" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              <ChevronLeft size={16} /> Sebelumnya
            </Button>
            <span className="text-muted">
              Halaman {page} dari {Math.max(1, totalPages)}
            </span>
            <Button variant="secondary" type="button" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              Berikutnya <ChevronRight size={16} />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

export default function EventsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <EventsContent />
    </Suspense>
  );
}
