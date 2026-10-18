# SYSTEM_DESIGN.md — UI/UX & Visual Design System

> Dokumen ini mendokumentasikan **design system yang benar-benar diterapkan** pada GATIX, diambil dari kode sumber dan konfigurasi (bukan dari screenshot/tebakan).
> Semua nilai warna/ukuran adalah nilai aktual dari kode, kecuali ditandai *estimasi*.
>
> Dokumentasi terkait: [`PRD.md`](./PRD.md), [`ARCHITECTURE.md`](./ARCHITECTURE.md), [`AGENTS.md`](./AGENTS.md).

Sumber utama: `frontend/src/app/globals.css`, `frontend/src/app/layout.tsx`, `frontend/src/components/**`, `frontend/next.config.ts`, `frontend/src/lib/utils.ts`.

---

## 1. Design Overview

**Karakter visual:** bersih, modern, terang (light theme) dengan aksen oranye yang kuat. Gaya khas marketplace: kartu membulat, border tipis abu muda, dan bayangan yang sangat halus.

**Prinsip yang terlihat dari implementasi:**

- **Dominasi putih + satu aksen.** Hampir semua permukaan `bg-white`, aksen tunggal `#FF6A00` (primary).
- **Bentuk lembut:** sudut `rounded-lg`, `rounded-xl`, `rounded-2xl`; elemen kecil memakai `rounded-full` (badge, chip, tombol nav mobile).
- **Border halus sebagai pemisah** (`border border-[#E5E7EB]`) alih-alih bayangan tebal.
- **Hierarki tipografi lewat weight**, bukan warna: judul `font-extrabold`, label `font-semibold`/`font-medium`, teks sekunder `text-[#737373]`.
- **Kontras gelap-terang:** hero memakai panel gelap `#161616` dengan teks putih sebagai pemisah visual dari halaman putih.

---

## 2. Color Palette

Token warna didefinisikan di `frontend/src/app/globals.css` (`:root` + `@theme inline`):

```css
:root {
  --background: #ffffff;
  --foreground: #161616;
  --primary: #ff6a00;
  --primary-hover: #e65f00;
  --secondary-bg: #f7f8fa;
  --secondary-text: #737373;
  --border: #e5e7eb;
  --success: #16a34a;
  --warning: #f59e0b;
  --danger: #dc2626;
}
```

| Fungsi | Nilai | Penggunaan nyata (contoh) |
|---|---|---|
| **Primary (aksen)** | `#FF6A00` | Tombol utama (`Button` primary), harga, link aktif, judul nav aktif, hero highlight, badge hero |
| **Primary hover** | `#E65F00` | `hover:bg-[#E65F00]` pada Button primary |
| **Foreground / teks utama** | `#161616` | Body text, judul, `text-[#161616]` di hampir semua komponen |
| **Background** | `#FFFFFF` | `body`, kartu, navbar, footer panel |
| **Surface sekunder** | `#F7F8FA` | Latar banner tanpa gambar (`bg-[#F7F8FA]`), footer, hover tombol sekunder, pemisah baris di dashboard (`border-[#F7F8FA]`) |
| **Teks sekunder / muted** | `#737373` | Deskripsi, label kecil, metadata tanggal/lokasi |
| **Border** | `#E5E7EB` | Border kartu, input, tombol sekunder, navbar, footer |
| **Success** | `#16A34A` | Badge status `approved` (geser + teks `#15803D`) |
| **Warning** | `#F59E0B` | Badge status `pending` (geser + teks `#B45309`), kartu notice |
| **Danger** | `#DC2626` | Tombol `danger`, pesan error (`text-[#DC2626]`), badge `cancelled` (teks `#B91C1C`) |

**Warna status badge** (`frontend/src/components/ui/StatusBadge.tsx`) — kombinasi latar transparan (`/15`) + teks gelap:

| Status | Latar | Teks |
|---|---|---|
| `pending` | `#F59E0B` @ 15% | `#B45309` |
| `approved` | `#16A34A` @ 15% | `#15803D` |
| `cancelled` | `#DC2626` @ 15% | `#B91C1C` |

**Warna lain yang dipakai:**

