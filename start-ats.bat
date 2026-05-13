@echo off
title ATS Portal Launcher
color 0A

echo.
echo  ==========================================
echo       ATS Portal ^| Multi-Branch Recruitment
echo  ==========================================
echo.

:: Check if seed is needed (first run)
set SEED_FLAG=%~dp0.seeded
if not exist "%SEED_FLAG%" (
    echo  [SEED] First run detected — seeding database...
    echo  (This only runs once)
    echo.
    pushd "%~dp0mini-services\ats-backend"
    node seed.js
    if errorlevel 1 (
        echo.
        echo  [!] Seed failed. Check MongoDB Atlas IP whitelist.
        echo  Go to: https://cloud.mongodb.com ^> Network Access ^> Add IP Address
        echo.
        pause
        exit /b 1
    )
    popd
    echo. > "%SEED_FLAG%"
    echo  [OK] Database seeded successfully.
    echo.
)

:: Start backend
echo  [1/2] Starting Backend on port 5000...
start "ATS Backend — Port 5000" /D "%~dp0mini-services\ats-backend" cmd /k "color 0B && echo  ATS Backend starting... && node index.js"

:: Brief pause so backend starts first
timeout /t 3 /nobreak > nul

:: Start frontend
echo  [2/2] Starting Frontend on port 3000...
start "ATS Frontend — Port 3000" /D "%~dp0" cmd /k "color 0E && echo  ATS Frontend starting... && npm run dev"

echo.
echo  ==========================================
echo   Services launched in separate windows.
echo.
echo   Frontend  →  http://localhost:3000
echo   Backend   →  http://localhost:5000
echo.
echo   Admin      →  admin@ats.com / admin123
echo   Candidate  →  ali@example.com / candidate123
echo  ==========================================
echo.
echo  Browser will open in 8 seconds...
timeout /t 8 /nobreak > nul
start http://localhost:3000
exit
