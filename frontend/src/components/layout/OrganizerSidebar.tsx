"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../../lib/utils";

const items = [
  { href: "/organizer", label: "Dashboard" },
  { href: "/organizer/events", label: "Event Saya" },
  { href: "/organizer/events/create", label: "Tambah Event" },
  { href: "/organizer/registrations", label: "Pendaftaran" },
  { href: "/organizer/profile", label: "Profil" },
];

export function OrganizerSidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-full shrink-0 rounded-xl border border-[#E5E7EB] bg-white p-3 shadow-[0_1px_3px_rgba(0,0,0,0.06)] md:w-56">
      {items.map((it) => (
        <Link
          key={it.href}
          href={it.href}
          className={cn(
            "block rounded-lg px-3 py-2 text-sm font-medium",
            pathname === it.href ? "bg-[#FF6A00]/10 text-[#FF6A00]" : "text-[#161616] hover:bg-[#F7F8FA]",
          )}
        >
          {it.label}
        </Link>
      ))}
    </aside>
  );
}
