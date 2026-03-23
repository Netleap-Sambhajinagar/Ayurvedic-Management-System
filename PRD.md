# Ayurveda Care — Product Requirements Document

**Version:** 1.1.0
**Product Type:** Clinic Management Web Application
**Tech Stack:** React (Vite) + Node.js + MySQL (Sequelize ORM)
**Prepared By:** Ayurveda Care Development Team
**Date:** March 2026
**Status:** Active Development

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Target Users & Personas](#2-target-users--personas)
3. [Core Features & Functional Requirements](#3-core-features--functional-requirements)
4. [Technical Architecture](#4-technical-architecture)
5. [Codebase Reference — File by File](#5-codebase-reference--file-by-file)
6. [API Endpoint Specification](#6-api-endpoint-specification)
7. [User Interface & Navigation](#7-user-interface--navigation)
8. [Patient Lifecycle & Workflow](#8-patient-lifecycle--workflow)
9. [Security Considerations](#9-security-considerations)
10. [Non-Functional Requirements](#10-non-functional-requirements)
11. [Future Roadmap](#11-future-roadmap)

---

## 1. Product Overview

### 1.1 Summary

Ayurveda Care is a full-stack clinic management web application purpose-built for Ayurvedic healthcare practitioners. The system streamlines the complete patient journey — from initial registration through to AI-assisted diagnosis, appointment scheduling, OPD management, follow-up tracking, and outcome analytics — all within a single, secure, authenticated platform.

The platform bridges traditional Ayurvedic clinical workflows with modern data management. Practitioners can record patient **Prakriti** (body constitution) and **Vikriti** (current imbalance) assessments, generate AI-powered treatment reports, schedule appointments and follow-ups, and visualise clinic-wide health trends through an interactive analytics dashboard.

---

### 1.2 Problem Statement

Ayurvedic clinics traditionally rely on paper-based records or generic medical software that does not accommodate Ayurvedic-specific constructs such as Doshas, Prakriti, Vikriti, and holistic treatment modalities. This results in:

- Lost or mismanaged patient records across multiple visits
- No structured tracking of Dosha imbalances or treatment outcomes
- Manual, error-prone appointment and follow-up scheduling
- No data-driven insights to guide clinical decision-making
- Time-consuming report generation that delays patient throughput
- Inability to correlate symptoms with Dosha patterns across the patient population

---

### 1.3 Proposed Solution

Ayurveda Care solves these challenges with a structured, Ayurveda-native platform that offers:

- A dedicated patient data model capturing all eight Prakriti assessment parameters
- AI-generated treatment reports via an integrated LLM API
- A clear patient lifecycle: **Registration → Appointment → OPD → Follow-up → History**
- A real-time analytics dashboard with Dosha, Vikriti, age, and treatment insights
- Secure, doctor-authenticated access with JWT-based session management
- A complete visit history for longitudinal clinical tracking
- Automatic patient data sync from Google Sheets / Excel every 60 seconds via cron job
- Password reset flow with time-limited email links

---

### 1.4 Project Scope

**In Scope for v1.0:**

- Doctor authentication, profile management, password change, and forgot-password flow
- Complete patient CRUD with Prakriti/Vikriti data fields
- Appointment queue management with cabin entry tracking
- Follow-up scheduling and management
- OPD daily records view
- Full visit history with filtering and search
- AI treatment report generation and export
- Analytics dashboard (Home tab + Treatment Analysis tab)
- Google Sheets → MySQL auto-sync via cron (every 1 minute)
- Google Calendar sync via webhook
- Patient report email delivery via Nodemailer/Gmail
- Forgot password / reset password via email link

**Out of Scope for v1.0:**

- Multi-clinic or multi-doctor support
- Billing and invoicing
- Native mobile application
- Patient-facing self-service portal
- Lab report upload and integration
- SMS/WhatsApp notification system

---

## 2. Target Users & Personas

### 2.1 Primary User — Ayurvedic Doctor / Practitioner

| Attribute        | Details                                                                                                                                                        |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Goal**         | Efficiently manage patient records, reduce administrative overhead, and deliver personalised Ayurvedic care.                                                   |
| **Pain Points**  | Time spent on paperwork; inability to track Dosha trends; no structured follow-up reminders; manual report writing.                                            |
| **Key Tasks**    | Register new patients, view/update patient Prakriti data, generate AI reports, manage the appointment queue, review OPD records, and monitor clinic analytics. |
| **Tech Comfort** | Moderate. Comfortable with web apps. Expects a clean, distraction-free UI with minimal learning curve.                                                         |
| **Access**       | Full authenticated access to all modules after login.                                                                                                          |
| **Session**      | Authenticated via JWT stored in localStorage. Session persists until manual logout or token expiry (1 day). Client-side expiry check prevents stale sessions.  |

---

### 2.2 Secondary User — Clinic Receptionist / Assistant _(Future)_

While v1.0 focuses on a single authenticated doctor, the system is designed with extensibility in mind. A future role-based expansion may allow receptionists to manage appointments and patient check-ins without accessing clinical or report data.

---

### 2.3 System User — Patient _(Indirect)_

Patients do not directly interact with the system in v1.0. Their data is entered either by the doctor after consultation or auto-synced from a Google Form / Google Sheets source. The AI report generated is emailed directly to the patient's registered email address and can be printed externally.

---

## 3. Core Features & Functional Requirements

### 3.1 Doctor Authentication & Profile Management

The authentication module ensures only registered doctors can access the system. All routes except `/login`, `/register`, `/forgot-password`, and `/reset-password` are protected by JWT middleware on the backend.

#### 3.1.1 Registration & Login

- Doctors register with their name, email, password, and specialization
- Passwords are hashed using bcrypt (salt rounds: 10) before storage — plaintext passwords are never stored
- On successful login, a JWT access token (expires in 1 day) is issued and stored in `localStorage`
- The `doctorEmail` is also persisted in `localStorage` for display purposes (sidebar profile fetch)
- All protected API routes validate the `Authorization: Bearer <token>` header via `authMiddleware.js`
- Client-side `ProtectedRoute` component decodes the JWT payload using `atob()` and checks the `exp` field — expired tokens are cleared and user is redirected to `/login` immediately
- A global axios response interceptor in `config.js` handles any server-side 401 response by clearing localStorage and redirecting to `/login`

#### 3.1.2 Forgot Password & Reset Password

- Doctor submits their registered email on the `/forgot-password` page
- Backend generates a short-lived JWT reset token (expires in 15 minutes) with `{ id, purpose: "reset" }` payload
- A branded HTML email with a reset link is sent via Nodemailer/Gmail using `sendPasswordResetEmail()`
- The link routes to `/reset-password?token=<token>`
- Doctor enters and confirms a new password (minimum 6 characters)
- Backend verifies the token, checks `purpose === "reset"`, and updates the bcrypt hash
- Always returns a generic success message to prevent email enumeration attacks

#### 3.1.3 Doctor Profile

- Doctors can view and edit their profile: name, email, specialization, and avatar image
- Avatar is stored as a base64 data-URI string in the `Doctors` MySQL table (max ~1 MB enforced server-side)
- The sidebar displays the doctor's name and specialization dynamically, fetched from `GET /api/doctor?email=<email>`
- A `profileUpdated` custom window event is dispatched after profile edits to refresh the sidebar without a page reload
- When email is changed, `localStorage.setItem("doctorEmail", newEmail)` is called before dispatching the event so the sidebar refetch uses the correct email
- Password changes are handled separately via `PATCH /api/doctor/change-password` — current password is verified before the new hash is saved

---

### 3.2 Patient Registration & Management

The patient module is the core data entry point of the system. Each patient record captures both demographic and Ayurvedic clinical data.

#### 3.2.1 Patient Registration

Patients enter data via a Google Form linked to a Google Sheet. The sync service reads this sheet every minute and upserts records into MySQL. Patients can also be created directly via the webhook endpoint.

The following fields are captured:

| Field           | Type / Options   | Description                                   |
| --------------- | ---------------- | --------------------------------------------- |
| Name            | Text             | Full name of the patient                      |
| Email           | Email (unique)   | Used as unique identifier; upsert key in sync |
| Age             | Integer          | Age in years; validated min: 0                |
| Weight          | Float (kg)       | Patient weight                                |
| Height          | Float (cm)       | Patient height in centimetres                 |
| Contact No.     | String           | Phone number for appointment reminders        |
| Body Build      | Enum (3 options) | Thin/Medium/Broad — maps to Vata/Pitta/Kapha  |
| Skin Type       | Enum (3 options) | Dry / Warm-sensitive / Soft-oily              |
| Digestion       | Enum (3 options) | Irregular / Strong-acidity / Slow             |
| Hunger Pattern  | Enum (3 options) | Variable / Strong-sharp / Mild-stable         |
| Sleep Pattern   | Enum (3 options) | Light / Moderate / Deep                       |
| Bowel Movements | Enum (3 options) | Dry / Loose / Regular-slow                    |
| Stress Response | Enum (3 options) | Anxious / Irritable / Withdrawn               |
| Energy Level    | Enum (3 options) | Fluctuating / Strong / Stable-slow            |

#### 3.2.2 Dosha Mapping

The eight Prakriti enum fields map to the three classical Ayurvedic Doshas as follows:

| Dosha     | Body Build                      | Skin Type                     | Digestion                   | Hunger                                | Sleep                   | Bowel                  | Stress                | Energy                  |
| --------- | ------------------------------- | ----------------------------- | --------------------------- | ------------------------------------- | ----------------------- | ---------------------- | --------------------- | ----------------------- |
| **Vata**  | Thin, difficulty gaining weight | Dry, rough, cold              | Irregular, bloating/gas     | Variable, forget to eat               | Light, easily disturbed | Dry, hard, constipated | Anxious or fearful    | Fluctuating, bursts     |
| **Pitta** | Medium build, muscular          | Warm, sensitive, redness/acne | Strong but prone to acidity | Strong and sharp, irritable if hungry | Moderate, may wake once | Loose or frequent      | Irritable or angry    | Strong but can burn out |
| **Kapha** | Broad, easily gains weight      | Soft, thick, oily             | Slow, heavy after meals     | Mild and stable                       | Deep and long           | Regular but slow       | Withdraw or feel dull | Stable but slow         |

#### 3.2.3 AI-Computed Fields

After registration, the AI service analyses the patient's responses to compute:

- **Vikriti Type** — the patient's current Dosha imbalance (e.g., Vata-Pitta, Kapha, etc.)
- **Severity** — categorised as:
  - `Sthula` — gross/mild imbalance
  - `Madhyama` — moderate imbalance
  - `Sukshma` — subtle/deep imbalance

#### 3.2.4 Patient Status Flags

Each patient record carries three boolean-style status flags that drive their journey through the clinic workflow:

| Flag          | Values   | Meaning                                                                      |
| ------------- | -------- | ---------------------------------------------------------------------------- |
| `isAppointed` | yes / no | Patient has been called into the doctor's cabin for their appointment        |
| `isOpd`       | yes / no | Patient's visit has been completed and a treatment report has been generated |
| `isFollowup`  | yes / no | Patient has a scheduled follow-up visit pending                              |

#### 3.2.5 Patient List & Search

- All registered patients are listed in the Patients module ordered by `createdAt` descending
- No serial number column — patients identified by name and initials avatar
- Full patient detail page accessible via `/patient/:id`
- Inline editing of patient data via centred modal (Edit Basic Info / Edit Health Details buttons)
- Health edits call `PUT /api/patients/:id/health`; basic info edits call `PUT /api/patients/:id` — both endpoints use field whitelisting to prevent mass-assignment
- Complete visit history displayed as a chronological table per patient
- Breadcrumb navigation reflects actual navigation source (Patients / Appointments / Follow-ups / OPD / History)

---

### 3.3 Appointment Management

The appointments module provides the doctor with a real-time queue of patients who have registered but not yet completed their OPD visit.

#### 3.3.1 Appointment Queue

- Lists all patients where `isOpd = 'no'`, ordered by registration date
- Each row shows: patient name, registration date, Vikriti type badge, and cabin entry status
- Doctor can mark a patient as **"Entered Cabin"** (`isAppointed = yes`) to signal the consultation has started
- A `PatientVisit` record with `visitType = 'appointment'` and `status = 'pending'` is created simultaneously when the patient enters the cabin
- Cancel button only shown when `isOpd !== 'yes'` (guard prevents accidental cancellation of completed visits)
- Doctor can cancel an appointment, which marks the PatientVisit as `status = 'missed'` and resets `isAppointed` to `'no'`

#### 3.3.2 AI Report Generation Flow

Once the patient is in the cabin, the doctor navigates to the patient's detail page to:

1. Review the full Prakriti profile and AI-assessed Vikriti type
2. Trigger AI report generation — the system sends patient data to the integrated LLM endpoint
3. Review and optionally edit the AI-generated treatment plan in an inline textarea
4. Approve the report with a toggle (`treatmentApproved`)
5. Set the follow-up duration: **No follow-up / 7 Days / 15 Days**
6. Export the report — this triggers `PATCH /:id/export` which:
   - Sets `isOpd = 'yes'`
   - Marks the PatientVisit `status = 'completed'`
   - Stores the report text in `aiReport` and the visit's `report` field
   - Computes and stores `followupDate` using a data-driven duration map (`FOLLOWUP_DAYS`)
   - Creates a new `PatientVisit` record with `visitType = 'followup'` and `status = 'pending'` if applicable
   - Sends the full HTML treatment report to the patient's email (fire-and-forget, non-blocking)

---

### 3.4 Follow-up Management

The follow-up module lists all patients who have a scheduled return visit.

- Lists patients where `isFollowup = 'yes'`, ordered by `followupDate` ascending (soonest first)
- Displays the scheduled follow-up date, follow-up interval (7 or 15 days), and Vikriti type
- Doctor can cancel a follow-up, which:
  - Clears `followupDate` and resets `isFollowup` to `'no'`
  - Resets `followupDuration` to `'No'`
  - Marks the associated PatientVisit record as `status = 'missed'`
- On the follow-up visit day, the patient flows back into the Appointment queue for a new cabin session

---

### 3.5 OPD (Outpatient Department) Records

The OPD view shows all patients whose visit was completed **today**.

- Fetches `PatientVisit` records where `visitDate = today` AND `status = 'completed'`, joined with Patient data
- Empty state message includes today's date so the time-scope is immediately clear to the user
- Displays: patient name, visit completion badge, follow-up schedule (if any), and Vikriti type
- Records are immutable in this view — the OPD page is read-only

---

### 3.6 Visit History

The History module provides a full chronological record of every patient visit ever recorded in the system.

#### 3.6.1 Data Displayed Per Record

| Column          | Source                 | Description                                  |
| --------------- | ---------------------- | -------------------------------------------- |
| Patient Name    | Patient.name           | With avatar initial, no serial number        |
| Email           | Patient.email          | Contact identifier                           |
| Visit Date      | PatientVisit.visitDate | Date of the visit                            |
| Visit Type      | PatientVisit.visitType | Appointment / Follow-up / OPD                |
| Status          | PatientVisit.status    | Completed / Pending / Missed                 |
| Dosha / Vikriti | Patient.vikritiType    | AI-assessed Dosha imbalance                  |
| Last Updated    | PatientVisit.updatedAt | Timestamp of last record change              |
| Action          | —                      | "View" button linking to patient detail page |

#### 3.6.2 Filtering & Search

- **Filter by Visit Type:** All / Appointment / Follow-up / OPD
- **Filter by Status:** All / Completed / Pending / Missed
- **Text search** by patient name or email
- All filters are independent and combinable
- Result count updates dynamically as filters are applied
- "View" button navigates to `/patient/:id` passing `{ state: { from: "history" } }` for correct breadcrumb rendering

#### 3.6.3 Summary Statistics (Top Cards)

Seven summary cards provide at-a-glance totals above the table:

| Card         | Value                               |
| ------------ | ----------------------------------- |
| Total Visits | Count of all PatientVisit records   |
| Completed    | Visits with status = completed      |
| Pending      | Visits with status = pending        |
| Missed       | Visits with status = missed         |
| Appointments | Visits with visitType = appointment |
| Follow-ups   | Visits with visitType = followup    |
| OPD Visits   | Visits with visitType = opd         |

---

### 3.7 Analytics Dashboard

The Dashboard provides real-time visual analytics derived from `GET /api/patients`. It is divided into two tabs: **Home** and **Treatment Analysis**.

#### 3.7.1 Home Tab — Demographic & Dosha Overview

**Stat Cards (top row):**

| Card             | Calculation                                        |
| ---------------- | -------------------------------------------------- |
| Total Patients   | `rawData.length`                                   |
| Average Age      | `sum(age) / count` rounded to 1 decimal            |
| Dominant Dosha   | Most frequent bodyBuild mapped to Vata/Pitta/Kapha |
| Common Vikriti   | Most frequent `vikritiType` value                  |
| OPD / Follow-ups | `count(isOpd=yes) / count(isFollowup=yes)`         |

**Charts:**

| Chart                         | Type           | Description                                     |
| ----------------------------- | -------------- | ----------------------------------------------- |
| Dosha (Prakriti) Distribution | Donut Pie      | Vata/Pitta/Kapha proportion across all patients |
| Sleep Pattern Distribution    | Vertical Bar   | Light/Moderate/Deep sleep pattern counts        |
| Vikriti Distribution          | Horizontal Bar | Top 6 Vikriti types by patient count            |
| Age Group Distribution        | Area Chart     | Patient count plotted across age values         |

#### 3.7.2 Treatment Analysis Tab — Clinical Outcome Metrics

**Stat Cards:**

| Card                | Calculation                                |
| ------------------- | ------------------------------------------ |
| OPD Completion Rate | `(count(isOpd=yes) / total) * 100`         |
| Most Common Vikriti | Top vikritiType from completed assessments |
| Follow-up Rate      | `(count(isFollowup=yes) / total) * 100`    |
| Active Appointments | `count(isAppointed=yes)`                   |

**Charts:**

| Chart                    | Type           | Description                                                  |
| ------------------------ | -------------- | ------------------------------------------------------------ |
| Patient Status Breakdown | Pie            | OPD Completed / Appointments / Follow-ups proportion         |
| Dosha vs Severity        | Stacked Bar    | Sthula/Madhyama/Sukshma distribution within each Dosha group |
| Skin Type Distribution   | Horizontal Bar | Vata/Pitta/Kapha skin type counts                            |
| Digestion Patterns       | Vertical Bar   | Three digestion category counts                              |
| Stress Response Patterns | Vertical Bar   | Anxious/Irritable/Withdrawn counts                           |

#### 3.7.3 Dashboard Filters & Controls

- Left sidebar filter panel (desktop) and slide-in drawer (mobile) — green-themed
- **Home tab filters:** Dosha (Body Build), Sleep Pattern, Vikriti Type, Severity
- **Treatment tab filters:** OPD Status, Follow-up status, Skin Type, Severity
- `optCache` (useMemo) pre-computes unique filter options per tab — dependency array includes both `rawData` and `tab` so options rebuild correctly when switching tabs
- All filters update charts and stat cards simultaneously via `useMemo` on `filtered` array
- **Reset button** clears all active filters instantly
- **Refresh button** re-fetches data from the database (with loading spinner)
- **"Live" badge** at the bottom of the filter panel shows total vs filtered count
- Last-updated timestamp shown in the header after each fetch

---

## 4. Technical Architecture

### 4.1 Technology Stack

| Layer              | Technology       | Version | Purpose                                             |
| ------------------ | ---------------- | ------- | --------------------------------------------------- |
| Frontend Framework | React            | 19.x    | Component-based SPA                                 |
| Build Tool         | Vite             | 7.x     | Fast HMR development and optimised production build |
| Styling            | Tailwind CSS     | v4.x    | Utility-first responsive styling via Vite plugin    |
| Charts             | Recharts         | 2.12.x  | SVG-based responsive chart library                  |
| Icons              | Lucide React     | 0.400.x | Consistent icon set                                 |
| Routing            | React Router DOM | v7.x    | Client-side routing with protected routes           |
| HTTP Client        | Axios            | 1.x     | API communication with global interceptors          |
| Backend Runtime    | Node.js          | 22.x    | Server-side JavaScript runtime                      |
| Backend Framework  | Express          | 5.x     | RESTful API server                                  |
| ORM                | Sequelize        | 6.37.x  | MySQL abstraction with model-based schema sync      |
| Database           | MySQL            | 8.x     | Relational data store                               |
| Authentication     | jsonwebtoken     | 9.x     | Stateless JWT token signing and verification        |
| Password Hashing   | bcryptjs         | 3.x     | Secure password storage (salt rounds: 10)           |
| Email              | Nodemailer       | 8.x     | Gmail-based report and reset emails                 |
| Scheduling         | node-cron        | 4.x     | Google Sheets sync every 60 seconds                 |
| CSV Parsing        | csv-parse        | 6.x     | Parses Google Sheets CSV export                     |
| HTTP Requests      | Axios (backend)  | 1.x     | Fetches Google Sheets CSV URL                       |
| Google APIs        | googleapis       | 171.x   | Google Calendar webhook integration                 |
| Dev Tooling        | nodemon          | 3.x     | Auto-restart backend on file changes                |

---

### 4.2 System Architecture Overview

Ayurveda Care follows a standard three-tier web architecture:

```
┌─────────────────────────────────────────────────────────┐
│                  PRESENTATION LAYER                      │
│              React SPA (Vite, port 5173)                 │
│  Dashboard | Appointments | OPD | History | Patients    │
└────────────────────────┬────────────────────────────────┘
                         │ REST API (Axios + JWT interceptor)
                         │ Authorization: Bearer <JWT>
┌────────────────────────▼────────────────────────────────┐
│                 APPLICATION LAYER                        │
│            Node.js + Express (port 5000)                 │
│   /api/auth  |  /api/doctor  |  /api/patients           │
│         authMiddleware.js  |  Sequelize ORM              │
│         syncPatient.js (cron every 1 min)               │
└────────────────────────┬────────────────────────────────┘
                         │ Sequelize queries (parameterised)
┌────────────────────────▼────────────────────────────────┐
│                    DATA LAYER                            │
│                 MySQL Database                           │
│   Doctors table | Patients table | PatientVisits table  │
└─────────────────────────────────────────────────────────┘

External integrations:
  Google Sheets CSV ──→ syncPatient.js (cron pull every 60s)
  Gmail SMTP        ←── emailService.js (report + reset emails)
  Google Calendar   ←── googleWebhook.js (webhook push)
```

**Presentation Layer (React SPA):** All state managed with React hooks (`useState`, `useEffect`, `useMemo`, `useCallback`). React Router v7 handles navigation. `ProtectedRoute` checks for a valid, non-expired JWT. Axios interceptors in `config.js` handle token attachment and 401 redirects globally.

**Application Layer (Express API):** All routes prefixed under `/api/`. `authMiddleware.js` validates JWT on every protected route and sets `req.doctorId`. Business logic lives in route handlers. Sequelize ORM manages all database interactions with parameterised queries (no SQL injection risk).

**Data Layer (MySQL):** Three tables — `Doctors`, `Patients`, and `PatientVisits`. One-to-many: one Patient has many PatientVisits. Schema is auto-synced with `alter: true` in development only; plain `sync({})` in production.

---

### 4.3 Data Models

#### 4.3.1 Doctor Model (`Doctors` table)

| Column           | Type     | Constraints       | Description                             |
| ---------------- | -------- | ----------------- | --------------------------------------- |
| `id`             | INT      | PK, autoIncrement | Auto-incrementing primary key           |
| `name`           | STRING   | not null          | Full display name                       |
| `email`          | STRING   | unique, not null  | Login identifier, validated as email    |
| `specialization` | STRING   | not null          | e.g. "Ayurvedic Physician"              |
| `password`       | STRING   | not null          | bcrypt hash — never stored as plaintext |
| `avatar`         | LONGTEXT | nullable          | base64 data-URI, max ~1 MB enforced     |
| `createdAt`      | DATETIME | auto              | Sequelize auto-timestamp                |
| `updatedAt`      | DATETIME | auto              | Sequelize auto-timestamp                |

#### 4.3.2 Patient Model (`Patients` table)

| Column              | Type                            | Constraints       | Description                                    |
| ------------------- | ------------------------------- | ----------------- | ---------------------------------------------- |
| `id`                | INT                             | PK, autoIncrement | Auto-incrementing primary key                  |
| `email`             | STRING                          | unique, not null  | Unique patient identifier; upsert key for sync |
| `name`              | STRING                          | not null          | Full patient name                              |
| `age`               | INTEGER                         | not null, min: 0  | Age in years                                   |
| `weight`            | FLOAT                           | not null, min: 0  | Weight in kg                                   |
| `height`            | FLOAT                           | not null, min: 0  | Height in cm                                   |
| `contactNo`         | STRING                          | not null          | Phone number                                   |
| `bodyBuild`         | ENUM(3)                         | not null          | Prakriti body build type                       |
| `skinType`          | ENUM(3)                         | not null          | Skin type indicator                            |
| `digestion`         | ENUM(3)                         | not null          | Digestive pattern                              |
| `hungerPattern`     | ENUM(3)                         | not null          | Hunger characteristic                          |
| `sleepPattern`      | ENUM(3)                         | not null          | Sleep quality indicator                        |
| `bowelMovements`    | ENUM(3)                         | not null          | Digestive elimination pattern                  |
| `stressResponse`    | ENUM(3)                         | not null          | Emotional response to stress                   |
| `energyLevel`       | ENUM(3)                         | not null          | Daily energy pattern                           |
| `vikritiType`       | STRING                          | nullable          | AI-computed current Dosha imbalance            |
| `severity`          | ENUM(Sthula, Madhyama, Sukshma) | nullable          | Severity of Vikriti imbalance                  |
| `isAppointed`       | ENUM(yes, no)                   | default: no       | Whether patient is currently in the cabin      |
| `isFollowup`        | ENUM(yes, no)                   | default: no       | Whether a follow-up is scheduled               |
| `isOpd`             | ENUM(yes, no)                   | default: no       | Whether patient has completed at least one OPD |
| `aiReport`          | TEXT                            | nullable          | Full AI-generated treatment report text        |
| `treatmentApproved` | BOOLEAN                         | default: true     | Whether doctor has approved the AI report      |
| `followupDuration`  | STRING                          | default: "No"     | No / 7 Days / 15 Days / 1 Month (extensible)   |
| `followupDate`      | DATEONLY                        | nullable          | Computed follow-up date (YYYY-MM-DD)           |
| `createdAt`         | DATETIME                        | auto              | Sequelize auto-timestamp                       |
| `updatedAt`         | DATETIME                        | auto              | Sequelize auto-timestamp                       |

#### 4.3.3 PatientVisit Model (`PatientVisits` table)

| Column      | Type                             | Constraints               | Description                               |
| ----------- | -------------------------------- | ------------------------- | ----------------------------------------- |
| `id`        | INT                              | PK, autoIncrement         | Auto-incrementing primary key             |
| `patientId` | INT                              | FK → Patient.id, not null | Foreign key referencing the patient       |
| `visitDate` | DATEONLY                         | not null                  | Date of the visit (YYYY-MM-DD)            |
| `visitType` | ENUM(appointment, followup, opd) | not null                  | Type of clinical visit                    |
| `status`    | ENUM(pending, completed, missed) | default: pending          | Current visit status                      |
| `report`    | TEXT                             | nullable                  | AI report text stored at visit completion |
| `notes`     | TEXT                             | nullable                  | Doctor notes (extensible field)           |
| `createdAt` | DATETIME                         | auto                      | Sequelize auto-timestamp                  |
| `updatedAt` | DATETIME                         | auto                      | Sequelize auto-timestamp                  |

**Relationship:** `Patient.hasMany(PatientVisit, { foreignKey: 'patientId', as: 'visits' })`
**Reverse:** `PatientVisit.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' })`

---

## 5. Codebase Reference — File by File

This section documents every source file in the project: its location, purpose, and the key functions or logic it contains.

---

### 5.1 Backend Files

#### `backend/.env`

Environment configuration file. **Never committed to source control.** Contains all secrets and connection strings. See `.env.example` for the full list of required keys (no values). Keys include `DB_HOST`, `DB_USER`, `DB_NAME`, `DB_PASSWORD`, `JWT_SECRET`, `WEBHOOK_SECRET`, `EMAIL_USER`, `EMAIL_PASS`, `DOCTOR_NAME`, `CLINIC_NAME`, `FRONTEND_URL`, `NODE_ENV`.

---

#### `backend/server.js`

**Entry point.** Sets up the Express app, CORS (restricted to `FRONTEND_URL`), body parser (5 MB limit), and mounts all four route groups. In development, runs `sequelize.sync({ alter: true })` to auto-apply schema changes without data loss. In production, runs `sequelize.sync({})` (no structural changes). Requires `syncPatient.js` after the DB is ready, which starts the cron job pulling from Google Sheets every minute.

**Key logic:**

- `process.env.NODE_ENV === "production"` guard on `alter: true`
- Route mounting: `/api/auth`, `/api` (doctor), `/api/patients`, `/api/webhooks`

---

#### `backend/config/database.js`

Creates and exports the single Sequelize instance connected to MySQL. Reads connection settings from `process.env`. `logging: false` suppresses raw SQL from the console. All models import this instance to define their tables and run queries.

---

#### `backend/middleware/authMiddleware.js`

Express middleware applied to all protected routes via `router.use(authMiddleware)`. Reads the `Authorization` header, splits off the Bearer token, and calls `jwt.verify()`. On success, sets `req.doctorId = decoded.id` for use by downstream route handlers. Returns structured 401 JSON for missing, expired, or invalid tokens.

---

#### `backend/models/Doctor.js`

Sequelize model defining the `Doctors` table. Fields: `id` (PK), `name`, `email` (unique), `specialization`, `password` (hashed string), `avatar` (LONGTEXT for base64). Timestamps auto-managed. Never sends the `password` field to the frontend — routes explicitly strip it with destructuring.

---

#### `backend/models/Patient.js`

Sequelize model defining the `Patients` table. Contains all eight Prakriti ENUM fields, demographic fields, the three status flags (`isAppointed`, `isFollowup`, `isOpd`), and the report/followup fields. The `email` field is the natural unique key used as the upsert target by the sync service.

---

#### `backend/models/PatientVisit.js`

Sequelize model defining the `PatientVisits` table. Declares the `Patient.hasMany` / `PatientVisit.belongsTo` association with `as: "patient"` and `as: "visits"` aliases. These aliases are required by the history and OPD routes that use Sequelize `include` with `populate`.

---

#### `backend/routes/authRoutes.js`

**No auth middleware** — public routes. Four endpoints:

- `POST /api/auth/register` — validates fields, checks for duplicate email, hashes password with bcrypt, creates Doctor record.
- `POST /api/auth/login` — finds Doctor by email, compares password with `bcrypt.compare`, signs a 1-day JWT containing `{ id: doctor.id }`, returns token + safe doctor object (no password).
- `POST /api/auth/forgot-password` — generates a 15-minute JWT reset token with `{ id, purpose: "reset" }`, sends branded HTML email via `sendPasswordResetEmail()`. Always returns the same generic message to prevent email enumeration.
- `POST /api/auth/reset-password` — verifies token, checks `purpose === "reset"`, hashes new password, updates Doctor record. Returns 400 for invalid/expired tokens.

---

#### `backend/routes/doctorRoutes.js`

**Auth required** (via `router.use(authMiddleware)`). Three endpoints:

- `GET /api/doctor?email=` — fetches doctor profile by email query param, returns all fields except password.
- `PUT /api/doctor` — updates name, email, specialization, avatar using `req.doctorId` from JWT (ownership verified by token, not query param). Enforces 1.5 MB avatar size limit. After email update, frontend must also update `localStorage.doctorEmail`.
- `PATCH /api/doctor/change-password` — verifies current password, hashes and saves new password. Uses `req.doctorId` from JWT.

---

#### `backend/routes/patientRoutes.js`

**Auth required** — the largest route file with 14 endpoints covering the full patient lifecycle.

**Read endpoints:**

- `GET /api/patients` — all patients, newest first. Feeds the Patients list and Dashboard.
- `GET /api/patients/appointments` — patients where `isOpd = "no"`. Feeds the Appointments queue.
- `GET /api/patients/followups` — patients where `isFollowup = "yes"`, sorted by `followupDate ASC`.
- `GET /api/patients/opd` — PatientVisits where `visitDate = today` and `status = "completed"`, joined with Patient. Feeds the OPD view.
- `GET /api/patients/history` — all PatientVisits joined with Patient, sorted by `visitDate DESC`. Feeds the History page.
- `GET /api/patients/:id` — single patient by primary key.
- `GET /api/patients/:id/visits` — all visits for one patient, sorted by `visitDate DESC`.

**Write endpoints:**

- `PUT /api/patients/:id` — updates basic info only. Whitelisted fields: `name, email, age, height, weight, contactNo`. Other fields (status flags, report) are silently ignored — prevents mass-assignment.
- `PUT /api/patients/:id/health` — updates Prakriti/health fields only. Whitelisted: the eight dosha fields, `severity`, `vikritiType`.
- `PATCH /api/patients/:id/appointed` — sets `isAppointed`; if `"yes"`, uses `findOrCreate` to create a pending appointment PatientVisit for today.
- `PATCH /api/patients/:id/cancel-appointment` — sets pending appointment visits to `"missed"`, resets `isAppointed` to `"no"`.
- `PATCH /api/patients/:id/cancel-followup` — sets the pending followup visit on `followupDate` to `"missed"`, resets `isFollowup`, `followupDuration`, `followupDate`.
- `PATCH /api/patients/visits/:visitId/cancel` — cancels a specific visit by its own ID; cannot cancel a completed visit; cascades to reset the patient status flag.
- `DELETE /api/patients/visits/:visitId` — hard-deletes a visit record (used from History page only).
- `PATCH /api/patients/:id/export` — the most complex endpoint. Uses `FOLLOWUP_DAYS = { "7 Days": 7, "15 Days": 15, "1 Month": 30 }` map to compute `followupDate`. Updates patient status, marks visit completed, creates followup visit, fires report email (non-blocking).

---

#### `backend/routes/googleWebhook.js`

Receives `POST /api/webhooks/google-form-webhook` from Google Apps Script when a new form is submitted. Validates the `x-secret-key` header against `WEBHOOK_SECRET`. Upserts the patient record using the email as the key. **No auth middleware** — authenticated by the shared secret header instead.

---

#### `backend/services/syncPatient.js`

Pulls patient data from Google Sheets every 60 seconds using `node-cron`. Fetches the publicly published CSV URL of the Google Sheet via `axios.get()`, parses it with `csv-parse/sync`, and upserts each row into the `Patients` table.

Key function `mapEnum(field, value)` strips Google Form answer prefixes (e.g., `"A. Thin, difficulty gaining weight"` → `"Thin, difficulty gaining weight"`) and validates the cleaned value against the ENUM list. Null values are removed from the update payload so they do not overwrite existing valid data. Logs created / updated / skipped counts per sync run.

---

#### `backend/services/emailService.js`

Nodemailer setup using Gmail SMTP with credentials from `.env`. Exports two functions:

- `sendReportEmail(patient, visits)` — builds a full HTML treatment report email with dosha info, visit history table, and the AI report text. Sent to the patient's registered email on `PATCH /export`. Fire-and-forget (`.catch()` logged, does not block the API response).
- `sendPasswordResetEmail(doctor, resetLink)` — sends a branded HTML email with the 15-minute reset link to the doctor's email address.

---

#### `backend/manual_sync.js`

Standalone script. Run with `node manual_sync.js` to trigger a one-off Google Sheets sync without waiting for the cron timer. Useful during setup or after a bulk data update to the sheet.

---

### 5.2 Frontend Files

#### `frontend/src/main.jsx`

React entry point. Mounts `<App />` inside `<StrictMode>` into the `#root` DOM element. Imports `index.css` for global styles.

---

#### `frontend/src/App.jsx`

Wraps `<Layout />` inside `<BrowserRouter>`. The BrowserRouter context is required here so that `Layout` and all child components can use React Router hooks (`useLocation`, `useNavigate`, `useParams`).

---

#### `frontend/src/Layout.jsx`

**The shell of the entire app.** Reads `token` from localStorage and `location.pathname` to decide whether to render the Sidebar. Hides the Sidebar on `/login`, `/register`, `/forgot-password`, and `/reset-password`. On mobile, renders a sticky top bar with a hamburger menu button when the Sidebar is hidden. Defines all React Router `<Routes>` and wraps all protected pages in `<ProtectedRoute>`.

Routes defined: `/`, `/login`, `/register`, `/forgot-password`, `/reset-password`, `/dashboard`, `/doctor/edit`, `/appointment`, `/followups`, `/opd`, `/history`, `/patient`, `/patient/:id`.

---

#### `frontend/src/config.js`

**Central API configuration.** Exports three base URL constants: `PATIENTS_API`, `AUTH_API`, `DOCTOR_API`. Sets up two global Axios interceptors:

- **Request interceptor** — reads `token` from localStorage and injects `Authorization: Bearer <token>` into every outgoing request automatically. No component ever needs to manually attach a token.
- **Response interceptor** — if any API call returns a 401 status, clears `token` and `doctorEmail` from localStorage and hard-redirects to `/login`. Handles expired or invalidated sessions universally.

---

#### `frontend/src/index.css`

**All global styles.** Imports Google Fonts (Playfair Display, Jost, DM Mono) first, then Tailwind CSS. Defines the full colour palette as CSS custom properties on `:root` (e.g., `--forest`, `--fern`, `--parchment`, `--terracotta`, `--mist`). Contains all animation `@keyframes` and utility classes (`.anim-up`, `.anim-scale`, `.d-150` delay classes). Defines reusable component classes: `.card`, `.card-interactive`, `.btn-primary`, `.btn-ghost`, `.input-field`, `.badge`, `.trow`, `.shimmer`, `.leaf-bg`. Scrollbar styling. The `@import` for Google Fonts must appear **before** `@import "tailwindcss"` due to PostCSS ordering rules.

---

#### `frontend/src/components/ProtectedRoute.jsx`

Wraps any page that requires authentication. Reads the JWT string from localStorage, base64-decodes the payload segment using `atob()`, and compares `payload.exp * 1000` against `Date.now()`. If the token is absent, malformed, or expired, clears localStorage and returns `<Navigate to="/login" replace />`. No external JWT library needed.

---

#### `frontend/src/components/Sidebar.jsx`

Left navigation panel. On mount, fetches the logged-in doctor's profile via `GET /api/doctor?email=<doctorEmail>` and stores it in local state. Listens to the `"profileUpdated"` window event to refetch when `EditDoctor` saves changes. Renders the doctor avatar (base64 image or initials fallback), name, and specialization with a shimmer skeleton while loading. Contains `NavItem` (individual nav button with active-route highlighting) and a collapsible Appointments dropdown (auto-opens when any child route is active). Logout button clears localStorage and navigates to `/login`.

---

#### `frontend/src/components/Login.jsx`

Login page. Two-panel layout: decorative green branding panel on the left (desktop only) and the form on the right. Submits `POST /api/auth/login`. On success, saves `token` and `doctorEmail` to localStorage then navigates to `/`. On error, renders an inline styled error div — never uses `alert()`. Includes a "Forgot password?" link to `/forgot-password`.

---

#### `frontend/src/components/Register.jsx`

Doctor registration form. Four fields: name, email, specialization, password. Submits `POST /api/auth/register`. On success, shows a green inline success message and auto-redirects to `/login` after 2 seconds. On error, shows a red inline message. Never uses `alert()`.

---

#### `frontend/src/components/ForgotPassword.jsx`

Standalone page (no sidebar). Single email field. Submits `POST /api/auth/forgot-password`. Shows a generic success message regardless of whether the email exists (prevents enumeration). Form hides after success so the user cannot re-submit.

---

#### `frontend/src/components/ResetPassword.jsx`

Reads the `?token=` query parameter from the URL via `useSearchParams`. Two password fields with a show/hide toggle. Validates that passwords match and are at least 6 characters client-side before submitting `POST /api/auth/reset-password`. On success, shows a green message and auto-redirects to `/login` after 2.5 seconds. Shows a "Invalid reset link" error state if `token` is absent from the URL.

---

#### `frontend/src/components/Dashboard.jsx`

Analytics page. Fetches all patients on mount and refresh via `GET /api/patients`. Stores raw data in `rawData` state. Two sub-components render the two tabs:

- `HomeDashboard` — renders donut pie (Prakriti distribution), horizontal bar (Vikriti), vertical bar (sleep), and area chart (age). Uses `countBy()` utility to group and count any field.
- `TreatmentDashboard` — renders patient status pie, stacked bar (Dosha × Severity), horizontal bar (skin), vertical bar (digestion), vertical bar (stress).
- `FilterPanel` — filter dropdowns dynamically built from `optCache`. The `optCache` useMemo now includes `tab` in its dependency array so filter options rebuild when switching between Home and Treatment tabs.
- `countBy(data, keyFn)` — generic utility that groups rows by a key function and returns `[{name, value}]` sorted descending by value.

All chart computation runs entirely in the browser from the raw patient array — there is no separate analytics API.

---

#### `frontend/src/components/AppointmentData.jsx`

Handles three views via the `viewType` prop: `"appointments"`, `"followups"`, `"opd"`. Each view fetches a different endpoint on mount. Renders a `SectionTable` with a different column definition per view. The Cancel button in the appointments view is guarded: only rendered when `p.isOpd !== "yes"`. All patient name links navigate to `/patient/:id` passing `{ state: { from: viewType } }` so `PatientDetails` can render the correct breadcrumb. OPD empty state message includes today's date to explain the time-scoped filter.

---

#### `frontend/src/components/PatientData.jsx`

Patients list page. Fetches all patients from `GET /api/patients`. Client-side name search. Passes filtered array to `PatientsTable`. Shows a loading spinner and empty state with context-aware message.

---

#### `frontend/src/components/PatientTable.jsx`

Renders the patients list as a table (desktop) and card list (mobile). No serial number column — removed in v1.1. Clicking a row navigates to `/patient/:id` with `{ state: { from: "patients" } }`. The desktop view shows name with initials avatar, age, height, weight, and contact number.

---

#### `frontend/src/components/PatientDetails.jsx`

The most complex frontend file. Fetches patient data and visit history in parallel. Three sections: Patient Overview (with Edit Basic Info button), Health Details (with Edit Health Details button), Visit History table, and Generated Report editor.

Key behaviour:

- Edit modal rendered as a **fixed overlay with internal scroll** using `overflow-y-auto` on the backdrop and `min-h-full flex items-center justify-center` wrapper — the modal card always appears centred on the visible viewport, never below the fold.
- "Edit Basic Info" calls `PUT /api/patients/:id`; "Edit Health Details" calls `PUT /api/patients/:id/health` — separate whitelisted endpoints.
- Breadcrumb uses `useLocation().state?.from` to render the correct back link (Patients / Appointments / Follow-ups / OPD / History).
- `handleExport` sends AI report + follow-up choice to `PATCH /api/patients/:id/export`.
- `handleCancelVisit` cancels a pending visit via `PATCH /api/patients/visits/:id/cancel`.

---

#### `frontend/src/components/HistoryData.jsx`

Fetches all visits with patient data joined via `GET /api/patients/history`. Dual filter bars (visit type + status) and text search, all computed client-side. Seven summary stat cards. Desktop table and mobile card layout. No serial number column. Delete button hard-deletes a visit record via `DELETE /api/patients/visits/:id`. "View Patient" navigates to `/patient/:id` with `{ state: { from: "history" } }`.

---

#### `frontend/src/components/EditDoctor.jsx`

Profile settings page with two independent forms:

- **Profile form** — name, email, specialization, avatar (JPG/PNG only, max 1 MB enforced client-side). Submits `PUT /api/doctor` (no email query param — JWT identifies the doctor). After success, updates `localStorage.doctorEmail` to the new email and dispatches the `"profileUpdated"` window event.
- **Password form** — current password, new password, confirm password. Client-side match validation before submitting `PATCH /api/doctor/change-password`.

---

#### `frontend/src/components/Toast.jsx`

Small floating notification component. Accepts `{ msg, type }` prop. `type` controls the colour (`"success"` → green, `"error"` → red). Auto-dismissed by the parent after 3 seconds via `setTimeout`. Used by `AppointmentData`, `PatientDetails`, `HistoryData`.

---

#### `frontend/src/components/AppointmentTable.jsx`

Legacy component retained for backwards compatibility. Not currently used in any active route. Uses `GET /api/patients` to look up a patient by name and navigate to their detail page. Replaced in practice by `AppointmentData.jsx`.

---

#### `frontend/src/utils/patientData.js`

Static mock data array (14 placeholder records all named "Shreya Mehta"). Not used in any live component — retained as reference seed data from the initial prototype. Can be safely deleted once live data is confirmed working.

---

## 6. API Endpoint Specification

All API routes are served from the Express backend on **port 5000** (configurable via `PORT` env var). Protected routes require a valid JWT in the `Authorization: Bearer <token>` header.

### 6.1 Authentication & Doctor Routes

| Method  | Endpoint                      | Auth Required | Description                                         |
| ------- | ----------------------------- | ------------- | --------------------------------------------------- |
| `POST`  | `/api/auth/register`          | No            | Register a new doctor account                       |
| `POST`  | `/api/auth/login`             | No            | Authenticate and receive JWT token (1-day expiry)   |
| `POST`  | `/api/auth/forgot-password`   | No            | Send 15-minute password reset link to doctor email  |
| `POST`  | `/api/auth/reset-password`    | No            | Verify reset token and save new hashed password     |
| `GET`   | `/api/doctor?email=`          | Yes           | Get doctor profile by email query param             |
| `PUT`   | `/api/doctor`                 | Yes           | Update profile (ownership via JWT, not query param) |
| `PATCH` | `/api/doctor/change-password` | Yes           | Verify old password, save new bcrypt hash           |

---

### 6.2 Patient Routes

| Method   | Endpoint                               | Auth Required | Description                                                                   |
| -------- | -------------------------------------- | ------------- | ----------------------------------------------------------------------------- |
| `GET`    | `/api/patients`                        | Yes           | All patients ordered by `createdAt` DESC                                      |
| `GET`    | `/api/patients/appointments`           | Yes           | Patients where `isOpd = 'no'` (appointment queue)                             |
| `GET`    | `/api/patients/followups`              | Yes           | Patients where `isFollowup = 'yes'` ordered by `followupDate` ASC             |
| `GET`    | `/api/patients/opd`                    | Yes           | Today's completed PatientVisit records joined with Patient data               |
| `GET`    | `/api/patients/history`                | Yes           | All PatientVisit records joined with Patient, ordered by date DESC            |
| `GET`    | `/api/patients/:id`                    | Yes           | Single patient details by ID                                                  |
| `GET`    | `/api/patients/:id/visits`             | Yes           | All visit records for a specific patient                                      |
| `PUT`    | `/api/patients/:id`                    | Yes           | Update basic info (whitelisted: name, email, age, height, weight, contact)    |
| `PUT`    | `/api/patients/:id/health`             | Yes           | Update health/dosha fields (whitelisted: 8 dosha fields + severity + vikriti) |
| `PATCH`  | `/api/patients/:id/appointed`          | Yes           | Set `isAppointed` flag; creates pending PatientVisit if `"yes"`               |
| `PATCH`  | `/api/patients/:id/cancel-appointment` | Yes           | Cancel active appointment; marks visit `missed`; resets `isAppointed`         |
| `PATCH`  | `/api/patients/:id/cancel-followup`    | Yes           | Cancel scheduled follow-up; clears `followupDate`; marks visit `missed`       |
| `PATCH`  | `/api/patients/:id/export`             | Yes           | Save AI report; mark OPD complete; create follow-up visit; send email         |
| `PATCH`  | `/api/patients/visits/:visitId/cancel` | Yes           | Cancel a specific visit by its own ID; cascades status reset to patient       |
| `DELETE` | `/api/patients/visits/:visitId`        | Yes           | Hard-delete a visit record                                                    |
| `POST`   | `/api/webhooks/google-form-webhook`    | Secret header | Upsert patient from Google Form webhook; auth via `x-secret-key` header       |

---

### 6.3 Key Request/Response Details

#### `PATCH /api/patients/:id/appointed`

```json
// Request body
{ "isAppointed": "yes" }

// Side effect: creates PatientVisit record
{
  "patientId": <id>,
  "visitDate": "<today YYYY-MM-DD>",
  "visitType": "appointment",
  "status": "pending"
}
```

#### `PATCH /api/patients/:id/export`

```json
// Request body
{
  "followupDuration": "7 Days",
  "aiReport": "<full report text>",
  "treatmentApproved": true
}

// Side effects:
// 1. Patient: isOpd="yes", isFollowup="yes", followupDate="<today+7>", aiReport stored
// 2. Appointment PatientVisit: status="completed", report=<aiReport>
// 3. New PatientVisit: { visitType:"followup", visitDate:"<today+7>", status:"pending" }
// 4. sendReportEmail() fires non-blocking
```

#### `POST /api/auth/forgot-password`

```json
// Request body
{ "email": "doctor@clinic.com" }

// Response (always the same regardless of whether email exists)
{ "message": "If that email exists, a reset link has been sent." }

// Side effect when email found:
// JWT reset token (15 min) generated → HTML email sent via Nodemailer
```

---

## 7. User Interface & Navigation

### 7.1 Application Layout

The application uses a persistent two-panel layout after login:

```
┌──────────────────────┬──────────────────────────────────────────┐
│                      │                                          │
│     SIDEBAR          │          MAIN CONTENT AREA               │
│     (256px fixed)    │          (flex-1, scrollable)            │
│                      │                                          │
│  🌿 AyurvedaCare     │  Active page component renders here:     │
│                      │  - Dashboard (full viewport h-screen)    │
│  [Doctor Profile]    │  - Appointments / Follow-ups / OPD       │
│  [Edit Profile btn]  │  - History                               │
│                      │  - Patients / Patient Detail             │
│  Navigation Menu:    │                                          │
│  • Dashboard         │                                          │
│  • Appointments ▼    │                                          │
│    → Appointments    │                                          │
│    → Follow-ups      │                                          │
│    → OPD             │                                          │
│    → History         │                                          │
│  • Patients          │                                          │
│                      │                                          │
│  [Logout]            │                                          │
└──────────────────────┴──────────────────────────────────────────┘
```

On mobile (< lg breakpoint), the sidebar is hidden by default and slides in over the content when the hamburger button in the sticky top bar is tapped. A semi-transparent backdrop closes it on tap.

---

### 7.2 Sidebar Navigation Structure

| Menu Item      | Route          | Type            | Notes                            |
| -------------- | -------------- | --------------- | -------------------------------- |
| Dashboard      | `/dashboard`   | Top-level       | Default landing page after login |
| Appointments   | —              | Dropdown parent | Chevron toggles open/close       |
| → Appointments | `/appointment` | Sub-item        | Active appointment queue         |
| → Follow-ups   | `/followups`   | Sub-item        | Scheduled follow-up patients     |
| → OPD          | `/opd`         | Sub-item        | Today's completed OPD visits     |
| → History      | `/history`     | Sub-item        | All-time visit records           |
| Patients       | `/patient`     | Top-level       | Full patient list                |

**Dropdown behaviour:**

- Auto-opens when any child route (`/appointment`, `/followups`, `/opd`, `/history`) is active
- Active route: green left border + green text + green background tint
- Chevron rotates 180° when dropdown is open

---

### 7.3 Route Configuration (React Router v7)

```
/                   → Redirects to /dashboard (if token valid) or /login
/login              → Login page (no sidebar)
/register           → Registration page (no sidebar)
/forgot-password    → Forgot password page (no sidebar)
/reset-password     → Reset password page (no sidebar, reads ?token= from URL)
/dashboard          → Dashboard analytics (ProtectedRoute)
/appointment        → AppointmentData viewType="appointments" (ProtectedRoute)
/followups          → AppointmentData viewType="followups" (ProtectedRoute)
/opd                → AppointmentData viewType="opd" (ProtectedRoute)
/history            → HistoryData (ProtectedRoute)
/patient            → PatientData (ProtectedRoute)
/patient/:id        → PatientDetails (ProtectedRoute)
/doctor/edit        → EditDoctor (ProtectedRoute)
```

---

### 7.4 Design System

All visual design is token-based through CSS custom properties defined in `index.css`:

| Token          | Value            | Usage                                |
| -------------- | ---------------- | ------------------------------------ |
| `--forest`     | `#1c4532`        | Primary dark green (headings, icons) |
| `--fern`       | `#276749`        | Interactive green (buttons, links)   |
| `--sage`       | `#4a7c59`        | Secondary green (sub-elements)       |
| `--parchment`  | `#faf6ef`        | Page background                      |
| `--terracotta` | `#c1694f`        | Error / cancel states                |
| `--mist`       | `#6b7e72`        | Muted text, labels                   |
| `--sand`       | `#d4b896`        | Borders, secondary muted elements    |
| `--ink`        | `#1a1f1c`        | Primary body text                    |
| `--font-serif` | Playfair Display | Headings and decorative text         |
| `--font-sans`  | Jost             | All body and UI text                 |
| `--font-mono`  | DM Mono          | IDs, codes, timestamps               |

---

## 8. Patient Lifecycle & Workflow

Understanding the end-to-end patient journey is critical for correct system operation.

```
[Patient fills Google Form]
        │
        ▼
[syncPatient.js runs every 60s]
Patient.upsert() → MySQL Patients table
isAppointed=no, isOpd=no, isFollowup=no
        │
        ▼
[Doctor marks patient as entered cabin]
PATCH /:id/appointed → isAppointed="yes"
PatientVisit created: { visitType:"appointment", status:"pending" }
        │
        ▼
[Doctor opens PatientDetails, generates AI report]
AI report stored in aiReport field
Doctor optionally edits report inline
Doctor sets treatmentApproved and followupDuration
        │
        ▼
[Doctor clicks Export Report]
PATCH /:id/export
→ isOpd="yes"
→ PatientVisit status="completed", report=<aiReport>
→ sendReportEmail() fires (non-blocking)
        │
        ├── [followupDuration="No"] ──────────────→ [End of visit cycle]
        │                                            Patient in OPD + History
        │
        └── [followupDuration="7 Days" or "15 Days"]
            followupDate = today + N days (via FOLLOWUP_DAYS map)
            isFollowup="yes"
            New PatientVisit: { visitType:"followup", status:"pending" }
                    │
                    ▼
            [Follow-up date arrives]
            Patient re-appears in Appointment queue
                    │
                    ▼
            [New cabin session → repeat from Step 2]
```

### State Transition Table

| Step | Action                             | System Effect                                                       | Resulting Patient State                 |
| ---- | ---------------------------------- | ------------------------------------------------------------------- | --------------------------------------- |
| 1    | Patient submits Google Form        | syncPatient.js upserts Patient record                               | isAppointed=no, isOpd=no, isFollowup=no |
| 2    | Doctor marks patient in-cabin      | `isAppointed="yes"`; PatientVisit(appointment, pending) created     | isAppointed=yes                         |
| 3    | Doctor exports report              | `isOpd="yes"`; visit marked completed; followup created if set      | isOpd=yes                               |
| 4a   | No follow-up selected              | Patient stays in OPD history only                                   | isFollowup=no                           |
| 4b   | Follow-up scheduled                | `isFollowup="yes"`; followupDate computed; new PatientVisit created | isFollowup=yes, followupDate set        |
| 5    | Follow-up date arrives             | Patient reappears in Appointment queue                              | New cycle begins                        |
| —    | Appointment cancelled at any stage | PatientVisit → missed; isAppointed reset                            | isAppointed=no                          |
| —    | Follow-up cancelled                | PatientVisit → missed; isFollowup, followupDate cleared             | isFollowup=no, followupDate=null        |

---

## 9. Security Considerations

### 9.1 Authentication

- All non-public routes require a valid JWT, verified by `authMiddleware.js` on every request
- `req.doctorId` is set from the decoded JWT — route handlers use this, never a client-supplied ID
- The `doctorEmail` in localStorage is used for display only; all write operations use the token-validated `req.doctorId`
- Tokens expire after 1 day; client-side `ProtectedRoute` catches expired tokens before any API call is made
- A global response interceptor catches server-side 401s and clears the session
- On logout, `token` and `doctorEmail` are cleared from localStorage

### 9.2 Password Security

- Passwords hashed with bcrypt at salt rounds 10 before storage — plaintext never stored or logged
- Password change requires the current password to be verified first
- Reset tokens are short-lived JWTs (15 minutes) with a `purpose: "reset"` claim — general JWTs cannot be used for password reset
- Forgot-password endpoint always returns the same response regardless of whether the email exists

### 9.3 Input Validation & Mass Assignment Prevention

- All Sequelize ENUM fields reject values outside the defined list
- `PUT /api/patients/:id` only applies fields from `BASIC_EDIT_FIELDS` whitelist
- `PUT /api/patients/:id/health` only applies fields from `HEALTH_EDIT_FIELDS` whitelist
- Status flags (`isAppointed`, `isOpd`, `isFollowup`) and report fields can only be changed via their dedicated PATCH endpoints — never via the PUT edit form
- Express body parser limited to 5 MB to prevent oversized payload attacks

### 9.4 CORS

- Express CORS restricted to `process.env.FRONTEND_URL` only — cross-origin requests from unknown origins are rejected

### 9.5 Database Security

- Sequelize uses parameterised queries for all operations — no raw SQL, no injection risk
- Database credentials stored in `.env`, never committed to source control (`.gitignore` includes `backend/.env`)
- `sequelize.sync({ alter: true })` only runs when `NODE_ENV !== "production"` — production uses safe `sync({})` with no structural changes

### 9.6 Webhook Security

- Google Form webhook authenticated by comparing `x-secret-key` request header against `WEBHOOK_SECRET` env variable — no JWT required for this system-to-system endpoint

---

## 10. Non-Functional Requirements

| Category            | Requirement          | Target                                                                                |
| ------------------- | -------------------- | ------------------------------------------------------------------------------------- |
| **Performance**     | Dashboard load time  | Charts render within 2 seconds for ≤ 1,000 patient records                            |
| **Performance**     | API response time    | All CRUD endpoints respond within 500ms under normal load                             |
| **Performance**     | History page load    | Full visit history table renders within 3 seconds for ≤ 5,000 records                 |
| **Availability**    | System uptime        | 99% uptime during clinic hours (8am–8pm local time)                                   |
| **Scalability**     | Patient records      | System handles up to 10,000 patient records without UI degradation                    |
| **Scalability**     | Concurrent users     | Supports up to 5 simultaneous authenticated sessions                                  |
| **Usability**       | Mobile compatibility | Sidebar collapses to hamburger menu below lg breakpoint; tables scroll horizontally   |
| **Usability**       | Learning curve       | Doctor completes a full patient visit workflow within 5 minutes of first use          |
| **Usability**       | Feedback             | All user actions (save, cancel, export) provide immediate visual feedback via Toast   |
| **Usability**       | Modal UX             | Edit modals appear centred on the visible viewport regardless of scroll position      |
| **Reliability**     | Data integrity       | No patient record is hard-deleted; cancellations mark records as `missed`             |
| **Reliability**     | Error handling       | All API errors return structured JSON with descriptive error messages                 |
| **Reliability**     | Email resilience     | Email failures (report, reset) are caught and logged; they do not block API responses |
| **Maintainability** | Code structure       | Frontend components are modular; backend routes separated by domain                   |
| **Extensibility**   | Follow-up durations  | `FOLLOWUP_DAYS` map in `patientRoutes.js` — add new durations with a single line      |
| **Extensibility**   | New analytics        | Dashboard filter system is data-driven; new filter keys added in one array            |

---

## 11. Future Roadmap

### Phase 2 — Short Term (3–6 months)

- [ ] Multi-doctor support with per-doctor patient ownership and login
- [ ] SMS / WhatsApp follow-up reminders via Twilio or similar service
- [ ] Prescription module with Ayurvedic herb and dosage templates
- [ ] Patient-facing QR code check-in for self-registration in the waiting room
- [ ] PDF export of AI treatment reports for patient handout

### Phase 3 — Medium Term (6–12 months)

- [ ] Billing and invoice generation with PDF export
- [ ] Lab report attachment and tracking per visit
- [ ] Longitudinal Vikriti trend tracking across multiple visits per patient
- [ ] Inventory management module for herbal medicines and supplies
- [ ] Role-based access control for clinic staff (receptionist role)
- [ ] "1 Month" follow-up duration already supported server-side (`FOLLOWUP_DAYS` map); add to frontend UI

### Phase 4 — Long Term (12+ months)

- [ ] Native mobile application (React Native) for on-the-go clinic management
- [ ] Multi-clinic franchise support with centralised admin dashboard
- [ ] Telemedicine integration for remote Ayurvedic consultations
- [ ] Anonymised data insights for Ayurvedic research and publication
- [ ] Integration with national health record systems (ABDM in India)

---

## Appendix A — Environment Variables

| Variable         | Description                       | Example                              |
| ---------------- | --------------------------------- | ------------------------------------ |
| `DB_HOST`        | MySQL host                        | `localhost`                          |
| `DB_PORT`        | MySQL port                        | `3306`                               |
| `DB_NAME`        | Database name                     | `ayurveda`                           |
| `DB_USER`        | Database username                 | `root`                               |
| `DB_PASSWORD`    | Database password                 | _(set in .env, never commit)_        |
| `JWT_SECRET`     | Secret key for JWT signing        | _(random 32+ character string)_      |
| `WEBHOOK_SECRET` | Shared secret for Google webhook  | _(random string)_                    |
| `EMAIL_USER`     | Gmail address for Nodemailer      | `clinic@gmail.com`                   |
| `EMAIL_PASS`     | Gmail app password for Nodemailer | _(16-char app password from Google)_ |
| `DOCTOR_NAME`    | Display name in email templates   | `Dr. Sharma`                         |
| `CLINIC_NAME`    | Clinic name in email templates    | `Ayurveda Care Clinic`               |
| `FRONTEND_URL`   | Allowed CORS origin               | `http://localhost:5173`              |
| `NODE_ENV`       | Environment flag                  | `development` or `production`        |
| `PORT`           | Express server port               | `5000`                               |

---

## Appendix B — Glossary

| Term               | Definition                                                                                                                                 |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Prakriti**       | An individual's inherent Ayurvedic body constitution, determined by the dominant Dosha(s) at birth. It remains constant throughout life.   |
| **Vikriti**        | The current state of Dosha imbalance in an individual. Unlike Prakriti, Vikriti changes based on lifestyle, diet, stress, and environment. |
| **Dosha**          | One of three bio-energetic forces in Ayurveda: Vata (air + ether), Pitta (fire + water), Kapha (earth + water).                            |
| **Vata**           | The Dosha governing movement, nervous system, and communication. Associated with thin build, dry skin, irregular digestion.                |
| **Pitta**          | The Dosha governing metabolism, transformation, and intelligence. Associated with medium build, warm skin, strong digestion.               |
| **Kapha**          | The Dosha governing structure, stability, and lubrication. Associated with broad build, oily skin, slow digestion.                         |
| **Sthula**         | Gross or mild severity level of Vikriti imbalance.                                                                                         |
| **Madhyama**       | Moderate severity level of Vikriti imbalance.                                                                                              |
| **Sukshma**        | Subtle or deep severity level of Vikriti imbalance — hardest to treat.                                                                     |
| **OPD**            | Outpatient Department — refers to completed clinical visits in this system.                                                                |
| **JWT**            | JSON Web Token — a compact, URL-safe means of representing claims between the frontend and backend.                                        |
| **Sequelize**      | A Node.js ORM (Object-Relational Mapper) that provides an abstraction layer over MySQL.                                                    |
| **PatientVisit**   | A database record representing a single clinical visit instance (appointment, follow-up, or OPD).                                          |
| **upsert**         | Insert-or-update — creates a new record if the email does not exist, or updates the existing record if it does.                            |
| **cron**           | A time-based job scheduler. Used here to run `syncPatient()` every 60 seconds.                                                             |
| **FOLLOWUP_DAYS**  | A server-side map `{ "7 Days": 7, "15 Days": 15, "1 Month": 30 }` used to compute `followupDate` from `followupDuration`.                  |
| **authMiddleware** | Express middleware in `authMiddleware.js` that verifies JWT and sets `req.doctorId` on every protected request.                            |

---

_Document version 1.1.0 — Updated March 2026 — Ayurveda Care SQL Edition_
