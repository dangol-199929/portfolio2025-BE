# Portfolio 2025 Backend – Technical Documentation

**Audience:** Backend and DevOps engineers deploying, operating, or extending this service (e.g. on AWS with Docker, HTTPS, Prisma, and CI/CD).

---

## 1. Purpose & Scope

This backend provides a standalone API for the Portfolio 2025 frontend. It replaces the original Next.js file‑based APIs with a dedicated Node.js/Express service and SQLite persistence.

**Core responsibilities:**

- Manage **experiences** and **projects** (CRUD).
- Provide **resume** upload and retrieval.
- Provide **image upload** for project thumbnails.
- Maintain full compatibility with the API contract defined in `api-docs.md`.

This document focuses on:

- Current implementation details (runtime, architecture, data model, APIs).
- Configuration and runtime behavior.
- Extension points for AWS, Docker, HTTPS, Prisma, and GitHub Actions.

---

## 2. Technology Stack

- **Runtime:** Node.js, Express.
- **Language:** TypeScript, compiled to CommonJS targeting ES2020.
- **Database:** SQLite via `better-sqlite3`.
- **Validation:** `zod` for POST/PUT body validation.
- **Uploads:** `multer` for multipart/form-data handling.
- **Configuration:** `.env` via `dotenv`.
- **CORS:** `cors` (currently permissive, suitable for local dev).

---

## 3. Project Structure

Root layout (key elements only):

- `package.json` – Scripts and dependencies.
- `tsconfig.json` – TypeScript compiler configuration.
- `.env` / `.env.example` – Backend environment variables.
- `frontend.env.example` – Example env file for a separate frontend.
- `src/` – TypeScript source code:
  - `server.ts` – Loads environment and starts HTTP server.
  - `app.ts` – Express app (middleware, static, routes, error handler).
  - `db/`
    - `schema.sql` – SQLite schema + initial seed.
    - `index.ts` – DB initialization and export.
  - `routes/`
    - `experiences.routes.ts`
    - `projects.routes.ts`
    - `resume.routes.ts`
    - `upload.routes.ts`
  - `controllers/`
    - `experiences.controller.ts`
    - `projects.controller.ts`
    - `resume.controller.ts`
    - `upload.controller.ts`
  - `middleware/`
    - `validate.ts` – Zod body validation.
    - `errorHandler.ts` – Standardized error responses.
  - `utils/`
    - `index.ts` – Placeholder for shared helpers.
- `dist/` – Compiled JavaScript (build output).
- `data/portfolio.db` – SQLite database file (runtime).
- `resume/` – Uploaded resume PDFs (served via `/resume/...`).
- `uploads/` – Uploaded images (served via `/uploads/...`).

---

## 4. Configuration & Environment

### 4.1 Backend environment (`.env`)

Loaded automatically by `dotenv` in `src/server.ts`.

**Variables:**

- `PORT`
  - Port the HTTP server listens on.
  - Default: `8080`.
- `DATABASE_PATH`
  - Filesystem path for the SQLite database.
  - Default: `./data/portfolio.db`.

Example (`.env.example`):

```bash
PORT=8080
DATABASE_PATH=./data/portfolio.db
```

### 4.2 Frontend integration (`frontend.env.example`)

For a separate frontend (e.g. Next.js), the key variable is:

- `NEXT_PUBLIC_API_URL` – Base URL for this backend, e.g.:
  - `http://localhost:8080` (local dev).
  - `https://api.yourdomain.com` (production over HTTPS).

