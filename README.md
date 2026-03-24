# Langgoku - Premium Digital E-Commerce Store

Platform e-commerce modern untuk menjual akun premium digital (Netflix, Canva, CapCut, dll) built dengan Next.js 14, React, Tailwind CSS, dan Google Sheets integration.

## 🎯 Fitur Utama

✅ **Marketplace Modern**
- Homepage dengan hero section
- Grid produk responsif dengan card UI
- Search functionality
- Product detail page
- Status stok real-time (Tersedia/Habis)

✅ **Data Management**
- Sinkronisasi otomatis dari Google Sheets
- No dummy data - data produk langsung dari database
- Empty state UI profesional jika data kosong
- Price formatting yang benar

✅ **Checkout System**
- Input data pembeli (Nama, No WhatsApp)
- Kode pembayaran unik
- Tampilan QRIS untuk pembayaran
- Konfirmasi via WhatsApp otomatis
- Ringkasan pesanan yang jelas

✅ **Admin Panel**
- Login terenkripsi (Username: adminku, Password: Langgoku7894$)
- Manajemen Produk (CRUD from Google Sheets)
- Manajemen Pembeli (Input manual dengan drag tracking)
- Tracking masa aktif akun (Aktif/Hampir Habis ≤3 hari/Expired)

✅ **Production Ready**
- TypeScript untuk type safety
- Clean code architecture
- Scalable folder structure
- Ready untuk Vercel deployment
- Environment variables configuration
- Error handling & validation

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS + Custom CSS
- **Database**: Google Sheets + Google Apps Script
- **Auth**: Simple credential-based admin login
- **Deployment**: Vercel-ready
- **HTTP Client**: Axios (optional, dapat menggunakan fetch)

## 📁 Folder Structure

```
langgoku-ecommerce/
├── app/
│   ├── api/
│   │   ├── admin/
│   │   │   └── login/route.ts
│   │   ├── products/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   ├── admin/page.tsx
│   ├── checkout/page.tsx
│   ├── product/[id]/page.tsx
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── AdminDashboard.tsx
│   ├── AdminLogin.tsx
│   ├── AdminProductManager.tsx
│   ├── AdminBuyerManager.tsx
│   ├── Navbar.tsx
│   ├── ProductCard.tsx
│   ├── ProductGrid.tsx
│   ├── LoadingSpinner.tsx
│   └── EmptyState.tsx
├── lib/
│   ├── auth.ts
│   └── googleSheets.ts
├── public/
│   └── images/
│       └── qris.png (placeholder)
├── styles/
│   └── globals.css
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.ts
├── postcss.config.js
├── .eslintrc.json
└── .env.local
```

## 🚀 Quick Start

### 1. Installation

```bash
# Navigasi ke folder project
cd langgoku-ecommerce

# Install dependencies
npm install

# Copy environment example file
cp .env.local.example .env.local
```

### 2. Setup Google Sheets

