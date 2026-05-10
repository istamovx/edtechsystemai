# Coursue — EdTech AI Platform for O'quv Markazlari

O'zbekistondagi o'quv markazlari uchun multi-tenant SaaS platforma. Sun'iy intellekt yordamida imtihon tahlili, davomat nazorati, to'lov va hisobotlar boshqaruvi.

## Texnologiyalar

- **Frontend/Backend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** NextAuth.js (credentials + Telegram)
- **AI:** Anthropic Claude API (savol tahlili va tavsiyalar)
- **Telegram Bot:** Node.js + Telegraf
- **Multi-tenancy:** Single DB + `tenantId` strategiyasi
- **Real-time:** Socket.io (turniket integratsiyasi)
- **File storage:** S3-compatible (MinIO yoki Cloudflare R2)

## Loyiha tuzilishi

```
.
├── prisma/
│   └── schema.prisma          # Ma'lumotlar bazasi sxemasi (multi-tenant)
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (auth)/            # Login, ro'yxatdan o'tish
│   │   ├── (dashboard)/       # Asosiy panel sahifalari
│   │   └── api/               # REST/Server actions API
│   ├── components/            # React komponentlar
│   ├── lib/                   # Yordamchi funksiyalar (prisma, auth, ai)
│   └── types/                 # TypeScript tiplari
├── telegram-bot/              # Alohida Telegram bot servisi
└── docs/                      # Hujjatlar (arxitektura, API)
```

## Modullar (yoqib/o'chirish mumkin)

Har bir o'quv markazi uchun `Tenant.enabledModules` orqali boshqariladi:

| Modul | Tavsifi |
|-------|---------|
| `dashboard` | Statistika, qisqacha ko'rinish |
| `users` | O'quvchi, o'qituvchi, mentor, xodim, ota-ona |
| `attendance` | Davomat (qo'lda + turniket integratsiya) |
| `payments` | To'lov, qarzdorlik, hisobotlar |
| `exams` | Imtihon yaratish, AI tahlil |
| `crm` | Lid'lar, sotuv voronkasi |
| `schedule` | Dars jadvali |
| `homework` | Uy vazifalari |
| `salary` | O'qituvchi maoshlari |
| `marketing` | SMS / Telegram broadcast |
| `certificates` | Avtomatik sertifikat generatsiyasi |
| `branches` | Filiallar (multi-branch) |
| `gamification` | Reyting, badge'lar |
| `reports` | Kengaytirilgan hisobotlar |
| `audit` | Kim nima o'zgartirgani logi |

## O'rnatish

```bash
# 1. Bog'liqliklarni o'rnatish
npm install

# 2. .env faylini sozlash
cp .env.example .env
# DATABASE_URL, NEXTAUTH_SECRET, ANTHROPIC_API_KEY, TELEGRAM_BOT_TOKEN ni to'ldiring

# 3. Bazani migratsiya qilish
npx prisma migrate dev --name init
npx prisma db seed

# 4. Dev serverni ishga tushirish
npm run dev

# 5. Telegram botni alohida ishga tushirish
cd telegram-bot && npm install && npm start
```

## Foydalanuvchi rollari

- **SUPER_ADMIN** — platforma egasi (siz). Barcha tenant'larni boshqaradi, obunalarni nazorat qiladi.
- **TENANT_OWNER** — o'quv markazi egasi. O'z markazidagi barcha modullarni boshqaradi.
- **ADMIN** — markaz administratori (xodim).
- **TEACHER** — o'qituvchi.
- **MENTOR** — mentor (kuratorlik).
- **STUDENT** — o'quvchi.
- **PARENT** — ota-ona (faqat o'z bolasini ko'radi).

## Asosiy xususiyatlar

### Imtihon moduli + AI
- Fanlar bo'yicha savol bazasi (Ona-tili, Adabiyot, Tarix, Rus tili, Ingliz tili, Fizika, Matematika, Kimyo, Biologiya).
- Formula muharriri (KaTeX/MathLive).
- Excel/Word'dan import.
- AI (Claude) o'quvchi natijalarini tahlil qiladi:
  - Qaysi mavzular zaif
  - Xato javoblarning to'g'ri yechimi va tushuntirishi
  - Mos universitet va fakultetlar tavsiyasi (DTM ballari bo'yicha)

### Davomat + turniket
- RFID / QR turniket bilan integratsiya (HTTP webhook yoki MQTT).
- Real-time kirish/chiqish vaqtlari.
- Ota-onalarga avtomatik Telegram xabari.

### To'lov hisobotlari
- O'quvchi profilida: F.I.Sh, telefon, Telegram ID, tanlagan universitet/fakultet, to'lov va qarzdorlik.
- Click/Payme integratsiyasi (kelajakda).

### Telegram bot
- Test havolalari, login/parol yuborish.
- Tasdiqlash kodlari.
- E'lon va yangiliklar broadcast.
- Ota-onalarga davomat xabarlari.

## Litsenziya

Mualliflik huquqi himoyalangan. Ishlab chiquvchi: Xurshid.
