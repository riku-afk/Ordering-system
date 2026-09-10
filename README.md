# Ordering System

A small full-stack restaurant ordering system built as a portfolio project. See [CLAUDE.md](./CLAUDE.md) for the full project brief, scope, and conventions.

## Stack

- **Backend**: Java 17, Spring Boot 4, Spring Web, Spring Data JPA, Spring Security, JWT, PostgreSQL, Flyway, Bean Validation, springdoc-openapi
- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, TanStack Query, React Hook Form, Zod

## Project Structure

```
OrderingSystem/
├── Backend/    # Spring Boot REST API (modular monolith)
├── Frontend/   # Next.js application
├── docker-compose.yml   # Local PostgreSQL
└── CLAUDE.md   # Project context and conventions
```

## Getting Started

### 1. Database

Copy `.env.example` to `.env` and adjust values if needed, then start PostgreSQL:

```bash
docker compose up -d
```

### 2. Backend

```bash
cd Backend
./mvnw spring-boot:run
```

API runs at `http://localhost:8080`. Swagger UI is available at `http://localhost:8080/swagger-ui.html`.

### 3. Frontend

```bash
cd Frontend
npm install
npm run dev
```

App runs at `http://localhost:3000`.
