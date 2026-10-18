"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { loginSchema, type LoginInput } from "../../validators/auth.schema";
import { login } from "../../services/auth.service";
import { useAuth } from "../../hooks/useAuth";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  return (
    <div className="mx-auto max-w-md rounded-xl border border-[#E5E7EB] bg-white p-6">
      <h1 className="text-xl font-extrabold">Login GATIX</h1>
      <p className="mt-1 text-sm text-[#737373]">Masuk untuk memesan tiket dan mengelola event.</p>
      <form
        className="mt-4 flex flex-col gap-3"
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
      <p className="mt-3 text-sm text-[#737373]">
        Belum punya akun? <a href="/register" className="font-semibold text-[#FF6A00]">Registrasi</a>
      </p>
    </div>
  );
}
