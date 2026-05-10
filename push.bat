@echo off
cd /d "%~dp0"
chcp 65001 >nul

echo Push qilinmoqda...
git add .
git commit -m "fix: use prisma db push and run seed on startup - no migrations folder"
git push origin main

if errorlevel 1 (
    echo Push xato!
    pause
    exit /b 1
)

echo MUVAFFAQIYAT! Render avtomatik qayta deploy boshlaydi.
pause
