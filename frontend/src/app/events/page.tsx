"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { listEvents } from "../../services/event.service";
import type { EventItem } from "../../types/event";
import { EventGrid } from "../../components/events/EventGrid";
import { EMPTY_FILTER, EventFilters, type EventFilter } from "../../components/events/EventFilters";
import { Loading } from "../../components/ui/Loading";

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
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-extrabold text-[#161616]">Jelajahi Event</h1>
      <EventFilters initial={filter} onSearch={(f) => { setPage(1); setFilter(f); }} />
      {loading ? (
        <Loading text="Memuat event..." />
      ) : error ? (
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 text-center">
          <p className="font-semibold text-[#DC2626]">Gagal memuat event</p>
          <p className="text-sm text-[#737373]">{error}</p>
        </div>
      ) : (
        <>
          <EventGrid events={events} />
          <div className="flex items-center justify-between text-sm">
            <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-lg border border-[#E5E7EB] px-3 py-1 disabled:opacity-50">Sebelumnya</button>
            <span className="text-[#737373]">Halaman {page} dari {Math.max(1, totalPages)}</span>
            <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="rounded-lg border border-[#E5E7EB] px-3 py-1 disabled:opacity-50">Berikutnya</button>
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