- Teks di panel gelap hero: `text-white` dan `text-white/70` (subjudul).
- Teks pada tombol primary: `text-black` (di atas `#FF6A00`).
- Bayangan: `shadow-[0_1px_3px_rgba(0,0,0,0.06)]` (kartu), `shadow-[0_4px_16px_rgba(0,0,0,0.08)]` (panel search), `shadow-lg` (dropdown akun).

> ⚠️ **Catatan penting:** token `--primary`, `--foreground`, dst. **didefinisikan tetapi tidak dipakai** — komponen menulis nilai HEX langsung (mis. `text-[#161616]`, bukan `text-foreground`). Jadi mengubah token di `globals.css` **tidak** mengubah tampilan. Lihat §9.

---

## 3. Typography

**Font yang dimuat** (`frontend/src/app/layout.tsx`):

- `Geist` (`next/font/google`) → variabel CSS `--font-geist-sans`
- `Geist_Mono` (`next/font/google`) → variabel CSS `--font-geist-mono`

Dipetakan di `globals.css`:
```css
@theme inline {
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}
```

⚠️ **Namun `globals.css` juga menetapkan:**
```css
body { font-family: Arial, Helvetica, sans-serif; }
```
Karena aturan `body` ini menimpa, **font yang benar-benar dirender adalah Arial/Helvetica/sans-serif**, bukan Geist (lihat §9 — inkonsistensi).

**Hierarki ukuran (class Tailwind yang dipakai aktual):**

| Elemen | Class | Contoh |
|---|---|---|
| Judul hero | `text-3xl md:text-5xl font-extrabold` | `HeroSection` |
| Judul halaman | `text-2xl font-extrabold` | "Jelajahi Event", "Tiket Saya" |
| Judul section | `text-xl font-extrabold` | "Jelajahi Kategori", "Event Pilihan" |
| Judul kartu / panel | `text-base` / `text-lg font-bold` | nama event, "Ringkasan Pemesanan" |
| Body | `text-sm` | deskripsi, isi form |
| Metadata / caption | `text-xs` | tanggal, lokasi, catatan |

**Weight:** `font-extrabold` (judul), `font-bold`, `font-semibold` (tombol/chip/label), `font-medium` (label input, link nav), default untuk body.
**Line-height:** tidak diatur eksplisit kecuali `leading-relaxed` pada halaman statis (`about`, `privacy`, `terms`).

---

## 4. Layout and Spacing

**Struktur layout global** (`frontend/src/app/layout.tsx`):

- `body`: `flex min-h-full flex-col bg-white text-[#161616]`
- `<Navbar />` (sticky) → `<main class="mx-auto w-full max-w-6xl flex-1 px-4 py-6">` → `<Footer />` → `<Toaster />`

**Lebar konten:**

| Konteks | Max width | Bukti |
|---|---|---|
| Kontainer utama, navbar, footer | `max-w-6xl` (72rem) | `layout.tsx`, `Navbar.tsx`, `Footer.tsx` |
| Hero search panel | `max-w-3xl` | `HeroSection.tsx` |
| Halaman statis (about/help/privacy/terms) | `max-w-2xl` | halaman masing-masing |
| Form event (create/edit) | `max-w-xl` | `organizer/events/create`, `.../[id]/edit` |
| Form login/register/profil | `max-w-md` | `login`, `register`, `organizer/profile` |
| Sidebar organizer | `md:w-56` | `OrganizerSidebar.tsx` |

**Spacing & grid:**

- Padding halaman: `px-4 py-6`; section utama: `gap-10` (beranda), `gap-4` (umum).
- Kartu: `p-4` (kartu data), `p-6` (panel/form), grid `gap-3`/`gap-4`.
- Grid event: `grid gap-4 sm:grid-cols-2 lg:grid-cols-3` (default) atau `lg:grid-cols-4` (beranda).
- Grid kategori: `grid grid-cols-3 gap-3 sm:grid-cols-6`.
- Footer: `grid gap-6 md:grid-cols-4`.
- Layout organizer & detail event: `flex flex-col gap-4 md:flex-row`.

**Breakpoint (default Tailwind v4):** dipakai `sm:` (≥640px), `md:` (≥768px), `lg:` (≥1024px). Tidak ada breakpoint kustom.

