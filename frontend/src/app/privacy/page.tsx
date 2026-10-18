export default function PrivacyPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <h1 className="text-2xl font-extrabold text-[#161616]">Kebijakan Privasi</h1>
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 text-sm leading-relaxed text-[#737373]">
        <p className="font-bold text-[#161616]">Data yang kami simpan</p>
        <ul className="mt-1 list-disc pl-5">
          <li>Nama dan email saat registrasi akun.</li>
          <li>Riwayat pendaftaran event milikmu.</li>
          <li>File bukti pembayaran yang kamu unggah untuk event berbayar.</li>
        </ul>
        <p className="mt-3 font-bold text-[#161616]">Penggunaan data</p>
        <ul className="mt-1 list-disc pl-5">
          <li>Data hanya dipakai untuk keperluan pendaftaran dan verifikasi tiket.</li>
          <li>Bukti pembayaran hanya ditampilkan kepada kamu (pemilik tiket) dan organizer event terkait; berkasnya disimpan di layanan penyimpanan gambar Cloudinary.</li>
          <li>Kami tidak membagikan datamu ke pihak ketiga tanpa izin.</li>
        </ul>
      </div>
    </div>
  );
}
