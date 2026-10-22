# SYSTEM_DESIGN.md — UI/UX & Visual Design System

> Dokumen ini mendokumentasikan **design system yang benar-benar diterapkan** pada GATIX setelah redesign UI, diambil dari kode sumber (bukan dari screenshot/tebakan).
> Semua nilai warna/ukuran adalah nilai aktual dari kode, kecuali ditandai *estimasi*.
>
> Dokumentasi terkait: [`PRD.md`](./PRD.md), [`ARCHITECTURE.md`](./ARCHITECTURE.md), [`AGENTS.md`](./AGENTS.md).

Sumber utama: `frontend/src/app/globals.css`, `frontend/src/app/layout.tsx`, `frontend/src/components/**`.

---

## 1. Design Overview

**Karakter visual:** premium editorial — permukaan putih bersih dengan identitas maroon tua yang kuat, tipografi judul serif, kartu bersudut besar, garis tipis, dan motif *ticket stub*.

**Prinsip yang diterapkan:**

- **Dua warna inti:** putih `#FFFFFF` sebagai kanvas dan maroon `#74070E` sebagai identitas (hero, CTA, harga, link aktif, focus ring).
- **Tipografi kontras:** judul memakai **Instrument Serif** (`font-display`), teks UI memakai **Geist**.
- **Bentuk tegas:** kartu `rounded-2xl`, hero/panel `rounded-3xl`, tombol `rounded-xl`, badge pill.
- **Border halus + bayangan hangat** sebagai pemisah, bukan blok abu-abu.
- **Motif tiket:** garis putus-putus (`border-dashed`), badge tanggal/harga di atas banner, panel ringkasan bergaya tiket.
- **Warna status tetap semantik** (hijau/kuning/merah lembut) agar tidak tertukar dengan brand.

---

## 2. Color Palette

Seluruh warna didefinisikan sebagai token di `frontend/src/app/globals.css` (`:root` + `@theme inline`) dan **dipakai lewat utility Tailwind** (mis. `bg-brand`, `text-ink`, `border-line`). Tidak ada hex langsung di komponen.

| Token | Utility contoh | Nilai | Penggunaan |
|---|---|---|---|
| `brand` | `bg-brand`, `text-brand` | `#74070E` | CTA utama, logo mark, link aktif, harga, focus ring, hero |
| `brand-hover` | `hover:bg-brand-hover` | `#5A050B` | Hover tombol primary |
| `brand-soft` | `bg-brand-soft` | `#FBF1F1` | Chip/badge, panel ringan, avatar |
| `brand-line` | `border-brand-line` | `#EFDCDC` | Border panel/chip brand |
| `ink` | `text-ink` | `#1B1315` | Judul & teks utama |
| `muted` | `text-muted` | `#6F6264` | Teks sekunder, label, metadata |
| `line` | `border-line` | `#E8E0E0` | Border kartu, input, pemisah |
| `surface` | `bg-surface` | `#FFFFFF` | Body, kartu, navbar |
| `surface-alt` | `bg-surface-alt` | `#FAF7F7` | Footer, panel dalam, hover |
| `success` / `success-soft` | `text-success`, `bg-success-soft` | `#157347` / `#ECFDF3` | Status `approved` |
| `warning` / `warning-soft` | `text-warning`, `bg-warning-soft` | `#B45309` / `#FFFAF1` | Status `pending` |
| `danger` / `danger-soft` | `text-danger`, `bg-danger-soft` | `#B42318` / `#FEF3F2` | Status `cancelled`, tombol bahaya, pesan error |

**Kontras:** `#74070E` di atas putih (dan putih di atas maroon) ≈ **11,9:1**, memenuhi WCAG AA/AAA untuk teks normal.

**Warna status badge** (`components/ui/StatusBadge.tsx`) — latar soft + teks + ring + titik indikator:

| Status | Latar | Teks | Ring |
|---|---|---|---|
| `pending` | `#FFFAF1` | `#B45309` | `#B45309` @ 20% |
| `approved` | `#ECFDF3` | `#157347` | `#157347` @ 20% |
| `cancelled` | `#FEF3F2` | `#B42318` | `#B42318` @ 20% |

**Bayangan & focus:**