Example:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
```

---

## 5. Application Bootstrap

### 5.1 `src/server.ts`

- Imports `dotenv/config` to load `.env`.
- Resolves port from `process.env.PORT` or `8080`.
- Starts Express app from `src/app.ts`:
  - `app.listen(PORT, ...)`.

This file is the process entrypoint for:

- `npm run dev` (via `ts-node-dev`).
- `npm start` (compiled: `dist/server.js`).

### 5.2 `src/app.ts`

Configures the Express application:

- **Middleware:**
  - `express.json()` – JSON body parsing.
  - `cors()` – Enables CORS (currently unrestricted).
- **Static file serving:**
  - `/resume` → `<project-root>/resume` (resume PDFs).
  - `/uploads` → `<project-root>/uploads` (uploaded images).
- **Health check:**
  - `GET /health` → `{ "status": "ok" }`.
- **Routers (mounted under `/api`):**
  - `/api/experiences` – Experiences CRUD.
  - `/api/projects` – Projects CRUD.
  - `/api/resume` – Resume upload + get current path.
  - `/api/upload` – Image upload.
- **Error handling:**
  - Global `errorHandler` middleware is registered last.

---

## 6. Database Model

Database is a single SQLite file, opened via `better-sqlite3`.

### 6.1 Initialization (`src/db/index.ts`)

- Resolves DB path:
  - `process.env.DATABASE_PATH` or `./data/portfolio.db`.
- Ensures containing directory exists.
- Opens DB as a long‑lived, process‑wide instance.
- Runs `schema.sql` to ensure all tables exist and seed `settings`.

### 6.2 Schema (`src/db/schema.sql`)

**Table `experiences`**

- `id` TEXT PRIMARY KEY
- `title` TEXT NOT NULL
- `company` TEXT NOT NULL
- `period` TEXT NOT NULL
- `description` TEXT NOT NULL
- `side` TEXT NOT NULL CHECK (`side` IN ('left', 'right'))

**Table `projects`**

- `id` TEXT PRIMARY KEY
- `title` TEXT NOT NULL
- `description` TEXT NOT NULL
- `fullDescription` TEXT NOT NULL
- `image` TEXT NOT NULL
- `tags` TEXT NOT NULL — JSON‑encoded `string[]`.
- `liveUrl` TEXT NOT NULL
- `githubUrl` TEXT NOT NULL
- `metrics` TEXT NOT NULL — JSON‑encoded `string[]`.

**Table `settings`**

- `id` INTEGER PRIMARY KEY CHECK (`id` = 1)
- `resumePath` TEXT NOT NULL DEFAULT `/resume/Resume.pdf`

Seed:

- `INSERT OR IGNORE INTO settings (id, resumePath) VALUES (1, '/resume/Resume.pdf');`

---

## 7. HTTP API Implementation

The API contract (paths, methods, bodies, responses) is defined in `api-docs.md`. The backend strictly follows that document. This section summarizes how each API is implemented internally.

### 7.1 Experiences – `/api/experiences`

- **Router:** `src/routes/experiences.routes.ts`
- **Controller:** `src/controllers/experiences.controller.ts`
- **Type:** `Experience`:
  - `id: string`
  - `title: string`
  - `company: string`
  - `period: string`
  - `description: string`
  - `side: 'left' | 'right'`

**Validation:**

- `POST` body schema: all fields optional (`title`, `company`, `period`, `description`, `side?`).
- `PUT` body schema: same fields, but `id` is required.
- Validation is enforced via `validateBody(zodSchema)`.

**Handlers:**

- `GET /api/experiences`
  - Returns all experiences ordered by `id`.
  - On DB error, returns `200` with `[]`.

- `POST /api/experiences`
  - Generates `id` with `Date.now().toString()`.
  - `side` behavior:
    - If provided and valid, use it.
    - If omitted/invalid, alternates based on total count:
      - Even → `"right"`.
      - Odd → `"left"`.
  - Inserts into DB; returns created row with `201`.
  - On DB error: `500 { "error": "Failed to create experience" }`.

- `PUT /api/experiences`
  - Requires `id` in body.
  - Fails with:
    - `404 { "error": "Experience not found" }` if no record.
    - `500 { "error": "Failed to update experience" }` on DB error.
  - Updates all fields and returns updated record.

- `DELETE /api/experiences?id=<id>`
  - Checks query parameter `id`.
  - Fails with:
    - `400 { "error": "ID is required" }` if missing.
    - `404 { "error": "Experience not found" }` if not in DB.
    - `500 { "error": "Failed to delete experience" }` on DB error.
  - On success: `200 { "success": true }`.

### 7.2 Projects – `/api/projects`

- **Router:** `src/routes/projects.routes.ts`
- **Controller:** `src/controllers/projects.controller.ts`
- **Type:** `Project`:
  - `id`, `title`, `description`, `fullDescription`, `image`,
  - `tags: string[]`, `liveUrl`, `githubUrl`, `metrics: string[]`.

**Special handling:**

- `tags` and `metrics` stored as JSON strings in DB.
- Controllers serialize/deserialize arrays to maintain the API contracts.
- Defaults applied on create for missing fields:
  - `liveUrl`, `githubUrl` → `"#"`.
  - `tags`, `metrics` → `[]`.
  - `title`, `description`, `fullDescription`, `image` → `""`.

**Handlers:**

- `GET /api/projects`
  - Returns all projects with `tags` and `metrics` as arrays.
  - On DB error, returns `200` with `[]`.

- `POST /api/projects`
  - Zod‑validated body, all fields optional except server‑generated `id`.
  - Applies defaults and writes to DB.
  - Returns created project with `201`.
  - On DB error: `500 { "error": "Failed to create project" }`.

- `PUT /api/projects`
  - Requires `id`. Other fields optional.
  - Reads existing record, merges incoming fields into it.
  - Fails with:
    - `404 { "error": "Project not found" }` if missing.
    - `500 { "error": "Failed to update project" }` otherwise.
  - Returns merged project with `200`.

- `DELETE /api/projects?id=<id>`
  - Same error semantics as experiences delete.
  - On success: `200 { "success": true }`.

### 7.3 Resume – `/api/resume`

- **Router:** `src/routes/resume.routes.ts`
- **Controller:** `src/controllers/resume.controller.ts`
- **Storage:** `<project-root>/resume`, served at `/resume/*`.

**Handlers:**

- `GET /api/resume`
  - Reads `resumePath` from `settings` (row `id = 1`).
  - Fallback on error/missing row: `{ "resumePath": "/resume/Resume.pdf" }` with `200`.

- `POST /api/resume`
  - `multer` with disk storage:
    - Destination: `<project-root>/resume`.
    - Filename: `resume-<timestamp>.pdf`.
  - Validates:
    - File exists.
    - `mimetype === "application/pdf"`.
  - On invalid/missing file:
    - Cleans up file if needed.
    - Returns `400` with `"No file uploaded"` or `"Only PDF files are allowed"`.
  - On success:
    - Computes `resumePath = "/resume/<filename>"`.
    - Updates `settings.resumePath`.
    - Returns `{ resumePath, success: true }` with `200`.
  - On error:
    - `500 { "error": "Failed to upload resume" }`.

### 7.4 Upload – `/api/upload`

- **Router:** `src/routes/upload.routes.ts`
- **Controller:** `src/controllers/upload.controller.ts`
- **Storage:** `<project-root>/uploads`, served at `/uploads/*`.

**Handlers:**

- `POST /api/upload`
  - `multer` with disk storage:
    - Destination: `<project-root>/uploads`.
    - Filename: `project-<timestamp>.<ext>`.
  - Validates:
    - File exists.
    - `mimetype` is one of:
      - `image/jpeg`, `image/png`, `image/webp`, `image/gif`.
  - On invalid/missing file:
    - Cleans up temp file.
    - Returns:
      - `400 { "error": "No file uploaded" }`, or
      - `400 { "error": "Only image files are allowed" }`.
  - On success:
    - Returns `{ path: "/uploads/<filename>", success: true }` with `200`.
  - On error:
    - `500 { "error": "Failed to upload file" }`.

---

## 8. Validation & Error Handling

### 8.1 Zod validation (`middleware/validate.ts`)

- Wraps Express route handlers for POST/PUT.
- On successful parse:
  - Replaces `req.body` with the parsed value and calls `next()`.
- On failure:
  - Aggregates all `ZodError.issues` messages into a single string.
  - Creates an error object with:
    - `statusCode = 400`
    - `expose = true`
  - Passes error to the global error handler.

Resulting client response:

- HTTP `400`
- Body: `{ "error": "<combined validation messages>" }`.

### 8.2 Global error handler (`middleware/errorHandler.ts`)

- Signature: `(err, req, res, next)`.
- Status:
  - Uses `err.statusCode` if present; otherwise `500`.
- Message:
  - If `err.expose === true`, uses `err.message`.
  - Otherwise, uses `"Internal Server Error"` to avoid exposing internals.
- Always returns:

```json
{ "error": "<message>" }
```

**Status codes used:**

- `400` – Validation issues, missing IDs, wrong file types, etc.
- `404` – Entity not found (`Experience` or `Project`).
- `500` – DB failures and unexpected errors.

---

## 9. Local Development & Build

### 9.1 Installation

```bash
npm install
```

### 9.2 Running in development

```bash
cp .env.example .env   # adjust as needed
npm run dev            # listens on PORT or 8080
```

### 9.3 Building & running production build

```bash
npm run build          # tsc → dist/
npm start              # node dist/server.js
```

The compiled entrypoint is `dist/server.js`.

---

## 10. Deployment & Extension Guidelines (AWS, Docker, HTTPS, Prisma, CI/CD)

This section outlines how to extend and harden this backend for production, especially on AWS with Docker, HTTPS, Prisma, and GitHub Actions. These steps are **not implemented yet**, but the codebase is structured to support them.

### 10.1 Dockerization

**Goals:**

- Containerize the backend for consistent runtime environments.
- Persist state (`portfolio.db`, `resume/`, `uploads/`) via volumes.

**Key points:**

- Entrypoint: `node dist/server.js` (after running `npm run build`).
- Expose port matching `PORT` (e.g. 8080).
- Mount or bind:
  - `/app/data` → `data/portfolio.db`.
  - `/app/resume` → resume PDFs.
  - `/app/uploads` → uploaded images.
- Pass environment variables via container env (not baked into image).

### 10.2 AWS Deployment (high level)

Possible targets:

- **ECS Fargate** service:
  - Task definition with:
    - Container image for this backend.
    - Port mapping (8080 → target group).
    - EFS or EBS for database and uploads _or_ move to managed DB (see Prisma below).
  - Application Load Balancer (ALB) in front:
    - Terminates TLS.
    - Routes `HTTPS → HTTP` to the service.

- **EC2** with Nginx/ALB:
  - Run Node process (or Docker container) on EC2.
  - Use Nginx or ALB to terminate TLS and proxy to `http://localhost:8080`.

For both:

- **API base URL** for frontend:
  - `NEXT_PUBLIC_API_URL=https://api.<your-domain>.com`.
- **Secrets & env:**
  - Store `.env` values (PORT, DB path or connection string, etc.) in:
    - SSM Parameter Store, Secrets Manager, or ECS Task definition environment.

### 10.3 HTTPS Considerations

Best practice:

- Terminate HTTPS at the **load balancer** (ALB) or reverse proxy, not in the Node app.
- Forward traffic to Node over HTTP on an internal network (e.g. target group).

If terminating HTTPS directly in Node (less common for AWS production):

- Use an HTTPS server wrapper around `app` (not implemented yet).
- Manage TLS certificates via AWS ACM + local termination or other providers.

In all cases, the frontend should use `https://...` for `NEXT_PUBLIC_API_URL`.

### 10.4 Moving to Prisma (optional)

Current state:

- Direct SQLite access using `better-sqlite3` and SQL queries in controllers.

Migration path:

1. **Define Prisma schema** that mirrors `schema.sql`:
   - Models: `Experience`, `Project`, `Settings`.
   - Fields match columns; `tags` and `metrics` can remain JSON columns or be normalized.
2. **Configure Prisma datasource**:
   - SQLite (local) or a managed DB (RDS Postgres/MySQL).
3. **Replace controller logic**:
   - Swap raw SQL calls for Prisma client calls.
   - Keep API shapes identical to `api-docs.md`.
4. **Adjust deployment**:
   - If moving off SQLite, `DATABASE_PATH` would be replaced with a connection URL (e.g. `DATABASE_URL`).

### 10.5 GitHub Actions CI/CD (outline)

Suggested pipeline steps:

1. **CI (on push / PR):**
   - `npm ci`
   - `npm run build`
   - (Optional) Run tests (e.g. supertest integration tests).
   - Linting if configured.

2. **Build & publish image (if using Docker):**
   - Build Docker image tagged with commit SHA.
   - Push to container registry (e.g. GitHub Container Registry or ECR).

3. **Deploy step:**
   - Trigger AWS deployment:
     - ECS service update or EC2 rollout.
   - Use GitHub Environments/Secrets for:
     - AWS credentials.
     - `PORT`, DB URL/credentials.

### 10.6 Encryption & Secrets Management

**At rest:**

- If remaining on SQLite on disk:
  - Consider volume or filesystem‑level encryption (EBS/EFS, encrypted disks).
  - Alternatively, move to a managed DB (RDS) with encryption at rest.

**In transit:**

- Always front the service with HTTPS (ALB, CloudFront, or other reverse proxy).
- Ensure frontend points to `https://` API URLs only.

**Secrets:**

- Do not commit `.env` to source control.
- Store secrets (future API keys, DB URLs, etc.) in:
  - AWS Secrets Manager.
  - AWS SSM Parameter Store.
  - GitHub Actions secrets (for CI/CD pipeline).

---

## 11. Summary

- The backend is a small, focused **Express + SQLite** service exposing strictly defined REST APIs for experiences, projects, resume, and image uploads.
- Configuration is environment‑driven and already structured for containerization and cloud deployment.
- Extending to AWS (with Docker, TLS at a load balancer, and a managed DB via Prisma) primarily involves:
  - Containerizing the service.
  - Externalizing and securing configuration.
  - Replacing raw SQLite access with Prisma if needed.

This document should serve as the primary reference when integrating this backend into AWS and designing CI/CD, security, and infrastructure around it.
