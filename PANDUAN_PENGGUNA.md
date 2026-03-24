# 📘 Panduan Lengkap Langgoku v1.0 (Update 2026)

Halo! Berikut adalah panduan lengkap untuk menggunakan website Langgoku yang sudah di-update dengan fitur-fitur baru yang keren!

---

## 🎯 Daftar Isi
1. [Apa Yang Berubah?](#apa-yang-berubah)
2. [Cara Menggunakan Admin Panel](#cara-menggunakan-admin-panel)
3. [Setup Google Sheets Integration](#setup-google-sheets-integration)
4. [Fitur-Fitur Baru](#fitur-fitur-baru)
5. [Troubleshooting](#troubleshooting)

---

## 🆕 Apa Yang Berubah?

### A. Homepage
✅ **Judul "Langgoku" sudah diperbaiki** - Tidak lagi terpotong di mobile
- Sekarang terlihat sempurna di semua ukuran layar
- Lebih besar dan lebih cantik dengan gradient warna

### B. Footer
✅ **Footer disederhanakan** - Terlihat lebih modern
- Hapus bagian "Aman & Terpercaya", dll
- Fokus pada 3 bagian penting: Tentang, Layanan, Kontak
- Gradient warna lebih cantik (Biru → Ungu)

### C. Admin Panel
✅ **Admin Panel sekarang terlihat lebih profesional**
- Sidebar kiri dengan menu (seperti panel admin umumnya)
- Warna gradien yang lebih menarik
- Layout yang lebih rapi

### D. Manajemen Pembeli
✅ **Tambahan fitur dan field baru**:
- Sekarang bisa **HAPUS data pembeli** (ada tombol delete)
- Tambah field: **Google Sheet ID**
- Tambah field: **Metode Pembayaran** (QRIS, Bank, E-Wallet, Pulsa)
- Tambah field: **Nomor Admin WhatsApp**
- Form lebih terorganisir dengan 4 bagian

### E. Desain
✅ **Desain keseluruhan lebih modern**
- Button lebih cantik dengan gradient
- Input field lebih baik dengan efek glassmorphism
- Animasi smooth di berbagai elemen
- Icon dan warna lebih cerah

---

## 🎮 Cara Menggunakan Admin Panel

### Akses Admin Panel
1. Buka website Anda
2. Klik link "Admin" (di navbar atau footer)
3. Masuk dengan password admin
4. Selesai! Anda di halaman admin

### Bagian-Bagian Admin Panel

#### Sidebar (Kiri)
```
📦 Produk     - Kelola produk digital
👥 Pembeli    - Kelola data pembeli
🚪 Logout     - Keluar dari admin
```

#### Section: Manajemen Pembeli

**1. Tambah Pembeli Baru**
- Klik tombol "➕ Tambah Pembeli"
- Isi form dengan data:
  - 📝 **Informasi Pembeli**: Nama, No WhatsApp
  - 🛍️ **Produk & Langganan**: Produk, Durasi
  - 💳 **Pembayaran & Admin**: Payment Method, Google Sheet ID, No Admin
  - 📅 **Tanggal**: Tgl Mulai, Tgl Selesai (auto-fill)
- Klik "✓ Tambah Pembeli"

**2. Edit Data Pembeli**
- Di tabel pembeli, klik tombol "✏️ Edit"
- Ubah data yang diperlukan
- Klik "✓ Update Pembeli"

**3. Hapus Data Pembeli** ✨ BARU
- Di tabel pembeli, klik tombol "🗑️ Hapus"
- Konfirmasi penghapusan
- Data akan dihapus permanent

**4. Lihat Status Pembeli**
- Tabel menampilkan status:
  - ✓ **Aktif** - Langganan masih berlaku
  - ⚠️ **Hampir Habis (X hari)** - Akan expire dalam 3 hari
  - ✕ **Expired** - Langganan sudah habis

**5. Kirim Notifikasi WhatsApp**
- Otomatis ada notifikasi untuk yang akan expired
- Klik "📢 Ingatkan Semua" atau "📱 Ingatkan" per pembeli
- Akan membuka WhatsApp otomatis dengan template pesan

---

## 🔧 Setup Google Sheets Integration

### Langkah 1: Buat Google Sheets Baru

1. Buka https://sheets.google.com
2. Klik "+ Spreadsheet baru"
3. Beri nama: "Langgoku Database"
4. **SALIN ID SPREADSHEET** dari URL:
   ```
   https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit
                                         ^^^^^^^^^^^^^^^^^^^
   Bagian ini adalah ID Anda
   Contoh: 1A2B3C4D5E6F7G8H9I0J1K2L3M4N5O6
   ```

### Langkah 2: Setup Google Apps Script

1. Di Google Sheets Anda, klik **Extensions > Apps Script**
2. Buka file: `google-apps-script-updated.gs` (di folder project Anda)
3. **SALIN SELURUH KODE** dari file tersebut
4. Kembali ke Google Apps Script Editor
5. **HAPUS** kode default (jika ada)
6. **PASTE** kode yang sudah disalin
7. Di baris atas, cari:
   ```javascript
   const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
   ```
   Ganti dengan:
   ```javascript
   const SPREADSHEET_ID = '1A2B3C4D5E6F7G8H9I0J1K2L3M4N5O6';
   ```
8. **SIMPAN** (Ctrl+S)

### Langkah 3: Jalankan Initialization

1. Di Google Apps Script Editor, cari fungsi: `initializeSheets()`
2. Klik pada nama fungsi tersebut
3. Tekan **Ctrl+Enter** (atau klik tombol Run)
4. **IZINKAN akses** ketika diminta
5. Tunggu sampai selesai

### Langkah 4: Deploy sebagai Web App

1. Klik tombol **"Deploy"** (atas kanan)
2. Pilih **"New deployment"**
3. Klik icon **⚙️** untuk memilih tipe
4. Pilih **"Web app"**
5. Isi konfigurasi:
   - Execute as: **Your Account**
   - Who has access: **Anyone**
6. Klik **"Deploy"**
7. **SALIN URL Deployment** yang ditampilkan

### Langkah 5: Setup Environment Variable

1. Di project Langgoku Anda, buka atau buat file `.env.local`
2. Tambahkan:
   ```
   NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/d/{SCRIPT_ID}/usurp
   ```
   Ganti `{SCRIPT_ID}` dengan ID dari URL deployment

3. **RESTART** Next.js dev server Anda:
   ```bash
   npm run dev
   ```

### ✅ Selesai!

Sekarang semua data pembeli dan produk akan ter-save di Google Sheets otomatis!

---

## ✨ Fitur-Fitur Baru

### 1. Field Google Sheet ID
**Kegunaan**: Untuk tracking atau integrasi dengan sheet lain
- Input text di form "Manajemen Pembeli"
- Tersimpan di Google Sheets
- Bisa pakai untuk custom rules atau tracking

### 2. Metode Pembayaran
**Kegunaan**: Catat bagaimana pelanggan membayar
- Opsi: QRIS, Bank Transfer, E-Wallet, Pulsa
- Dropdown di form
- Membantu tracking pembayaran

### 3. Nomor Admin WhatsApp
**Kegunaan**: Nomor WhatsApp admin untuk follow-up
- Input text di form
- Bisa dipakai untuk auto-message atau reminder

### 4. Delete Pembeli
**Kegunaan**: Hapus data yang tidak perlu
- Ada tombol "🗑️" di setiap baris tabel
- Ada konfirmasi sebelum hapus
- Data akan hilang permanen

### 5. Modern Design
**Kegunaan**: Tampilan lebih profesional
- Gradient colors yang menarik
- Smooth animations
- Better responsiveness di mobile

---

## 🌐 Fitur Mobile Friendly

Semua halaman sudah otomatis responsive:
- ✅ Mobile (layar kecil)
- ✅ Tablet (layar sedang)
- ✅ Desktop (layar besar)

Cek dengan:
- Buka browser
- Tekan F12
- Klik icon mobile (top left)
- Lihat tampilan mobile semua halaman

---

## 🆘 Troubleshooting

### ❌ Admin Panel tidak loading
**Solusi**:
1. Clear browser cache (Ctrl+Shift+Delete)
2. Refresh halaman (F5 atau Ctrl+R)
3. Cek console (F12 > Console) untuk error
4. Restart Next.js server Anda

### ❌ Data pembeli tidak tersimpan
**Solusi**:
1. Cek apakah Google Apps Script sudah di-deploy
2. Cek URL di `.env.local`
3. Cek Google Sheets - apakah ada data baru?
4. Buka console (F12) - lihat error apa

### ❌ "SPREADSHEET_ID is undefined"
**Solusi**:
1. Pastikan sudah ganti `YOUR_SPREADSHEET_ID_HERE` dengan ID sebenarnya
2. Cek tidak ada typo di ID
3. Simpan file (Ctrl+S)
4. Run `initializeSheets()` lagi
5. Deploy ulang

### ❌ "Sheet tidak ditemukan"
**Solusi**:
1. Jalankan `initializeSheets()` lagi
2. Cek di Google Sheets apakah ada sheet baru bernama:
   - "Produk"
   - "Pembeli"
   - "Logs"
3. Jika belum ada, buat manual atau run init ulang

### ❌ Delete button tidak work
**Solusi**:
1. Cek apakah ID pembeli tidak kosong
2. Buka console (F12) lihat error
3. Cek di Google Sheets apakah datanya ada
4. Try refresh halaman

### ❌ "Anyone" deployment tidak bisa diakses
**Solusi**:
1. Deploy ulang dengan setting yang benar
2. Di deployment dialog, pilih:
   - Execute as: **Your Account** (penting!)
   - Who has access: **Anyone** (penting!)
3. Salin URL deployment baru

---

## 💡 Tips & Trik

1. **Backup Data Rutin**
   - Download Google Sheets bulanan
   - File > Download > Microsoft Excel

2. **Cek Logs**
   - Sheet "Logs" mencatat semua error
   - Bisa untuk debugging

3. **Custom Duration**
   - Di form pembeli, bisa custom durasi
   - Misal: 15 hari, 2 minggu, 4 bulan, dll

4. **Bulk Reminders**
   - Klik "📢 Ingatkan Semua" untuk notify semua yang hampir expire
   - Delay otomatis 500ms antar notifikasi

5. **Mobile Responsive**
   - Test dengan F12 > Mobile view
   - Semua fitur work di mobile juga

6. **Form Validation**
   - Semua field required tandanya ada (*)
   - Tidak bisa submit kalau kosong

---

## 📞 Butuh Bantuan?

1. **Cek file dokumentasi**:
   - `GOOGLE_APPS_SCRIPT_SETUP.md` - Setup detail
   - `UPDATE_SUMMARY_2026.md` - List semua perubahan
   - `google-apps-script-updated.gs` - Source code

2. **Debug dengan Console**:
   - Buka F12 dan pilih tab Console
   - Lihat error messages
   - Network tab untuk check API calls

3. **Verifikasi di Google Sheets**:
   - Buka Google Sheets Anda
   - Cek apakah data sudah ada
   - Check sheet "Logs" untuk error history

---

## 🎉 Selamat!

Website Langgoku Anda sekarang sudah:
- ✅ Modern dan cantik
- ✅ Fully functional dengan delete buyer
- ✅ Terintegrasi dengan Google Sheets
- ✅ Mobile friendly
- ✅ Professional admin panel

Selamat menggunakan! Semoga lancar! 🚀

---

**Versi**: 1.0
**Last Updated**: 24 Maret 2026
**Status**: ✅ Ready to Use
