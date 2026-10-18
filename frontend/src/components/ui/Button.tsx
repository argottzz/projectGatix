"use client";

import { cn } from "../../lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  loading?: boolean;
}

export function Button({ variant = "primary", loading, className, children, disabled, ...rest }: ButtonProps) {
  const styles =
    variant === "primary"
      ? "bg-[#FF6A00] text-black hover:bg-[#E65F00]"
      : variant === "danger"
        ? "bg-[#DC2626] text-white hover:opacity-90"
        : "bg-white text-[#161616] border border-[#E5E7EB] hover:bg-[#F7F8FA]";
  return (
    <button
      className={cn("rounded-lg px-4 py-2 text-sm font-semibold transition disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6A00]/40 focus-visible:ring-offset-1", styles, className)}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? "Memproses..." : children}
    </button>
  );
}