#### A. Buat Google Sheet
1. Go to [Google Sheets](https://sheets.new)
2. Buat sheet baru dengan nama "Langgoku"
3. Di sheet "Products", buat header di row 1:

```
ID | Name | Price | Duration | Stock | Image_URL | Description
```

4. Contoh data:
```
netflix-1m | Netflix 1 Bulan | 59000 | 1 bulan | 10 | https://... | Full HD
canva-month | Canva Pro 1 Bulan | 45000 | 1 bulan | 15 | https://... | All features
```

#### B. Setup Google Sheets API
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project
3. Enable "Google Sheets API"
4. Create API key (tidak perlu authentication untuk public read)
5. Copy Spreadsheet ID dari URL:
   ```
   https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit
   ```

### 3. Setup Environment Variables

Edit `.env.local`:

```env
# Google Sheets Configuration
NEXT_PUBLIC_GOOGLE_SHEET_ID=YOUR_SPREADSHEET_ID
NEXT_PUBLIC_GOOGLE_API_KEY=YOUR_API_KEY

# Google Apps Script Web App URL (untuk automation)
GOOGLE_APPS_SCRIPT_URL=YOUR_GAS_WEB_APP_URL

# Admin Credentials
ADMIN_USERNAME=adminku
ADMIN_PASSWORD=Langgoku7894$
```

### 4. Setup QRIS Image

1. Tempat file `qris.png` di folder `/public/images/`
2. File akan ditampilkan di checkout page

### 5. Run Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

## 📖 Usage

### Halaman Utama (Home)
- Menampilkan semua produk dari Google Sheets
- Search produk berdasarkan nama
- Click product untuk lihat detail

### Halaman Detail Produk
- Info lengkap produk
- Harga, durasi, stok
- Button "Beli Sekarang"
- Form input data pembeli

### Halaman Checkout
- Ringkasan pesanan
- Kode pembayaran unik (untuk tracking)
- Display QRIS
- Button konfirmasi via WhatsApp

### Admin Panel (`/admin`)
- **Login**: Username: `adminku` | Password: `Langgoku7894$`
- **Manajemen Produk**: Edit stok, harga, durasi dari Google Sheets
- **Manajemen Pembeli**: Input manual pembeli + tracking masa aktif

## 🔌 API Endpoints

### Public Endpoints

```typescript
// Get all products
GET /api/products
// Response: { success: true, data: Product[] }

// Get single product
GET /api/products/[id]
// Response: { success: true, data: Product }
```

### Admin Endpoints

```typescript
// Admin login
POST /api/admin/login
// Body: { username: string, password: string }
// Response: { success: boolean, message: string }
```

## 📊 Google Sheets Integration

### Data Format

Google Sheets harus memiliki sheet "Products" dengan struktur:

| ID | Name | Price | Duration | Stock | Image_URL | Description |
|----|------|-------|----------|-------|-----------|-------------|
| netflix-1m | Netflix 1 Bulan | 59000 | 1 bulan | 10 | url | - |

### Price Formatting

- Input: `59000` → Output: `Rp59.000`
- Input: `99500` → Output: `Rp99.500`
- Tidak ada decimal jika 0

### Dynamic Update

Setiap kali ada request ke `/api/products`, data otomatis diambil dari Google Sheets terbaru.

## 🔐 Admin Panel Details

### Login
- Username: `adminku`
- Password: `Langgoku7894$`
- Session: 24 hours
- Storage: localStorage + httpOnly cookie

### Manajemen Produk
- View semua produk dari Google Sheets
- Edit: nama, harga, durasi, stok
- Auto-sync dengan Google Sheets

### Manajemen Pembeli
- Input manual pembeli
- Fields: Nama, No WA, Produk, Durasi, Tanggal Mulai, Tanggal Selesai
- Auto-calculate endDate based on duration
- Status tracking:
  - **Aktif**: Masa aktif normal
  - **Hampir Habis**: ≤ 3 hari tersisa
  - **Expired**: Sudah melewati tanggal selesai

## 📱 Price Code System

**Cara Kerja:**

1. Produk Netflix harga Rp59.000
2. Kode unik pembeli: `ABC123`
3. Kode dikonversi ke angka: 12
4. Final price: Rp59.000 + Rp12 = **Rp59.012**
5. Pembeli transfer dengan nominal **Rp59.012**
6. Admin bisa verify pembeli dari nominal unik tersebut

## 🌐 Deployment ke Vercel

### Dari Terminal

```bash
# Install Vercel CLI
npm install -g vercel

# Login ke Vercel
vercel login

# Deploy
vercel
```

### Dari GitHub

1. Push project ke GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Import repository
5. Add environment variables
6. Deploy

### Environment Variables di Vercel

1. Go to Project Settings → Environment Variables
2. Tambahkan:
   - `NEXT_PUBLIC_GOOGLE_SHEET_ID`
   - `NEXT_PUBLIC_GOOGLE_API_KEY`
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`

## 📚 Google Apps Script (Optional)

Untuk automation penuh, bisa gunakan Google Apps Script untuk handle:
- Auto-update stok
- Auto-record pembeli ke sheet
- Email notifications

File: `google-apps-script.js` (tersedia di docs/)

## 🎨 Styling

### Colors
- Primary: Blue (`#1e40af`)
- Secondary: Yellow/Accent (`#facc15`)
- Success: Green (`#10b981`)
- Danger: Red (`#ef4444`)

### Rounded
- Card: `rounded-xl`
- Button: `rounded-lg`

### Responsive
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)

## 🐛 Troubleshooting

### Products tidak muncul di homepage
- Check `.env.local` - pastikan SHEET_ID dan API_KEY benar
- Refresh page
- Check browser console untuk error

### Google Sheets API error
- Verify Spreadsheet ID format
- Check API key aktif di Google Cloud
- Ensure sheet nama "Products" exist

### Admin login tidak bisa
- Username: `adminku`
- Password: `Langgoku7894$`
- Clear localStorage jika ada issue

### QRIS image tidak muncul
- Letakkan file `qris.png` di `/public/images/qris.png`
- Check file size (recommend < 500KB)

## 📝 Development Tips

### Add New Product Fields

1. Update Google Sheets column
2. Update `Product` interface di components
3. Update `getGoogleSheetsData()` parsing logic
4. Update UI components

### Custom Styling

Edit `styles/globals.css` atau `tailwind.config.ts`

### Environment Variables

Always use `.env.local` untuk local dev, jangan commit ke git!

## 📖 Documentation Files

- `/docs/SETUP.md` - Detailed setup guide
- `/docs/API.md` - API documentation
- `/docs/DEPLOYMENT.md` - Deployment guide
- `/docs/GOOGLE_SHEETS_GUIDE.md` - Google Sheets integration

## 🤝 Support

Untuk help atau issue, silakan:
1. Check dokumentasi di `/docs`
2. Check file `.env.local.example`
3. Review Google Cloud Console settings

## 📄 License

MIT License - Feel free to use untuk personal/commercial projects

---

**Built with ❤️ using Next.js 14 + Google Sheets API**

Last Updated: March 2026
