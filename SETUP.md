# Darevel AI Spreadsheet - Setup Guide

## Phase 5: Backend Integration with Spring Boot

This guide will help you set up and run the full-stack AI-powered spreadsheet application with authentication and cloud sync.

## Prerequisites

### Backend
- Java 17 or higher
- Maven 3.6+

### Frontend
- Node.js 16+ and npm
- Modern web browser

## Installation

### 1. Install Dependencies

#### Frontend
```bash
npm install
```

This will install:
- React 19.2.0
- Axios (for HTTP requests)
- xlsx (Excel file support)
- hot-formula-parser (spreadsheet formulas)
- use-undo (undo/redo functionality)
- TypeScript and Vite

#### Backend
```bash
cd backend
mvn clean install
```

## Running the Application

### Step 1: Start the Backend Server

```bash
cd backend
mvn spring-boot:run
```

The backend will start on `http://localhost:8080/api`

**H2 Database Console** (for development):
- URL: `http://localhost:8080/api/h2-console`
- JDBC URL: `jdbc:h2:mem:spreadsheetdb`
- Username: `sa`
- Password: (leave empty)

### Step 2: Start the Frontend Dev Server

In a new terminal:

```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

### Step 3: Use the Application

1. **Create an Account**
   - Click "Sign up" on the login page
   - Enter username, email, and password
   - Click "Sign Up"

2. **Login**
   - Enter your credentials
   - Click "Login"

3. **Use the Spreadsheet**
   - The spreadsheet will auto-save to the cloud every 30 seconds
   - Watch for "Syncing..." status in the header
   - Your username and logout button appear in the top right

4. **Save and Load Sheets**
   - Click "File" > "Save Version" to manually save
   - Click "File" > "Load from Cloud" to see all your sheets
   - Click on any sheet to load it

## Features

### Authentication
- ✅ JWT-based secure authentication
- ✅ User registration and login
- ✅ Protected routes

### Cloud Sync
- ✅ Auto-save every 30 seconds
- ✅ Manual save versions
- ✅ Load sheets from cloud
- ✅ Delete sheets
- ✅ Per-user sheet ownership

### Spreadsheet Features
- ✅ Excel-like UI with formulas
- ✅ Cell formatting (bold, italic, colors, alignment)
- ✅ Merge cells
- ✅ Undo/redo
- ✅ Dark/light theme
- ✅ Zoom control (50-200%)
- ✅ AI data generation (Ollama integration)
- ✅ Export to Excel, CSV, JSON
- ✅ Import from Excel, CSV, JSON
- ✅ Version history (local)

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info

### Sheets (All require authentication)
- `POST /api/sheets/save` - Create new sheet
- `PUT /api/sheets/{id}` - Update existing sheet
- `GET /api/sheets/load` - Get all user's sheets
- `GET /api/sheets/{id}` - Get specific sheet
- `DELETE /api/sheets/{id}` - Delete sheet

## Configuration

### Backend Configuration

Edit `backend/src/main/resources/application.properties`:

```properties
# Server port
server.port=8080

# JWT secret (change in production!)
jwt.secret=your-secret-key-change-this-in-production-min-256-bits-long
jwt.expiration=86400000

# CORS allowed origins
cors.allowed-origins=http://localhost:5173,http://localhost:3000
```

### Frontend Configuration

Edit `services/authService.ts` and `services/apiService.ts` to change API URL:

```typescript
const API_URL = 'http://localhost:8080/api/auth/';
```

## Production Deployment

### Backend

1. Update `application.properties` for production:
   - Change `jwt.secret` to a secure 256-bit key
   - Configure PostgreSQL database
   - Update CORS origins to your production domain

2. Build JAR:
```bash
cd backend
mvn clean package
java -jar target/spreadsheet-backend-1.0.0.jar
```

### Frontend

1. Update API URLs in services to production backend URL

2. Build:
```bash
npm run build
```

3. Deploy `dist/` folder to static hosting (Vercel, Netlify, etc.)

## Troubleshooting

### Backend Issues

**Port 8080 already in use:**
- Change port in `application.properties`

**Database errors:**
- Check H2 console for data
- Clear database by restarting server (H2 in-memory DB)

### Frontend Issues

**Cannot connect to backend:**
- Ensure backend is running on port 8080
- Check CORS configuration
- Verify API URLs in service files

**Login fails:**
- Create a new account
- Check browser console for errors
- Verify backend is running

**Sheets not syncing:**
- Check "Syncing..." status appears
- Look for errors in browser console
- Verify authentication token is valid

## Architecture

```
┌─────────────────────────────────────────┐
│         React Frontend (Vite)           │
│  - Authentication UI                    │
│  - Spreadsheet Components               │
│  - Auto-sync every 30s                  │
│  - JWT token storage                    │
└──────────────┬──────────────────────────┘
               │ HTTP + JWT
               │
┌──────────────▼──────────────────────────┐
│      Spring Boot Backend (8080)         │
│  - JWT Authentication                   │
│  - REST API                             │
│  - User Management                      │
│  - Sheet CRUD                           │
└──────────────┬──────────────────────────┘
               │
               │
┌──────────────▼──────────────────────────┐
│      H2 Database (In-Memory)            │
│  - Users table                          │
│  - Sheets table                         │
│  (or PostgreSQL for production)         │
└─────────────────────────────────────────┘
```

## Development Tips

1. **Use H2 Console** to inspect database during development
2. **Check browser DevTools** Network tab for API requests
3. **Backend logs** show detailed Spring Security and JPA activity
4. **Auto-sync can be adjusted** in App.tsx (currently 30 seconds)
5. **Test with multiple users** by using different browsers/incognito mode

## Next Steps

- Configure production database (PostgreSQL)
- Add email verification
- Implement password reset
- Add sheet sharing between users
- Add real-time collaboration (WebSockets)
- Implement role-based access control
- Add API rate limiting

## Support

For issues and questions:
- Check browser console for errors
- Check backend logs for API errors
- Verify all services are running
- Check network requests in DevTools
