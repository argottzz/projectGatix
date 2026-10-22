"use client";

import { useState } from "react";
import { toast } from "sonner";
import { uploadPaymentProof } from "../../services/registration.service";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

export function PaymentProofForm({ registrationId, onDone }: { registrationId: number; onDone: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <Card className="p-5">
      <form
        className="flex flex-col gap-3"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!file) {
            toast.error("Pilih file bukti pembayaran dulu");
            return;
          }
          setLoading(true);
          try {
            await uploadPaymentProof(registrationId, file);
            toast.success("Bukti pembayaran diunggah. Status tetap menunggu hingga diperiksa organizer.");
            onDone();
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Gagal mengunggah");
          } finally {
            setLoading(false);
          }
        }}
      >
        <div>
          <p className="text-sm font-bold text-ink">Upload bukti pembayaran</p>
          <p className="text-xs text-muted">Maksimal 5 MB, format jpg/jpeg/png.</p>
        </div>
        <input
          type="file"
          accept=".jpg,.jpeg,.png"
          className="block w-full cursor-pointer rounded-xl border border-dashed border-line bg-surface-alt px-3 py-4 text-sm text-muted file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-brand file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white hover:border-brand-line"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <Button type="submit" loading={loading}>Unggah bukti</Button>
      </form>
    </Card>
  );
}