- `shadow-card`: `0 1px 2px rgba(27,19,21,0.05), 0 12px 32px -24px rgba(27,19,21,0.45)`
- `shadow-lift`: `0 20px 44px -24px rgba(116,7,14,0.35)`
- Focus ring: `focus-visible:ring-2 focus-visible:ring-brand/30` (tombol) dan `focus:ring-4 focus:ring-brand/10` (input).
- Seleksi teks: latar `brand`, teks putih (`::selection`).

---

## 3. Typography

**Font yang dimuat** (`frontend/src/app/layout.tsx`, `next/font/google`):

- `Geist` → `--font-geist-sans` → utility `font-sans` (teks UI).
- `Instrument_Serif` (weight 400, normal + italic) → `--font-instrument-serif` → utility `font-display` (judul).
- `Geist_Mono` → `--font-geist-mono` → utility `font-mono`.

**Hierarki ukuran (class aktual):**

| Elemen | Class | Contoh |
|---|---|---|
| Judul hero | `font-display text-4xl md:text-6xl tracking-tight` | `HeroSection` |
| Judul halaman | `font-display text-3xl md:text-4xl tracking-tight` | `/events`, `/my-tickets`, dashboard |
| Judul section | `font-display text-2xl md:text-3xl tracking-tight` | beranda |
| Judul kartu/panel | `text-base font-bold` / `text-lg font-extrabold` | nama event, angka statistik |
| Body | `text-sm` | deskripsi, isi form |
| Metadata/caption | `text-xs` | tanggal, lokasi, catatan |
| Label form | `text-[11px] font-semibold uppercase tracking-[0.08em]` | `Input`, `Select`, `Textarea` |

**Weight:** `font-extrabold` (angka/statistik), `font-bold` (judul kartu), `font-semibold` (tombol, chip, label), `font-medium` (link nav, teks penting).
**Italic** dipakai untuk satu kata penekanan di hero ("Favoritmu").

---

## 4. Layout and Spacing

**Struktur global** (`frontend/src/app/layout.tsx`):

- `body`: `flex min-h-full flex-col bg-surface text-ink`
- `<Navbar />` (sticky, blur) → `<main class="mx-auto w-full max-w-6xl flex-1 px-4 py-8 md:py-10">` → `<Footer />` → `<Toaster />`

**Lebar & spacing:**

| Konteks | Nilai |
|---|---|
| Kontainer utama, navbar, footer | `max-w-6xl` |
| Hero search panel | `max-w-3xl` |
| Panel autentikasi | `max-w-4xl`, grid `md:grid-cols-[0.9fr_1.1fr]` |
| Form event / profil | `max-w-xl` |
| Sidebar organizer | `md:w-60`, `md:sticky md:top-24` |
| Detail event | `lg:grid-cols-[1fr_340px]` |
| Detail tiket | `lg:grid-cols-[1fr_320px]` |

**Grid:**

- Event: `grid gap-4 sm:grid-cols-2 lg:grid-cols-3` (default) atau `lg:grid-cols-4` (beranda).
- Kategori: `grid-cols-3 sm:grid-cols-6`.
- Statistik organizer: `sm:grid-cols-3`.
- Footer: 1 kolom → `md:grid-cols-[1.6fr_1fr_1fr]`.

**Breakpoint:** `sm` (≥640px), `md` (≥768px), `lg` (≥1024px). Tanpa breakpoint kustom.

---

## 5. UI Components

