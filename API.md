# API Documentation - Langgoku E-Commerce

Complete API reference untuk Langgoku E-Commerce.

## 🔗 Base URL

```
Development: http://localhost:3000/api
Production: https://langgoku-ecommerce.vercel.app/api
```

---

## 📦 Products Endpoints

### Get All Products

```http
GET /api/products
```

**Response (Success):**

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
      "image": "https://...",
      "description": "Streaming HD"
    }
  ]
}
```

**Response (No Data):**

```json
{
  "success": false,
  "message": "Data produk belum terhubung atau kosong",
  "data": []
}
```

**Status Codes:**
- `200` - Success (atau no data)
- `500` - Server error

---

### Get Single Product

```http
GET /api/products/[id]
```

**Parameters:**
- `id` (required) - Product ID, e.g., `netflix-1m`

**Response (Success):**

```json
{
  "success": true,
  "data": {
    "id": "netflix-1m",
    "name": "Netflix 1 Bulan",
    "price": 59000,
    "duration": "1 bulan",
    "stock": 10,
    "image": "https://...",
    "description": "Streaming HD"
  }
}
```

**Response (Not Found):**

```json
{
  "success": false,
  "message": "Produk tidak ditemukan"
}
```

**Status Codes:**
- `200` - Success
- `404` - Product not found
- `500` - Server error

---

## 🔐 Admin Endpoints

### Admin Login

```http
POST /api/admin/login
```

**Request Body:**

```json
{
  "username": "adminku",
  "password": "Langgoku7894$"
}
```

**Response (Success):**

```json
{
  "success": true,
  "message": "Login berhasil"
}
```

**Response (Failure):**

```json
{
  "success": false,
  "message": "Username atau password salah"
}
```

**Status Codes:**
- `200` - Success
- `400` - Missing fields
- `401` - Wrong credentials
- `500` - Server error

**Session:**
- Cookie `admin_token` set
- Expires: 24 hours
- HttpOnly: true (secure)

---

## 🛒 Checkout Flow (Frontend Only)

Checkout saat ini handle dari frontend (client-side).

### Order Structure

```typescript
interface CheckoutData {
  productId: string
  productName: string
  originalPrice: number
  uniqueCode: string
  finalPrice: number
  buyerName: string
  buyerPhone: string
}
```

### Price Calculation

```javascript
// Original price: 59000
// Unique code: "ABC123"
// Code to number: 12
// Final price: 59000 + 12 = 59012

finalPrice = originalPrice + codeToNumber(uniqueCode)
```

### Store Checkout Data

```javascript
sessionStorage.setItem('checkoutData', JSON.stringify({
  productId: 'netflix-1m',
  productName: 'Netflix 1 Bulan',
  originalPrice: 59000,
  uniqueCode: 'ABC123',
  finalPrice: 59012,
  buyerName: 'John Doe',
  buyerPhone: '+62812345678'
}))
```

---

## 📝 Request Examples

### JavaScript/Fetch

```javascript
// Get all products
fetch('/api/products')
  .then(res => res.json())
  .then(data => console.log(data))

// Get single product
fetch('/api/products/netflix-1m')
  .then(res => res.json())
  .then(data => console.log(data))

// Admin login
fetch('/api/admin/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'adminku',
    password: 'Langgoku7894$'
  })
})
  .then(res => res.json())
  .then(data => console.log(data))
```

### cURL

```bash
# Get all products
curl "http://localhost:3000/api/products"

# Get single product
curl "http://localhost:3000/api/products/netflix-1m"

# Admin login
curl -X POST "http://localhost:3000/api/admin/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"adminku","password":"Langgoku7894$"}'
```

### Axios

```javascript
import axios from 'axios'

// Get products
axios.get('/api/products')
  .then(res => console.log(res.data))

// Login
axios.post('/api/admin/login', {
  username: 'adminku',
  password: 'Langgoku7894$'
})
  .then(res => console.log(res.data))
```

---

## ⚙️ Utility Functions

### Format Price

```typescript
import { formatPrice } from '@/lib/googleSheets'

formatPrice(59000) // → "Rp59.000"
formatPrice(149000) // → "Rp149.000"
```

### Parse Price

```typescript
import { parsePrice } from '@/lib/googleSheets'

parsePrice('59000') // → 59000
parsePrice('Rp59.000') // → 59000
parsePrice(59000) // → 59000
```

### Generate Unique Code

```typescript
import { generateUniqueCode } from '@/lib/googleSheets'

generateUniqueCode() // → "ABC123"
```

### Calculate Days Remaining

```typescript
import { calculateRemainingDays } from '@/lib/googleSheets'

