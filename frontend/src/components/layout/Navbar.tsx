"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, Ticket, User as UserIcon } from "lucide-react";
import { cn } from "../../lib/utils";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../ui/Button";

function NavLinks() {
  const pathname = usePathname();
  const { user } = useAuth();

  const link = (href: string, text: string) => {
    const active = pathname === href;
    return (
      <Link
        key={href}
        href={href}
        className={cn(
          "relative py-1 text-sm font-medium transition-colors",
          active
            ? "text-brand after:absolute after:-bottom-0.5 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-brand"
            : "text-muted hover:text-ink",
        )}
      >
        {text}
      </Link>
    );
  };

  return (
    <nav className="hidden items-center gap-7 md:flex">
      {link("/", "Beranda")}
      {link("/events", "Jelajahi Event")}
      <Link href="/#kategori" className="text-sm font-medium text-muted transition-colors hover:text-ink">
        Kategori
      </Link>
      {user && link("/my-tickets", "Tiket Saya")}
      {user?.role === "organizer" && link("/organizer", "Dashboard")}
    </nav>
  );
}

function AccountMenu() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  if (loading) return null;
  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/login" className="px-2 text-sm font-medium text-muted transition-colors hover:text-ink">
          Login
        </Link>
        <Link href="/register">
          <Button>Registrasi</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full border border-line bg-white py-1 pl-1 pr-2.5 text-sm font-medium text-ink transition hover:border-brand-line hover:bg-brand-soft"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-white">
          <UserIcon size={14} />
        </span>
        <span className="hidden max-w-24 truncate sm:inline">{user.name}</span>
        <ChevronDown size={14} className={cn("text-muted transition", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 overflow-hidden rounded-2xl border border-line bg-white p-1.5 shadow-card">
          <Link
            href="/organizer/profile"
            onClick={() => setOpen(false)}
            className="block rounded-xl px-3 py-2 text-sm text-ink transition hover:bg-surface-alt"
          >
            Profil
          </Link>
          <Link
            href="/my-tickets"
            onClick={() => setOpen(false)}
            className="block rounded-xl px-3 py-2 text-sm text-ink transition hover:bg-surface-alt"
          >
            Tiket Saya
          </Link>
          {user.role === "organizer" && (
            <Link
              href="/organizer"
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3 py-2 text-sm text-ink transition hover:bg-surface-alt"
            >
              Dashboard
            </Link>
          )}
          <button
            className="mt-1 block w-full rounded-xl border-t border-line px-3 py-2 text-left text-sm text-danger transition hover:bg-danger-soft"
            onClick={() => {
              logout();
              setOpen(false);
              router.push("/");
            }}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

function MobileNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const link = (href: string, text: string) => {
    const active = pathname === href;
    return (
      <Link
        key={href}
        href={href}
        className={cn(
          "whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition",
          active ? "bg-brand-soft text-brand" : "text-muted hover:bg-surface-alt hover:text-ink",
        )}
      >
        {text}
      </Link>
    );
  };
  return (
    <nav className="flex items-center gap-1 overflow-x-auto border-t border-line px-4 py-2 md:hidden">
      {link("/", "Beranda")}
      {link("/events", "Event")}
      <Link href="/#kategori" className="whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium text-muted">
        Kategori
      </Link>
      {user && link("/my-tickets", "Tiket Saya")}
      {user?.role === "organizer" && link("/organizer", "Dashboard")}
    </nav>
  );
}

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white shadow-lift">
            <Ticket size={18} />
          </span>
          <span className="font-display text-2xl leading-none tracking-tight text-ink">GATIX</span>
        </Link>
        <Suspense fallback={null}>
          <NavLinks />
        </Suspense>
        <Suspense fallback={null}>
          <AccountMenu />
        </Suspense>
      </div>
      <Suspense fallback={null}>
        <MobileNav />
      </Suspense>
    </header>
  );
}
