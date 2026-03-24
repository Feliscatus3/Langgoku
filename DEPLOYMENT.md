# Deploy Guide - Langgoku E-Commerce

Panduan lengkap deploy Langgoku ke production dengan Vercel.

## 🌐 Deployment Options

### Option 1: Vercel (Recommended) ⭐

Vercel adalah platform terbaik untuk Next.js dengan features:
- Free tier generous
- Auto-scaling
- CDN global
- Serverless functions
- Analytics bawaan

### Option 2: Self-Hosted

Bisa deploy ke VPS, AWS, GCP, dll (lebih kompleks)

---

## 📋 Pre-Deployment Checklist

- [ ] All features tested locally
- [ ] Environment variables defined
- [ ] Google Sheets API working
- [ ] Admin credentials set
- [ ] QRIS image added
- [ ] Code pushed to GitHub
- [ ] No hardcoded secrets

---

## 🚀 Deploy ke Vercel

### Method 1: Via Vercel Dashboard (Easiest)

#### Step 1: Push ke GitHub

```bash
# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Deploy Langgoku E-Commerce"

# Add remote
git remote add origin https://github.com/YOUR_USERNAME/langgoku-ecommerce.git

# Push
git branch -M main
git push -u origin main
```

#### Step 2: Connect ke Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up (gunakan GitHub account)
3. Click "New Project"
4. Select GitHub repository `langgoku-ecommerce`
5. Vercel auto-detect Next.js ✅

#### Step 3: Add Environment Variables

1. Di halaman project settings, click "Environment Variables"
2. Tambahkan:

```
NEXT_PUBLIC_GOOGLE_SHEET_ID = YOUR_SHEET_ID
NEXT_PUBLIC_GOOGLE_API_KEY = YOUR_API_KEY
ADMIN_USERNAME = adminku
ADMIN_PASSWORD = Langgoku7894$
```

#### Step 4: Deploy

Click "Deploy" → Tunggu build selesai (~2-3 menit)

**Done!** 🎉 URL live Anda adalah:
```
https://langgoku-ecommerce.vercel.app
```

---

### Method 2: Via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel
```

Follow prompts dan Vercel akan handle sisanya.

---

## ⚙️ Custom Domain (Optional)

1. Di Vercel dashboard, go to Project Settings
2. Click "Domains"
3. Add custom domain: `langgoku.com`
4. Vercel akan kasih DNS records
5. Update DNS di domain provider Anda

---

## 🔐 Security Best Practices

### 1. Environment Variables

✅ **DO**:
- Use `.env.local` untuk local dev
- Set proper env vars di Vercel
- Restrict API keys di Google Cloud

❌ **DON'T**:
- Commit `.env.local` ke GitHub
- Use hardcoded secrets
- Share API keys publicly

### 2. API Security

```typescript
// ✅ Good: Use server-side routes
// /api/products - public read
// /api/admin/* - protected with auth

// ❌ Bad: Expose secrets in client code
console.log(process.env.SECRET_KEY) // DON'T
```

### 3. Database Security

Untuk production dengan real database:
- Use secure connection (SSL/TLS)
- Validate all inputs
- Use parameterized queries
- Implement rate limiting

---

## 📊 Monitoring & Analytics

### Enable Vercel Analytics

1. Project Settings → Analytics
2. Turn on "Web Analytics"
3. Track page performance

### Google Analytics (Optional)

```typescript
// Add to components/Analytics.tsx
export default function Analytics() {
  return (
    <Script
      src="https://www.googletagmanager.com/gtag/js?id=GA_ID"
      strategy="afterInteractive"
    />
  )
}
```

---

## 🐛 Troubleshooting Deployment

### Build Fails

```makefile
# Check logs
vercel logs

# Local test build
npm run build