const endDate = new Date('2024-02-15')
calculateRemainingDays(endDate) // → 30 (jika hari ini 2024-01-15)
```

### Get Subscription Status

```typescript
import { getSubscriptionStatus } from '@/lib/googleSheets'

getSubscriptionStatus(5) // → "expiring" (≤3 hari)
getSubscriptionStatus(10) // → "active"
getSubscriptionStatus(-1) // → "expired"
```

---

## 🔐 Authentication

### Admin Auth

Authentication untuk admin panel:

```typescript
// Login
const response = await fetch('/api/admin/login', {
  method: 'POST',
  body: JSON.stringify({ username, password })
})

// Check auth
const isAuth = localStorage.getItem('admin_token')

// Logout
localStorage.removeItem('admin_token')
```

### Protected Routes

Routes yang memerlukan auth:
- `/admin` - Full protection
- `/api/admin/*` - Protected endpoints

---

## 🚀 Google Apps Script Integration

Optional API untuk automation.

### Setup

Deploy sebagai web app di [script.google.com](https://script.google.com):

```javascript
// doPost handler
function doPost(e) {
  const data = JSON.parse(e.postData.contents)
  // Process request
  return ContentService.createTextOutput(JSON.stringify(response))
}
```

### Endpoints (if deployed)

```
POST https://script.google.com/macros/d/{ID}/usercontent
```

**Actions:**

1. **addBuyer**
```json
{
  "action": "addBuyer",
  "buyerName": "John Doe",
  "buyerPhone": "+62812345678",
  "productName": "Netflix 1 Bulan",
  "duration": "1 bulan",
  "startDate": "2024-01-15",
  "endDate": "2024-02-15"
}
```

2. **updateStock**
```json
{
  "action": "updateStock",
  "productId": "netflix-1m",
  "newStock": 9
}
```

3. **getBuyers**
```json
{
  "action": "getBuyers"
}
```

---

## 📊 Data Models

### Product

```typescript
interface Product {
  id: string           // Unique ID
  name: string         // Display name
  price: number        // Price in IDR
  duration: string     // e.g., "1 bulan"
  stock: number        // Available quantity
  image?: string       // Optional image URL
  description?: string // Optional description
}
```

### Buyer

```typescript
interface Buyer {
  id: string
  name: string         // Full name
  phone: string        // WhatsApp number
  product: string      // Product name
  duration: string     // Duration
  startDate: string    // YYYY-MM-DD
  endDate: string      // YYYY-MM-DD
  status: 'active' | 'expiring' | 'expired'
  remainingDays: number
}
```

### Checkout

```typescript
interface CheckoutData {
  productId: string
  productName: string
  originalPrice: number
  uniqueCode: string
  finalPrice: number
  buyerName: string
  buyerPhone: string
}
```

---

## 🧪 Testing

### Test dalam Browser Console

```javascript
// Test API response
fetch('/api/products')
  .then(r => r.json())
  .then(d => {
    console.log('Status:', d.success)
    console.log('Products:', d.data.length)
    console.log('First:', d.data[0])
  })
```

### Test locally dengan cURL

```bash
# All products
curl http://localhost:3000/api/products | jq

# Single product
curl http://localhost:3000/api/products/netflix-1m | jq

# Admin login
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"adminku","password":"Langgoku7894$"}' | jq
```

---

## ⚠️ Error Handling

### Response Codes

| Code | Meaning |
|------|---------|
| 200 | Success (atau "no data" state) |
| 400 | Bad request (missing fields) |
| 401 | Unauthorized (wrong credentials) |
| 404 | Not found |
| 500 | Server error |

### Error Response Format

```json
{
  "success": false,
  "message": "Error description here",
  "data": null
}
```

---

## 🔒 Rate Limiting

Saat ini tidak ada rate limiting.

Untuk production, implementasikan:

```typescript
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
})
```

---

## 📈 Monitoring

### Check API Health

```bash
# Server running?
curl http://localhost:3000/api/products

# Response time?
time curl http://localhost:3000/api/products

# Error rate?
# Monitor error logs di terminal
```

---

## 🚀 Versioning

Current API version: **v1**

Future support untuk versioning:

```
GET /api/v1/products
GET /api/v2/products
```

---

## 📝 Changelog

**v1.0 (2026-03-24)**
- Released
- Products endpoint
- Admin login
- Google Sheets integration

---

## 📞 Support

API issues? Check:
1. `.env.local` configuration
2. Google Cloud setup
3. Browser console errors
4. Network tab in DevTools

---

**Last Updated: March 2026**
