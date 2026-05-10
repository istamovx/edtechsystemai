# Coursue — GitHub'ga birinchi push uchun PowerShell skripti
# Ishga tushirish: PowerShell'ni loyiha papkasida oching va kiriting:
#   .\scripts\init-github.ps1

$ErrorActionPreference = "Stop"

$repo = "https://github.com/istamovx/edtechsystemai.git"

Write-Host "🚀 Coursue — GitHub initsializatsiya" -ForegroundColor Magenta
Write-Host ""

# 1. Eski .git tozalash (agar bo'lsa va yaroqsiz bo'lsa)
if (Test-Path ".git") {
    $confirm = Read-Host "⚠️  Mavjud .git papkasi topildi. O'chirib qayta boshlaymizmi? (y/N)"
    if ($confirm -eq "y" -or $confirm -eq "Y") {
        Remove-Item -Recurse -Force .git
        Write-Host "✓ Eski .git o'chirildi" -ForegroundColor Yellow
    }
}

# 2. Git init
git init -q
git branch -M main
Write-Host "✓ Git initsializatsiya qilindi (branch: main)" -ForegroundColor Green

# 3. Foydalanuvchi nomini sozlash (agar yo'q bo'lsa)
$userEmail = git config user.email 2>$null
if (-not $userEmail) {
    git config user.email "designerwebapk@gmail.com"
    git config user.name "Xurshid"
    Write-Host "✓ Git foydalanuvchi sozlandi" -ForegroundColor Green
}

# 4. .env xavfsizlik tekshirovi
$staged = git status --porcelain | Select-String -Pattern "\.env$"
if ($staged) {
    Write-Host "❌ XATOLIK: .env fayli git'ga qo'shilmoqda! .gitignore tekshiring" -ForegroundColor Red
    exit 1
}

# 5. Add + commit
git add .
$envIgnored = git check-ignore .env 2>$null
if ($envIgnored) {
    Write-Host "✓ .env xavfsiz (gitignored)" -ForegroundColor Green
} else {
    Write-Host "⚠️  .env gitignored emas! Yarating yoki tekshiring" -ForegroundColor Yellow
}

git commit -m "feat: initial commit — Coursue EdTech AI Platform`n`nMulti-tenant SaaS platforma o'quv markazlari uchun:`n- Next.js 14 + Prisma + PostgreSQL`n- AI imtihon tahlili (Anthropic Claude)`n- Telegram bot integratsiyasi`n- Turniket/davomat moduli`n- 15 ta yoqib/o'chirish mumkin bo'lgan modul`n- Render.com avto-deploy"

Write-Host "✓ Birinchi commit yaratildi" -ForegroundColor Green

# 6. Remote qo'shish
$existing = git remote get-url origin 2>$null
if ($existing) {
    Write-Host "ℹ Remote allaqachon mavjud: $existing" -ForegroundColor Cyan
} else {
    git remote add origin $repo
    Write-Host "✓ Remote bog'landi: $repo" -ForegroundColor Green
}

# 7. Push
Write-Host ""
Write-Host "🚀 GitHub'ga push qilinmoqda..." -ForegroundColor Magenta
Write-Host "   (parol so'ralsa, GitHub Personal Access Token kiriting)" -ForegroundColor Yellow
Write-Host ""

git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ MUVAFFAQIYAT!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Keyingi qadam:" -ForegroundColor Cyan
    Write-Host "  1. https://render.com → New + → Blueprint"
    Write-Host "  2. Repository: istamovx/edtechsystemai"
    Write-Host "  3. Render avtomatik render.yaml ni o'qiydi va 3 ta servis yaratadi"
    Write-Host "  4. ANTHROPIC_API_KEY va TELEGRAM_BOT_TOKEN ni qo'shing"
    Write-Host ""
    Write-Host "Keyingi push'lar:" -ForegroundColor Cyan
    Write-Host "  npm run push                 # avtomatik commit xabari"
    Write-Host "  npm run push -- 'sizning xabar' # qo'lda xabar"
    Write-Host "  npm run watch:push           # avto-watch rejimi"
}
