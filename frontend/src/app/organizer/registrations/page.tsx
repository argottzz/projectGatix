"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { listEvents } from "../../../services/event.service";
import { listEventRegistrations, setRegistrationStatus } from "../../../services/registration.service";
import type { EventItem } from "../../../types/event";
import type { Registration } from "../../../types/registration";
import { OrganizerSidebar } from "../../../components/layout/OrganizerSidebar";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { Button } from "../../../components/ui/Button";

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
    <div className="flex flex-col gap-4 md:flex-row">
      <OrganizerSidebar />
      <div className="flex flex-1 flex-col gap-4">
        <h1 className="text-2xl font-extrabold">Manajemen Pendaftaran</h1>
        <select value={selected} onChange={(e) => setSelected(e.target.value)} className="max-w-md rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm">
          {events.map((e) => (
            <option key={e.id} value={e.id}>{e.title}</option>
          ))}
        </select>
        {loading ? (
          <p className="text-sm text-[#737373]">Memuat...</p>
        ) : (
          <div className="flex flex-col gap-2">
            {regs.map((r) => (
              <div key={r.id} className="flex flex-col gap-2 rounded-xl border border-[#E5E7EB] bg-white p-3 md:flex-row md:items-center md:justify-between">
                <div className="text-sm">
                  <p className="font-bold">{r.user_name ?? `User #${r.user_id}`} <span className="font-normal text-[#737373]">({r.user_email ?? ""})</span></p>
                  <p className="text-xs text-[#737373]">
                    Bukti: {r.payment_proof_url ? <a href={r.payment_proof_url} target="_blank" className="text-[#FF6A00] underline">lihat bukti</a> : "belum ada"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
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
            {regs.length === 0 && <p className="text-sm text-[#737373]">Belum ada pendaftaran.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
