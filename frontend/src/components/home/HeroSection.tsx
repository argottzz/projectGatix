import { SearchPanel } from "./SearchPanel";

export function HeroSection() {
  return (
    <section className="overflow-hidden rounded-2xl bg-[#161616] p-8 text-white md:p-12">
      <p className="inline-block rounded-full bg-[#FF6A00] px-3 py-1 text-xs font-bold text-black">EVENT TICKETING MARKETPLACE</p>
      <h1 className="mt-3 max-w-xl text-3xl font-extrabold md:text-5xl">
        Temukan Event <span className="text-[#FF6A00]">Favoritmu</span>
      </h1>
      <p className="mt-3 max-w-xl text-sm text-white/70">
        Jelajahi acara menarik dan amankan tiketmu dengan mudah bersama GATIX.
      </p>
      <div className="mt-5 max-w-3xl">
        <SearchPanel />
      </div>
    </section>
  );
}
