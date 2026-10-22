"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ShieldCheck, Ticket, TicketCheck } from "lucide-react";
import { loginSchema, type LoginInput } from "../../validators/auth.schema";
import { login } from "../../services/auth.service";
import { useAuth } from "../../hooks/useAuth";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";

const perks = [
  { icon: Ticket, text: "Semua tiket tersimpan rapi dalam satu akun." },
  { icon: ShieldCheck, text: "Pembayaran diverifikasi langsung oleh organizer." },
  { icon: TicketCheck, text: "Status tiket selalu bisa kamu pantau." },
];

export default function LoginPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  return (
    <div className="mx-auto grid w-full max-w-4xl overflow-hidden rounded-3xl border border-line bg-white shadow-card md:grid-cols-[0.9fr_1.1fr]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-brand p-10 text-white md:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full border border-white/10"
        />
        <div className="relative">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white">
              <Ticket size={18} />
            </span>
            <span className="font-display text-2xl leading-none tracking-tight">GATIX</span>
          </div>
          <h2 className="mt-10 font-display text-4xl leading-[1.1] tracking-tight">
            Tiket event favoritmu, dalam satu akun.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-white/70">
            Masuk untuk memesan tiket, memantau status pembayaran, dan mengelola event.
          </p>
        </div>
        <ul className="relative mt-10 flex flex-col gap-3 text-sm text-white/75">
          {perks.map((p) => (
            <li key={p.text} className="flex items-start gap-2.5">
              <p.icon size={16} className="mt-0.5 shrink-0 text-white/60" /> {p.text}
            </li>
          ))}
        </ul>
      </aside>
      <div className="p-6 md:p-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand">Selamat datang kembali</p>
        <h1 className="mt-2 font-display text-3xl tracking-tight text-ink">Login GATIX</h1>
        <p className="mt-1 text-sm text-muted">Masuk untuk memesan tiket dan mengelola event.</p>
        <form
          className="mt-6 flex flex-col gap-4"
          onSubmit={handleSubmit(async (v) => {
            setLoading(true);
            try {
              await login(v.email, v.password);
              await refresh();
              toast.success("Login berhasil");
              router.push("/");
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Login gagal");
            } finally {
              setLoading(false);
            }
          })}
        >
          <Input label="Email" type="email" error={errors.email?.message} {...register("email")} />
          <Input label="Password" type="password" error={errors.password?.message} {...register("password")} />
          <Button type="submit" loading={loading}>Login</Button>
        </form>
        <p className="mt-4 text-sm text-muted">
          Belum punya akun?{" "}
          <Link href="/register" className="font-semibold text-brand hover:underline">
            Registrasi
          </Link>
        </p>
      </div>
    </div>
  );
}
