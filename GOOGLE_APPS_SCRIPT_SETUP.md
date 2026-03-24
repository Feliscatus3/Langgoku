# Panduan Setup Google Apps Script untuk Langgoku

## 📋 Daftar Isi
- [Persiapan Awal](#persiapan-awal)
- [Langkah-Langkah Setup](#langkah-langkah-setup)
- [Konfigurasi di Database](#konfigurasi-di-database)
- [Testing API](#testing-api)
- [Troubleshooting](#troubleshooting)

## Persiapan Awal

Sebelum memulai, pastikan Anda memiliki:
- Akun Google (Gmail)
- Google Sheets (gratis)
- Text Editor atau IDE (VS Code, Notepad, dll)
- URL Deployment dari Google Apps Script

## Langkah-Langkah Setup

### 1. Buat Google Sheets Baru

```
1. Buka https://sheets.google.com
2. Klik "+ Spreadsheet baru"
3. Beri nama: "Langgoku Database"
4. Salin ID Spreadsheet dari URL
   - URL format: https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit
   - Contoh ID: 1A2B3C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0
```

### 2. Akses Google Apps Script

```
1. Di spreadsheet Langgoku, klik "Extensions" (Ekstensi)
2. Pilih "Apps Script"
3. Akan terbuka tab baru dengan Google Apps Script Editor
```

### 3. Salin Kode Google Apps Script

```
1. Buka file: google-apps-script-updated.gs di project Anda
2. Salin SELURUH kode dari file tersebut
3. Kembali ke Google Apps Script Editor
4. Hapus kode default (jika ada)
5. Paste kode yang sudah disalin
```

### 4. Konfigurasi SPREADSHEET_ID

```javascript
// Di baris atas file, cari:
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';

// Ganti dengan ID spreadsheet Anda:
const SPREADSHEET_ID = '1A2B3C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0';
```

### 5. Setup Database Sheets

```
1. Di Google Apps Script Editor, cari fungsi: initializeSheets()
2. Jalankan fungsi tersebut:
   - Klik pada nama fungsi "initializeSheets"
   - Tekan Ctrl + Enter (atau klik tombol Run)
3. Izinkan akses ketika diminta
4. Tunggu sampai selesai (check di Execution log)
```

### 6. Deploy sebagai Web App

```
1. Di Google Apps Script, klik "Deploy" (Tengelam biru di atas)
2. Pilih "New deployment"
3. Klik icon "⚙️" untuk memilih tipe
4. Pilih "Web app"
5. Isi konfigurasi:
   - Execute as: Your Account (Akun Anda)
   - Who has access: Anyone
6. Klik "Deploy"
7. Salin URL Deployment yang ditampilkan
   - Format: https://script.google.com/macros/d/{SCRIPT_ID}/usurp
8. Simpan URL ini untuk step berikutnya
```

## Konfigurasi di Database

### Setup Environment Variables

Di project Anda (Langgoku), tambahkan environment variable:

```bash
# .env.local
NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/d/{SCRIPT_ID}/usurp
```

### Update lib/googleSheets.ts

```typescript
const API_URL = process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL;

export async function getProducts() {
  const response = await fetch(`${API_URL}?action=getProducts`);
  return response.json();
}

export async function getBuyers() {
  const response = await fetch(`${API_URL}?action=getBuyers`);
  return response.json();
}

export async function addBuyer(buyer: any) {
  const response = await fetch(`${API_URL}?action=addBuyer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(buyer)
  });
  return response.json();
}
```

## Testing API

### Test dengan Browser

```
Buka URL ini di browser:
https://script.google.com/macros/d/{SCRIPT_ID}/usurp?action=getProducts

Response yang diharapkan:
{
  "success": true,
  "data": [...],
  "count": 0
}
```

### Test dengan curl

```bash
# Get Products
curl "https://script.google.com/macros/d/{SCRIPT_ID}/usurp?action=getProducts"

# Add Product
curl -X POST "https://script.google.com/macros/d/{SCRIPT_ID}/usurp?action=addProduct" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Netflix Premium",
    "price": 50000,
    "duration": "1 bulan",
    "stock": 100
  }'
```

### Test dari Admin Panel

```
1. Buka Admin Panel
2. Buka Console (F12 > Console)
3. Coba tambah pembeli
4. Cek apakah data masuk ke Google Sheets
5. Refresh halaman dan cek apakah data terbaca kembali
```

## API Endpoints

### GET Requests (Baca Data)

```
GET /?action=getProducts
- Mengambil semua produk
- Response: { success, data: [...], count }

GET /?action=getBuyers
- Mengambil semua pembeli
- Response: { success, data: [...], count }

GET /?action=getProduct&id=ID_123
- Mengambil produk spesifik
- Response: { success, data: {...} }

GET /?action=getBuyer&id=ID_456
- Mengambil pembeli spesifik
- Response: { success, data: {...} }

GET /?action=getStats
- Mengambil statistik
- Response: { success, stats: {...} }
```

### POST Requests (Tulis Data)

```
POST /?action=addProduct
Body: { name, price, duration, stock, description }
Response: { success, message, data: { id } }

POST /?action=updateProduct
Body: { id, name, price, duration, stock, description }
Response: { success, message }

POST /?action=deleteProduct
Body: { id }
Response: { success, message }

POST /?action=addBuyer
Body: { name, phone, product, duration, startDate, endDate, googleSheetId, paymentMethod, adminPhone }
Response: { success, message, data: { id } }

POST /?action=updateBuyer
Body: { id, name, phone, product, ...same fields }
Response: { success, message }

POST /?action=deleteBuyer
Body: { id }
Response: { success, message }
```

## Sheet Structure

### Produk Sheet
| ID | Nama Produk | Harga | Durasi | Stok | Deskripsi | Tanggal Dibuat | Gambar URL |
|----|-------------|-------|--------|------|-----------|----------------|------------|
| ID_xxx | Netflix Premium | 50000 | 1 bulan | 100 | ... | 24/03/2026 | ... |

### Pembeli Sheet
| ID | Nama | No WA | Produk | Durasi | Tgl Mulai | Tgl Selesai | Status | Sisa Hari | Notified | Google Sheet ID | Metode Pembayaran | No Admin |
|----|------|-------|--------|--------|-----------|-------------|--------|-----------|----------|-----------------|-------------------|---------|

### Logs Sheet
| Waktu | Action | Error | User |
|-------|--------|-------|------|

## Troubleshooting

### ❌ Error: "Script not found"
**Solusi:**
- Pastikan URL deployment benar
- Cek jika Apps Script sudah di-deploy
- Coba deploy ulang

### ❌ Error: SPREADSHEET_ID is undefined
**Solusi:**
- Pastikan SPREADSHEET_ID sudah dikonfigurasi
- Jangan lupa simpan (Ctrl+S)
- Coba jalankan fungsi lagi

### ❌ Error: "Sheet tidak ditemukan"
**Solusi:**
- Jalankan fungsi `initializeSheets()` kembali
- Periksa di Google Sheets apakah sheet sudah dibuat
- Pastikan nama sheet sesuai (Produk, Pembeli, Logs)

### ❌ Error: "CORS or 403 Forbidden"
**Solusi:**
- Pastikan deployment dengan "Who has access: Anyone"
- Coba deploy ulang dengan setting yang benar
- Clear browser cache (Ctrl+Shift+Delete)

### ❌ Data tidak tersimpan
**Solusi:**
- Cek apakah POST request berhasil (cek console)
- Verifikasi format JSON data
- Cek permission Google Sheets (bukan view only)

## Tips & Trik

1. **Backup Rutin**: Download Google Sheets secara berkala
2. **Monitoring**: Cek sheet "Logs" untuk error history
3. **Testing**: Gunakan test functions di akhir file
4. **Performance**: Untuk data besar (>1000 rows), pertimbangkan pagination

## Support & Resources

- Google Apps Script Documentation: https://developers.google.com/apps-script
- Google Sheets API: https://developers.google.com/sheets/api
- Stack Overflow: Tag `google-apps-script`

---

**Dibuat untuk Langgoku v1.0**
Terakhir diupdate: 24 Maret 2026
