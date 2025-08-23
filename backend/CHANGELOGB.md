# Backend Development Progress

## Current Version (v0.1.0)

### Authentication ✅

- User registration
- Login system
- Password reset
- JWT implementation
- Auth middleware
- Test coverage complete

### Clients Module ✅

- CRUD operations
- API routes (/api/clients)
- Test coverage
- User-client relationships
- Authorization

### Infrastructure ✅

- PostgreSQL setup
- Prisma ORM
- Project structure
- Error handling
- Logging system
- Test environment

## Next Steps (v0.2.0)

### Products Module (Next Priority)

- [ ] Database model
- [ ] CRUD API
- [ ] Tests
- [ ] Validation
- [ ] Stock tracking

### Sales Module (Planned)

- [ ] Database model
- [ ] CRUD API
- [ ] Client relationships
- [ ] Tests
- [ ] Reports

### Technical Tasks

- [ ] API documentation
- [ ] Performance optimization
- [ ] Security enhancements

# Changelog

All notable changes to the LEANID SOLAR project will be documented in this file.

## [Unreleased]

### Added
- 2025-02-28: Created test schema `schema.test.prisma` for isolated testing, configured tests to use `.env.test` with test database `solartest`.
- 2025-02-28: Restored cleanup of `clients` table in tests after syncing test database with all required tables (`users`, `clients`, `sales`, `purchases`, `doc_settlement`, etc.).

### Changed
- 2025-02-28: Updated `setup.js` to load `.env.test` and use test-specific Prisma client from `prisma/generated/test`.

### Fixed
- 2025-02-28: Resolved `PrismaClientKnownRequestError` by ensuring test database has all necessary tables.
### Changed
- 2025-02-28: Updated test database to solar_eat1_test_tdjt with new credentials, applied migrations, and ensured tests pass in GitHub Actions.
### Changed
- 2025-02-28: Replaced test database with solar_eat1_test_tdjt, updated GitHub Secrets with new DATABASE_URL, and removed .env.test from local tracking.
### Added
- 2025-03-01: Deployed frontend npmfr-frontend on Render in project Solar.
- 2025-03-01: Deployed backend on Vercel with integration to Render databases.
### Deployed backend frontend
- 2025-03-01: Deployed backend frontend on Render in project Solar.
### Added
- 2025-03-01: Corrected service names to npmbk (backend) and npmfr (frontend) in Render.
### Fixed
- 2025-03-01: Fixed EJSONPARSE error in b/package.json by adding missing closing brace and removing extra comma.
### Added
- 2025-03-01: Created new migration to add purchases table to test database.
### Added
- 2025-03-01: Created new migration to add purchases table to test database.
### Fixed
- 2025-03-01: Updated deploy.yml to use DATABASE_URL_TEST_VERCEL for tests.
### Fixed
- 2025-03-02: Updated authController.js to use users_t model for tests, fixing failing registration in tests.
### Fixed
- 2025-03-02: Fixed Prisma Client import path in tests to resolve module not found error.
### Fixed
- 2025-03-02: Fixed authController.js to correctly select Prisma Client for test and prod environments, resolving undefined findUnique error.
### Fixed
- 2025-03-02: Fixed Prisma Client import path in authController.js using path.resolve to resolve module not found error.
### Fixed
- 2025-03-02: Fixed authController.js to dynamically select users/users_t model based on environment, resolving undefined findUnique error.
### Fixed
- 2025-03-02: Updated tests to use test schema Prisma Client from prisma/generated/test, resolving module not found error.
### Fixed
- 2025-03-02: Replaced schema.test.prisma with schema_t.prisma and updated all files to use only test schema, resolving module not found errors.
### Fixed
- 2025-03-02: Updated clientsRoutes.js to use test schema Prisma Client, resolving module not found error.
### Fixed
- 2025-03-02: Fixed DATABASE_URL_TEST_VERCEL not found error by ensuring it is set in .env.test and GitHub Actions.
### Fixed
- 2025-03-02: Updated schema_t.prisma to use camelCase model names (usersT, clientsT) and fixed cleanup order in tests.
### Fixed
- 2025-03-02: Applied migration to sync schema_t.prisma with test database and verified tables in Prisma Studio.
### Fixed
- 2025-03-02: Fixed 404 error on frontend by setting VITE_API_URL to point to the backend on Render.
### Fixed
- 2025-03-02: Added express to dependencies in b/package.json to fix MODULE_NOT_FOUND error during deployment.
### Fixed
- 2025-03-02: Verified admin users in both test and main databases via Prisma Studio and tested login functionality.
### Fixed
- 2025-03-02: Fixed 404 error on login by reconfiguring VITE_API_URL for consistent API requests.
### Fixed
- 2025-03-02: Fixed useNavigate из react-router-dom

