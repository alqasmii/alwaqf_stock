@echo off
echo =======================================
echo    الوقف مسقط – بدء تشغيل المشروع
echo    Al Waqf Muscat – Project Startup
echo =======================================

echo.
echo [1/2] تشغيل الخادم الخلفي (Python FastAPI)...
start "Backend – Al Waqf Muscat" cmd /k "cd /d %~dp0backend && pip install -r requirements.txt -q && uvicorn main:app --reload --port 8000"

timeout /t 4 /nobreak >nul

echo [2/2] تشغيل الواجهة الأمامية (Next.js)...
start "Frontend – Al Waqf Muscat" cmd /k "cd /d %~dp0frontend && npm install && npm run dev"

echo.
echo ✅ تم بدء التشغيل!
echo.
echo الخادم الخلفي: http://localhost:8000
echo الواجهة الأمامية: http://localhost:3000
echo توثيق API:     http://localhost:8000/docs
echo.
pause
