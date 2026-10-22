"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CATEGORIES } from "./categories";

export function CategoryList() {
  return (
    <section id="kategori" className="flex scroll-mt-28 flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="font-display text-2xl tracking-tight text-ink md:text-3xl">Jelajahi Kategori</h2>
          <p className="text-sm text-muted">Pilih kategori dan temukan event yang paling relevan.</p>
        </div>
        <Link
          href="/events"
          className="inline-flex items-center gap-1 text-sm font-semibold text-brand transition hover:gap-2"
        >
          Semua event <ArrowRight size={15} />
        </Link>
      </div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {CATEGORIES.map((c) => (
          <Link
            key={c.label}
            href={`/events?search=${encodeURIComponent(c.keyword)}`}
            className="group flex flex-col items-center gap-3 rounded-2xl border border-line bg-white p-4 text-center shadow-card transition hover:-translate-y-0.5 hover:border-brand-line hover:shadow-lift"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-brand transition group-hover:bg-brand group-hover:text-white">
              <c.icon size={21} />
            </span>
            <span className="text-xs font-semibold text-ink">{c.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
