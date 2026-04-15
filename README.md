# Buckeye Marketplace (Had to use git force as of 4/15/2026)

Full-stack marketplace app with a React + TypeScript frontend and ASP.NET Core Web API backend.

## Tech Stack

- Frontend: React 19 + TypeScript + Vite
- Backend: ASP.NET Core Web API (.NET 8)
- Data: EF Core (SQLite runtime DB, InMemory used in tests)
- Auth: JWT bearer tokens

## Prerequisites

- .NET SDK 8.x
- Node.js 20+
- npm

## Backend Setup

From the workspace root:

```powershell
cd backend
dotnet restore
```

Set JWT secret using either user secrets (recommended for local dev) or environment variable.

Option A: User Secrets

```powershell
dotnet user-secrets set "Jwt:SigningKey" "replace-with-a-long-random-secret"
```

Option B: Environment Variable

```powershell
$env:JWT_SIGNING_KEY="replace-with-a-long-random-secret"
```

Run backend:

```powershell
dotnet run
```

Default local API URL is typically:

- `http://localhost:5228`
- Swagger UI: `http://localhost:5228/swagger`

## Frontend Setup

From the workspace root:

```powershell
cd frontend
npm install
npm run dev
```

Frontend runs at:

- `http://localhost:5173`
- `http://127.0.0.1:5173`

Vite dev server proxies `/api/*` calls to backend `http://localhost:5228`.

## Test Credentials

There are no hardcoded seeded login users in the running app.
Create a test user via register, then log in with the same credentials.

Recommended test credentials:

- Username: `student1`
- Password: `StrongPass123!`

You can create this user in the UI or API:

```http
POST /api/auth/register
{
  "username": "student1",
  "password": "StrongPass123!"
}
```

## Run Tests

Backend tests:

```powershell
cd backend.Tests
dotnet test
```

Frontend tests:

```powershell
cd frontend
npm test
```

## Security Checklist Notes (Week 13)

- User identity for protected cart operations is read from JWT `NameIdentifier` claim.
- JWT signing key is loaded from user secrets or environment config, not appsettings JSON.
- CORS policy allows local frontend dev origins for both `localhost` and `127.0.0.1` on port `5173`.
- No raw SQL string concatenation is used in backend code.
- No `dangerouslySetInnerHTML` usage exists in frontend source.
- Admin role claims are included in issued JWTs and are ready for role-based endpoint protection as admin endpoints are added.

# 4/15/2026

review ai-usuage-log.md for AI usage for AI-Assisted Security, QA & Testing Workshop