---

## 5. UI Components

Komponen yang **benar-benar ada** beserta lokasi & variasinya:

| Komponen | Lokasi | Fungsi & variasi |
|---|---|---|
| **Button** | `components/ui/Button.tsx` | Props `variant: "primary" \| "secondary" \| "danger"`, `loading`. Primary `bg-[#FF6A00] text-black hover:bg-[#E65F00]`; danger `bg-[#DC2626] text-white`; secondary `bg-white border`. Saat `loading`, teks diganti `"Memproses..."` dan tombol `disabled`. Radius `rounded-lg`, `px-4 py-2 text-sm font-semibold`. |
| **Input** | `components/ui/Input.tsx` | Input teks + `label` opsional + `error` (teks merah `text-xs text-[#DC2626]`). Focus: `focus:border-[#FF6A00] focus:ring-2 focus:ring-[#FF6A00]/30`. |
| **Card** | `components/ui/Card.tsx` | Kontainer putih `rounded-xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.06)]`, terima `className`. |
| **Loading** | `components/ui/Loading.tsx` | Spinner (`animate-spin`, border abu dengan `border-t-[#FF6A00]`) + teks (default "Memuat..."). |
| **StatusBadge** | `components/ui/StatusBadge.tsx` | Badge status tiket (`pending`/`approved`/`cancelled`), pill `rounded-full px-2.5 py-1 text-xs font-semibold`. |
| **Navbar** | `components/layout/Navbar.tsx` | Sticky header. Berisi logo GATIX, `NavLinks` (desktop), `AccountMenu` (dropdown akun / tombol Login+Registrasi), `MobileNav`. Dropdown dibuka/tutup lewat klik luar (`mousedown` listener). |
| **OrganizerSidebar** | `components/layout/OrganizerSidebar.tsx` | Menu organizer: Dashboard, Event Saya, Tambah Event, Pendaftaran, Profil. Item aktif `bg-[#FF6A00]/10 text-[#FF6A00]`. |
| **Footer** | `components/layout/Footer.tsx` | 4 kolom: brand, navigasi, tentang, informasi. Latar `#F7F8FA`. |
| **Toast** | `sonner` (`layout.tsx`: `<Toaster position="top-center" richColors />`) | Notifikasi sukses/gagal. |
| **EventCard** | `components/events/EventCard.tsx` | Kartu event: banner (`h-40`, fallback "Tanpa banner"), judul `line-clamp-1`, tanggal, lokasi, harga, tombol "Lihat Detail". |
| **EventGrid** | `components/events/EventGrid.tsx` | Grid `EventCard` + empty state ("Belum ada event"). |
| **EventFilters** | `components/events/EventFilters.tsx` | Chip kategori + form filter (cari, lokasi, tanggal dari/sampai, urutkan, tombol Cari). |
| **FeaturedEvents** | `components/home/FeaturedEvents.tsx` | Section judul + subtitle + link "Lihat Semua" + `EventGrid`. |
| **HeroSection** | `components/home/HeroSection.tsx` | Panel gelap `rounded-2xl bg-[#161616]` berisi badge, judul, subjudul, dan `SearchPanel`. |
| **SearchPanel** | `components/home/SearchPanel.tsx` | Form pencarian (nama event, lokasi, tanggal) → navigasi ke `/events?...`. |
| **CategoryList** | `components/home/CategoryList.tsx` | Grid 6 kategori (ikon + label) yang menautkan ke pencarian. |
| **BookingSummary** | `components/booking/BookingSummary.tsx` | Panel sticky ringkasan pemesanan + tombol "Daftar Sekarang" / "Kuota Habis". |
| **PaymentProofForm** | `components/booking/PaymentProofForm.tsx` | Input file + tombol unggah bukti. |
| **TicketCard / TicketStatus** | `components/tickets/*` | Kartu tiket dan badge + deskripsi status. |

**Komponen yang TIDAK ada (terverifikasi):**

