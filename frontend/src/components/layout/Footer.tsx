import Link from "next/link";
import { Ticket } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-surface-alt">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-[1.6fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand text-white">
              <Ticket size={16} />
            </span>
            <span className="font-display text-2xl leading-none tracking-tight text-ink">GATIX</span>
          </div>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
            Marketplace event yang mudah digunakan. Temukan event favoritmu dan amankan tiketmu.
          </p>
        </div>
        <div className="flex flex-col gap-2.5 text-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">Jelajahi</p>
          <Link href="/" className="text-ink transition hover:text-brand">
            Beranda
          </Link>
          <Link href="/events" className="text-ink transition hover:text-brand">
            Jelajahi Event
          </Link>
          <Link href="/my-tickets" className="text-ink transition hover:text-brand">
            Tiket Saya
          </Link>
        </div>
        <div className="flex flex-col gap-2.5 text-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">Organizer</p>
          <Link href="/organizer" className="text-ink transition hover:text-brand">
            Dashboard
          </Link>
          <Link href="/organizer/events/create" className="text-ink transition hover:text-brand">
            Tambah Event
          </Link>
          <Link href="/organizer/profile" className="text-ink transition hover:text-brand">
            Profil
          </Link>
        </div>
      </div>
      <div className="border-t border-line/80">
        <div className="mx-auto flex max-w-6xl flex-col gap-1.5 px-4 py-4 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 GATIX. Seluruh hak cipta dilindungi.</p>
          <p>Marketplace event ticketing untuk organizer dan peserta.</p>
        </div>
      </div>
    </footer>
  );
}
