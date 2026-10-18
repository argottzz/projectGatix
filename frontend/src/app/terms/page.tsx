export default function TermsPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <h1 className="text-2xl font-extrabold text-[#161616]">Syarat dan Ketentuan</h1>
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 text-sm leading-relaxed text-[#737373]">
        <ul className="list-disc pl-5">
          <li>Harga tiket dan sisa kuota ditentukan dan diverifikasi oleh sistem.</li>
          <li>Pendaftaran event gratis langsung disetujui; event berbayar berstatus menunggu hingga pembayaran diverifikasi organizer.</li>
          <li>Mengunggah bukti pembayaran bukan berarti tiket otomatis disetujui — status mengikuti hasil pemeriksaan organizer.</li>
          <li>Organizer hanya dapat mengelola event miliknya sendiri.</li>
          <li>Pendaftaran yang dibatalkan membebaskan kuota dan dapat didaftarkan ulang.</li>
        </ul>
      </div>
    </div>
  );
}
