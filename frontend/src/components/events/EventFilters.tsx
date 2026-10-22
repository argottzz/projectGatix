"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { CATEGORIES } from "../home/categories";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => { const f = { ...form, category: "" }; setForm(f); onSearch(f); }}
          className={cn(
            "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition",
            form.category === ""
              ? "border-brand bg-brand text-white shadow-lift"
              : "border-line bg-white text-muted hover:border-brand-line hover:text-brand",
          )}
        >
          Semua
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.label}
            onClick={() => { const f = { ...form, category: c.label, search: c.keyword }; setForm(f); onSearch(f); }}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition",
              form.category === c.label
                ? "border-brand bg-brand text-white shadow-lift"
                : "border-line bg-white text-muted hover:border-brand-line hover:text-brand",
            )}
          >
            <c.icon size={13} /> {c.label}
          </button>
        ))}
      </div>
      <form
        className="grid gap-3 rounded-2xl border border-line bg-white p-4 shadow-card sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_0.9fr_0.9fr_1fr_auto]"
        onSubmit={(e) => {
          e.preventDefault();
          onSearch(form);
        }}
      >
        <Input label="Cari event" placeholder="Judul, deskripsi..." value={form.search} onChange={(e) => setForm({ ...form, search: e.target.value })} />
        <Input label="Lokasi" placeholder="Kota..." value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        <Input label="Dari" type="date" value={form.date_from} onChange={(e) => setForm({ ...form, date_from: e.target.value })} />
        <Input label="Sampai" type="date" value={form.date_to} onChange={(e) => setForm({ ...form, date_to: e.target.value })} />
        <Select
          label="Urutkan"
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
        </Select>
        <div className="flex items-end">
          <Button type="submit" className="w-full md:w-auto">
            <span className="inline-flex items-center gap-1.5">
              <Search size={15} /> Cari
            </span>
          </Button>
        </div>
      </form>
    </div>
  );
}
