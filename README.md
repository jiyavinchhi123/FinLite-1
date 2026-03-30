# FinLite-1

# Smart Business Finance Manager

Beginner-friendly, AI-assisted accounting for business owners who do not know accounting terms. The UI uses simple language like Money In, Money Out, and Business Money.

## Tech Stack
- Frontend: React + HTML + CSS + JavaScript
- Backend: Java Spring Boot REST API
- Database: Supabase (PostgreSQL)
- AI Service: Python FastAPI (Smart Entry)

## Project Structure
```
smart-finance-manager/
├── frontend/
├── backend/
│   └── springboot-api/
├── ai-service/
└── database/
```

## Key Features
- Money In / Money Out tracking
- Smart Entry (text -> category, amount, payment mode, pending)
- Customers and Suppliers management
- Business Dashboard with charts and predictions
- Download Balance Sheet (PDF/XLSX) and Complete Report (PDF)
- Company-based data isolation using companyId

## Run Locally

### 1) Backend API (Spring Boot)
```
cd backend/springboot-api
mvn spring-boot:run
```
Default: http://localhost:8080

### 2) AI Service (FastAPI)
```
cd ai-service
python -m venv .venv
.\.venv\Scripts\activate
pip install fastapi uvicorn pillow pytesseract python-multipart
uvicorn main:app --reload --port 8000
```
Default: http://127.0.0.1:8000

### 3) Frontend (React)
```
cd frontend
npm install
npm start
```
Default: http://localhost:3000

### Quick Start (All services)
Open three terminals and run:
```
cd backend/springboot-api
mvn spring-boot:run
```
```
cd ai-service
python -m venv .venv
.\.venv\Scripts\activate
pip install fastapi uvicorn pillow pytesseract python-multipart
uvicorn main:app --reload --port 8000
```
```
cd frontend
npm install
npm start
```

## Configuration

### Supabase (backend)
Update `backend/springboot-api/src/main/resources/application.properties` with your Supabase connection:
```
spring.datasource.url=jdbc:postgresql://<host>:5432/postgres?sslmode=require
spring.datasource.username=postgres
spring.datasource.password=<your-password>
```

### Frontend
No special env vars required for local dev. The API base is `http://localhost:8080/api` in `frontend/src/services/api.js`.

## Expected First-Time Flow
1. Register
2. Login
3. Create Company page opens
4. Dashboard loads after company setup

## Common Issues

**Create Company does not appear**
- Log out and log in again.
- Ensure backend is running.
- If needed, clear `localStorage` and re-login.

**Data from other accounts is visible**
- Ensure backend is restarted after adding companyId fields.
- Make sure entries are created after the update so companyId is saved.

**Maven error: No plugin found**
Run Maven inside `backend/springboot-api` where the `pom.xml` exists.

**Database connection errors**
Verify Supabase connection details in `application.properties`.

**React blank screen**
Run `npm install` inside `frontend` and restart `npm start`.

## Deployment Notes
- Do not upload `node_modules`.
- Use `npm run build` and deploy the `frontend/build` folder.
- Configure environment variables on your host as needed.
