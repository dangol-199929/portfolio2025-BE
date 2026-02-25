# API Documentation

This document describes the portfolio API: data structures, request/response shapes, and error handling. It also covers **About us**, **Contact us**, and **Personal info** endpoints now served by this backend.

**Base path:** `/api` (relative to the app origin)

---

## 1. Data Structures

### 1.1 Experience

Matches `data/experiences.json` (array of objects).

| Field         | Type                  | Required               | Description                                          |
| ------------- | --------------------- | ---------------------- | ---------------------------------------------------- |
| `id`          | string                | yes (server-generated) | Unique identifier (e.g. `"1"`, timestamp string).    |
| `title`       | string                | yes                    | Job or role title (e.g. `"Frontend Web Developer"`). |
| `company`     | string                | yes                    | Company or institution name.                         |
| `period`      | string                | yes                    | Time period (e.g. `"Aug 2021 - Aug 2025"`).          |
| `description` | string                | yes                    | Full description text.                               |
| `side`        | `"left"` \| `"right"` | yes                    | Timeline side for layout.                            |

**Example (single item):**

```json
{
  "id": "1",
  "title": "Frontend Web Developer",
  "company": "E.K. Solutions Pvt. Ltd",
  "period": "Aug 2021 - Aug 2025",
  "description": "Developed scalable web apps with React.js, Next.js, and modern UI frameworks...",
  "side": "right"
}
```

**Example (full file — array):**

```json
[
  {
    "id": "1",
    "title": "Frontend Web Developer",
    "company": "E.K. Solutions Pvt. Ltd",
    "period": "Aug 2021 - Aug 2025",
    "description": "Developed scalable web apps...",
    "side": "right"
  },
  {
    "id": "2",
    "title": "Web Developer Intern",
    "company": "E.K. Solutions Pvt. Ltd",
    "period": "June 2021 - Aug 2021",
    "description": "Translated design mockups...",
    "side": "left"
  }
]
```

---

### 1.2 Project

Matches `data/projects.json` (array of objects).

| Field             | Type     | Required               | Description                                                                                                                         |
| ----------------- | -------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `id`              | string   | yes (server-generated) | Unique identifier.                                                                                                                  |
| `title`           | string   | yes                    | Project title.                                                                                                                      |
| `description`     | string   | yes                    | Short summary.                                                                                                                      |
| `fullDescription` | string   | yes                    | Longer description (e.g. markdown or plain text).                                                                                   |
| `image`           | string   | yes                    | Image key (e.g. `"assistant"`, `"revv"`, `"bs"`, `"koklass"`, `"ban"`) or URL path from upload (e.g. `"/uploads/project-123.png"`). |
| `tags`            | string[] | yes                    | List of tags.                                                                                                                       |
| `liveUrl`         | string   | yes                    | Live demo URL (use `"#"` if none).                                                                                                  |
| `githubUrl`       | string   | yes                    | GitHub URL (use `"#"` if none).                                                                                                     |
| `metrics`         | string[] | yes                    | List of metric or highlight strings.                                                                                                |

**Example (single item):**

```json
{
  "id": "1",
  "title": "AI Assistant Platform",
  "description": "AI-powered enterprise productivity tool automating day-to-day business workflows.",
  "fullDescription": "Designed and developed an AI assistant platform to handle HR tasks...",
  "image": "assistant",
  "tags": [
    "AI",
    "Automation",
    "Enterprise",
    "React",
    "Next.js",
    "TypeScript",
    "Workflow Optimization"
  ],
  "liveUrl": "#",
  "githubUrl": "#",
  "metrics": [
    "60% reduction in manual administrative effort",
    "Faster HR and client workflows",
    "Automated reporting and email tasks"
  ]
}
```

**Example (full file — array):** An array of objects with the same shape as above.

---

### 1.3 Settings (Resume)

Matches `data/settings.json` (single object). Used by the resume API.

| Field        | Type   | Description                                                                                                   |
| ------------ | ------ | ------------------------------------------------------------------------------------------------------------- |
| `resumePath` | string | Public URL path to the current resume PDF (e.g. `"/resume/Resume.pdf"` or `"/resume/resume-1234567890.pdf"`). |

**Example (full file):**

```json
{
  "resumePath": "/resume/Resume.pdf"
}
```

---

### 1.4 Contact (display settings)

Contact information is now served by `GET /api/contact` and updated by `PUT /api/contact`.

Each item:

| Field      | Type   | Description                                      |
| ---------- | ------ | ------------------------------------------------ |
| `label`    | string | Display label (e.g. `"Email"`, `"LinkedIn"`).    |
| `value`    | string | Display value or CTA text.                       |
| `href`     | string | URL (`mailto:...`, profile URL, or resume path). |
| `target`   | string | Optional link target (`"_blank"` or `"_self"`).  |
| `download` | string | Optional; filename for resume download links.    |

**Example:**

