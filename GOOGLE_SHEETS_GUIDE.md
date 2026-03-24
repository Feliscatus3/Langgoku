# Google Sheets Setup Guide

Panduan lengkap setup Google Sheets untuk Langgoku E-Commerce database.

## 📋 Tab 1: Products

### Setup Header

Di row 1, buat kolom:

| A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|
| ID | Name | Price | Duration | Stock | Image_URL | Description |

### Column Details

**A - ID** (unique identifier)
- Format: `netflix-1m`, `canva-pro`, `capcut-month`
- Cannot be duplicated
- Cannot be empty

**B - Name** (display name)
- Contoh: `Netflix 1 Bulan`, `Canva Pro`
- Will show on homepage
- Keep under 50 characters for best display

**C - Price** (in Rupiah)
- Format: number only - contoh: `59000`, `99500`
- Don't use Rp, dots, or formatting
- Must be > 0

**D - Duration** (subscription period)
- Contoh: `1 bulan`, `3 bulan`, `6 bulan`, `1 tahun`
- Used for display & admin calculations
- Standard format recommended

**E - Stock** (quantity available)
- Format: number only - contoh: `10`, `0`, `100`
- If 0: product marked as "Habis"
- Used for "Tersedia/Habis" badge

**F - Image_URL** (optional product image)
- Full URL: `https://example.com/image.png`
- Leave empty if using default emoji
- Supported: JPG, PNG, WebP
- Max size: ~500KB (for loading speed)

**G - Description** (optional)
- Max 200 characters
- Will show on detail page
- Can leave empty

### Example Data

```
ID,Name,Price,Duration,Stock,Image_URL,Description
netflix-1m,Netflix 1 Bulan,59000,1 bulan,10,https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg,Streaming HD
netflix-3m,Netflix 3 Bulan,149000,3 bulan,8,https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg,Streaming HD
canva-pro,Canva Pro 1 Bulan,45000,1 bulan,15,https://upload.wikimedia.org/wikipedia/commons/1/1d/Canva_logo.png,Design tools
capcut,CapCut Premium,35000,1 bulan,20,,Video editor
adobe,Adobe CC 1 Tahun,299000,1 tahun,5,,All creative apps
spotify,Spotify Premium,49000,1 bulan,12,,Music streaming
```

### 🎨 Pro Tips for Images

1. **Use official logos** from Wikipedia or brand sites
2. **Square format** (1:1 ratio) works best
3. **Keep URLs stable** - don't use temporary links
4. **Fast CDN** - use services like Imgur, Cloudinary
5. **Fallback** - leave Image_URL empty → akan pakai emoji

---

## 📊 Tab 2: Buyers (Optional)

Untuk track pembelian otomatis (jika pakai Google Apps Script).

### Header

| A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|
| ID | Name | Phone | Product | Duration | Start Date | End Date | Timestamp |

### Auto-generated

Kolom ini bisa di-auto-create oleh Google Apps Script:

```javascript
// Otomatis dibuat saat pengguna checkout
id: "buyer_1234567890"
name: "John Doe"
phone: "+62812345678"
product: "Netflix 1 Bulan"
duration: "1 bulan"
startDate: "2024-01-15"
endDate: "2024-02-15"
timestamp: "2024-01-15 10:30:45"
```

---

## 🔑 Step-by-Step Setup

### 1. Create Google Sheets

```
Go to: https://sheets.new
```

1. New spreadsheet terbuka
2. Rename sheet pertama:
   - Right-click on sheet tab
   - Select "Rename"
   - Type: `Products`

### 2. Add Headers

Di cell A1, type `ID`, then B1 `Name`, etc:

```
A1: ID
B1: Name
C1: Price
D1: Duration
E1: Stock
F1: Image_URL
G1: Description
```

Or copy-paste sekaligus di A1:

```
ID	Name	Price	Duration	Stock	Image_URL	Description
```

### 3. Add Data

Start from row 2 (A2), input data:

- Row 2: `netflix-1m`, `Netflix 1 Bulan`, `59000`, `1 bulan`, `10`, `[image_url]`, `HD`
- Row 3: `canva-pro`, `Canva Pro`, `45000`, `1 bulan`, `15`, `[image_url]`, `Design`
- etc...

### 4. Share Sheet (Public Access)

1. Click "Share" button (top right)
2. Click "Change to anyone with link"
3. Make sure "Viewer" selected
4. Copy link

Or just make public:
1. Share settings
2. "Link sharing is on"
3. "Viewer" selected

### 5. Get Spreadsheet ID

Di URL:
```
https://docs.google.com/spreadsheets/d/{THIS_IS_ID}/edit
```

Copy ID itu.

### 6. Get Google API Key

