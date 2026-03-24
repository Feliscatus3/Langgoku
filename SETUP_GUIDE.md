# Setup Guide - Langgoku E-Commerce

Panduan lengkap setup Langgoku E-Commerce dari awal hingga production.

## ⚡ Prerequisites

Sebelum memulai, pastikan Anda sudah memiliki:
- Node.js v18+ ([download](https://nodejs.org/))
- npm atau yarn
- Google Account
- GitHub Account (untuk deployment)
- Vercel Account (untuk hosting)

## 🔧 Step 1: Setup Lokal

### A. Clone atau Download Project

```bash
# Jika menggunakan git
git clone <repository-url>
cd langgoku-ecommerce

# Atau buka folder project yang sudah ada
cd c:\Users\ASUS\Documents\Website\Langgoku\langgoku-ecommerce
```

### B. Install Dependencies

```bash
npm install
```

Tunggu sampai selesai (±1-2 menit tergantung internet).

### C. Buat .env.local

```bash
cp .env.local.example .env.local
```

Edit `.env.local` dengan text editor:

```env
NEXT_PUBLIC_GOOGLE_SHEET_ID=XXXXXX
NEXT_PUBLIC_GOOGLE_API_KEY=XXXXXX
GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/d/xxxxx/usercontent
ADMIN_USERNAME=adminku
ADMIN_PASSWORD=Langgoku7894$
```

## 📊 Step 2: Setup Google Sheets

### A. Buat Spreadsheet Baru

1. Go to [sheets.new](https://sheets.new)
2. Rename sheet pertama menjadi "Products"
3. Buat header di row 1:

```
ID | Name | Price | Duration | Stock | Image_URL | Description
```

### B. Masukkan Data Contoh

| ID | Name | Price | Duration | Stock | Image_URL | Description |
|----|------|-------|----------|-------|-----------|-------------|
| netflix-1m | Netflix 1 Bulan | 59000 | 1 bulan | 10 | https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg | Streaming HD |
| canva-pro | Canva Pro 1 Bulan | 45000 | 1 bulan | 15 | https://upload.wikimedia.org/wikipedia/commons/1/1d/Canva_logo.png | Design Tools |
| capcut | CapCut Premium | 35000 | 1 bulan | 20 | https://pbs.twimg.com/profile_images/1284976522991054848/7qGbxMWW_400x400.jpg | Video Editor |

### C. Ambil Spreadsheet ID

URL Spreadsheet:
```
https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit
```

Copy `{SPREADSHEET_ID}` - ini yang dibutuhkan di .env.local.

## 🔑 Step 3: Setup Google Cloud API

### A. Buat Project di Google Cloud

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click "Select a Project" > "New Project"
3. Beri nama: `langgoku-ecommerce`
4. Click "Create"

### B. Enable Google Sheets API

1. Di sidebar kiri, click "APIs & Services" > "Library"
2. Search "Google Sheets API"
3. Click "Enable"

### C. Buat API Key

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy API Key
4. Paste di `.env.local` sebagai `NEXT_PUBLIC_GOOGLE_API_KEY`

**⚠️ PENTING**: Restrict API key untuk hanya Google Sheets API (optional tapi recommended untuk production)

## 🎬 Step 4: Run Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

Seharusnya Anda bisa melihat:
- ✅ Homepagedengan produk dari Google Sheets
- ✅ Search functionality
- ✅ Product detail page
- ✅ Admin panel at `/admin`

### Test Admin Login

Go to [http://localhost:3000/admin](http://localhost:3000/admin)

Login dengan:
- Username: `adminku`
- Password: `Langgoku7894$`

## 📱 Step 5: Add QRIS Image

1. Siapkan file gambar QRIS atau barcode.
2. Simpan dengan nama `qris.png` di folder `/public/images/`
3. File akan otomatis di-load saat checkout.

## 🌐 Step 6: Deploy ke Vercel

### A. Push ke GitHub

```bash
# Initialize git (jika belum)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Langgoku E-Commerce"

# Add GitHub remote
git remote add origin https://github.com/YOUR_USERNAME/langgoku-ecommerce.git

# Push
git branch -M main
git push -u origin main
```

### B. Deploy di Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Select GitHub repository `langgoku-ecommerce`
4. Framework: **Next.js** (auto-detected)
5. Click "Environment Variables"
6. Add semua dari `.env.local`:
   - `NEXT_PUBLIC_GOOGLE_SHEET_ID`
   - `NEXT_PUBLIC_GOOGLE_API_KEY`
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`

7. Click "Deploy"

**Waiting untuk build selesai (~2-3 menit)...**

Setelah selesai, Vercel akan memberikan URL live. Contoh:
```
https://langgoku-ecommerce.vercel.app
```

### C. Test Production

1. Buka live URL
2. Verify semua halaman berfungsi
3. Test admin login
4. Test checkout flow

## 🔧 Google Apps Script (Optional)

Untuk automation penuh seperti auto-record pembeli:

### A. Setup GAS Project

1. Go to [script.google.com](https://script.google.com)
2. Click "New Project"
3. Copy code dari `google-apps-script.js` ke editor
4. Save

### B. Deploy sebagai Web App

1. Click "Deploy" > "New Deployment"
2. Select type: "Web App"
3. Execute as: Pilih email Anda
4. Who has access: "Anyone"
5. Click "Deploy"
6. Copy URL yang muncul

### C. Setup di .env

Paste URL di `.env.local`:
```env
GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/d/xxxxx/usercontent
```

## ✅ Checklists

### Development
- [ ] Project setup lokal
- [ ] npm install berhasil
- [ ] .env.local configured
- [ ] Google Sheets created
- [ ] Google Cloud API key generated
- [ ] Dev server running
- [ ] Produk muncul di homepage
- [ ] Admin login berfungsi
- [ ] QRIS image ditambahkan

### Production
- [ ] GitHub repository created
- [ ] Code pushed to GitHub
- [ ] Vercel project created
- [ ] Environment variables set
- [ ] Build successful
- [ ] All pages working
- [ ] Admin panel accessible
- [ ] Checkout flow tested
- [ ] Custom domain (optional)

## 📝 Environment Variables Reference

```env
# REQUIRED - Google Sheets Configuration
NEXT_PUBLIC_GOOGLE_SHEET_ID=1abc2def3ghi4jkl5mno6pqr7stu8vwx9yza0

# REQUIRED - Google API Key
NEXT_PUBLIC_GOOGLE_API_KEY=AIzaSxDxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# OPTIONAL - Google Apps Script URL
GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/d/xxxxx/usercontent

# Admin Credentials
ADMIN_USERNAME=adminku
ADMIN_PASSWORD=Langgoku7894$
```

## 🐛 Common Issues & Solutions

### 1. Products tidak muncul di homepage

**Problem**: Homepage blank, produk tidak loading

**Solutions**:
- ✅ Check `.env.local` - pastikan SHEET_ID dan API_KEY benar
- ✅ Verify Google Sheets punya sheet bernama "Products"
- ✅ Check Network tab di browser DevTools
- ✅ Ensure data di Google Sheets formatnya benar

### 2. Google Sheets API Error 403

**Problem**: Error "The caller does not have permission"

**Solutions**:
- ✅ Pastikan Google Sheets API enabled di Google Cloud
- ✅ API Key sudah benar
- ✅ Share Google Sheet ke public atau set sharing

### 3. Admin login tidak bisa

**Problem**: Username/password salah terus

**Solutions**:
- ✅ Double-check credentials: `adminku` / `Langgoku7894$`
- ✅ Clear localStorage: `localStorage.clear()` di console
- ✅ Try incognito/private mode

### 4. Build error di Vercel

**Problem**: Deployment failed dengan error

**Solutions**:
- ✅ Check build logs di Vercel dashboard
- ✅ Ensure semua env variables sudah set
- ✅ Try `npm run build` lokal
- ✅ Check untuk TypeScript errors

### 5. QRIS image tidak muncul

**Problem**: Checkout page blank di image area

**Solutions**:
- ✅ Pastikan file ada di `/public/images/qris.png`
- ✅ File size tidak terlalu besar
- ✅ Format: PNG, JPG, atau WebP
- ✅ Restart dev server

## 📞 Support

Jika ada masalah:

1. Check documentation di `/docs`
2. Check error message di browser console (F12)
3. Check server logs di terminal
4. Clear cache dan refresh
5. Try using different browser

## 🚀 Next Steps

Setelah setup berhasil:

1. **Customize branding**:
   - Logo di Navbar
   - Colors di `tailwind.config.ts`
   - Meta description di `layout.tsx`

2. **Add more pages**:
   - Terms & Conditions
   - Privacy Policy
   - Contact form

3. **Integrations**:
   - Email notification
   - Payment gateway (Doku, Xendit)
   - CRM system

4. **Analytics**:
   - Google Analytics
   - Vercel Analytics
   - Custom tracking

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Google Sheets API](https://developers.google.com/sheets/api)
- [Vercel Docs](https://vercel.com/docs)

---

**Questions?** Refer ke README.md atau docs folder.

Happy Coding! 🎉