```json
[
  {
    "label": "Email",
    "value": "name@example.com",
    "href": "mailto:name@example.com",
    "target": "_blank"
  },
  {
    "label": "Resume",
    "value": "Download Resume",
    "href": "/resume/Resume.pdf",
    "target": "_self",
    "download": "Resume.pdf"
  }
]
```

---

### 1.5 About (display settings)

About information is now served by `GET /api/about` and updated by `PUT /api/about`.

| Field          | Type     | Description                         |
| -------------- | -------- | ----------------------------------- |
| `name`         | string   | Full name.                          |
| `email`        | string   | Email address.                      |
| `education`    | string   | Education line.                     |
| `availability` | string   | Availability/status text.           |
| `bio`          | string[] | About paragraph list.               |
| `image`        | string   | Optional profile image path or URL. |

**Example:**

```json
{
  "name": "Sandeep Dangol",
  "email": "sandeep@example.com",
  "education": "BSc Computing (UCSI University)",
  "availability": "Open to opportunities",
  "bio": ["Paragraph 1", "Paragraph 2"],
  "image": "/uploads/me.jpg"
}
```

---

## 2. Error Structure

All error responses use the same shape. HTTP status is in the response status code; the body is JSON.

### Error response body

| Field   | Type   | Description                   |
| ------- | ------ | ----------------------------- |
| `error` | string | Human-readable error message. |

**Example:**

```json
{
  "error": "Experience not found"
}
```

### Status codes used for errors

| Status | Meaning               | When used (examples)                        |
| ------ | --------------------- | ------------------------------------------- |
| `400`  | Bad Request           | Missing body/field (e.g. no file, no `id`). |
| `404`  | Not Found             | Entity not found for given `id`.            |
| `500`  | Internal Server Error | Read/write failure or unexpected error.     |

---

## 3. Endpoints

### 3.1 Experiences

**Base path:** `/api/experiences`

#### GET `/api/experiences`

Returns all experiences (same order as stored).

