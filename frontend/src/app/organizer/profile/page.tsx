"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { becomeOrganizer, updateProfile } from "../../../services/auth.service";
import { useAuth } from "../../../hooks/useAuth";
import { OrganizerSidebar } from "../../../components/layout/OrganizerSidebar";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";

export default function OrganizerProfilePage() {
  const { user, refresh } = useAuth();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    if (user) setName(user.name);
  }, [user]);

  return (
    <div className="flex flex-col gap-4 md:flex-row">
      <OrganizerSidebar />
      <div className="mx-auto w-full max-w-md rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <h1 className="text-xl font-extrabold text-[#161616]">Profil</h1>
        <p className="mt-1 text-sm text-[#737373]">{user?.email ?? ""} • {user?.role ?? ""}</p>
        <form
          className="mt-4 flex flex-col gap-3"
          onSubmit={async (e) => {
            e.preventDefault();
            if (name.trim().length < 3) {
              toast.error("Nama minimal 3 karakter");
              return;
            }
            setLoading(true);
            try {
              await updateProfile(name.trim());
              await refresh();
              toast.success("Profil berhasil diperbarui");
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Gagal memperbarui profil");
            } finally {
              setLoading(false);
            }
          }}
        >
          <Input label="Nama" value={name} onChange={(e) => setName(e.target.value)} />
          <Button type="submit" loading={loading}>Simpan</Button>
        </form>
        {user?.role !== "organizer" && (
          <div className="mt-4 rounded-xl border border-[#FF6A00]/30 bg-[#FF6A00]/5 p-4">
            <p className="text-sm font-bold text-[#161616]">Jadi Organizer</p>
            <p className="mt-1 text-xs text-[#737373]">
              Upgrade akunmu untuk membuat event, melihat peserta, dan memeriksa bukti pembayaran.
            </p>
            <Button
              className="mt-3"
              loading={upgrading}
              onClick={async () => {
                setUpgrading(true);
                try {
                  await becomeOrganizer();
                  await refresh();
                  toast.success("Akunmu sekarang organizer. Selamat membuat event!");
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Gagal upgrade akun");
                } finally {
                  setUpgrading(false);
                }
              }}
            >
              Upgrade jadi Organizer
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
