"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { eventSchema, type EventInput } from "../../../../../validators/event.schema";
import { getEvent, updateEvent } from "../../../../../services/event.service";
import { OrganizerSidebar } from "../../../../../components/layout/OrganizerSidebar";
import { Input } from "../../../../../components/ui/Input";
import { Textarea } from "../../../../../components/ui/Textarea";
import { Button } from "../../../../../components/ui/Button";
import { Card } from "../../../../../components/ui/Card";
import { Loading } from "../../../../../components/ui/Loading";

function toLocalInput(date: string): string {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function EditEventForm() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [banner, setBanner] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<EventInput>({
    resolver: zodResolver(eventSchema),
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await getEvent(params.id);
        reset({
          title: res.data.title,
          description: res.data.description,
          date: toLocalInput(res.data.date),
          location: res.data.location,
          price: Number(res.data.price),
          quota: res.data.quota,
        });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Gagal memuat event");
      }
    })();
  }, [params.id, reset]);

  return (
    <div className="flex flex-col gap-6 md:flex-row">
      <OrganizerSidebar />
      <div className="mx-auto w-full max-w-xl flex-1">
        <div className="mb-4 flex flex-col gap-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand">Kelola event</p>
          <h1 className="font-display text-3xl tracking-tight text-ink md:text-4xl">Edit Event</h1>
          <p className="text-sm text-muted">Perbarui informasi event yang sudah dipublikasikan.</p>
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
                await updateEvent(params.id, form);
                toast.success("Event diperbarui");
                router.push("/organizer/events");
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Gagal menyimpan");
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
              <Input label="Harga" type="number" min={0} error={errors.price?.message} {...register("price", { valueAsNumber: true })} />
              <Input label="Kuota" type="number" min={1} error={errors.quota?.message} {...register("quota", { valueAsNumber: true })} />
            </div>
            <div className="border-t border-line" />
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
                Ganti banner (opsional)
              </label>
              <input
                type="file"
                accept=".jpg,.jpeg,.png"
                className="block w-full cursor-pointer rounded-xl border border-dashed border-line bg-surface-alt px-3 py-3 text-sm text-muted file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-brand file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white hover:border-brand-line"
                onChange={(e) => setBanner(e.target.files?.[0] ?? null)}
              />
            </div>
            <Button type="submit" loading={loading}>Simpan perubahan</Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default function EditEventPage() {
  return (
    <Suspense fallback={<Loading text="Memuat form..." />}>
      <EditEventForm />
    </Suspense>
  );
}
