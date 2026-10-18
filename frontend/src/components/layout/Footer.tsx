import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-12 border-t border-[#E5E7EB] bg-[#F7F8FA]">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 md:grid-cols-4">
        <div>
          <p className="text-lg font-extrabold text-[#161616]">GATIX</p>
          <p className="mt-2 text-sm text-[#737373]">Marketplace event yang mudah digunakan. Temukan event favoritmu dan amankan tiketmu.</p>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <p className="font-bold text-[#161616]">Navigasi</p>
          <Link href="/" className="text-[#737373] hover:text-[#FF6A00]">Beranda</Link>
          <Link href="/events" className="text-[#737373] hover:text-[#FF6A00]">Jelajahi Event</Link>
          <Link href="/my-tickets" className="text-[#737373] hover:text-[#FF6A00]">Tiket Saya</Link>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <p className="font-bold text-[#161616]">Tentang GATIX</p>
          <Link href="/about" className="text-[#737373] hover:text-[#FF6A00]">Tentang kami</Link>
          <Link href="/help" className="text-[#737373] hover:text-[#FF6A00]">Bantuan</Link>
          <Link href="/privacy" className="text-[#737373] hover:text-[#FF6A00]">Kebijakan privasi</Link>
          <Link href="/terms" className="text-[#737373] hover:text-[#FF6A00]">Syarat dan ketentuan</Link>
        </div>
        <div className="text-sm text-[#737373]">
          <p className="font-bold text-[#161616]">Informasi platform</p>
          <p className="mt-2">© 2026 GATIX. Seluruh hak cipta dilindungi.</p>
        </div>
      </div>
    </footer>
  );
}
