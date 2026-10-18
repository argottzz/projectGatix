export default function AboutPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <h1 className="text-2xl font-extrabold text-[#161616]">Tentang GATIX</h1>
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 text-sm leading-relaxed text-[#161616]">
        <p>
          GATIX adalah marketplace event ticketing yang memudahkanmu menemukan acara menarik
          dan mengamankan tiket dengan mudah.
        </p>
        <p className="mt-3 font-bold">Cara kerja GATIX:</p>
        <ol className="mt-1 list-decimal pl-5 text-[#737373]">
          <li>Jelajahi event lewat pencarian, kategori, atau lokasi.</li>
          <li>Daftar ke event pilihanmu — gratis langsung disetujui.</li>
          <li>Untuk event berbayar, unggah bukti pembayaran di Tiket Saya.</li>
          <li>Organizer memeriksa pembayaran, lalu tiketmu disetujui.</li>
        </ol>
      </div>
    </div>
  );
}
