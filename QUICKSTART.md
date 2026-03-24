# Quick Start - 5 Menit Setup

Panduan cepat untuk setup dan run Langgoku E-Commerce dalam 5 menit.

## 1️⃣ Clone/Download Project

```bash
cd langgoku-ecommerce
```

## 2️⃣ Install Packages

```bash
npm install
```

**⏱️ Waktu: ~2 menit**

## 3️⃣ Setup Environment

Copy `.env.local.example` ke `.env.local`:

```bash
cp .env.local.example .env.local
```

Edit dan isi dengan:
- `NEXT_PUBLIC_GOOGLE_SHEET_ID` (dari Google Sheets URL)
- `NEXT_PUBLIC_GOOGLE_API_KEY` (dari Google Cloud)

## 4️⃣ Prepare Google Sheets

1. Create new sheet at [sheets.new](https://sheets.new)
2. Rename to "Products"
3. Add header: `ID | Name | Price | Duration | Stock | Image_URL | Description`
4. Add sample data:
   - netflix-1m | Netflix 1 Bulan | 59000 | 1 bulan | 10 | ... | HD
   - canva-pro | Canva Pro | 45000 | 1 bulan | 15 | ... | Design

## 5️⃣ Get API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create Project > Enable Sheets API
3. Create API Key
4. Paste di `.env.local`

## 6️⃣ Run!

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) ✨

## 🎯 Test

- ✅ Homepage shows products
- ✅ Search works
- ✅ Click product detail
- ✅ Admin `/admin` login (adminku / Langgoku7894$)

## 📦 What You Get

```
✅ Full e-commerce frontend
✅ Admin panel with CRUD
✅ Google Sheets integration
✅ Checkout system
✅ TypeScript + Modern stack
✅ Production-ready
✅ Tailwind CSS styling
```

## 🚀 Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Or connect GitHub to Vercel dashboard.

## 📚 Need More Help?

- See `README.md` for detailed docs
- See `SETUP_GUIDE.md` for step-by-step
- Check `/docs` folder for guides

---

**You're all set! 🎉 Happy coding!**
