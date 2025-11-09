# Windows Backend Setup Guide

## Quick Setup (For Windows)

### Step 1: Install Java 17+

**Option A - Using Chocolatey (Recommended):**
```powershell
# Open PowerShell as Administrator and run:
choco install openjdk17
```

**Option B - Manual Download:**
1. Go to https://adoptium.net/temurin/releases/
2. Download Java 17 (LTS) for Windows x64
3. Run the installer
4. Check installation:
```bash
java -version
```

### Step 2: Install Maven

**Option A - Using Chocolatey:**
```powershell
# In PowerShell as Administrator:
choco install maven
```

**Option B - Manual Download:**
1. Go to https://maven.apache.org/download.cgi
2. Download `apache-maven-3.9.x-bin.zip`
3. Extract to `C:\Program Files\Apache\maven`
4. Add to PATH:
   - Search "Environment Variables" in Windows
   - Edit "Path" in System Variables
   - Add `C:\Program Files\Apache\maven\bin`
5. Restart terminal and verify:
```bash
mvn -version
```

### Step 3: Navigate to Your Project

```bash
cd C:\Users\acer\Downloads\ai-spreadsheet
```

### Step 4: Copy Backend Files

The backend folder should already be in your project from git. Verify:
```bash
dir backend
```

You should see `pom.xml` and `src` folder.

### Step 5: Run the Backend

```bash
cd backend
mvn spring-boot:run
```

**First run will take 2-3 minutes** to download all dependencies.

You should see:
```
Started SpreadsheetApplication in X.XXX seconds (JVM running for Y.YYY)
```

The backend is now running at: `http://localhost:8080/api`

### Step 6: Test the Backend

Open a new browser tab and go to:
```
http://localhost:8080/api/h2-console
```

You should see the H2 database console!

### Step 7: Return to Frontend and Signup

1. Keep the backend terminal running (don't close it!)
2. Go back to `http://localhost:5173` in your browser
3. Click "Sign Up"
4. Create your account - it should work now!

## Troubleshooting

### "Java not found"
- Make sure Java is installed: `java -version`
- Restart your terminal after installation

### "Maven not found"
- Make sure Maven is in PATH
- Restart terminal after adding to PATH
- Try: `mvn -version`

### Port 8080 already in use
Edit `backend/src/main/resources/application.properties`:
```
server.port=8081
```

Then update frontend API URL in:
- `services/authService.ts` - change to `http://localhost:8081/api/auth/`
- `services/apiService.ts` - change to `http://localhost:8081/api/sheets/`

### Backend crashes or errors
Check that Java 17+ is installed (not Java 8 or 11)

## Quick Commands Reference

**Start Backend:**
```bash
cd C:\Users\acer\Downloads\ai-spreadsheet\backend
mvn spring-boot:run
```

**Start Frontend (separate terminal):**
```bash
cd C:\Users\acer\Downloads\ai-spreadsheet
npm run dev
```

**Both must be running at the same time!**

## What to Expect

When both are running:
- ✅ Backend: `http://localhost:8080/api`
- ✅ Frontend: `http://localhost:5173`
- ✅ H2 Console: `http://localhost:8080/api/h2-console`

The signup/login should work, and sheets will auto-save to the database every 30 seconds!
