"use client";

import { cn } from "../../lib/utils";
import type { RegistrationStatus } from "../../types/registration";

const map: Record<RegistrationStatus, string> = {
  pending: "bg-[#F59E0B]/15 text-[#B45309]",
  approved: "bg-[#16A34A]/15 text-[#15803D]",
  cancelled: "bg-[#DC2626]/15 text-[#B91C1C]",
};

const label: Record<RegistrationStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  cancelled: "Cancelled",
};

export function StatusBadge({ status }: { status: RegistrationStatus }) {
  return (
    <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", map[status])}>
      {label[status]}
    </span>
  );
}
