"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, CirclePlus, CircleUser, LayoutDashboard, Users } from "lucide-react";
import { cn } from "../../lib/utils";

const items = [
  { href: "/organizer", label: "Dashboard", icon: LayoutDashboard },
  { href: "/organizer/events", label: "Event Saya", icon: CalendarDays },
  { href: "/organizer/events/create", label: "Tambah Event", icon: CirclePlus },
  { href: "/organizer/registrations", label: "Pendaftaran", icon: Users },
  { href: "/organizer/profile", label: "Profil", icon: CircleUser },
];

export function OrganizerSidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-full shrink-0 self-start rounded-2xl border border-line bg-white p-2 shadow-card md:sticky md:top-24 md:w-60">
      <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
        Menu organizer
      </p>
      {items.map((it) => {
        const active = pathname === it.href;
        return (
          <Link
            key={it.href}
            href={it.href}
            className={cn(
              "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition",
              active
                ? "bg-brand text-white shadow-lift"
                : "text-muted hover:bg-surface-alt hover:text-ink",
            )}
          >
            <it.icon size={17} />
            {it.label}
          </Link>
        );
      })}
    </aside>
  );
}
