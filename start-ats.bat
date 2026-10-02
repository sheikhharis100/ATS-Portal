@echo off
title ATS Portal Launcher
color 0A

echo.
echo  ==========================================
echo       ATS Portal ^| Multi-Branch Recruitment
echo  ==========================================
echo.

set ROOT=%~dp0
set BACKEND=%ROOT%mini-services\ats-backend
set MONGO_HOME=%LOCALAPPDATA%\mongodb
set MONGO_DATA=%LOCALAPPDATA%\mongodb-data

:: ---------------------------------------------------------------------------
:: 0) Local MongoDB
:: ---------------------------------------------------------------------------
:: Only started when a local mongod is present. If .env points at MongoDB
:: Atlas instead, delete the mongodb folder and this step is skipped.
if exist "%MONGO_HOME%\bin\mongod.exe" (
    netstat -ano | findstr /C:"127.0.0.1:27017" | findstr LISTENING >nul 2>&1
    if errorlevel 1 (
        echo  [0/3] Starting local MongoDB on port 27017...
        if not exist "%MONGO_DATA%" mkdir "%MONGO_DATA%"
        start "MongoDB - Port 27017" /MIN "%MONGO_HOME%\bin\mongod.exe" --dbpath "%MONGO_DATA%" --bind_ip 127.0.0.1 --port 27017
        timeout /t 5 /nobreak >nul
    ) else (
        echo  [0/3] MongoDB already running on port 27017.
    )
) else (
    echo  [0/3] No local MongoDB found - assuming .env points at MongoDB Atlas.
)

:: ---------------------------------------------------------------------------
:: 1) Seed the database on first run
:: ---------------------------------------------------------------------------
set SEED_FLAG=%ROOT%.seeded
if not exist "%SEED_FLAG%" (
    echo  [SEED] First run detected - seeding database...
    echo  (This only runs once)
    echo.
    pushd "%BACKEND%"
    call node seed.js
    if errorlevel 1 (
        echo.
        echo  [!] Seed failed. Check that MongoDB is running and MONGO_URI in
        echo      mini-services\ats-backend\.env is correct.
        echo.
        popd
        pause
        exit /b 1
    )
    popd
    echo. > "%SEED_FLAG%"
    echo  [OK] Database seeded successfully.
    echo.
)

:: ---------------------------------------------------------------------------
:: 2) Backend + 3) Frontend
:: ---------------------------------------------------------------------------
echo  [2/3] Starting Backend on port 5000...
start "ATS Backend - Port 5000" /D "%BACKEND%" cmd /k "color 0B && echo  ATS Backend starting... && node index.js"

timeout /t 3 /nobreak >nul

echo  [3/3] Starting Frontend on port 3000...
start "ATS Frontend - Port 3000" /D "%ROOT%" cmd /k "color 0E && echo  ATS Frontend starting... && npm run dev"

echo.
echo  ==========================================
echo   Services launched in separate windows.
echo.
echo   Frontend  -^>  http://localhost:3000
echo   Backend   -^>  http://localhost:5000
echo.
echo   Admin      -^>  admin@ats.com / admin123
echo   Candidate  -^>  ali@example.com / candidate123
echo  ==========================================
echo.
echo  Browser will open in 10 seconds...
timeout /t 10 /nobreak >nul
start http://localhost:3000
exit
