"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { registerSchema, type RegisterInput } from "../../validators/auth.schema";
import { register as registerApi } from "../../services/auth.service";
import { useAuth } from "../../hooks/useAuth";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";

export default function RegisterPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  return (
    <div className="mx-auto max-w-md rounded-xl border border-[#E5E7EB] bg-white p-6">
      <h1 className="text-xl font-extrabold">Registrasi GATIX</h1>
      <p className="mt-1 text-sm text-[#737373]">Registrasi publik hanya membuat akun user.</p>
      <form
        className="mt-4 flex flex-col gap-3"
        onSubmit={handleSubmit(async (v) => {
          setLoading(true);
          try {
            await registerApi(v.name, v.email, v.password);
            await refresh();
            toast.success("Registrasi berhasil");
            router.push("/");
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Registrasi gagal");
          } finally {
            setLoading(false);
          }
        })}
      >
        <Input label="Nama" error={errors.name?.message} {...register("name")} />
        <Input label="Email" type="email" error={errors.email?.message} {...register("email")} />
        <Input label="Password" type="password" error={errors.password?.message} {...register("password")} />
        <Input label="Konfirmasi password" type="password" error={errors.confirmPassword?.message} {...register("confirmPassword")} />
        <Button type="submit" loading={loading}>Registrasi</Button>
      </form>
    </div>
  );
}
