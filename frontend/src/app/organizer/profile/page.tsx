"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { becomeOrganizer, updateProfile } from "../../../services/auth.service";
import { useAuth } from "../../../hooks/useAuth";
import { OrganizerSidebar } from "../../../components/layout/OrganizerSidebar";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";

export default function OrganizerProfilePage() {
  const { user, refresh } = useAuth();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    if (user) setName(user.name);
  }, [user]);

  return (
    <div className="flex flex-col gap-6 md:flex-row">
      <OrganizerSidebar />
      <div className="mx-auto w-full max-w-xl flex-1">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand text-lg font-bold text-white">
              {(user?.name ?? "G").slice(0, 1).toUpperCase()}
            </span>
            <div className="min-w-0">
              <h1 className="font-display text-2xl tracking-tight text-ink">Profil</h1>
              <p className="truncate text-sm text-muted">
                {user?.email ?? ""} • {user?.role ?? ""}
              </p>
            </div>
          </div>
          <form
            className="mt-5 flex flex-col gap-4"
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
            <div className="mt-6 rounded-2xl border border-brand-line bg-brand-soft p-5">
              <p className="text-sm font-bold text-ink">Jadi Organizer</p>
              <p className="mt-1 text-xs leading-relaxed text-muted">
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
        </Card>
      </div>
    </div>
  );
}
