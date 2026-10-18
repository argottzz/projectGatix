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
import { Button } from "../../../../../components/ui/Button";

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
    <div className="flex flex-col gap-4 md:flex-row">
      <OrganizerSidebar />
      <div className="mx-auto w-full max-w-xl rounded-xl border border-[#E5E7EB] bg-white p-6">
        <h1 className="text-xl font-extrabold">Edit Event</h1>
        <form
          className="mt-4 flex flex-col gap-3"
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
          <Input label="Judul event" error={errors.title?.message} {...register("title")} />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Deskripsi</label>
            <textarea className="rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm outline-none focus:border-[#FF6A00]" rows={4} {...register("description")} />
            {errors.description && <span className="text-xs text-[#DC2626]">{errors.description.message}</span>}
          </div>
          <Input label="Tanggal dan waktu" type="datetime-local" error={errors.date?.message} {...register("date")} />
          <Input label="Lokasi" error={errors.location?.message} {...register("location")} />
          <Input label="Harga" type="number" min={0} error={errors.price?.message} {...register("price", { valueAsNumber: true })} />
          <Input label="Kuota" type="number" min={1} error={errors.quota?.message} {...register("quota", { valueAsNumber: true })} />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Ganti banner (opsional)</label>
            <input type="file" accept=".jpg,.jpeg,.png" className="text-sm" onChange={(e) => setBanner(e.target.files?.[0] ?? null)} />
          </div>
          <Button type="submit" loading={loading}>Simpan perubahan</Button>
        </form>
      </div>
    </div>
  );
}

export default function EditEventPage() {
  return (
    <Suspense fallback={<p className="text-sm text-[#737373]">Memuat form...</p>}>
      <EditEventForm />
    </Suspense>
  );
}
