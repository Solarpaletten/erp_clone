# 🚀 SOLAR Backend Architecture README

## ✨ Overview
SOLAR's backend is a modular, TypeScript-based system designed for scalability, clarity, and real-time business operations. This document outlines the architecture, design principles, and core components to onboard engineers and contributors.

---

## 🧩 1. High-Level Structure

```
📦 b
├── prisma
│   ├── schema.prisma          // Main schema
│   ├── schema_t.prisma        // Test schema
│   ├── migrations/            // Current migration history
│   └── migrations_archive/    // Archived migrations
├── src
│   ├── controllers/           // Route handlers
│   ├── routes/                // API route definitions
│   ├── services/              // Business logic modules
│   └── utils/                 // Helpers, validators
├── tests
│   ├── integration/           // Full-stack integration tests
│   └── mockApp.js             // Express app for test env
├── .env / .env.test           // Environment configs
└── ...
```

---

## 🧠 2. Prisma Data Layer

- `schema.prisma`: Defines production database models
- `schema_t.prisma`: Used for isolated test environments
- Enum strategy: Role-based access (`UserRole`, `ClientRole`), lifecycle enums (`Status`, `Currency`, etc.)
- Migration rules:
  - Only keep active schema changes in `/migrations`
  - Move legacy/failed migrations to `/migrations_archive`
- Reset policy (CI): Use `db push --force-reset` for clean test setup

---

## 🔀 3. Routing & Controllers

- Routes live in `routes/` (e.g., `clients.js`, `sales.js`)
- Logic is handled by matching controllers in `controllers/`
- Middleware handles auth, logging, validation

Example structure:
```
routes/clients.js → controllers/clientsController.js
```

---

## 🛡 4. Modular Service Design

Each domain (e.g., sales, purchases, assistant) has its own controller, service layer, and test suite. Principles followed:

- **Separation of concerns**
- **Clear responsibility boundaries**
- **Reusable helper modules**

---

## 🌐 5. External Integration

- **Frontend:** Connected via RESTful API (Vite + React frontend)
- **OpenAI / Whisper:** Used for assistant module
- **Render CI/CD:** For deployment and test pipelines

---

## 🧪 6. Testing & CI/CD

- Test schema (`schema_t.prisma`) and dedicated test DB
- Integration tests written in Jest using `supertest`
- GitHub Actions (`deploy.yml`):
  - Build → Test → Deploy
  - Environment-specific secrets

---

## ⚙️ 7. Local Development Guide

### Recommended shell: `zsh`
- More compatible with aliases, autocomplete, and scripts

### Key commands:
```
cd ./b
npx prisma migrate dev --name init --schema=prisma/schema.prisma
npx prisma generate
npm run dev
```

### Notes:
- Use `.env` for development DB
- Avoid `prisma migrate dev` in CI — use `db push` instead

---

## 🧽 Conclusion
This backend is designed for clarity, performance, and future growth. Every module tells a story — now documented for the crew.

Feel free to expand this file as modules evolve. SOLAR thrives on transparency and shared understanding. 🚀