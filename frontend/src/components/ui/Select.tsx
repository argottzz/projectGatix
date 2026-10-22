"use client";

import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export function Select({ label, error, className, children, ...rest }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">{label}</label>
      )}
      <div className="relative">
        <select
          className={cn(
            "h-11 w-full appearance-none rounded-xl border border-line bg-white px-3.5 pr-9 text-sm text-ink outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10 disabled:bg-surface-alt",
            error && "border-danger/40",
            className,
          )}
          {...rest}
        >
          {children}
        </select>
        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
        />
      </div>
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  );
}
