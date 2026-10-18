"use client";

import Link from "next/link";
import { CATEGORIES } from "./categories";

export function CategoryList() {
  return (
    <section id="kategori" className="flex scroll-mt-24 flex-col gap-3">
      <h2 className="text-xl font-extrabold text-[#161616]">Jelajahi Kategori</h2>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {CATEGORIES.map((c) => (
          <Link
            key={c.label}
            href={`/events?search=${encodeURIComponent(c.keyword)}`}
            className="flex flex-col items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition hover:border-[#FF6A00]"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FF6A00]/10 text-[#FF6A00]">
              <c.icon size={20} />
            </span>
            <span className="text-xs font-semibold text-[#161616]">{c.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
