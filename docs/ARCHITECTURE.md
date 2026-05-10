# Coursue Platforma — Arxitektura

## Umumiy ko'rinish

Coursue — multi-tenant SaaS platforma. Har bir o'quv markazi alohida `Tenant` sifatida tizimda ro'yxatdan o'tadi va o'ziga kerakli modullarni yoqib/o'chirib qo'yadi.

```
┌──────────────────────────────────────────────────────────────────┐
│                       FOYDALANUVCHILAR                           │
│   Markaz egasi · Admin · O'qituvchi · O'quvchi · Ota-ona         │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                    NEXT.JS WEB APP (App Router)                  │
│   ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐    │
│   │ Dashboard  │ │ Users tab  │ │ Payments   │ │ Exams + AI │    │
│   └────────────┘ └────────────┘ └────────────┘ └────────────┘    │
│   ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐    │
│   │ Reports    │ │ CRM        │ │ Schedule   │ │ Settings   │    │
│   └────────────┘ └────────────┘ └────────────┘ └────────────┘    │
└──────────────────────────────────────────────────────────────────┘
        │                  │                    │
        ▼                  ▼                    ▼
┌─────────────┐    ┌──────────────┐    ┌────────────────┐
│ NextAuth    │    │ Prisma ORM   │    │ Anthropic API  │
│ (JWT)       │    │              │    │ (Claude AI)    │
└─────────────┘    └──────┬───────┘    └────────────────┘
                          │
                          ▼
                  ┌──────────────┐
                  │ PostgreSQL   │
                  │ (multi-tenant│
                  │  by tenantId)│
                  └──────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                  TASHQI INTEGRATSIYALAR                          │
├──────────────────────────────────────────────────────────────────┤
│  Telegram Bot (Telegraf)  ◄──►  /api/telegram/webhook            │
│  Turniket qurilmasi       ◄──►  /api/turnstile/webhook (HMAC)    │
│  Click / Payme            ◄──►  /api/payments/click (kelajak)    │
│  S3 / R2 storage          ◄──►  Fayllar va sertifikatlar         │
└──────────────────────────────────────────────────────────────────┘
```

## Multi-tenancy strategiyasi

**Tanlandi:** Single DB + `tenantId` ustun har bir jadvalda.

**Sabablar:**
1. Yagona migratsiya — barcha markazlar bir vaqtda yangilanadi.
2. Operatsion xarajatlar past — bitta DB serveri 1000+ markazga yetadi.
3. SUPER_ADMIN bitta query bilan barcha markazlarni ko'ra oladi.

**Xavfsizlik:**
- Har bir Prisma query'ga `tenantId` shartli filtr qo'yiladi (Server Action / API darajasida).
- `tenantScope(tenantId)` yordamchi funksiya orqali avtomatik.
- NextAuth JWT'da `tenantId` saqlanadi va har bir requestda tekshiriladi.

## Modullar tizimi

`Tenant.enabledModules: String[]` — markaz qaysi modullarni yoqgani.

Sidebar dinamik — faqat yoqilgan modullarni ko'rsatadi:
```ts
const visibleModules = ALL_MODULES.filter(m => tenant.enabledModules.includes(m.key));
```

Markaz egasi `/settings` sahifasida modullarni yoqib/o'chirishi mumkin. Ba'zi modullar (`branches`, `audit`) faqat PRO/ENTERPRISE rejaga tegishli.

## Imtihon moduli + AI

### Savol bazasi
- `Subject` (Matematika, Fizika, ...) → `Topic` (mavzular, ierarxik) → `ExamQuestion`.
- Savol matni KaTeX/LaTeX formulalarini qo'llab-quvvatlaydi: `$\sqrt{x^2 + y^2}$`.
- Frontend: **MathLive** muharriri (vizual formula yaratish).
- Excel/Word import: `xlsx` paketi + Claude AI parse qilish (rasm va formulalar bilan).

### AI tahlil oqimi
1. O'quvchi imtihon topshiradi → `ExamAttempt` yaratiladi, javoblar `answers: Json`.
2. POST `/api/exams/ai-analyze` chaqiriladi.
3. `lib/ai.ts` Claude'ga so'rov yuboradi: barcha savol+javoblar+to'g'ri javoblar.
4. Claude javob qiladi:
   - `weakTopics`: zaif mavzular
   - `recommendations.universities`: mos universitetlar
   - `questionExplanations`: xato javoblar uchun tushuntirish
