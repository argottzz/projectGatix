"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Ticket, User as UserIcon, ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../ui/Button";

function NavLinks() {
  const pathname = usePathname();
  const { user } = useAuth();

  const link = (href: string, text: string) => (
    <Link
      key={href}
      href={href}
      className={cn(
        "text-sm font-medium",
        pathname === href ? "text-[#FF6A00]" : "text-[#161616] hover:text-[#FF6A00]",
      )}
    >
      {text}
    </Link>
  );

  return (
    <nav className="hidden items-center gap-6 md:flex">
      {link("/", "Beranda")}
      {link("/events", "Jelajahi Event")}
      <Link href="/#kategori" className="text-sm font-medium text-[#161616] hover:text-[#FF6A00]">
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
        <Link href="/login" className="text-sm font-medium text-[#161616] hover:text-[#FF6A00]">
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
        className="flex items-center gap-1 rounded-lg border border-[#E5E7EB] px-2 py-1.5 text-sm font-medium hover:bg-[#F7F8FA]"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#FF6A00]/15 text-[#FF6A00]">
          <UserIcon size={14} />
        </span>
        <span className="hidden max-w-24 truncate sm:inline">{user.name}</span>
        <ChevronDown size={14} className="text-[#737373]" />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-44 rounded-xl border border-[#E5E7EB] bg-white py-1 shadow-lg">
          <Link href="/organizer/profile" onClick={() => setOpen(false)} className="block px-4 py-2 text-sm hover:bg-[#F7F8FA]">
            Profil
          </Link>
          <Link href="/my-tickets" onClick={() => setOpen(false)} className="block px-4 py-2 text-sm hover:bg-[#F7F8FA]">
            Tiket Saya
          </Link>
          {user.role === "organizer" && (
            <Link href="/organizer" onClick={() => setOpen(false)} className="block px-4 py-2 text-sm hover:bg-[#F7F8FA]">
              Dashboard
            </Link>
          )}
          <button
            className="block w-full px-4 py-2 text-left text-sm text-[#DC2626] hover:bg-[#F7F8FA]"
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
  const link = (href: string, text: string) => (
    <Link
      key={href}
      href={href}
      className={cn(
        "text-sm font-medium",
        pathname === href ? "text-[#FF6A00]" : "text-[#161616] hover:text-[#FF6A00]",
      )}
    >
      {text}
    </Link>
  );
  return (
    <nav className="flex items-center gap-4 border-t border-[#E5E7EB] px-4 py-2 md:hidden">
      {link("/", "Beranda")}
      {link("/events", "Event")}
      <Link href="/#kategori" className="text-sm font-medium text-[#161616]">Kategori</Link>
      {user && link("/my-tickets", "Tiket Saya")}
      {user?.role === "organizer" && link("/organizer", "Dashboard")}
    </nav>
  );
}

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-[#E5E7EB] bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FF6A00] text-black">
            <Ticket size={18} />
          </span>
          <span className="text-lg font-extrabold tracking-tight text-[#161616]">GATIX</span>
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
