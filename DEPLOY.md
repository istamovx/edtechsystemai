# GitHub + Render.com — bosqichma-bosqich deploy qo'llanmasi

## ✅ Yaratilgan fayllar

| Fayl | Vazifasi |
|------|----------|
| `render.yaml` | Render Blueprint (web + bot + DB bir martalik) |
| `Dockerfile` | Production konteyner (Render Docker rejimi uchun ham) |
| `.dockerignore` | Docker build'da qaysi fayllar e'tiborga olinmasin |
| `.github/workflows/ci.yml` | Har push'da type-check va build tekshiruvi |
| `scripts/autopush.mjs` | `npm run push` — bir buyruq bilan commit+push |
| `scripts/watch-push.mjs` | `npm run watch:push` — fayl o'zgartirilganda avtomatik push |
| `.gitignore` | `.env` va boshqa secrets ni himoya qiladi |
| `.env` | Lokal secrets (gitignored — GitHub'ga yuborilmaydi) |

---

## 1️⃣ Birinchi qadam — GitHub'ga push qilish

Loyiha papkasida **Terminal** (PowerShell yoki Git Bash) oching va quyidagilarni bajaring:

```bash
cd "C:\Users\Xurshid\Documents\Claude\Projects\Edtech System AI"

# Git initsializatsiya
git init
git branch -M main

# Remote bog'lash
git remote add origin https://github.com/istamovx/edtechsystemai.git

# Birinchi commit
git add .
git commit -m "feat: initial commit — Coursue EdTech AI Platform"

# Push
git push -u origin main
```

GitHub login so'rasa, **Personal Access Token** ishlating (parol emas):
- https://github.com/settings/tokens → "Generate new token (classic)"
- Scope: `repo` belgilang
- Tokenni nusxa oling va parol o'rniga kiriting

> 💡 **Maslahat:** [GitHub Desktop](https://desktop.github.com) yoki [GitHub CLI](https://cli.github.com) (`gh auth login`) ishlatsangiz, parol so'ralmaydi.

---

## 2️⃣ Render.com'ga deploy

### A) Render hisobini ochish
1. https://render.com → **Get Started** → GitHub bilan kiring
2. GitHub authorization: Render'ga `edtechsystemai` repo'siga ruxsat bering

### B) Blueprint orqali bir martalik yaratish
1. Render dashboard → **New +** → **Blueprint**
2. Repository: `istamovx/edtechsystemai` ni tanlang
3. Render avtomatik `render.yaml` ni o'qiydi va 3 ta resurs yaratadi:
   - **coursue-db** — PostgreSQL ma'lumotlar bazasi
   - **coursue-web** — Next.js web app
   - **coursue-bot** — Telegram bot worker

### C) Secret env variables qo'shish
Web service'ga o'tib (`coursue-web`) → **Environment** → quyidagilarni qo'lda kiriting:

| Key | Value |
|-----|-------|
| `NEXTAUTH_URL` | `https://coursue-web.onrender.com` (deploy bo'lgach yangilang) |
| `ANTHROPIC_API_KEY` | https://console.anthropic.com'dan oling |
| `TELEGRAM_BOT_TOKEN` | **YANGI token oling** (eski chat'da ochiq yuborilgan) |

`coursue-bot` worker'iga ham `TELEGRAM_BOT_TOKEN` ni qo'shing.

### D) Deploy boshlanadi
Render avtomatik:
1. Repodan kodni oladi
2. `npm ci` → `prisma generate` → `prisma migrate deploy` → `npm run build`
3. Web service ishga tushiradi
4. Bot worker'ni ham ishga tushiradi

⏱ Birinchi deploy ~5-8 daqiqa.

---

## 3️⃣ Avto-deploy oqimi

Endi har safar GitHub'ga push qilganingizda Render avtomatik deploy qiladi:

```
[Sizning kompyuter]
       │
       │  npm run push
       ▼
[GitHub: edtechsystemai]
       │
       │  webhook (avtomatik)
       ▼
[Render: build + deploy]
       │
       │  ~3 daqiqa
       ▼
[Live: coursue-web.onrender.com]
```

### Tezkor push variantlari

```bash
# Bitta commitda push (commit xabarini avtomatik yozadi)
npm run push

# O'z commit xabari bilan
npm run push -- "feat: imtihon moduli qo'shildi"

# Watch mode (har 60 soniyada o'zgarishlarni avtomatik push qiladi)
npm run watch:push
```

---

## 4️⃣ Production'da DB seed va migratsiya

Render dashboard → `coursue-web` → **Shell** ochib:

```bash
# Seed (faqat birinchi marta)
npx prisma db seed

# Yangi migratsiya bo'lsa
npx prisma migrate deploy
```

Yoki lokal'dan:
```bash
DATABASE_URL="<render-db-url>" npx prisma db seed
```

---

## 5️⃣ Telegram bot webhook (production)

Bot ishga tushganini tekshirish:
```
https://api.telegram.org/bot<TOKEN>/getMe
```

Free tier'da Render worker har 15 daqiqa "uxlaydi" (free plan cheklovi). Bot uchun **starter plan** ($7/oy) tavsiya qilinadi — hech qachon to'xtamaydi.

---

## 6️⃣ Domen ulash (ixtiyoriy)

`coursue.uz` domeningiz bo'lsa:
1. Render → `coursue-web` → **Settings** → **Custom Domain**
2. CNAME yozuvi qo'shing: `coursue.uz` → `coursue-web.onrender.com`
3. SSL avtomatik (Let's Encrypt)

---

## 🛡 Xavfsizlik tekshirovi

`.env` fayl GitHub'ga yuborilmasligi kerak. Tekshirish:

```bash
git check-ignore .env
# Natija: .env  (demak ignored)
```

Agar `.env` xato push bo'lib qolsa:
```bash
git rm --cached .env
git commit -m "fix: remove .env from tracking"
git push
```
Va **darhol barcha tokenlarni almashtiring** (Telegram, Anthropic, NEXTAUTH_SECRET).

---

## 📊 Render free tier cheklovlari

| Resurs | Free | Starter ($7/oy) |
|--------|------|----------------|
| Web service | 750 soat/oy, 15 daq inactivity'da uxlaydi | 24/7 ishlaydi |
| PostgreSQL | 256 MB, 90 kun keyin o'chadi | 1 GB, doimiy |
| Worker (bot) | 750 soat | 24/7 |

**Tavsiya:** dastlab free'da test qiling, real foydalanuvchi paydo bo'lganda starter'ga o'ting (~$21/oy = ~265,000 so'm).

---

## ❓ Muammolar

**Build xato beryapti** → Render dashboard → service → **Logs** ko'ring. Eng tez-tez:
- `prisma generate` muvaffaqiyatsiz → `DATABASE_URL` to'g'ri kiritilganmi?
- Type error → `npm run build` ni lokalda ishlating

**Bot ishlamayapti** → Render → `coursue-bot` → **Logs**:
- `TELEGRAM_BOT_TOKEN` env'da bormi?
- DATABASE_URL ulangan bo'lishi kerak

**DB ulanmaydi** → `coursue-db` → **Connect** → "Internal Database URL" ni nusxa oling va `coursue-web` env'iga qo'ying.

---

## ✅ Keyingi qadamlar

1. [ ] GitHub'ga push qiling
2. [ ] Render Blueprint orqali deploy qiling
3. [ ] Secret env'larni kiriting (`ANTHROPIC_API_KEY`, `TELEGRAM_BOT_TOKEN`)
4. [ ] `npm run push` ni sinab ko'ring — avto-deploy ishlashini ko'ring
5. [ ] Bot tokenni almashtiring (eski chat'da ochiq yuborilgan)