# Check TypeScript
npm run lint
```

### Environment Variables Not Working

1. Ensure all vars set di Vercel dashboard
2. Redeploy after adding vars
3. Check variable names (case-sensitive)

### Google Sheets API Not Working

1. Verify API key di Vercel env vars
2. Check SHEET_ID format
3. Ensure sheet is accessible
4. Check API quota

### Admin Login Not Working

1. Clear localStorage/cookies
2. Check credentials
3. Verify env vars set correctly
4. Test in incognito mode

---

## 🔄 Continuous Deployment

Vercel auto-deploy kapan push ke GitHub:

```bash
# Edit file locally
# Commit & push
git add .
git commit -m "Update product"
git push

# Vercel auto-build & deploy ✅
# Check deployment di dashboard
```

---

## 📈 Scaling untuk Production

### Traffic Tinggi

- ✅ Vercel auto-scales serverless functions
- ✅ Use image optimization
- ✅ Cache static assets
- ✅ Optimize database queries

### Database di Production

Untuk harga reliability, integrate real database:

```typescript
// Example: PostgreSQL
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

export async function getProducts() {
  const result = await pool.query('SELECT * FROM products')
  return result.rows
}
```

### Session Storage

Untuk production dengan banyak users:

```typescript
// Use Redis atau database
// Jangan use localStorage di admin panel
import { createClient } from 'redis'

const client = createClient()
```

---

## 💰 Vercel Pricing

### Free Tier

- Unlimited projects
- Unlimited GB bandwidth
- Unlimited serverless function invocations
- SSL certificate
- Perfect untuk small-medium projects

### Pro Plan (Optional)

- Priority support
- Advanced analytics
- Custom domains unlimited
- Starting $20/month

---

## 🎯 Post-Deployment

### 1. Verify Live URL

```
https://langgoku-ecommerce.vercel.app
```

- [ ] Homepage loads
- [ ] Products visible
- [ ] Search works
- [ ] Admin login works
- [ ] Checkout functional

### 2. Update DNS/Domain

If using custom domain, update nameservers.

### 3. Test All Features

- [ ] Create new product in sheet
- [ ] Refresh homepage - produk muncul
- [ ] Admin panel accessible
- [ ] Add buyer - works
- [ ] Checkout flow complete

### 4. Setup Monitoring

- [ ] Vercel Analytics enabled
- [ ] Error tracking setup
- [ ] Performance monitoring active

### 5. Backup & Documentation

- [ ] Google Sheets backed up
- [ ] Code documented
- [ ] Setup notes saved
- [ ] Credentials secured

---

## 🔄 Updates & Maintenance

### Update Dependencies

```bash
npm update
npm audit fix
npm run build
git push # Auto-deploy
```

### Staging Environment (Optional)

Buat preview di branch terpisah:

```bash
git checkout -b staging
# Make changes
git push origin staging

# Vercel creates preview URL automatically
```

---

## 📞 Support & Help

### Vercel Support
- Email: support@vercel.com
- Docs: [vercel.com/docs](https://vercel.com/docs)

### Next.js Help
- Docs: [nextjs.org/docs](https://nextjs.org/docs)
- Discord: [Discord.gg/nextjs](https://discord.gg/nextjs)

### Google Cloud Help
- Console: [console.cloud.google.com](https://console.cloud.google.com)
- Docs: [cloud.google.com/docs](https://cloud.google.com/docs)

---

## ✨ Deployment Checklist

```
Pre-Deployment:
- [ ] All tests passing
- [ ] Code committed to GitHub
- [ ] .env.local not in git
- [ ] QRIS image added

Vercel Setup:
- [ ] GitHub connected
- [ ] Project imported
- [ ] Env variables set
- [ ] Build successful

Post-Deployment:
- [ ] URL live & accessible
- [ ] All pages loading
- [ ] API endpoints working
- [ ] Google Sheets synced
- [ ] Admin panel accessible
- [ ] Checkout tested

Monitoring:
- [ ] Analytics enabled
- [ ] Error tracking setup
- [ ] Performance monitoring
- [ ] Backup verified
```

---

**🎉 Selamat! Project sudah live dan siap production!**

Next steps:
1. Promote ke teman/keluarga
2. Gather feedback
3. Implement improvements
4. Scale dengan mencermati traffic

Happy deploying! 🚀
