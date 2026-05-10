@echo off
cd /d "%~dp0"
chcp 65001 >nul

echo Push qilinmoqda...
git add .
git commit -m "fix: dropdown overflow issue - use Radix DropdownMenu with Portal"
git push origin main

if errorlevel 1 (
    echo Push xato!
    pause
    exit /b 1
)

echo MUVAFFAQIYAT! Render avtomatik qayta deploy boshlaydi.
pause
