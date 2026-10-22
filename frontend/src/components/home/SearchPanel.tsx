"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";

export function SearchPanel() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");

  return (
    <form
      className="grid gap-3 rounded-2xl border border-line bg-white p-3 shadow-lift md:grid-cols-[1fr_1fr_1fr_auto]"
      onSubmit={(e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (name.trim()) params.set("search", name.trim());
        if (location.trim()) params.set("location", location.trim());
        if (date) {
          params.set("date_from", new Date(date).toISOString());
        }
        router.push(`/events${params.toString() ? `?${params.toString()}` : ""}`);
      }}
    >
      <Input label="Nama event" placeholder="Konser, seminar..." value={name} onChange={(e) => setName(e.target.value)} />
      <Input label="Lokasi" placeholder="Kota..." value={location} onChange={(e) => setLocation(e.target.value)} />
      <Input label="Tanggal" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      <div className="flex items-end">
        <Button type="submit" className="w-full md:w-auto">
          <span className="inline-flex items-center gap-1.5">
            <Search size={15} /> Cari Event
          </span>
        </Button>
      </div>
    </form>
  );
}
