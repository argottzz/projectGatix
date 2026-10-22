import { Clock, ShieldCheck, TicketCheck } from "lucide-react";
import { SearchPanel } from "./SearchPanel";

const highlights = [
  { icon: ShieldCheck, text: "Pembayaran diperiksa organizer" },
  { icon: TicketCheck, text: "Tiket digital dalam satu akun" },
  { icon: Clock, text: "Daftar dalam hitungan menit" },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-brand px-6 py-12 text-white md:px-12 md:py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-40 h-[26rem] w-[26rem] rounded-full border border-white/10"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-white/5 blur-2xl"
      />
      <div className="relative">
        <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/80">
          EVENT TICKETING MARKETPLACE
        </p>
        <h1 className="mt-5 max-w-2xl font-display text-4xl leading-[1.05] tracking-tight md:text-6xl">
          Temukan Event <span className="italic text-brand-soft">Favoritmu</span>
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/75 md:text-base">
          Jelajahi acara menarik dan amankan tiketmu dengan mudah bersama GATIX.
        </p>
        <div className="mt-7 max-w-3xl">
          <SearchPanel />
        </div>
        <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs text-white/65">
          {highlights.map((h) => (
            <li key={h.text} className="inline-flex items-center gap-1.5">
              <h.icon size={14} /> {h.text}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
