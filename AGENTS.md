# AGENTS.md — AI Coding Agent Guidelines

> Pedoman kerja untuk AI coding agent yang akan mengubah project **GATIX**.
> Aturan di bawah **spesifik untuk project ini**, diturunkan dari struktur, teknologi, dan pola kode aktual — bukan aturan generik.
>
> Dokumentasi terkait: [`PRD.md`](./PRD.md) (produk & aturan bisnis), [`SYSTEM_DESIGN.md`](./SYSTEM_DESIGN.md) (desain visual), [`ARCHITECTURE.md`](./ARCHITECTURE.md) (arsitektur & API).

---

## 1. Project Context

**GATIX** adalah marketplace event ticketing. Pengguna dapat menemukan event, mendaftar, membayar (unggah bukti manual), dan memegang tiket; organizer dapat membuat event dan memverifikasi pembayaran.

**Stack:**
- **Backend:** Express 5 + TypeScript, MySQL (`mysql2/promise`, SQL mentah), JWT + bcryptjs, zod, multer, Cloudinary. Root: `backend/`.
- **Frontend:** Next.js 16 (App Router) + React 19 + TypeScript, Tailwind CSS v4, react-hook-form + zod, lucide-react, sonner. Root: `frontend/`.
- **Database:** MySQL — **tidak ada file skema/migration di repo** (lihat `ARCHITECTURE.md` §Database Design).

**Referensi wajib sebelum mengubah kode:**
- Kebutuhan bisnis & aturan → `PRD.md`
- Tampilan/design system → `SYSTEM_DESIGN.md`
- Arsitektur, endpoint, skema DB → `ARCHITECTURE.md`
- Pedoman ini → `AGENTS.md`

> `frontend/AGENTS.md` adalah file yang **di-generate otomatis oleh `next dev`** (blok `BEGIN:nextjs-agent-rules`). Jangan menganggapnya pedoman manual; jangan menambahkan aturan project ke sana.

---

## 2. Coding Principles

- **Prioritaskan kode sederhana, mudah dibaca, dan mudah dipelihara.** Lebih baik lebih panjang tetapi jelas daripada singkat tetapi rumit.
- **Hindari overengineering.** Jangan menambah layer/abstraksi yang tidak perlu. Backend saat ini **tanpa** layer service; jangan menambahkannya tanpa kebutuhan nyata.
- **Hindari duplikasi logika yang tidak perlu**, tetapi jangan abstraksi dini hanya demi mengurangi baris.
- **Ikuti konvensi yang sudah ada:**
  - Frontend memakai **impor relatif** (`../../services/...`), meski alias `@/*` tersedia. **Jangan** mulai memakai `@/` kecuali diminta.
  - Backend memisahkan `routes → controllers` dan file skema `validations/` (zod).
  - Nama fungsi & file: `camelCase` untuk fungsi, `PascalCase` untuk komponen React, `kebab-case`/`nama.service.ts` untuk service frontend.
- **Jangan menambahkan komentar yang tidak bermanfaat.** Kode sudah sebagian tanpa komentar; hormati gaya itu.
- **Jangan membuat helper/service/hook/komponen baru tanpa kebutuhan jelas.** Periksa dulu apakah sudah ada yang serupa (mis. `lib/utils.ts` untuk `cn`/format, `components/ui/*`).
- **Jangan mengubah perilaku yang tidak diminta** (fitur, kontrak API, teks UI, warna).

---

## 3. Project-Specific Rules

### Frontend
- Halaman yang butuh interaksi/API diberi `"use client"`.
- **Next 16 + `cacheComponents: true`: jangan menghapus batas `<Suspense>`** pada komponen yang memakai `useParams()`/`usePathname()` (mis. `Navbar`, `events/[id]`, `my-tickets/[id]`, `organizer/events/[id]/edit`). Menghapusnya membuat `next build` gagal saat prerender.
- Panggilan API selalu lewat `services/api.ts` (`api(path, { auth: true })`), bukan `fetch` langsung di komponen.
- Tambah fungsi service baru di file `services/*.service.ts` yang relevan, bukan di komponen.
- Tipe data bersama diletakkan di `src/types/*`, bukan didefinisikan ulang per halaman.
- Validasi form memakai react-hook-form + `zodResolver` + skema di `src/validators/`.
- Karena `next/image` dipakai untuk gambar Cloudinary, tambahkan hostname baru ke `images.remotePatterns` di `next.config.ts` bila sumber gambar berubah.

