#!/bin/bash
# Coursue — GitHub initsializatsiya (Git Bash / WSL / Linux / Mac)
# Ishga tushirish: bash scripts/init-github.sh

set -e

REPO="https://github.com/istamovx/edtechsystemai.git"

echo -e "\033[35m🚀 Coursue — GitHub initsializatsiya\033[0m\n"

if [ -d ".git" ]; then
  read -p "⚠️  Mavjud .git papkasi topildi. O'chirib qayta boshlaymizmi? (y/N) " confirm
  if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
    rm -rf .git
    echo -e "\033[33m✓ Eski .git o'chirildi\033[0m"
  fi
fi

git init -q
git branch -M main
echo -e "\033[32m✓ Git initsializatsiya qilindi\033[0m"

if [ -z "$(git config user.email)" ]; then
  git config user.email "designerwebapk@gmail.com"
  git config user.name "Xurshid"
fi

git add .

if git check-ignore .env > /dev/null 2>&1; then
  echo -e "\033[32m✓ .env xavfsiz (gitignored)\033[0m"
else
  echo -e "\033[31m⚠️  .env gitignored emas!\033[0m"
fi

git commit -m "feat: initial commit — Coursue EdTech AI Platform

Multi-tenant SaaS platforma o'quv markazlari uchun:
- Next.js 14 + Prisma + PostgreSQL
- AI imtihon tahlili (Anthropic Claude)
- Telegram bot integratsiyasi
- Turniket/davomat moduli
- 15 ta yoqib/o'chirish mumkin bo'lgan modul
- Render.com avto-deploy"

if ! git remote get-url origin > /dev/null 2>&1; then
  git remote add origin "$REPO"
  echo -e "\033[32m✓ Remote bog'landi\033[0m"
fi

echo -e "\n\033[35m🚀 GitHub'ga push qilinmoqda...\033[0m\n"
git push -u origin main

echo -e "\n\033[32m✅ MUVAFFAQIYAT!\033[0m"
echo -e "\033[36mKeyingi qadam: https://render.com → New → Blueprint → istamovx/edtechsystemai\033[0m"
