@echo off
cd /d "%~dp0"
chcp 65001 >nul

echo Push qilinmoqda...
git add .
git commit -m "fix: Render free plan'ga moslashtirish - bot web service, build optimization"
git push origin main

if errorlevel 1 (
    echo Push xato!
    pause
    exit /b 1
)

echo MUVAFFAQIYAT! Render avtomatik qayta deploy boshlaydi.
echo https://dashboard.render.com
pause