- **Modal/Dialog:** tidak ada. Komponen `components/ui/Modal.tsx` pernah ada tetapi **sudah dihapus** (tidak dipakai) pada commit `52b887c`.
- **Table:** tidak ada `<table>`; daftar memakai `div` bertumpuk.
- **Alert:** tidak ada komponen alert khusus; feedback memakai toast atau kartu statis.
- **Dropdown:** hanya dropdown akun di `Navbar` (bukan komponen reusable).

---

## 6. Page Design

| Route | Struktur visual | Komponen utama |
|---|---|---|
| `/` (Beranda) | Hero gelap + search → daftar kategori → "Event Pilihan" → panel "Cari Event di Sekitarmu" (input kota) → "Jangan Lewatkan Event Ini" | `HeroSection`, `CategoryList`, `FeaturedEvents`, `PopularEvents` |
| `/events` | Judul "Jelajahi Event" → `EventFilters` → grid event → kontrol paginasi | `EventFilters`, `EventGrid`, `Loading` |
| `/events/[id]` | Grid 2 kolom (`md:grid-cols-[1fr_320px]`): kiri banner + judul + meta + harga + deskripsi + penyelenggara; kanan `BookingSummary` sticky | `BookingSummary` |
| `/login`, `/register` | Panel `max-w-md` terpusat, form vertikal | `Input`, `Button` |
| `/my-tickets` | Judul → tab status (Semua/Menunggu/Disetujui/Dibatalkan) → grid tiket | `TicketCard` |
| `/my-tickets/[id]` | Header judul + `TicketStatus`; panel detail; `PaymentProofForm` (jika pending); tombol Batalkan | `TicketStatus`, `PaymentProofForm` |
| `/organizer` | Sidebar + dashboard: 3 kartu statistik, kartu "Menunggu pemeriksaan", kartu "Event terbaru" | `OrganizerSidebar`, `Card`, `StatusBadge` |
| `/organizer/events` | Sidebar + daftar event dengan aksi edit/hapus | `OrganizerSidebar` |
| `/organizer/events/create` | Sidebar + form `max-w-xl` (multipart + banner) | `Input`, `Button` |
| `/organizer/events/[id]/edit` | Sama seperti create, dengan nilai terisi | `Input`, `Button` |
| `/organizer/registrations` | Sidebar + dropdown pilih event + daftar peserta dengan aksi Setujui/Batalkan | `StatusBadge`, `Button` |
| `/organizer/profile` | Sidebar + panel `max-w-md` (form nama + kartu "Jadi Organizer") | `Input`, `Button` |
| `/about`, `/help`, `/privacy`, `/terms` | Konten statis `max-w-2xl` | — |

Semua halaman dibungkus `main` global (`max-w-6xl`); halaman organizer menambahkan `OrganizerSidebar` di dalam konten.

---

## 7. Interaction and States

| State | Perilaku aktual | Bukti |
|---|---|---|
| **Hover** | Link → `hover:text-[#FF6A00]`; tombol primary → `hover:bg-[#E65F00]`; danger → `hover:opacity-90`; kartu/daftar → `hover:border-[#FF6A00]` atau `hover:bg-[#F7F8FA]` | komponen terkait |
| **Focus** | Hanya `Input` punya gaya fokus jelas: `focus:border-[#FF6A00] focus:ring-2 focus:ring-[#FF6A00]/30`. `Button`, `select`, `textarea` sebagian **tidak** punya ring fokus seragam | `Input.tsx`, `EventFilters.tsx` |
| **Active (nav)** | Item sidebar/nav aktif: `bg-[#FF6A00]/10 text-[#FF6A00]` | `OrganizerSidebar.tsx`, `Navbar.tsx` |
| **Disabled** | `disabled:opacity-50` (tombol paginasi, `Button` saat loading) | `Button.tsx`, `events/page.tsx` |
| **Loading** | (a) `Button` menampilkan "Memproses..."; (b) komponen `Loading` (spinner); (c) sebagian halaman memakai teks polos `<p>Memuat...</p>` | `Button.tsx`, `Loading.tsx`, `organizer/events/page.tsx` |
| **Error** | Toast (`toast.error`) di hampir semua aksi; **kartu error inline** hanya di `/`, `/events`, `/my-tickets` | `app/page.tsx`, `app/events/page.tsx`, `app/my-tickets/page.tsx` |
| **Empty** | `EventGrid` ("Belum ada event"), `/my-tickets` ("Belum ada tiket pada tab ini"), daftar pendaftaran ("Belum ada pendaftaran.") | komponen terkait |
| **Success** | Toast (`toast.success`) setelah login/registrasi/simpan/unggah/approve | komponen terkait |
| **Notice inline** | Kartu notifikasi oranye di `/events/[id]` saat pendaftaran berbayar (status pending) | `events/[id]/page.tsx` |