Di [Google Cloud Console](https://console.cloud.google.com):

1. New project: "Langgoku"
2. Enable "Google Sheets API"
3. Create → API Key
4. Copy key

### 7. Update .env.local

```env
NEXT_PUBLIC_GOOGLE_SHEET_ID=YOUR_ID_HERE
NEXT_PUBLIC_GOOGLE_API_KEY=YOUR_KEY_HERE
```

---

## 🧪 Test Connection

Setelah setup, test di browser console:

```javascript
// Check if products loading
fetch('/api/products')
  .then(r => r.json())
  .then(data => console.log(data))
```

Should output:
```json
{
  "success": true,
  "message": "Produk berhasil diambil",
  "data": [
    {
      "id": "netflix-1m",
      "name": "Netflix 1 Bulan",
      "price": 59000,
      "duration": "1 bulan",
      "stock": 10,
      ...
    }
  ]
}
```

---

## 🔄 Update Data (Real-time)

Kelebihan Google Sheets: update real-time!

### Add Product

1. Open Google Sheet
2. Add row 6:
   ```
   example | Contoh Produk | 99000 | 1 bulan | 5 | ... | ...
   ```
3. Refresh homepage
4. New product appears ✅

**No redeploy needed!**

### Edit Price

1. Change cell C2 from `59000` → `49000`
2. Refresh homepage
3. Price updated immediately ✅

### Update Stock

1. Change cell E2 from `10` → `0`
2. Status changes to "Habis" ✅

---

## ⚠️ Common Issues

### Products tidak muncul

**Check:**
1. Sheet pertama diberi nama "Products" ✅
2. Headers di row 1 sesuai format ✅
3. Data mulai dari row 2 ✅
4. API Key & Sheet ID di .env.local benar ✅
5. Google Sheets API enabled di Cloud ✅

**Test locally:**
```bash
npm run dev
# Go to browser console
fetch('/api/products').then(r => r.json()).then(d => console.log(d))
```

### API Error 403 (Permission Denied)

**Fix:**
1. Check Google Sheets API enabled
2. API Key correct di .env.local
3. Sheet tidak private
4. Try creating new API Key

### Price formatting salah

**Format yang benar:**
```
59000 ✅ → Rp59.000
59000.5 ❌ (gunakan 59001)
Rp59000 ❌ (hanya angka)
59.000 ❌ (gunakan 59000)
```

### Blank rows causing issues

**Fix:**
- Remove blank rows
- Keep data contiguous
- Delete row 10 if not needed

---

## 📝 Best Practices

1. **Use consistent naming:**
   - IDs: `lowercase-with-dash`
   - Prices: `numbers only`
   - Dates: `YYYY-MM-DD`

2. **Keep data clean:**
   - No blank rows in middle
   - No extra spaces
   - Proper data types

3. **Organize your sheet:**
   - Products sorted by category
   - Keep Track of stock
   - Archive old products

4. **Regular backups:**
   - Google Sheets auto-backup
   - Download CSV copy weekly
   - Keep version history

---

## 🚀 Advanced: Google Apps Script

Untuk automation:

```javascript
// Auto-update stok saat ada pembelian
function recordBuyer(buyerData) {
  const sheet = SpreadsheetApp.getActiveSheet();
  sheet.appendRow([
    buyerData.name,
    buyerData.phone,
    buyerData.product,
    buyerData.startDate,
    buyerData.endDate
  ]);
}
```

See `google-apps-script.js` untuk full code.

---

## 📊 Spreadsheet Template

Create dari template:

**Copy & paste ke Google Sheet:**

```
ID	Name	Price	Duration	Stock	Image_URL	Description
netflix-1   	Netflix 1 Bulan	59000	1 bulan	10	https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg	Streaming HD
netflix-3m	Netflix 3 Bulan	149000	3 bulan	8	https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg	Streaming HD
canva-pro	Canva Pro	45000	1 bulan	15	https://upload.wikimedia.org/wikipedia/commons/1/1d/Canva_logo.png	Design Tools
capcut	CapCut Premium	35000	1 bulan	20		Video Editor
adobe-cc	Adobe Creative Cloud	299000	1 tahun	5		All Apps
spotify	Spotify Premium	49000	1 bulan	12		Music Streaming
youtube	YouTube Premium	59000	1 bulan	8		No Ads
```

---

## ✅ Checklist

- [ ] Google Sheet created
- [ ] Sheet named "Products"
- [ ] Headers in row 1
- [ ] Sample data added
- [ ] Sheet shared publicly
- [ ] Spreadsheet ID copied
- [ ] API Key generated
- [ ] .env.local updated
- [ ] Test in browser console
- [ ] Homepage shows products

---

## 📞 Need Help?

1. Check Products sheet structure
2. Verify API Key in Google Cloud
3. Check .env.local format
4. Try refresh + clear cache
5. Check console errors (F12)

---

**Happy Sheets-ing! 📊**

Last updated: March 2026
