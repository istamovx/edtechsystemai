# Coursue — O'rnatish va ishga tushirish qo'llanmasi

## 1. Talablar

- **Node.js** ≥ 20
- **PostgreSQL** ≥ 14 (mahalliy yoki Docker)
- **Anthropic API key** (AI tahlil uchun) — https://console.anthropic.com
- **Telegram bot token** — [@BotFather](https://t.me/BotFather)

## 2. Loyihani sozlash

```bash
# Bog'liqliklarni o'rnatish
npm install

# Telegram bot uchun ham
cd telegram-bot && npm install && cd ..
```

## 3. Ma'lumotlar bazasini sozlash

### Variant A — Docker bilan (tavsiya)
```bash
docker run -d --name coursue-db \
  -e POSTGRES_PASSWORD=coursue \
  -e POSTGRES_USER=coursue \
  -e POSTGRES_DB=coursue \
  -p 5432:5432 \
  postgres:16
```

`.env` faylida:
```
DATABASE_URL="postgresql://coursue:coursue@localhost:5432/coursue?schema=public"
```

### Variant B — mavjud PostgreSQL
DATABASE_URL ni o'z connection string'ingizga moslashtiring.

## 4. Migratsiya va seed

```bash
# Sxemani DB'ga yuborish
npx prisma migrate dev --name init

# Boshlang'ich ma'lumotlar (super admin + demo markaz + fanlar)
npx prisma db seed
```

Seed yaratadi:
- **Super admin:** `admin@coursue.uz` / `SuperAdmin2026!`
- **Demo markaz egasi:** `owner@demo.uz` / `Owner2026!`

## 5. Ishga tushirish

### Web app
```bash
npm run dev
```
→ http://localhost:3000

### Telegram bot (alohida terminal)
```bash
cd telegram-bot
npm start
```
Bot Internal API: http://localhost:4000

## 6. Kirish

1. http://localhost:3000/login ga o'ting
2. `owner@demo.uz` / `Owner2026!` bilan kiring
3. Dashboard ko'rinadi

## 7. Productionga deploy

### Docker compose (tavsiya)
```yaml
# docker-compose.yml namunasi
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: coursue
      POSTGRES_USER: coursue
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data

  web:
    build: .
    environment:
      DATABASE_URL: postgresql://coursue:${DB_PASSWORD}@postgres:5432/coursue
      NEXTAUTH_URL: https://coursue.uz
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
      ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}
    ports: ["3000:3000"]
    depends_on: [postgres]

  bot:
    build: ./telegram-bot
    environment:
      TELEGRAM_BOT_TOKEN: ${TELEGRAM_BOT_TOKEN}
      DATABASE_URL: postgresql://coursue:${DB_PASSWORD}@postgres:5432/coursue
    depends_on: [postgres]

volumes:
  pgdata:
```

### Vercel + Neon (alternativ)
- Web app Vercel'ga deploy
- Database — Neon.tech (free tier)
- Bot — Render/Railway alohida

## 8. Foydali buyruqlar

```bash
npm run dev              # Dev server
npm run build            # Production build
npm run start            # Production server
npm run db:studio        # Prisma Studio (DB ko'rish)
npm run db:migrate       # Migratsiya yaratish
npm run db:seed          # Seed
```

## 9. Loyiha tuzilishi

```
Edtech System AI/
├── README.md                    # Umumiy ma'lumot
├── SETUP.md                     # Bu fayl
├── package.json
├── prisma/
│   ├── schema.prisma            # DB sxemasi
│   └── seed.ts                  # Boshlang'ich ma'lumotlar
├── src/
│   ├── app/
│   │   ├── page.tsx             # Landing
│   │   ├── (auth)/login/        # Login sahifa
│   │   ├── (dashboard)/         # Asosiy panel
│   │   │   ├── dashboard/       # Bosh sahifa
│   │   │   ├── users/           # Foydalanuvchilar tab
│   │   │   ├── payments/        # To'lov hisobotlari
│   │   │   ├── exams/           # Imtihon moduli
│   │   │   ├── reports/         # Hisobotlar
│   │   │   └── settings/        # Sozlamalar
│   │   └── api/
│   │       ├── auth/            # NextAuth
│   │       ├── exams/ai-analyze # AI tahlil endpoint
│   │       └── turnstile/webhook# Turniket webhook
│   ├── components/layout/       # Sidebar, Header
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── auth.ts
│   │   ├── ai.ts                # Claude AI integratsiya
│   │   ├── modules.ts           # Modullar tizimi
│   │   └── utils.ts
│   └── middleware.ts            # Yo'l himoyasi
├── telegram-bot/
│   ├── bot.js                   # Telegraf bot
│   └── package.json
└── docs/
    └── ARCHITECTURE.md
```

## 10. Keyingi qadamlar

1. `.env.example` ni `.env` ga nusxa olib, kalitlarni to'ldiring
2. `npx prisma migrate dev` bilan DB tayyorlang
3. `npm run dev` bilan web ishga tushiring
4. Demo akkaunt bilan kirib, modullarni sinab ko'ring
5. `/settings` sahifasidan modullarni yoqib/o'chirib ko'ring
6. Imtihon yaratib, AI tahlilni sinab ko'ring (haqiqiy Anthropic API key bilan)

## Yordam

Savollar bo'lsa hujjatlarni o'qing:
- `README.md` — umumiy ko'rinish
- `docs/ARCHITECTURE.md` — chuqur arxitektura
- Prisma sxemasi — `prisma/schema.prisma`