### Backend
- Ikuti pola `routes → controller`. Middleware auth/role memakai `verifyToken`/`requireRole`. Skema zod di `validations/` **dipanggil di dalam controller** (`schema.safeParse(req.body)`), **bukan** sebagai middleware Express.
- Respons sukses: `{ message, data }` (daftar event menambah `pagination`; endpoint auth menambah `token` di level atas dan sebagian menambah `success`). Error: `{ message }`; kegagalan validasi: `{ message: "Data tidak valid", error: [...] }`.
- Akses database lewat pool di `config/database.ts` memakai `pool.query(...)` (query berparameter `?`, jangan menyusun SQL dengan string interpolation dari input pengguna).
- Otorisasi **dua lapis**: `requireRole` di route + **pengecekan kepemilikan** di controller (`created_by === req.user.id` untuk event; pemilik/`user_id` untuk registrasi). Jangan hanya mengandalkan satu lapis.
- Perubahan kuota/anti-duplikat harus tetap berada di dalam transaksi `SELECT ... FOR UPDATE`.
- Upload file lewat `middlewares/upload.ts` (memoryStorage, jpg/jpeg/png, maks 5 MB) + `utils/upload.ts` ke Cloudinary. Jangan menulis file ke disk.

### Database
- **Tidak ada migration tool.** Jangan mengubah skema database secara sepihak.
- Bila perlu mengubah skema: ajukan rencana + perintah SQL, minta persetujuan, dan **update `ARCHITECTURE.md` §Database Design**. Jangan menjalankan DDL berisiko tanpa izin.
- Jaga konsistensi nama kolom dengan yang sudah dipakai di query (mis. `banner_url`, `banner_public_id`, `payment_proof_url`, `payment_proof_public_id`, `created_by`, `status`).

### API
- Jangan mengubah path, method, nama field, format respons, atau status code yang ada tanpa persetujuan. Ini kontrak yang dipakai frontend.
- Bila menambah endpoint, sertakan validasi zod + autentikasi/otorisasi yang sesuai, dan dokumentasikan di `ARCHITECTURE.md` §6 (dan `backend/docs/API.md`).

### Validasi & Error Handling
- Validasi di dua sisi bila relevan: backend (`validations/*`) untuk keamanan, frontend (`validators/*`) untuk UX.
- Pesan error dalam bahasa Indonesia dan sejelas mungkin; pertahankan pesan yang sudah ada kecuali diminta mengubahnya.
- Di frontend, error API ditampilkan lewat `toast.error(err.message)` atau kartu error inline sesuai pola halaman yang sudah ada.

### Authentication & Authorization
- JWT dikirim `Authorization: Bearer <token>`; token disimpan di `localStorage` (`gatix_token`).
- Role yang ada hanya `user` dan `organizer` — **tidak ada `admin`**. Jangan menambah role/klaim baru tanpa persetujuan; bila role baru ditambah, `become-organizer`/`useAuth`/`requireRole` juga perlu disesuaikan.
- Jangan menuliskan secret/kredensial ke kode atau dokumentasi. `backend/.env.example` saat ini memuat nilai yang tampak seperti kredensial asli — **jangan menyalinnya ke dokumen atau berkas lain**.

### Styling & UI Components
- Warna ditulis sebagai nilai heksadesimal langsung (mis. `text-[#161616]`, `bg-[#FF6A00]`). Ikuti pola ini; **jangan** mulai memakai token CSS (`text-foreground`, `bg-primary`) kecuali tugasnya memang merapikan token (harus disetujui, karena menyentuh banyak file).
- Utamakan komponen yang sudah ada: `Button`, `Input`, `Card`, `Loading`, `StatusBadge`. Jangan membuat duplikatnya.
- Pertahankan border `border-[#E5E7EB]`, radius `rounded-lg`/`rounded-xl`/`rounded-2xl`, dan bayangan halus yang sudah konsisten.
- Perubahan visual yang tidak diminta **tidak boleh** dilakukan. Bila memperbaiki UI, jelaskan dan pertahankan bahasa Indonesia pada teks.

---

## 4. Tools and Commands

Package manager: **npm** (ada `package-lock.json`; jangan mencampur pnpm/yarn).

### Backend (`cd backend`)
| Tujuan | Perintah |
|---|---|
| Install | `npm install` |
| Development | `npm run dev` (`tsx watch src/server.ts`) |
| Build | `npm run build` (`tsc`) |
| Jalankan produksi | `npm start` (`node dist/server.js`) |
| Type check | `npm run typecheck` (`tsc --noEmit`) |
| Test | **Tidak tersedia** — script `test` masih placeholder (bukan test nyata). |

### Frontend (`cd frontend`)
| Tujuan | Perintah |
|---|---|
| Install | `npm install` |
| Development | `npm run dev` (`next dev`) |
| Build | `npm run build` (`next build`) |
| Jalankan produksi | `npm run start` (`next start`) |
| Lint | `npm run lint` (`eslint`) |
| Type check | `npx tsc --noEmit` (tidak ada script khusus) |
| Test | **Tidak tersedia** — script `test` placeholder. |

**Database:** tidak ada perintah migration/seed di project. Skema harus disiapkan manual (lihat `ARCHITECTURE.md`).

**Menjalankan penuh:** perlu MySQL aktif + kredensial Cloudinary di `backend/.env`, dan `frontend/.env.local` berisi `NEXT_PUBLIC_API_URL`. Tanpa ini, aplikasi tidak akan berjalan end-to-end.

