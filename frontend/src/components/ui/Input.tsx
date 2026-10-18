"use client";

import { cn } from "../../lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, ...rest }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-[#161616]">{label}</label>}
      <input
        className={cn(
          "rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#161616] outline-none focus:border-[#FF6A00] focus:ring-2 focus:ring-[#FF6A00]/30",
          className,
        )}
        {...rest}
      />
      {error && <span className="text-xs text-[#DC2626]">{error}</span>}
    </div>
  );
}
