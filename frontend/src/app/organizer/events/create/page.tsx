"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { eventSchema, type EventInput } from "../../../../validators/event.schema";
import { createEvent } from "../../../../services/event.service";
import { OrganizerSidebar } from "../../../../components/layout/OrganizerSidebar";
import { Input } from "../../../../components/ui/Input";
import { Textarea } from "../../../../components/ui/Textarea";
import { Button } from "../../../../components/ui/Button";
import { Card } from "../../../../components/ui/Card";

export default function CreateEventPage() {
  const router = useRouter();
  const [banner, setBanner] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<EventInput>({
    resolver: zodResolver(eventSchema),
    defaultValues: { price: 0, quota: 100 },
  });

  return (
    <div className="flex flex-col gap-6 md:flex-row">
      <OrganizerSidebar />
      <div className="mx-auto w-full max-w-xl flex-1">
        <div className="mb-4 flex flex-col gap-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand">Event baru</p>
          <h1 className="font-display text-3xl tracking-tight text-ink md:text-4xl">Tambah Event</h1>
          <p className="text-sm text-muted">Lengkapi informasi event sebelum dipublikasikan.</p>
        </div>
        <Card className="p-6">
          <form
            className="flex flex-col gap-5"
            onSubmit={handleSubmit(async (v) => {
              setLoading(true);
              try {
                const form = new FormData();
                form.append("title", v.title);
                form.append("description", v.description);
                form.append("date", new Date(v.date).toISOString());
                form.append("location", v.location);
                form.append("price", String(v.price));
                form.append("quota", String(v.quota));
                if (banner) form.append("banner", banner);
                await createEvent(form);
                toast.success("Event dibuat");
                router.push("/organizer/events");
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Gagal membuat event");
              } finally {
                setLoading(false);
              }
            })}
          >
            <div className="flex flex-col gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">Informasi event</p>
              <Input label="Judul event" error={errors.title?.message} {...register("title")} />
              <Textarea label="Deskripsi" rows={5} error={errors.description?.message} {...register("description")} />
            </div>
            <div className="border-t border-line" />
            <div className="flex flex-col gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">Waktu & lokasi</p>
              <Input label="Tanggal dan waktu" type="datetime-local" error={errors.date?.message} {...register("date")} />
              <Input label="Lokasi" error={errors.location?.message} {...register("location")} />
            </div>
            <div className="border-t border-line" />
            <div className="grid gap-3 sm:grid-cols-2">
              <Input label="Harga (0 = gratis)" type="number" min={0} error={errors.price?.message} {...register("price", { valueAsNumber: true })} />
              <Input label="Kuota" type="number" min={1} error={errors.quota?.message} {...register("quota", { valueAsNumber: true })} />
            </div>
            <div className="border-t border-line" />
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
                Banner (jpg/png, maks 5 MB)
              </label>
              <input
                type="file"
                accept=".jpg,.jpeg,.png"
                className="block w-full cursor-pointer rounded-xl border border-dashed border-line bg-surface-alt px-3 py-3 text-sm text-muted file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-brand file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white hover:border-brand-line"
                onChange={(e) => setBanner(e.target.files?.[0] ?? null)}
              />
            </div>
            <Button type="submit" loading={loading}>Simpan event</Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
