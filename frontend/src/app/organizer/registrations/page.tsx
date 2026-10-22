"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Users } from "lucide-react";
import { listEvents } from "../../../services/event.service";
import { listEventRegistrations, setRegistrationStatus } from "../../../services/registration.service";
import type { EventItem } from "../../../types/event";
import type { Registration } from "../../../types/registration";
import { OrganizerSidebar } from "../../../components/layout/OrganizerSidebar";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Select } from "../../../components/ui/Select";
import { Loading } from "../../../components/ui/Loading";

export default function OrganizerRegistrationsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [regs, setRegs] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await listEvents({ limit: 50 });
        setEvents(res.data);
        if (res.data.length > 0) setSelected(String(res.data[0].id));
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Gagal memuat event");
      }
    })();
  }, []);

  useEffect(() => {
    if (!selected) return;
    (async () => {
      setLoading(true);
      try {
        const res = await listEventRegistrations(selected);
        setRegs(res.data);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Gagal memuat pendaftaran");
      } finally {
        setLoading(false);
      }
    })();
  }, [selected]);

  const act = async (id: number, status: "approved" | "cancelled") => {
    try {
      await setRegistrationStatus(id, status);
      toast.success(status === "approved" ? "Pendaftaran disetujui" : "Pendaftaran dibatalkan");
      const res = await listEventRegistrations(selected);
      setRegs(res.data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengubah status");
    }
  };

  return (
    <div className="flex flex-col gap-6 md:flex-row">
      <OrganizerSidebar />
      <div className="flex min-w-0 flex-1 flex-col gap-5">
        <div className="flex flex-col gap-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand">Peserta event</p>
          <h1 className="font-display text-3xl tracking-tight text-ink md:text-4xl">Manajemen Pendaftaran</h1>
          <p className="text-sm text-muted">Periksa bukti pembayaran dan ubah status pendaftaran peserta.</p>
        </div>
        <Card className="p-4">
          <Select
            label="Pilih event"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="max-w-md"
          >
            {events.map((e) => (
              <option key={e.id} value={e.id}>{e.title}</option>
            ))}
          </Select>
        </Card>
        {loading ? (
          <Loading />
        ) : regs.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-line bg-white px-6 py-14 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft text-brand">
              <Users size={22} />
            </span>
            <p className="font-semibold text-ink">Belum ada pendaftaran</p>
            <p className="text-sm text-muted">Pendaftaran peserta akan muncul di sini.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {regs.map((r) => (
              <div
                key={r.id}
                className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-4 shadow-card transition hover:border-brand-line sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-soft text-sm font-bold text-brand">
                    {(r.user_name ?? "U").slice(0, 1).toUpperCase()}
                  </span>
                  <div className="min-w-0 text-sm">
                    <p className="truncate font-bold text-ink">
                      {r.user_name ?? `User #${r.user_id}`}{" "}
                      <span className="font-normal text-muted">({r.user_email ?? ""})</span>
                    </p>
                    <p className="text-xs text-muted">
                      Bukti:{" "}
                      {r.payment_proof_url ? (
                        <a href={r.payment_proof_url} target="_blank" className="text-brand underline">
                          lihat bukti
                        </a>
                      ) : (
                        "belum ada"
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={r.status} />
                  {r.status === "pending" && (
                    <>
                      <Button onClick={() => act(r.id, "approved")}>Setujui</Button>
                      <Button variant="danger" onClick={() => act(r.id, "cancelled")}>Batalkan</Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