5. Natija `ExamAttempt.aiAnalysis` JSON ustuniga saqlanadi.

### Tashqi xizmat sifatida sotish
Boshqa o'quv markazlari yoki maktablar uchun bir martalik xizmat:
- Maxsus link: `/external-exam/:token`
- Token to'lovga bog'langan
- O'quvchi ro'yxatdan o'tmasdan testni topshira oladi
- Natija va AI tahlil PDF shaklida yuboriladi

## Davomat + Turniket

### Oqim
1. RFID karta turniketga yaqinlashtiriladi.
2. Turniket qurilmasi → POST `/api/turnstile/webhook` (HMAC imzo bilan).
3. Tizim:
   - `TurnstileEvent` (xom log) yaratadi.
   - O'quvchini topadi va `Attendance` yaratadi/yangilaydi (`enterAt` / `exitAt`).
   - Ota-ona Telegramiga xabar yuboradi.

### Qurilma protokoli
Aksariyat O'zbekistondagi turniketlar (ZKTeco, Hikvision, Anviz) HTTP yoki UDP push push qila oladi.
Agar qurilma faqat lokal SDK bilan ishlasa — vositachi (Windows servis yoki Raspberry Pi) yoziladi.

## To'lov hisobotlari

`Payment` jadvalida har bir to'lov:
- `method`: CASH, CARD, CLICK, PAYME, BANK_TRANSFER
- `forMonth`: "2026-05" — qaysi oy uchun
- O'quvchi profilida joriy qarzdorlik avtomatik hisoblanadi:
  ```
  qarzdorlik = (oktyabr·dek) × oylik to'lov - sum(Payment WHERE PAID)
  ```

## Telegram bot

Alohida Node.js servis (`/telegram-bot`).
- Telegraf framework
- Express ichki API: `POST /notify`, `POST /broadcast`
- Web app o'zaro aloqa qiladi: `fetch('http://bot:4000/notify', {...})`

## Xavfsizlik checklist

- [x] Multi-tenant izolyatsiya (har query'da `tenantId`)
- [x] HMAC imzo turniket webhook'lari uchun
- [x] bcrypt parol hash
- [x] NextAuth JWT
- [ ] Rate limiting (productionda Redis + upstash/ratelimit)
- [ ] CSRF himoya (NextAuth o'rnatib beradi)
- [ ] Audit logs (`AuditLog` jadval — kengaytirish kerak)
- [ ] 2FA SMS yoki Telegram orqali (kelajakda)

## Deploy

### Tavsiya: VPS (DigitalOcean / Hetzner)
- Docker compose: web + telegram-bot + postgres + nginx (TLS)
- DNS: `*.coursue.uz` wildcard subdomain
- Backup: kunlik `pg_dump` + S3'ga yuklash
- Monitoring: Grafana + Prometheus

### Alternativ: Vercel + Neon (PostgreSQL)
- Web Vercel'da, bot — alohida server (Render/Railway)
- Cheaper for low traffic

## Bosqichma-bosqich roadmap

### Faza 1 (MVP, 1-2 oy)
- [x] Auth, dashboard, users, payments, exams, settings
- [x] Telegram bot (asosiy buyruqlar)
- [x] AI imtihon tahlili
- [ ] Excel/Word savol import

### Faza 2 (3-4 oy)
- [ ] Turniket integratsiyasi
- [ ] Click/Payme to'lov
- [ ] CRM (lid'lar)
- [ ] Schedule (dars jadvali)

### Faza 3 (5-6 oy)
- [ ] Filiallar (multi-branch)
- [ ] Sertifikat generator (PDF + QR)
- [ ] Marketing (broadcast)
- [ ] Mobil ilovalar (React Native)

### Faza 4 (kelajak)
- [ ] White-label (har markazga o'z brendi)
- [ ] Public API + webhook'lar
- [ ] Analytics dashboard SUPER_ADMIN uchun
- [ ] Tashqi xizmat marketplace
