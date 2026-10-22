"use client";

import { cn } from "../../lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  loading?: boolean;
}

export function Button({ variant = "primary", loading, className, children, disabled, ...rest }: ButtonProps) {
  const styles =
    variant === "primary"
      ? "bg-brand text-white hover:bg-brand-hover"
      : variant === "danger"
        ? "border border-danger/20 bg-danger-soft text-danger hover:bg-danger hover:text-white"
        : "border border-line bg-white text-ink hover:border-brand-line hover:bg-brand-soft hover:text-brand";
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:ring-offset-2",
        styles,
        className,
      )}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? "Memproses..." : children}
    </button>
  );
}