---

## 8. Responsive Design

Berdasarkan class aktual:

- **Navbar:** link desktop `hidden md:flex`; sub-nav mobile `md:hidden` (tampil di bawah header pada layar kecil). Logo selalu tampil. Dropdown akun ada di kedua ukuran.
- **Footer:** 1 kolom di mobile, `md:grid-cols-4` di desktop.
- **Grid event:** 1 kolom (mobile) → `sm:grid-cols-2` → `lg:grid-cols-3`/`4`.
- **Grid kategori:** `grid-cols-3` (mobile) → `sm:grid-cols-6`.
- **Halaman organizer & detail event:** bertumpuk (`flex-col`) di mobile → `md:flex-row` (sidebar/kiri-kanan) di desktop.
- **Hero:** padding `p-8 md:p-12`; judul `text-3xl md:text-5xl`; panel search `grid-cols-1` → `md:grid-cols-[1fr_1fr_1fr_auto]`.
- **Form event:** `datetime-local`/`number`/`file` mengikuti lebar kontainer.

---

## 9. Design Consistency

**Inkonsistensi yang benar-benar ditemukan (dengan bukti):**

1. **Token warna tidak dipakai.** `globals.css` mendefinisikan token (`--primary`, `--foreground`, ...) tapi komponen menulis HEX langsung (`text-[#161616]`). Mengubah token tidak berdampak visual.
2. **Font tidak sesuai konfigurasi.** Geist dimuat dan dipetakan ke `--font-sans`, tetapi `body { font-family: Arial, ... }` menimpanya, sehingga yang tampil Arial.
3. **Loading tidak seragam.** Sebagian halaman memakai komponen `Loading`; sebagian (`organizer/events`, `organizer/registrations`) memakai `<p className="text-sm text-[#737373]">Memuat...</p>`. Sama untuk state "memuat detail".
4. **Error tidak seragam.** Kartu error inline hanya ada di 3 halaman; halaman lain hanya mengandalkan toast atau templat not-found sederhana.
5. **Bahasa badge tidak konsisten.** UI berbahasa Indonesia, tetapi label `StatusBadge` berbahasa Inggris: "Pending / Approved / Cancelled".
6. **Fokus tidak seragam.** Ring fokus hanya pada `Input`; `Button`, `select`, `textarea` tidak memiliki gaya `:focus-visible` yang sama.
7. **`select` dan `textarea` ad-hoc.** Elemen ini menulis style langsung (tidak memakai komponen `Input`), sehingga border/focus berbeda dari `Input`.
8. **Kontras tombol primary.** Tombol primary memakai `text-black` di atas `#FF6A00`. Ini nilai aktual; kelayakan kontras sebaiknya diperiksa terpisah (tidak diubah di sini).
9. **Detail kecil:** judul section kosong pada `<FeaturedEvents title="" />` di beranda (merender `<h2>` kosong untuk daftar "event sekitar").

**Rekomendasi (terpisah dari implementasi, jangan diterapkan tanpa diminta):**

- Pindahkan seluruh warna ke token dan pakai `text-foreground`, `bg-primary`, dll., agar theming terpusat.
- Perbaiki `body { font-family: ... }` agar memakai `var(--font-sans)`, atau hapus agar Geist dipakai.
- Standardisasi loading/error ke komponen `Loading` + satu pola kartu error.
- Seragamkan bahasa badge ke bahasa Indonesia.
- Terapkan `focus-visible` seragam pada semua elemen interaktif.
- Buat komponen `Select`/`Textarea` bila polanya mulai berulang.

---

*Dokumen ini mencerminkan kondisi pada commit `0324a4f`. Perbarui bila tampilan/design system berubah (lihat `AGENTS.md`).*
