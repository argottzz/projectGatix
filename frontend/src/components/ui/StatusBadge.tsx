"use client";

import { cn } from "../../lib/utils";
import type { RegistrationStatus } from "../../types/registration";

const map: Record<RegistrationStatus, string> = {
  pending: "bg-warning-soft text-warning ring-warning/20",
  approved: "bg-success-soft text-success ring-success/20",
  cancelled: "bg-danger-soft text-danger ring-danger/20",
};

const label: Record<RegistrationStatus, string> = {
  pending: "Menunggu",
  approved: "Disetujui",
  cancelled: "Dibatalkan",
};

export function StatusBadge({ status }: { status: RegistrationStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
        map[status],
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label[status]}
    </span>
  );
}