| Komponen | Lokasi | Fungsi & variasi |
|---|---|---|
| **Button** | `components/ui/Button.tsx` | `variant: primary \| secondary \| danger`, `loading`. Primary `bg-brand text-white hover:bg-brand-hover`; secondary outline `border-line bg-white hover:bg-brand-soft hover:text-brand`; danger `bg-danger-soft text-danger` yang berubah solid saat hover. Radius `rounded-xl`, `px-4 py-2.5 text-sm font-semibold`. |
| **Input** | `components/ui/Input.tsx` | Input teks + label uppercase + error. `h-11 rounded-xl border-line`, fokus `border-brand ring-4 ring-brand/10`. |
| **Select** | `components/ui/Select.tsx` | Select native dengan chevron Lucide, label & error, gaya fokus sama dengan Input. |
| **Textarea** | `components/ui/Textarea.tsx` | Textarea dengan label & error, gaya fokus sama. |
| **Card** | `components/ui/Card.tsx` | `rounded-2xl border border-line bg-white shadow-card`; menerima `className` (mis. `p-5`, `p-0`). |
| **Loading** | `components/ui/Loading.tsx` | Spinner `border-brand-line border-t-brand` + teks (default "Memuat..."). |
| **StatusBadge** | `components/ui/StatusBadge.tsx` | Pill `rounded-full` + titik indikator; label Indonesia (Menunggu/Disetujui/Dibatalkan). |
| **Navbar** | `components/layout/Navbar.tsx` | Sticky `bg-white/85 backdrop-blur-md`, logo mark maroon + wordmark `font-display`, link aktif maroon dengan underline, dropdown akun, sub-nav mobile. |
| **Footer** | `components/layout/Footer.tsx` | 3 kolom (brand, Jelajahi, Organizer) + bottom bar copyright. Latar `surface-alt`. |
| **OrganizerSidebar** | `components/layout/OrganizerSidebar.tsx` | 5 item ber-ikon; item aktif `bg-brand text-white shadow-lift`, lainnya hover `surface-alt`. |
| **HeroSection** | `components/home/HeroSection.tsx` | Panel maroon `rounded-3xl` + ornamen lingkaran CSS, badge uppercase, headline serif, `SearchPanel`, tiga highlight. |
| **SearchPanel** | `components/home/SearchPanel.tsx` | Form nama/lokasi/tanggal → `/events?...`; panel putih `rounded-2xl shadow-lift`. |
| **CategoryList** | `components/home/CategoryList.tsx` | 6 kartu kategori dengan ikon di kotak `brand-soft` berubah maroon solid saat hover. |
| **FeaturedEvents** | `components/home/FeaturedEvents.tsx` | Header section serif + link "Lihat Semua" + `EventGrid`. |
| **EventCard** | `components/events/EventCard.tsx` | Banner `h-44`, chip harga di atas gambar, meta tanggal/lokasi, tombol primary full-width; hover lift. |
| **EventGrid** | `components/events/EventGrid.tsx` | Grid kartu + empty state ber-ikon. |
| **EventFilters** | `components/events/EventFilters.tsx` | Chip kategori (aktif solid maroon) + panel filter (Input, Select, Button). |
| **BookingSummary** | `components/booking/BookingSummary.tsx` | Panel ringkasan bergaya tiket: header maroon berisi harga, garis putus-putus, rincian, CTA. Sticky di `lg`. |
| **PaymentProofForm** | `components/booking/PaymentProofForm.tsx` | File input bergaya drop area (`border-dashed`, tombol `file:` maroon) + tombol unggah. |
| **TicketCard / TicketStatus** | `components/tickets/*` | Kartu tiket horizontal di `sm`, badge status + deskripsi. |

**Komponen yang tidak ada:**

- Modal/Dialog, Table, Alert, dan komponen dropdown reusable (dropdown hanya di Navbar).
- Halaman statis (`about`, `help`, `privacy`, `terms`) sudah dihapus.

---

## 6. Page Design

| Route | Struktur visual | Komponen utama |
|---|---|---|
| `/` | Hero maroon + search → kategori → "Event Pilihan" → panel "Cari Event di Sekitarmu" → "Jangan Lewatkan Event Ini" → "Cara kerja GATIX" → CTA organizer | `HeroSection`, `CategoryList`, `FeaturedEvents`, `PopularEvents` |
| `/events` | Kicker + judul serif → chip kategori → panel filter → grid event → paginasi | `EventFilters`, `EventGrid`, `Loading`, `Button` |
| `/events/[id]` | Breadcrumb kembali → banner → judul + pill meta → kartu deskripsi → kartu penyelenggara → notice; ringkasan pemesanan sticky di kanan | `BookingSummary` |
| `/login` | Kartu dua kolom: panel maroon (brand + benefit) + form putih; satu kolom di mobile | `Input`, `Button` |
| `/register` | Sama seperti login, empat field + konfirmasi password | `Input`, `Button` |
| `/my-tickets` | Kicker + judul → segmented tab status → grid kartu tiket | `TicketCard`, `StatusBadge` |
| `/my-tickets/[id]` | Breadcrumb → judul; kartu detail + status & aksi; form bukti pembayaran jika pending | `TicketStatus`, `PaymentProofForm`, `Button` |
| `/organizer` | Sidebar + judul; 3 kartu statistik (2 metrik + CTA); daftar "Menunggu pemeriksaan" & "Event terbaru" dengan progress kuota | `OrganizerSidebar`, `Card`, `StatusBadge` |
| `/organizer/events` | Sidebar + header aksi; daftar event ber-ikon dengan tombol edit/hapus | `OrganizerSidebar` |
| `/organizer/events/create` | Sidebar + form bersection (informasi, waktu & lokasi, harga & kuota, banner) | `Input`, `Textarea`, `Button`, `Card` |
| `/organizer/events/[id]/edit` | Sama seperti create, nilai terisi; banner opsional | `Input`, `Textarea`, `Button`, `Card` |
| `/organizer/registrations` | Sidebar + pemilih event + daftar peserta (avatar, bukti, status, aksi) | `Select`, `StatusBadge`, `Button` |
| `/organizer/profile` | Sidebar + kartu profil (avatar, form nama, panel "Jadi Organizer") | `Input`, `Button`, `Card` |

