const FAQS = [
  {
    q: "Bagaimana cara mendaftar event?",
    a: "Buka halaman detail event, klik Daftar Sekarang. Jika belum login kamu akan diarahkan ke halaman login dulu.",
  },
  {
    q: "Bagaimana cara membayar event berbayar?",
    a: "Setelah mendaftar, buka Tiket Saya, pilih tiket berstatus Menunggu, lalu unggah bukti pembayaran (jpg/jpeg/png, maks 5 MB).",
  },
  {
    q: "Kapan tiket saya disetujui?",
    a: "Event gratis langsung disetujui otomatis. Event berbayar disetujui setelah organizer memeriksa bukti pembayaranmu.",
  },
  {
    q: "Bagaimana cara membatalkan pendaftaran?",
    a: "Buka detail tiket di Tiket Saya lalu klik Batalkan pendaftaran.",
  },
  {
    q: "Bagaimana cara menjadi organizer?",
    a: "Buka halaman Profil lalu klik Upgrade jadi Organizer. Setelah itu kamu bisa membuat dan mengelola event.",
  },
];

export default function HelpPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <h1 className="text-2xl font-extrabold text-[#161616]">Bantuan</h1>
      {FAQS.map((f) => (
        <div key={f.q} className="rounded-xl border border-[#E5E7EB] bg-white p-4">
          <p className="text-sm font-bold text-[#161616]">{f.q}</p>
          <p className="mt-1 text-sm text-[#737373]">{f.a}</p>
        </div>
      ))}
    </div>
  );
}
