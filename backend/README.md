# Darevel Spreadsheet Backend

Spring Boot backend for the AI-powered spreadsheet application.

## Features

- JWT-based authentication
- User registration and login
- Sheet CRUD operations with ownership
- Auto-save support
- H2 in-memory database (development)
- PostgreSQL support (production)

## Prerequisites

- Java 17 or higher
- Maven 3.6+

## Running the Application

```bash
cd backend
mvn spring-boot:run
```

The server will start on `http://localhost:8080/api`

## H2 Console

Access the H2 database console at: `http://localhost:8080/api/h2-console`

- JDBC URL: `jdbc:h2:mem:spreadsheetdb`
- Username: `sa`
- Password: (leave empty)

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Sheets

All sheet endpoints require authentication (Bearer token)

- `POST /api/sheets/save` - Save new sheet
- `PUT /api/sheets/{id}` - Update existing sheet
- `GET /api/sheets/load` - Get all user's sheets
- `GET /api/sheets/{id}` - Get specific sheet
- `DELETE /api/sheets/{id}` - Delete sheet

## Building for Production

```bash
mvn clean package
java -jar target/spreadsheet-backend-1.0.0.jar
```

## Configuration

Edit `src/main/resources/application.properties` to configure:

- Server port
- Database connection
- JWT secret and expiration
- CORS allowed origins