- **Response:** `200 OK`
- **Body:** Array of [Experience](#11-experience) objects.

```json
[
  {
    "id": "1",
    "title": "Frontend Web Developer",
    "company": "E.K. Solutions Pvt. Ltd",
    "period": "Aug 2021 - Aug 2025",
    "description": "...",
    "side": "right"
  }
]
```

- **Errors:** On read failure the handler returns `200` with an empty array `[]`; no error body is returned for GET.

---

#### POST `/api/experiences`

Creates one experience. `id` and default `side` are set by the server.

- **Request:** `Content-Type: application/json`
- **Body:** Object with [Experience](#11-experience) fields **except** `id` (all optional at send; empty string/array used if omitted).

| Field         | Type                  | Notes                                 |
| ------------- | --------------------- | ------------------------------------- |
| `title`       | string                |                                       |
| `company`     | string                |                                       |
| `period`      | string                |                                       |
| `description` | string                |                                       |
| `side`        | `"left"` \| `"right"` | Optional; alternates if not provided. |

- **Response:** `201 Created`
- **Body:** Created [Experience](#11-experience) object (includes `id`).

- **Errors:**
  - `500` — `{ "error": "Failed to create experience" }`

---

#### PUT `/api/experiences`

Updates one experience. Body must include `id`.

- **Request:** `Content-Type: application/json`
- **Body:** [Experience](#11-experience) object (must include `id`). Other fields are merged into the existing item.

- **Response:** `200 OK`
- **Body:** Updated [Experience](#11-experience) object.

- **Errors:**
  - `404` — `{ "error": "Experience not found" }`
  - `500` — `{ "error": "Failed to update experience" }`

---

#### DELETE `/api/experiences?id=<id>`

Deletes one experience by `id`.

- **Query:** `id` (required) — experience id.
- **Response:** `200 OK`
- **Body:** `{ "success": true }`

- **Errors:**
  - `400` — `{ "error": "ID is required" }`
  - `404` — `{ "error": "Experience not found" }`
  - `500` — `{ "error": "Failed to delete experience" }`

---

### 3.2 Projects

**Base path:** `/api/projects`

#### GET `/api/projects`

Returns all projects.

- **Response:** `200 OK`
- **Body:** Array of [Project](#12-project) objects.

- **Errors:** On read failure the handler returns `200` with an empty array `[]`; no error body is returned for GET.

---

#### POST `/api/projects`

Creates one project. `id` is server-generated.

- **Request:** `Content-Type: application/json`
- **Body:** Object with [Project](#12-project) fields **except** `id`. Omitted fields get defaults (e.g. `""`, `[]`, `"#"`).

| Field             | Type     | Notes          |
| ----------------- | -------- | -------------- |
| `title`           | string   |                |
| `description`     | string   |                |
| `fullDescription` | string   |                |
| `image`           | string   |                |
| `tags`            | string[] |                |
| `liveUrl`         | string   | Default `"#"`. |
| `githubUrl`       | string   | Default `"#"`. |
| `metrics`         | string[] |                |

- **Response:** `201 Created`
- **Body:** Created [Project](#12-project) object (includes `id`).

- **Errors:**
  - `500` — `{ "error": "Failed to create project" }`

---

#### PUT `/api/projects`

Updates one project. Body must include `id`.

- **Request:** `Content-Type: application/json`
- **Body:** [Project](#12-project) object (must include `id`). Other fields merged into existing item.

- **Response:** `200 OK`
- **Body:** Updated [Project](#12-project) object.

- **Errors:**
  - `404` — `{ "error": "Project not found" }`
  - `500` — `{ "error": "Failed to update project" }`

---

#### DELETE `/api/projects?id=<id>`

Deletes one project by `id`.

- **Query:** `id` (required).
- **Response:** `200 OK`
- **Body:** `{ "success": true }`

- **Errors:**
  - `400` — `{ "error": "ID is required" }`
  - `404` — `{ "error": "Project not found" }`
  - `500` — `{ "error": "Failed to delete project" }`

---

### 3.3 Resume

**Base path:** `/api/resume`

#### GET `/api/resume`

Returns the current resume path from [Settings](#13-settings-resume).

- **Response:** `200 OK`
- **Body:** Same shape as [Settings](#13-settings-resume):

```json
{
  "resumePath": "/resume/Resume.pdf"
}
```

If the settings file is missing, the API still returns `200` with default: `{ "resumePath": "/resume/Resume.pdf" }`.

---

#### POST `/api/resume`

Uploads a new PDF and updates resume settings.

- **Request:** `Content-Type: multipart/form-data`
- **Body:** Form field `file` — PDF file. Only `application/pdf` allowed.

- **Response:** `200 OK`
- **Body:**

```json
{
  "resumePath": "/resume/resume-<timestamp>.pdf",
  "success": true
}
```

When S3 is configured and `ASSETS_BASE_URL` is set, `resumePath` may be returned as a full URL (for example, `https://api.example.com/resume/resume-<timestamp>.pdf`).

- **Errors:**
  - `400` — `{ "error": "No file uploaded" }`
  - `400` — `{ "error": "Only PDF files are allowed" }`
  - `500` — `{ "error": "Failed to upload resume" }`

---

### 3.4 Upload (images)

**Base path:** `/api/upload`

#### POST `/api/upload`

Uploads an image for use (e.g. project images). Only POST is supported.

- **Request:** `Content-Type: multipart/form-data`
- **Body:** Form field `file` — image file. Allowed types: `image/jpeg`, `image/png`, `image/webp`, `image/gif`.

- **Response:** `200 OK`
- **Body:**

```json
{
  "path": "/uploads/project-<timestamp>.<ext>",
  "success": true
}
```

When S3 is configured and `ASSETS_BASE_URL` is set, `path` may be returned as a full URL (for example, `https://api.example.com/uploads/project-<timestamp>.<ext>`).

- **Errors:**
  - `400` — `{ "error": "No file uploaded" }`
  - `400` — `{ "error": "Only image files are allowed" }`
  - `500` — `{ "error": "Failed to upload image" }`

---

### 3.5 About

**Base path:** `/api/about`

#### GET `/api/about`

Returns current about data.

- **Response:** `200 OK`
- **Body:** [About](#15-about-display-settings) object.

#### PUT `/api/about`

Updates about data (partial update supported).

- **Request:** `Content-Type: application/json`
- **Body:** Any subset of [About](#15-about-display-settings) fields.
- **Response:** `200 OK`
- **Body:** Updated [About](#15-about-display-settings) object.

---

### 3.6 Contact

**Base path:** `/api/contact`

#### GET `/api/contact`

Returns current contact items.

- **Response:** `200 OK`
- **Body:** Array of [Contact](#14-contact-display-settings) items.

#### PUT `/api/contact`

Replaces contact items.

- **Request:** `Content-Type: application/json`
- **Body:** Array of [Contact](#14-contact-display-settings) items.
- **Response:** `200 OK`
- **Body:** Updated array of [Contact](#14-contact-display-settings) items.

---

## 4. Summary

| Endpoint           | Methods                | Success body shape                                                      | Error body shape      |
| ------------------ | ---------------------- | ----------------------------------------------------------------------- | --------------------- |
| `/api/experiences` | GET, POST, PUT, DELETE | Array (GET), single Experience (POST/PUT), `{ success: true }` (DELETE) | `{ "error": string }` |
| `/api/projects`    | GET, POST, PUT, DELETE | Array (GET), single Project (POST/PUT), `{ success: true }` (DELETE)    | `{ "error": string }` |
| `/api/resume`      | GET, POST              | `{ resumePath }` (GET), `{ resumePath, success: true }` (POST)          | `{ "error": string }` |
| `/api/upload`      | POST                   | `{ path, success: true }`                                               | `{ "error": string }` |
| `/api/about`       | GET, PUT               | About object                                                            | `{ "error": string }` |
| `/api/contact`     | GET, PUT               | Contact item array                                                      | `{ "error": string }` |

All error responses use the same structure: a single key `error` with a string message. The HTTP status code indicates 400, 404, or 500 as described above.
