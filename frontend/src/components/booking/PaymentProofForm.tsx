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
    <Card className="p-4">
      <form
        className="flex flex-col gap-2"
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
        <p className="text-sm font-bold text-[#161616]">Upload bukti pembayaran</p>
        <input
          type="file"
          accept=".jpg,.jpeg,.png"
          className="text-sm"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <p className="text-xs text-[#737373]">Maksimal 5 MB, format jpg/jpeg/png.</p>
        <Button type="submit" loading={loading}>Unggah bukti</Button>
      </form>
    </Card>
  );
}