Halaman yang dihapus: `/about`, `/help`, `/privacy`, `/terms` (tidak memiliki dukungan backend).

---

## 7. Interaction and States

| State | Perilaku aktual |
|---|---|
| **Hover** | Link nav → `text-ink`; link brand → `hover:gap-2`; tombol primary → `bg-brand-hover`; kartu → `-translate-y-1` + `border-brand-line` + `shadow-lift`; baris daftar → `bg-surface-alt`. |
| **Focus** | Input/Select/Textarea: `focus:border-brand focus:ring-4 focus:ring-brand/10`; Button: `focus-visible:ring-2 focus-visible:ring-brand/30`. |
| **Active (nav)** | Underline maroon di desktop; pill `bg-brand-soft text-brand` di mobile; sidebar organizer `bg-brand text-white`. |
| **Disabled** | `disabled:opacity-50` + `disabled:pointer-events-none` pada Button. |
| **Loading** | Button menampilkan "Memproses..."; komponen `Loading` untuk event, tiket, dan halaman organizer. |
| **Error** | Kartu error inline ber-ikon di `/`, `/events`, `/my-tickets`; halaman lain memakai toast. |
| **Empty** | Empty state ber-ikon: "Belum ada event", "Belum ada tiket pada tab ini", "Belum ada pendaftaran". |
| **Success** | Toast Sonner (`richColors`, radius 14px, border `line`). |
| **Notice** | Kartu inline `border-brand-line bg-brand-soft` di `/events/[id]` setelah pendaftaran berbayar. |

---

## 8. Responsive Design

- **Navbar:** link desktop `hidden md:flex`; sub-nav mobile horizontal-scroll `md:hidden`; dropdown akun di kedua ukuran.
- **Footer:** 1 kolom → 3 kolom di `md`.
- **Hero:** padding `px-6 py-12` → `md:px-12 md:py-16`; judul `text-4xl` → `md:text-6xl`.
- **Grid event:** 1 → 2 (`sm`) → 3/4 (`lg`).
- **Halaman organizer & detail:** bertumpuk `flex-col` → `md:flex-row`; sidebar menjadi sticky di desktop.
- **Autentikasi:** panel maroon disembunyikan di mobile (`hidden md:flex`).
- **Form event:** grid harga/kuota `sm:grid-cols-2`; input mengikuti lebar kontainer.

---

## 9. Design Consistency

**Yang sudah konsisten:**

1. **Token warna terpusat** di `globals.css` dan dipakai seluruh komponen — mengubah `--brand` mengubah seluruh tampilan.
2. **Form control seragam** lewat `Input`, `Select`, dan `Textarea`.
3. **Satu pola state** (empty/error/loading) dengan ikon di dalam lingkaran `brand-soft`/`danger-soft`.
4. **Hierarki tipografi** konsisten: judul serif, teks UI sans, label uppercase kecil.

**Catatan tersisa:**

- `input[type=file]` masih memakai styling `file:` langsung (dua tempat: banner event dan bukti pembayaran).
- Halaman dashboard organizer belum menampilkan indikator loading global.
- Aturan ESLint `react-hooks/set-state-in-effect` melaporkan pola data-fetching lama di beberapa halaman; perilaku tidak diubah pada redesign ini.

---

*Dokumen ini mencerminkan kondisi setelah redesign UI dengan palet `#FFFFFF` + `#74070E`. Perbarui bila tampilan/design system berubah (lihat `AGENTS.md`).*
