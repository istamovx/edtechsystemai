@echo off
cd /d "%~dp0"
chcp 65001 >nul

echo Push qilinmoqda...
git add .
git commit -m "feat: students module - full CRUD with real DB, validation, audit log, dashboard with real stats"
git push origin main

if errorlevel 1 (
    echo Push xato!
    pause
    exit /b 1
)

echo MUVAFFAQIYAT! Render avtomatik qayta deploy boshlaydi.
pause
