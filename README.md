# Si-Cabe NTT

Sistem Catatan Bersama Hortikultura NTT

Sistem pelaporan real-time Luas Tambah Tanam (LTT) dan Luas Tambah Panen (LTP) komoditas hortikultura (Sayuran, Tanaman Buah, Tanaman Obat; 16 komoditas) se-Provinsi Nusa Tenggara Timur.

Dinas Pertanian dan Ketahanan Pangan Provinsi NTT.

## Isi repositori

| Berkas | Fungsi |
|---|---|
| `index.html` | Aplikasi web (satu berkas, tanpa build) |
| `logo.png` | Logo Si-Cabe NTT (opsional; jika tidak ada, tampil logo sementara) |
| `Code.gs` | Backend Google Apps Script untuk menyimpan data ke Google Sheets |
| `SiCabe-Database.xlsx` | Struktur database siap impor ke Google Sheets |

## Fitur

- Login dua peran: admin provinsi (semua kabupaten/kota) dan admin kabupaten/kota (data sendiri)
- Dashboard LTT dan LTP: peta sebaran, grafik per kelompok dan komoditas, capaian per kabupaten/kota, filter bulan dan akumulasi
- Input laporan harian per kelompok komoditas: pilih kecamatan, isi luas semua komoditas sekaligus, total langsung terlihat
- Tabulasi per kabupaten/kota (rincian kecamatan), per provinsi, dan pemantauan laporan harian
- Kelola Target bulanan dan Kelola Akun (admin provinsi)
- Ekspor CSV rapi (pemisah titik koma, siap dibuka di Excel)

## Memasang database Google Sheets

1. Buat Google Sheet baru, lalu File → Import → Upload `SiCabe-Database.xlsx` → Replace spreadsheet.
2. Extensions → Apps Script, tempel isi `Code.gs`, simpan.
3. Deploy → New deployment → Web app. Execute as: Me. Who has access: Anyone. Salin URL Web App.
4. Di `index.html`, isi baris `var APPS_SCRIPT_URL = '';` dengan URL tersebut.
5. Setiap kali `Code.gs` diubah, buat versi baru: Deploy → Manage deployments → Edit → New version.

Selama `APPS_SCRIPT_URL` kosong, aplikasi berjalan dalam mode demo dengan data contoh yang tersimpan di browser.

## Deploy di Vercel

1. Unggah semua berkas ini ke repositori GitHub.
2. Di Vercel: Add New → Project → pilih repositori ini.
3. Framework Preset: Other. Biarkan Build Command dan Output Directory kosong. Klik Deploy.

## Akun awal

| Peran | Nama pengguna | Sandi awal |
|---|---|---|
| Provinsi | `provinsi` | `provinsi123` |
| Kabupaten/Kota | nama kabupaten huruf kecil, spasi jadi tanda hubung (mis. `ende`, `sumba-barat`, `kota-kupang`) | `cabe2026` |

Segera ganti sandi lewat menu profil → Ubah Password setelah masuk pertama kali.

## Catatan keamanan

- Siapa pun yang memegang URL Web App Apps Script dapat membaca dan menulis data. Jangan membagikan URL itu dan jangan memasukkannya ke repositori publik. Gunakan repositori privat bila `APPS_SCRIPT_URL` sudah terisi.
- Penyimpanan di Google Sheets dimaksudkan untuk tahap pilot satu musim tanam. Untuk produksi, rencana lanjutannya adalah pindah ke PostgreSQL.
