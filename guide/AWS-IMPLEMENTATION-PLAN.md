## Portfolio Backend → AWS Implementation Plan

**Goal:** Deploy the existing Express/TypeScript backend to AWS with Docker, Prisma/Postgres, HTTPS endpoints, and GitHub Actions–based CI/CD, without breaking the current API contract.

---

## Phase 1 – Baseline & Pre‑AWS Hardening (Local)

1. **Review existing backend docs and code**
   - Re‑read `backend-documentation.md`, `api-docs.md`, and `src/` to confirm routes, data model, and error conventions that must remain stable.

2. **Standardize environment configuration**
   - Confirm `.env` / `.env.example` define `PORT` and `DATABASE_PATH`.
   - Add placeholders for future DB and AWS vars (e.g. `DATABASE_URL`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`) without using them yet.
   - Add a body size limit for JSON (e.g. `express.json({ limit: '1mb' })`) to avoid DoS via large payloads.

3. **Abstract database access behind repositories**
   - Create `src/db/experience.repository.ts` and `src/db/project.repository.ts` that encapsulate all `better-sqlite3` queries.
   - Refactor controllers to depend on these repositories instead of calling `db.prepare` directly.

4. **Introduce a minimal logging utility**
   - Add `src/utils/logger.ts` (even if it just wraps `console`) so you have a single place to later swap in Pino/structured logging.
   - Use it in controllers and critical DB operations.

5. **Re‑verify local behavior end‑to‑end**
   - Retest `GET/POST/PUT/DELETE` for experiences and projects, plus resume and upload endpoints.
   - Ensure all responses still match `api-docs.md` (status codes, body shape, default values).

---

## Phase 2 – Prisma & PostgreSQL (Local Migration)

6. **Design the relational schema for Postgres**
   - Translate the SQLite tables (`experiences`, `projects`, `settings`) into conceptual models for Prisma.
   - Decide whether `tags` and `metrics` remain JSON columns or become normalized relations.

7. **Add Prisma and Postgres dependencies**
   - Install `prisma`, `@prisma/client`, `pg`, and `@prisma/adapter-pg` (following patterns from `guide/LEARNING.md` and `guide/AWS-DOCKER-BACKEND-GUIDE.md`).
   - Initialize Prisma to create `prisma/schema.prisma`.

8. **Define Prisma models**
   - In `prisma/schema.prisma`, create models for `Experience`, `Project`, and `Settings` mirroring the existing shapes (including JSON columns or equivalent).
   - Keep IDs compatible with current usage (string IDs from `Date.now().toString()`) or design a safe migration path if changing types.

9. **Configure Prisma datasource via environment**
   - Add `prisma.config.ts` (or similar) so `datasource.url` comes from `process.env.DATABASE_URL`, not hardcoded in the schema (per the AWS guide’s Prisma section).
   - For local dev, set `DATABASE_URL` to a local Postgres instance instead of SQLite.

10. **Set up local Postgres with docker‑compose**
    - Create a `docker-compose.yml` with a `postgres` service (port 5432, DB name/user/password).
    - Document how to start it (`docker compose up -d`) and how the backend will point to it.

11. **Run initial migrations into Postgres**
    - Run `npx prisma migrate dev --name init` against the local Postgres DB.
    - Verify tables and columns align with expectations using a DB client or `psql`.

12. **Create Prisma client wrapper**
    - Implement `src/lib/prisma.ts`:
      - Build a connection using `DATABASE_URL` (or `DB_*` vars if you follow the adapter pattern in the guides).
      - Export a singleton Prisma client instance.

13. **Switch repositories to Prisma (internals only)**
    - Change `experience.repository.ts` and `project.repository.ts` to use Prisma instead of `better-sqlite3`, preserving their external TypeScript signatures.
    - Optionally gate this with `USE_PRISMA=true` in `.env` to allow fallback to SQLite during the transition.

14. **Comprehensive API regression testing**
    - Retest every endpoint:
      - Ordering of results.
      - Default values for missing fields.
      - Error messages and HTTP status codes.
    - Fix any differences so that behavior still matches `api-docs.md`.

**Phase 2 done.** Repositories use Prisma when `DATABASE_URL` (or `DB_*`) is set; otherwise SQLite. To run with Postgres locally:

1. `docker compose up -d` (start Postgres).
2. In `.env`: `DATABASE_URL=postgresql://portfolio:portfolio@localhost:5432/portfolio?schema=public`
3. `npm run db:migrate:dev -- --name init` (if migrations not yet applied).
4. `npm run dev` (app uses Prisma + Postgres).

---

## Phase 3 – Dockerization of the Backend

15. **Create a multi‑stage Dockerfile**
    - Follow the pattern in `guide/AWS-DOCKER-BACKEND-GUIDE.md`:
      - **Builder:** install dependencies, build TypeScript (`npm install`, `npm run build`).
      - **Runner:** copy `dist/`, `node_modules`, and a small entrypoint script.
    - Use `npm config set fetch-retries ...` as in the guide to avoid `ECONNRESET` during `npm install` in Docker.

16. **Add a Docker entrypoint script**
    - Create `docker-entrypoint.sh` to:
      - Ensure env vars are present.
      - Optionally construct `DATABASE_URL` from `DB_*` envs if needed (reusing logic from the guide).
      - Run `prisma migrate deploy` when `DATABASE_URL` points to a real DB.
      - Execute `node dist/server.js`.
    - Ensure the Node process handles SIGTERM (graceful shutdown): stop accepting new requests, finish in-flight, then exit so ECS can drain tasks cleanly.

17. **Create a `.dockerignore`**
    - Exclude `node_modules`, `dist`, `.env`, `.git`, local SQLite data, and temporary files to keep the image small and secure.

18. **Build and run the Docker image locally**
    - Build with explicit platform (e.g. `docker build --platform linux/amd64 -t portfolio-backend:local .`).
    - Run with `docker run`:
      - Map container port (e.g. 8080) to host.
      - Supply `DATABASE_URL` (or `DB_*`) and `PORT` via `--env-file` or `-e`.

19. **Validate Dockerized backend behavior**
    - Call `/health` and all CRUD endpoints against the container.
    - Confirm migrations run automatically on container start and that uploads work with volumes (if still using local disk for `resume/` and `uploads/`).

---

## Phase 4 – AWS Infrastructure (ECR, ECS, ALB, CloudFront, RDS)

20. **Lock in AWS architecture**
    - Use the architecture from `guide/AWS-DOCKER-BACKEND-GUIDE.md`:
      - CloudFront (HTTPS) → ALB (HTTP) → ECS Fargate (backend container) → RDS Postgres.
      - Secrets in Secrets Manager, VPC with public and private subnets.

21. **Provision networking with CDK**
    - Use CDK to define:
      - VPC with 2 AZs, public + private subnets, and one NAT gateway.
      - Security groups:
        - ALB (public ingress 80/443).
        - ECS tasks (ingress from ALB).
        - RDS (ingress from ECS tasks only).

22. **Create RDS PostgreSQL instance**
    - Add an RDS Postgres 16 instance in private subnets.
    - Store DB credentials in Secrets Manager (DB host, port, name, user, password).
    - Enable automated backups with a retention period (e.g. 7 days); document restore procedure in the runbook.
    - Output the secret ARN and connection info from the CDK stack for later use.

23. **Create ECR repository**
    - Define an ECR repository (e.g. `portfolio-backend-api`) via CDK.
    - Output the ECR URI for CI and ECS task definitions.

24. **Define ECS cluster and Fargate service**
    - Create an ECS cluster and Fargate task definition:
      - Container using the ECR image.
      - Port mapping (e.g. container 8080).
      - Env vars: `PORT`, `NODE_ENV`, etc.
      - Secrets: DB credentials and/or `DATABASE_URL` from Secrets Manager (following the pattern in the guides).
    - Create a Fargate service running in private subnets.

25. **Configure ALB and target group**
    - Add an Application Load Balancer in public subnets:
      - Listener on 80 (optionally 443 if terminating TLS directly).
      - Target group registered to the ECS service (port matching container).
      - Health check on `/health`.
    - Output ALB DNS name.

26. **Add CloudFront distribution as HTTPS front door**
    - Configure a CloudFront distribution with the ALB as origin.
    - Attach an ACM certificate for your domain and enforce HTTPS to CloudFront.
    - Output the CloudFront domain (this becomes `NEXT_PUBLIC_API_URL` for the frontend).

27. **Plan for file storage (resume/uploads)**
    - Decide whether to:
      - Mount EFS to ECS tasks and keep using `/resume` and `/uploads`, or
      - Migrate to S3 buckets (to be implemented in a later phase).
    - For v1, document the choice and any changes needed in the controllers.

---

## Phase 5 – CI/CD with GitHub Actions

28. **Configure GitHub secrets and environments**
    - Add repository secrets:
      - `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`.
      - `ECR_REPOSITORY_URI`.
      - `ECS_CLUSTER_NAME`, `ECS_SERVICE_NAME`.
      - Any additional secrets (e.g. DB secret ARN if needed).

29. **Create CI workflow (build and test)**
    - Add `.github/workflows/ci.yml`:
      - Trigger on pull requests and pushes to main.
      - Steps: checkout → `npm ci` → `npm run build` → run tests (unit/integration as you add them).
      - Add dependency vulnerability check (e.g. `npm audit --audit-level=high` or Dependabot); fail or warn per policy.
      - Fail on compilation or test errors before deployment happens.

30. **Create deploy workflow (build → push → ECS update)**
    - Add `.github/workflows/deploy.yml` modeled after the AWS guide:
      - Trigger on pushes to main or tagged releases.
      - Steps:
        - Checkout and configure AWS credentials.
        - Login to ECR.
        - Build Docker image for `linux/amd64` tagged with commit SHA.
        - Push image to ECR.
        - Call `aws ecs update-service --force-new-deployment` using cluster and service from secrets or CDK outputs.

31. **Wire CDK outputs into workflows and docs**
    - Ensure CDK stack exposes:
      - ECR repo URI, ECS cluster/service names, CloudFront API URL.
    - Reference these outputs in workflow environment variables or GitHub secrets.
    - Update `backend-documentation.md` to link to the deployed API URL.

32. **End‑to‑end CI/CD test**
    - Make a small backend change (e.g. log line or comment).
    - Push to main.
    - Confirm:
      - CI passes (build succeeds).
      - Deploy workflow builds and pushes image, then forces new ECS deployment.
      - New version is active and `/health` returns 200 at the CloudFront URL.

---

## Phase 6 – Security, Encryption, and Observability

33. **Enforce HTTPS and tighten CORS**
    - Ensure CloudFront only serves HTTPS.
    - Optionally redirect HTTP→HTTPS.
    - Restrict CORS in `app.ts` to known frontend origins (staging/prod URLs).
    - Add security headers (e.g. Helmet middleware): `X-Content-Type-Options`, `X-Frame-Options`, and other recommended headers to reduce XSS/clickjacking surface.

34. **Add API key authentication**
    - Store the API key in environment (e.g. `API_KEY`) and in AWS Secrets Manager for ECS; never commit it to the repo.
    - Add middleware that validates the key on each request (e.g. `Authorization: Bearer <key>` or `X-API-Key` header); return 401 when missing or invalid.
    - Exempt public/health routes (e.g. `GET /health`, and optionally `GET /experiences`, `GET /projects`) from the check if they should stay unauthenticated.
    - Use the same key for server-side frontend calls (e.g. Next.js server); document the header and rotation in `api-docs.md` and the runbook.

34a. **Add rate limiting** - Apply rate limiting (per IP and/or per API key) to protect against abuse and brute force (e.g. `express-rate-limit` or ALB/WAF rules). - Use stricter limits for unauthenticated or public routes; optionally higher limits for valid API key. - Return 429 Too Many Requests with a `Retry-After` header when exceeded; document limits in `api-docs.md`.

35. **Encrypt data at rest**
    - Confirm:
      - RDS encryption at rest is enabled.
      - EBS/EFS volumes used by ECS tasks are encrypted.
    - Avoid storing secrets in `.env` in the repo; rely on AWS Secrets Manager and Parameter Store.

36. **Harden error handling**
    - Keep stack traces and internal messages out of 500 responses in production.
    - Optionally add an env flag (e.g. `EXPOSE_ERROR=1`) to show detailed errors only in non‑production environments.
    - Ensure all mutation endpoints validate and sanitize request body and query params (e.g. Zod or existing `validate` middleware); return 400 with clear messages for invalid input to avoid injection and bad data.

37. **Implement structured logging**
    - Replace console logs with Pino or similar.
    - Configure ECS task definition to send logs to CloudWatch Logs.
    - Consider adding a request ID per incoming request for traceability.

38. **Add monitoring and alerts**
    - Define CloudWatch alarms:
      - ALB 5xx rate.
      - ECS task CPU and memory usage.
      - RDS CPU, connections, and storage.
    - Optionally add AWS Budgets to monitor monthly spend.

39. **Document runbooks and operations**
    - In a new `DEPLOYMENT-RUNBOOK.md` (or extend `backend-documentation.md`), document:
      - How to deploy and roll back.
      - How to rotate DB credentials and API keys.
      - How to restore from RDS backups if needed.
      - How to recover from common failures (ECS task failing, RDS down, etc.).

---

## Phase 7 – Optional Enhancements

40. **Migrate uploads and resume to S3**
    - Create S3 buckets for resumes and uploads.
    - Update controllers to:
      - Upload files to S3 instead of local disk.
      - Return S3/CloudFront URLs in `resumePath` and `path` fields.
    - Optionally put CloudFront in front of these S3 buckets.

41. **Add staging environment**
    - Duplicate the stack for a `staging` environment:
      - Separate ECS service, RDS instance, and CloudFront distribution.
    - Extend CI/CD to:
      - Deploy to staging on every push to main.
      - Deploy to prod only on tagged releases or manual approvals.

42. **Performance and cost tuning**
    - Profile API latency and DB usage.
    - Right‑size Fargate task CPU/memory and RDS instance class based on CloudWatch metrics.
    - Refine auto‑scaling rules for ECS (e.g. scale on CPU or request count).