---

## 5. Rules Before Editing

1. **Baca file terkait sepenuhnya** sebelum mengubah.
2. **Pahami alur fitur dan dependensinya** (lihat `ARCHITECTURE.md` §10 untuk peta ketergantungan).
3. **Periksa apakah komponen/fungsi serupa sudah ada** (`components/ui/*`, `lib/utils.ts`, `services/*`) agar tidak menduplikasi.
4. **Periksa dampak ke frontend, backend, dan database** — perubahan field/kontrak API biasanya menyentuh tiga tempat (controller, `services/*`, `types/*`).
5. **Buat perubahan sekecil mungkin** untuk mencapai tujuan; jangan menyentuh kode yang tidak berkaitan.
6. Perhatikan berkas auto-generate: `frontend/AGENTS.md` dan `next-env.d.ts` ditulis ulang oleh Next — jangan menjadikannya target perubahan.

---

## 6. Rules After Editing

1. Jalankan pemeriksaan relevan:
   - Backend: `npm run typecheck` (wajib).
   - Frontend: `npx tsc --noEmit` dan `npm run lint`; bila menyentuh halaman/layout, jalankan `npm run build` (khususnya untuk memastikan batas `Suspense` Next 16 tetap benar).
2. Pastikan perubahan tidak merusak fitur lain (telusuri pemakai fungsi/komponen yang diubah).
3. Periksa kompatibilitas API: nama field, tipe, dan status code tetap sama atau diperbarui di kedua sisi.
4. Bila UI berubah, periksa tampilan responsive (mobile/tablet/desktop) sesuai pola di `SYSTEM_DESIGN.md` §8.
5. **Laporkan hasil**: file yang diubah, ringkasan perubahan, perintah yang dijalankan, dan hasilnya. **Jangan mengklaim test/lint/build berhasil bila tidak dijalankan.** Catat juga masalah/risiko yang masih tersisa.

---

## 7. Restrictions

- **Jangan mengubah fitur** yang tidak berkaitan dengan tugas.
- **Jangan menghapus fitur atau data** tanpa izin.
- **Jangan mengubah kontrak API** (path, method, field, status code, format error) tanpa kebutuhan jelas dan persetujuan.
- **Jangan mengubah skema database** atau menjalankan migration berisiko tanpa persetujuan.
- **Jangan mengubah desain visual** (warna, spacing, layout) yang sudah ada kecuali diminta.
- **Jangan menampilkan atau menyimpan secret** (API key, password, token, `JWT_SECRET`) ke dokumentasi atau berkas terlacak git.
- **Jangan mengklaim test berhasil** bila tidak dijalankan.
- **Jangan menghapus batas `<Suspense>`** pada komponen Next 16 yang memakai `useParams`/`usePathname`.
- **Jangan menambah dependency baru** tanpa alasan kuat dan persetujuan.

---

## 8. Workflow

1. **Analisis permintaan** — tentukan apakah perubahan menyentuh frontend, backend, database, atau kombinasinya.
2. **Periksa file dan dokumentasi terkait** — baca kode aktual + `PRD.md`/`SYSTEM_DESIGN.md`/`ARCHITECTURE.md`.
3. **Identifikasi dampak perubahan** — daftar file/tempat yang perlu disesuaikan agar konsisten.
4. **Implementasikan perubahan** sekecil mungkin, mengikuti pola yang ada.
5. **Jalankan validasi** (`typecheck`, `lint`, dan `build` bila perlu).
6. **Laporkan hasil dan risiko** yang masih ada.

Perubahan besar (skema DB, kontrak API, redesign): **usulkan dulu, minta persetujuan**, baru kerjakan.

---

## 9. Documentation Maintenance

Jika perubahan mengubah salah satu aspek berikut, **perbarui dokumentasi terkait** (hanya dengan informasi yang sudah diverifikasi):

| Jika perubahan mengubah… | Perbarui… |
|---|---|
| Fitur bisnis, role, aturan bisnis, alur pengguna | `PRD.md` |
| Tampilan, warna, tipografi, komponen UI, layout | `SYSTEM_DESIGN.md` |
| Teknologi/versi, struktur, endpoint API, skema database, autentikasi, alur sistem | `ARCHITECTURE.md` |
| Aturan kerja AI, command, workflow, tools | `AGENTS.md` |

- Jangan menuliskan informasi yang belum diverifikasi ke dokumentasi (tandai `Belum terverifikasi` bila perlu).
- Jaga agar keempat file tidak saling menduplikasi: jelaskan sesuai konteks masing-masing dan gunakan referensi silang.
- Bila mengubah backend endpoint, pertimbangkan juga `backend/docs/API.md` (dokumen API ringkas yang sudah ada).

---

*Pedoman ini mencerminkan kondisi pada commit `0324a4f`.*
