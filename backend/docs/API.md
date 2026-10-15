# GATIX API — Dokumentasi

Base URL lokal: `http://localhost:8000/api/v1`

Auth: JWT via header `Authorization: Bearer <token>`.

## Authentication

| Method | Endpoint | Auth | Body | Response |
|---|---|---|---|---|
| POST | `/auth/register` | - | `{name, email, password}` | 201 `{data, token}`, role selalu `user` |
| POST | `/auth/login` | - | `{email, password}` | 200 `{data, token}` (rate-limit 20/15 mnt) |
| GET | `/auth/me` | Ya | - | 200 user, 401 tanpa token |

## Events

| Method | Endpoint | Auth | Keterangan |
|---|---|---|---|
| GET | `/events?search=&location=&date_from=&date_to=&sort_by=date\|price&order=asc\|desc&page=&limit=` | - | List + pagination + `available_quota` |
| GET | `/events/:id` | - | Detail + `available_quota` + organizer |
| POST | `/events` | organizer | Multipart: `title, description, date(ISO), location, price, quota, banner?(jpg/png ≤5MB)` |
| PATCH | `/events/:id` | organizer pemilik | Field parsial + ganti banner |
| DELETE | `/events/:id` | organizer pemilik | Hapus banner + bukti terkait |
| GET | `/events/:id/registrations` | organizer pemilik | Daftar peserta event |

Validasi: harga ≥ 0, kuota ≥ 1, tanggal masa depan. Error: 400 validasi, 401 auth, 403 bukan pemilik/role, 404 tidak ada.

## Registrations (pembayaran manual)

| Method | Endpoint | Auth | Keterangan |
|---|---|---|---|
| POST | `/registrations` | user | Body `{event_id}`. Gratis → `approved`, berbayar → `pending`. Cegah ganda, cek kuota transaksional, reaktivasi dari `cancelled` |
| GET | `/registrations/my-tickets` | user | Tiket milik sendiri |
| GET | `/registrations/:id` | pemilik/tiket atau organizer event | Detail |
| PATCH | `/registrations/:id/payment` | pemilik tiket, status `pending` | Multipart `payment_proof` (jpg/png ≤5MB) |
| PATCH | `/registrations/:id/status` | organizer pemilik (`approved`/`cancelled`) atau user (`cancelled` miliknya) | Approve cek kuota |

Status: `pending` kuning, `approved` hijau, `cancelled` merah.
