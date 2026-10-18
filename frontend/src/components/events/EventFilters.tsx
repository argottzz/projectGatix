"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { CATEGORIES } from "../home/categories";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { cn } from "../../lib/utils";

export interface EventFilter {
  search: string;
  location: string;
  date_from: string;
  date_to: string;
  category: string;
  sort_by: "date" | "price";
  order: "asc" | "desc";
}

export const EMPTY_FILTER: EventFilter = {
  search: "",
  location: "",
  date_from: "",
  date_to: "",
  category: "",
  sort_by: "date",
  order: "desc",
};

export function EventFilters({ initial, onSearch }: { initial: EventFilter; onSearch: (f: EventFilter) => void }) {
  const [form, setForm] = useState(initial);

  useEffect(() => {
    setForm(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial.search, initial.location, initial.date_from, initial.date_to]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => { const f = { ...form, category: "" }; setForm(f); onSearch(f); }}
          className={cn(
            "rounded-full border px-3 py-1.5 text-xs font-semibold",
            form.category === "" ? "border-[#FF6A00] bg-[#FF6A00]/10 text-[#FF6A00]" : "border-[#E5E7EB] bg-white text-[#161616]",
          )}
        >
          Semua
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.label}
            onClick={() => { const f = { ...form, category: c.label, search: c.keyword }; setForm(f); onSearch(f); }}
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold",
              form.category === c.label ? "border-[#FF6A00] bg-[#FF6A00]/10 text-[#FF6A00]" : "border-[#E5E7EB] bg-white text-[#161616]",
            )}
          >
            <c.icon size={13} /> {c.label}
          </button>
        ))}
      </div>
      <form
        className="grid gap-2 rounded-xl border border-[#E5E7EB] bg-white p-3 shadow-[0_1px_3px_rgba(0,0,0,0.06)] md:grid-cols-[1fr_1fr_1fr_1fr_auto]"
        onSubmit={(e) => {
          e.preventDefault();
          onSearch(form);
        }}
      >
        <Input label="Cari event" placeholder="Judul, deskripsi..." value={form.search} onChange={(e) => setForm({ ...form, search: e.target.value })} />
        <Input label="Lokasi" placeholder="Kota..." value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        <div className="grid grid-cols-2 gap-2">
          <Input label="Dari" type="date" value={form.date_from} onChange={(e) => setForm({ ...form, date_from: e.target.value })} />
          <Input label="Sampai" type="date" value={form.date_to} onChange={(e) => setForm({ ...form, date_to: e.target.value })} />
        </div>
        <div>
          <label className="text-sm font-medium text-[#161616]">Urutkan</label>
          <select
            className="block rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm outline-none focus:border-[#FF6A00] focus:ring-2 focus:ring-[#FF6A00]/30"
            value={`${form.sort_by}-${form.order}`}
            onChange={(e) => {
              const [sort_by, order] = e.target.value.split("-") as ["date" | "price", "asc" | "desc"];
              setForm({ ...form, sort_by, order });
            }}
          >
            <option value="date-desc">Tanggal terbaru</option>
            <option value="date-asc">Tanggal terlama</option>
            <option value="price-asc">Harga termurah</option>
            <option value="price-desc">Harga termahal</option>
          </select>
        </div>
        <div className="flex items-end">
          <Button type="submit">
            <span className="inline-flex items-center gap-1"><Search size={15} /> Cari</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
