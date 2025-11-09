@echo off
echo ========================================
echo Darevel Spreadsheet Backend Launcher
echo ========================================
echo.

REM Check if Java is installed
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Java is not installed or not in PATH
    echo.
    echo Please install Java 17+ from: https://adoptium.net/temurin/releases/
    echo.
    pause
    exit /b 1
)

REM Check if Maven is installed
mvn -version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Maven is not installed or not in PATH
    echo.
    echo Please install Maven from: https://maven.apache.org/download.cgi
    echo Or use Chocolatey: choco install maven
    echo.
    pause
    exit /b 1
)

echo Java and Maven are installed!
echo.
echo Starting Spring Boot backend...
echo This may take 2-3 minutes on first run to download dependencies.
echo.
echo Backend will run on: http://localhost:8080/api
echo H2 Console available at: http://localhost:8080/api/h2-console
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

cd backend
mvn spring-boot:run
