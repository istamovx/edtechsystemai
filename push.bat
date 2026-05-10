@echo off
cd /d "%~dp0"
chcp 65001 >nul

echo Push qilinmoqda...
git add .
git commit -m "feat: rebrand bot messages to Edtech System AI"
git push origin main

if errorlevel 1 (
    echo Push xato!
    pause
    exit /b 1
)

echo MUVAFFAQIYAT! Render avtomatik qayta deploy boshlaydi.
pause
