@echo off
echo ========================================
echo Darevel Spreadsheet - Full Stack Launcher
echo ========================================
echo.
echo This will start BOTH backend and frontend
echo.
echo Opening Backend in new window...
start "Spring Boot Backend" cmd /k "cd backend && mvn spring-boot:run"

timeout /t 5 /nobreak >nul

echo Opening Frontend in new window...
start "Vite Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo Both servers are starting!
echo ========================================
echo.
echo Backend: http://localhost:8080/api
echo Frontend: http://localhost:5173
echo H2 Console: http://localhost:8080/api/h2-console
echo.
echo Wait 30 seconds for backend to fully start,
echo then open http://localhost:5173 in your browser
echo.
echo Close the terminal windows to stop the servers
echo ========================================
