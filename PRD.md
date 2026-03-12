# 🌿 Ayurveda Care — Product Requirements Document

**Version:** 1.0.0
**Product Type:** Clinic Management Web Application
**Tech Stack:** React (Vite) + Node.js + MySQL (Sequelize)
**Prepared By:** Ayurveda Care Development Team
**Date:** March 2026
**Status:** Active Development

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Target Users & Personas](#2-target-users--personas)
3. [Core Features & Functional Requirements](#3-core-features--functional-requirements)
4. [Technical Architecture](#4-technical-architecture)
5. [API Endpoint Specification](#5-api-endpoint-specification)
6. [User Interface & Navigation](#6-user-interface--navigation)
7. [Patient Lifecycle & Workflow](#7-patient-lifecycle--workflow)
8. [Security Considerations](#8-security-considerations)
9. [Non-Functional Requirements](#9-non-functional-requirements)
10. [Future Roadmap](#10-future-roadmap)

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

---

### 1.4 Project Scope

**In Scope for v1.0:**

- Doctor authentication and profile management
- Complete patient CRUD with Prakriti/Vikriti data fields
- Appointment queue management with cabin entry tracking
- Follow-up scheduling and management
- OPD daily records view
- Full visit history with filtering and search
- AI treatment report generation and export
- Analytics dashboard (Home tab + Treatment Analysis tab)
- Google Calendar sync via webhook

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
| **Session**      | Authenticated via JWT stored in localStorage. Session persists until manual logout or token expiry.                                                            |

---

### 2.2 Secondary User — Clinic Receptionist / Assistant _(Future)_

While v1.0 focuses on a single authenticated doctor, the system is designed with extensibility in mind. A future role-based expansion may allow receptionists to manage appointments and patient check-ins without accessing clinical or report data.

---

### 2.3 System User — Patient _(Indirect)_

Patients do not directly interact with the system in v1.0. Their data is entered by the doctor after an initial consultation. The AI report generated is intended to be printed or shared with the patient externally.

---

## 3. Core Features & Functional Requirements

### 3.1 Doctor Authentication & Profile Management

The authentication module ensures only registered doctors can access the system. All routes except `/login` and `/register` are protected by JWT middleware on the backend.

#### 3.1.1 Registration & Login

- Doctors register with their name, email, password, and specialization
- Passwords are hashed using bcrypt before storage
- On successful login, a JWT access token is issued and stored in `localStorage`
- The `doctorEmail` is also persisted in localStorage for profile fetching across sessions
- All protected API routes validate the `Authorization: Bearer <token>` header
- Invalid or expired tokens redirect the user to the login page

#### 3.1.2 Doctor Profile

- Doctors can view and edit their profile: name, specialization, and avatar image
- The sidebar displays the doctor's name and specialization dynamically, fetched from `/api/doctor?email=<email>`
- A `profileUpdated` custom event is dispatched after profile edits to refresh the sidebar without a page reload
- Avatar images are uploaded via Multer and served as static assets

---

### 3.2 Patient Registration & Management

The patient module is the core data entry point of the system. Each patient record captures both demographic and Ayurvedic clinical data.

#### 3.2.1 Patient Registration Form

The following fields are captured during patient registration:

| Field           | Type / Options   | Description                                          |
| --------------- | ---------------- | ---------------------------------------------------- |
| Name            | Text             | Full name of the patient                             |
| Email           | Email (unique)   | Used as unique identifier; validated as email format |
| Age             | Integer          | Age in years; validated min: 0                       |
| Weight          | Float (kg)       | Patient weight                                       |
| Height          | Float (cm)       | Patient height                                       |
| Contact No.     | String           | Phone number for appointment reminders               |
| Body Build      | Enum (3 options) | Thin/Medium/Broad — maps to Vata/Pitta/Kapha         |
| Skin Type       | Enum (3 options) | Dry / Warm-sensitive / Soft-oily                     |
| Digestion       | Enum (3 options) | Irregular / Strong-acidity / Slow                    |
| Hunger Pattern  | Enum (3 options) | Variable / Strong-sharp / Mild-stable                |
| Sleep Pattern   | Enum (3 options) | Light / Moderate / Deep                              |
| Bowel Movements | Enum (3 options) | Dry / Loose / Regular-slow                           |
| Stress Response | Enum (3 options) | Anxious / Irritable / Withdrawn                      |
| Energy Level    | Enum (3 options) | Fluctuating / Strong / Stable-slow                   |

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
- Full patient detail page accessible via `/patient/:id`
- Inline editing of patient data supported on the detail page
- Complete visit history displayed as a chronological timeline per patient

---

### 3.3 Appointment Management

The appointments module provides the doctor with a real-time queue of patients who have registered but not yet completed their OPD visit. It is the live operational screen of the clinic.

#### 3.3.1 Appointment Queue

- Lists all patients where `isOpd = 'no'`, ordered by registration date
- Each row shows: patient name, registration date, Vikriti type badge, and cabin entry status
- Doctor can mark a patient as **"Entered Cabin"** (`isAppointed = yes`) to signal the consultation has started
- A `PatientVisit` record with `visitType = 'appointment'` and `status = 'pending'` is created simultaneously when the patient enters the cabin
- Doctor can cancel an appointment, which marks the PatientVisit as `status = 'missed'` and resets `isAppointed` to `'no'`

#### 3.3.2 AI Report Generation Flow

Once the patient is in the cabin, the doctor navigates to the patient's detail page to:

1. Review the full Prakriti profile and AI-assessed Vikriti type
2. Trigger AI report generation — the system sends patient data to the integrated LLM endpoint
3. Review and optionally edit the AI-generated treatment plan
4. Approve the report with a toggle (`treatmentApproved`)
5. Set the follow-up duration: **No follow-up / 7 Days / 15 Days**
6. Export the report — this triggers `PATCH /:id/export` which:
   - Sets `isOpd = 'yes'`
   - Marks the PatientVisit `status = 'completed'`
   - Stores the report text in the `aiReport` field and visit's `report` field
   - Computes and stores `followupDate` if a duration was set
   - Creates a new `PatientVisit` record with `visitType = 'followup'` and `status = 'pending'` if applicable

---

### 3.4 Follow-up Management

The follow-up module lists all patients who have a scheduled return visit, helping the doctor anticipate the day's returning patients.

- Lists patients where `isFollowup = 'yes'`, ordered by `followupDate` ascending (soonest first)
- Displays the scheduled follow-up date, follow-up interval (7 or 15 days), and Vikriti type
- Doctor can cancel a follow-up, which:
  - Clears `followupDate` and resets `isFollowup` to `'no'`
  - Marks the associated PatientVisit record as `status = 'missed'`
- On the follow-up visit day, the patient flows back into the Appointment queue for a new cabin session

---

### 3.5 OPD (Outpatient Department) Records

The OPD view shows all patients whose visit was completed **today**, providing an end-of-day summary of clinic activity.

- Fetches `PatientVisit` records where `visitDate = today` AND `status = 'completed'`, joined with Patient data
- Displays: patient name, visit completion badge, follow-up schedule (if any), and Vikriti type
- Serves as a daily treatment log that can be reviewed for quality assurance and reporting
- Records are immutable in this view — the OPD page is read-only

---

### 3.6 Visit History

The History module provides a full chronological record of every patient visit ever recorded in the system — a complete longitudinal clinical database.

#### 3.6.1 Data Displayed Per Record

| Column          | Source                 | Description                                  |
| --------------- | ---------------------- | -------------------------------------------- |
| Patient Name    | Patient.name           | With avatar initial                          |
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
- All filters are independent and can be combined simultaneously
- Result count updates dynamically as filters are applied

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

The Dashboard provides real-time visual analytics derived directly from the live MySQL database via `GET /api/patients`. It is divided into two tabs: **Home** and **Treatment Analysis**.

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

- Left sidebar with a **Filters Menu** panel (green themed, matching old dashboard)
- **Home tab filters:** Dosha (Body Build), Sleep Pattern, Vikriti Type, Severity
- **Treatment tab filters:** OPD Status, Follow-up status, Skin Type, Severity
- All filters dynamically update charts and stat cards simultaneously via `useMemo`
- **Reset button** clears all active filters instantly
- **Refresh button** re-fetches data from the database (with loading spinner)
- **"Live Data" badge** at the bottom of the filter panel shows total vs filtered count
- Last-updated timestamp shown in the header after each fetch

---

## 4. Technical Architecture

### 4.1 Technology Stack

| Layer              | Technology          | Version | Purpose                                       |
| ------------------ | ------------------- | ------- | --------------------------------------------- |
| Frontend Framework | React               | 19.x    | Component-based SPA                           |
| Build Tool         | Vite                | 7.x     | Fast HMR development and build                |
| Styling            | Tailwind CSS        | v4.x    | Utility-first responsive styling              |
| Charts             | Recharts            | 2.x     | SVG-based responsive chart library            |
| Icons              | Lucide React        | 0.4x    | Consistent icon set                           |
| Routing            | React Router DOM    | v7.x    | Client-side routing with protected routes     |
| HTTP Client        | Axios               | 1.x     | API communication                             |
| Backend Runtime    | Node.js             | 22.x    | Server-side JavaScript runtime                |
| Backend Framework  | Express             | 4.x     | RESTful API server                            |
| ORM                | Sequelize           | 6.x     | MySQL abstraction with model-based sync       |
| Database           | MySQL               | 8.x     | Relational data store                         |
| Authentication     | JWT (jsonwebtoken)  | —       | Stateless authentication tokens               |
| Password Hashing   | bcrypt              | —       | Secure password storage                       |
| File Uploads       | Multer              | —       | Doctor avatar and attachment handling         |
| External Sync      | Google Calendar API | v3      | Webhook-based appointment sync                |
| AI Reports         | External LLM API    | —       | Treatment report generation from patient data |

---

### 4.2 System Architecture Overview

Ayurveda Care follows a standard three-tier web architecture:

```
┌─────────────────────────────────────────────────────────┐
│                  PRESENTATION LAYER                      │
│              React SPA (Vite, port 5173)                 │
│  Dashboard | Appointments | OPD | History | Patients    │
└────────────────────────┬────────────────────────────────┘
                         │ REST API (Axios)
                         │ Authorization: Bearer <JWT>
┌────────────────────────▼────────────────────────────────┐
│                 APPLICATION LAYER                        │
│            Node.js + Express (port 5000)                 │
│   /api/auth  |  /api/doctor  |  /api/patients           │
│         JWT Middleware  |  Sequelize ORM                 │
└────────────────────────┬────────────────────────────────┘
                         │ Sequelize queries
┌────────────────────────▼────────────────────────────────┐
│                    DATA LAYER                            │
│                 MySQL Database                           │
│          Patients table  |  PatientVisits table          │
└─────────────────────────────────────────────────────────┘
```

**Presentation Layer (React SPA):** Runs in the browser. All state managed with React hooks (`useState`, `useEffect`, `useMemo`, `useCallback`). React Router handles navigation. Protected routes wrap components in `<ProtectedRoute>` which checks for a valid JWT in localStorage.

**Application Layer (Express API):** All routes prefixed under `/api/`. Authentication middleware validates JWT on every protected route. Business logic (PatientVisit creation, follow-up scheduling, OPD completion) lives in route handlers. Sequelize ORM manages all database interactions.

**Data Layer (MySQL):** Two primary tables — `Patients` (demographics + Prakriti + status flags) and `PatientVisits` (visit records with type, date, status, report). One-to-many relationship: one Patient has many PatientVisits.

---

### 4.3 Data Models

#### 4.3.1 Patient Model (`patients` table)

| Column              | Type                            | Constraints       | Description                                    |
| ------------------- | ------------------------------- | ----------------- | ---------------------------------------------- |
| `id`                | INT                             | PK, autoIncrement | Auto-incrementing primary key                  |
| `email`             | STRING                          | unique, not null  | Unique patient identifier; validated as email  |
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
| `followupDuration`  | STRING                          | default: "No"     | No / 7 Days / 15 Days                          |
| `followupDate`      | DATEONLY                        | nullable          | Computed follow-up date                        |
| `createdAt`         | DATETIME                        | auto              | Sequelize auto-timestamp                       |
| `updatedAt`         | DATETIME                        | auto              | Sequelize auto-timestamp                       |

#### 4.3.2 PatientVisit Model (`PatientVisits` table)

| Column      | Type                             | Constraints               | Description                               |
| ----------- | -------------------------------- | ------------------------- | ----------------------------------------- |
| `id`        | INT                              | PK, autoIncrement         | Auto-incrementing primary key             |
| `patientId` | INT                              | FK → Patient.id, not null | Foreign key referencing the patient       |
| `visitDate` | DATEONLY                         | not null                  | Date of the visit                         |
| `visitType` | ENUM(appointment, followup, opd) | not null                  | Type of clinical visit                    |
| `status`    | ENUM(pending, completed, missed) | default: pending          | Current visit status                      |
| `report`    | TEXT                             | nullable                  | AI report text stored at visit completion |
| `notes`     | TEXT                             | nullable                  | Doctor notes (extensible field)           |
| `createdAt` | DATETIME                         | auto                      | Sequelize auto-timestamp                  |
| `updatedAt` | DATETIME                         | auto                      | Sequelize auto-timestamp                  |

**Relationship:** `Patient.hasMany(PatientVisit, { foreignKey: 'patientId', as: 'visits' })`

---

## 5. API Endpoint Specification

All API routes are served from the Express backend on **port 5000**. Protected routes require a valid JWT in the `Authorization: Bearer <token>` header.

### 5.1 Authentication & Doctor Routes

| Method | Endpoint             | Auth Required | Description                                          |
| ------ | -------------------- | ------------- | ---------------------------------------------------- |
| `POST` | `/api/auth/register` | No            | Register a new doctor account                        |
| `POST` | `/api/auth/login`    | No            | Authenticate and receive JWT token                   |
| `POST` | `/api/auth/logout`   | Yes           | Invalidate current session                           |
| `GET`  | `/api/doctor`        | Yes           | Get doctor profile by email query param              |
| `PUT`  | `/api/doctor`        | Yes           | Update doctor profile (name, specialization, avatar) |

---

### 5.2 Patient Routes

| Method  | Endpoint                               | Auth Required | Description                                                                 |
| ------- | -------------------------------------- | ------------- | --------------------------------------------------------------------------- |
| `GET`   | `/api/patients`                        | Yes           | Get all patients ordered by `createdAt` DESC                                |
| `GET`   | `/api/patients/appointments`           | Yes           | Get patients where `isOpd = 'no'` (appointment queue)                       |
| `GET`   | `/api/patients/followups`              | Yes           | Get patients where `isFollowup = 'yes'` ordered by `followupDate` ASC       |
| `GET`   | `/api/patients/opd`                    | Yes           | Get today's completed PatientVisit records joined with Patient data         |
| `GET`   | `/api/patients/history`                | Yes           | Get all PatientVisit records joined with Patient data, ordered by date DESC |
| `GET`   | `/api/patients/:id`                    | Yes           | Get single patient details by ID                                            |
| `GET`   | `/api/patients/:id/visits`             | Yes           | Get all visit records for a specific patient                                |
| `PUT`   | `/api/patients/:id`                    | Yes           | Update patient demographic or clinical data                                 |
| `PATCH` | `/api/patients/:id/appointed`          | Yes           | Set `isAppointed` flag; creates pending `PatientVisit`                      |
| `PATCH` | `/api/patients/:id/cancel-appointment` | Yes           | Cancel active appointment; marks visit as `missed`                          |
| `PATCH` | `/api/patients/:id/cancel-followup`    | Yes           | Cancel scheduled follow-up; clears `followupDate`                           |
| `PATCH` | `/api/patients/:id/export`             | Yes           | Export AI report; marks OPD complete; schedules follow-up if set            |
| `PATCH` | `/api/patients/visits/:visitId/cancel` | Yes           | Cancel a specific visit record by its ID                                    |

---

### 5.3 Key Request/Response Details

#### `PATCH /api/patients/:id/appointed`

```json
// Request body
{ "isAppointed": "yes" }

// Side effect: creates PatientVisit record
{
  "patientId": <id>,
  "visitDate": "<today>",
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
// 1. Updates patient: isOpd=yes, isFollowup=yes, followupDate=<today+7>
// 2. Marks appointment PatientVisit as status=completed
// 3. Creates new PatientVisit for the followupDate
```

---

## 6. User Interface & Navigation

### 6.1 Application Layout

The application uses a persistent two-panel layout after login:

```
┌──────────────────────┬──────────────────────────────────────────┐
│                      │                                          │
│     SIDEBAR          │          MAIN CONTENT AREA               │
│     (240px fixed)    │          (flex-1, scrollable)            │
│                      │                                          │
│  🌿 AyurvedaCare     │  Active page component renders here:     │
│                      │  - Dashboard (full viewport)             │
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

---

### 6.2 Sidebar Navigation Structure

| Menu Item      | Route          | Type            | Notes                              |
| -------------- | -------------- | --------------- | ---------------------------------- |
| Dashboard      | `/dashboard`   | Top-level       | Default landing page after login   |
| Appointments   | —              | Dropdown parent | Chevron toggles open/close         |
| → Appointments | `/appointment` | Sub-item        | Active appointment queue           |
| → Follow-ups   | `/followups`   | Sub-item        | Scheduled follow-up patients       |
| → OPD          | `/opd`         | Sub-item        | Today's completed OPD visits       |
| → History      | `/history`     | Sub-item        | All-time visit records             |
| Patients       | `/patient`     | Top-level       | Full patient list and registration |

**Dropdown behaviour:**

- Auto-opens when any child route (`/appointment`, `/followups`, `/opd`, `/history`) is active
- Active route highlighted with green left border + green text + green background tint
- Chevron rotates 180° when open

---

### 6.3 Route Configuration (React Router)

```
/                  → Redirects to /dashboard (if token) or /login
/login             → Login page (no sidebar)
/register          → Registration page (no sidebar)
/dashboard         → Dashboard (analytics)
/appointment       → AppointmentData (viewType="appointments")
/followups         → AppointmentData (viewType="followups")
/opd               → AppointmentData (viewType="opd")
/history           → HistoryData
/patient           → PatientData (all patients)
/patient/:id       → PatientDetails
/doctor/edit       → EditDoctor
```

All routes under `ProtectedRoute` check for a valid `token` in localStorage. If absent, user is redirected to `/login`.

---

### 6.4 Key Page Descriptions

#### Dashboard Page (`/dashboard`)

Full-screen analytics view. Overrides the standard content layout to allow the dashboard's own internal header bar and green filter sidebar to use the full viewport height (`h-screen overflow-hidden`). Data is fetched independently via `GET /api/patients` on mount and on manual refresh.

#### Appointment Page (`/appointment`)

Renders the appointment queue. The `AppointmentData` component accepts a `viewType` prop — `"appointments"` renders the pending queue with cabin-entry controls and cancel actions.

#### History Page (`/history`)

Table-based view of all visits across all time. Features 7 summary stat cards, dual filter bars (visit type + status), text search, and a "View" button on each row linking to the patient's detail page. Data fetched from `GET /api/patients/history`.

#### Patient Detail Page (`/patient/:id`)

Shows the complete clinical profile: all Prakriti fields, Vikriti type, severity, AI report text, and the full visit timeline. Supports inline editing of patient fields. AI report generation can be triggered from this page. Visit history displayed as a card-based chronological list.

---

## 7. Patient Lifecycle & Workflow

Understanding the end-to-end patient journey is critical for correct system operation.

```
[Patient Registers]
        │
        ▼
isAppointed=no, isOpd=no, isFollowup=no
        │
        ▼
[Doctor calls patient into cabin]
PATCH /:id/appointed → isAppointed=yes
PatientVisit created: { visitType: "appointment", status: "pending" }
        │
        ▼
[Doctor reviews Prakriti, generates AI report]
        │
        ▼
[Doctor approves and exports report]
PATCH /:id/export
→ isOpd=yes
→ PatientVisit status=completed
→ aiReport stored
        │
        ├── [No follow-up] ──────────────────────────→ [End of visit cycle]
        │   followupDuration="No"                      Patient in OPD history
        │
        └── [Follow-up scheduled]
            followupDuration="7 Days" or "15 Days"
            followupDate = today + 7 or + 15
            isFollowup=yes
            New PatientVisit: { visitType: "followup", status: "pending" }
                    │
                    ▼
            [Follow-up date arrives]
            Patient re-appears in Appointment queue
                    │
                    ▼
            [New cabin session begins → repeat from Step 2]
```

### State Transition Table

| Step | Action                                | System Effect                                                     | Resulting Patient State                 |
| ---- | ------------------------------------- | ----------------------------------------------------------------- | --------------------------------------- |
| 1    | Patient registers via web form        | Patient record created; AI computes vikritiType & severity        | isAppointed=no, isOpd=no, isFollowup=no |
| 2    | Doctor marks patient as entered cabin | `isAppointed=yes`; PatientVisit(appointment, pending) created     | isAppointed=yes                         |
| 3    | Doctor generates AI report            | LLM API called; report stored in `aiReport` field                 | aiReport populated                      |
| 4    | Doctor exports/approves report        | `isOpd=yes`; visit marked completed; follow-up created if set     | isOpd=yes                               |
| 5a   | No follow-up selected                 | Patient stays in OPD history only                                 | isFollowup=no                           |
| 5b   | Follow-up scheduled                   | `isFollowup=yes`; followupDate computed; new PatientVisit created | isFollowup=yes, followupDate set        |
| 6    | Follow-up date arrives                | Patient reappears in Appointment queue                            | New cycle begins                        |

---

## 8. Security Considerations

### 8.1 Authentication

- All non-public routes require a valid JWT. Tokens are signed with a secret stored in environment variables (`.env`)
- The `doctorEmail` in localStorage is used for display only; all sensitive operations use the token-validated server session
- Tokens have a defined expiry; a refresh mechanism is available for extended sessions
- On logout, the token and email are cleared from localStorage and the user is redirected to login

### 8.2 Input Validation

- All patient registration fields are validated by Sequelize model constraints (ENUMs, not-null, email format, min values)
- `PATCH` and `PUT` routes accept only known fields to prevent mass-assignment vulnerabilities
- The Express JSON body parser is limited to `5mb` to prevent payload-based attacks

### 8.3 CORS

- Express CORS middleware is configured to allow requests from the frontend origin only
- Credentials (tokens) are not sent with cross-origin requests to third-party services

### 8.4 File Uploads

- Doctor avatar uploads are handled by Multer with file type and size restrictions
- Uploaded files are stored in the server's `public/images` directory and served as static assets
- File names are sanitised to prevent path traversal attacks

### 8.5 Database Security

- Sequelize parameterised queries prevent SQL injection on all database operations
- Database credentials are managed via environment variables (`.env`) and never committed to source control
- `sequelize.sync({ alter: true })` applies schema changes safely without dropping existing data

---

## 9. Non-Functional Requirements

| Category            | Requirement          | Target                                                                             |
| ------------------- | -------------------- | ---------------------------------------------------------------------------------- |
| **Performance**     | Dashboard load time  | Charts render within 2 seconds for ≤ 1,000 patient records                         |
| **Performance**     | API response time    | All CRUD endpoints respond within 500ms under normal load                          |
| **Performance**     | History page load    | Full visit history table renders within 3 seconds for ≤ 5,000 records              |
| **Availability**    | System uptime        | 99% uptime during clinic hours (8am–8pm local time)                                |
| **Scalability**     | Patient records      | System handles up to 10,000 patient records without UI degradation                 |
| **Scalability**     | Concurrent users     | Supports up to 5 simultaneous authenticated sessions                               |
| **Usability**       | Tablet compatibility | UI usable on tablets with minimum 768px viewport width                             |
| **Usability**       | Learning curve       | Doctor completes a full patient visit workflow within 5 minutes of first use       |
| **Usability**       | Feedback             | All user actions (save, cancel, generate report) provide immediate visual feedback |
| **Reliability**     | Data integrity       | No patient record is hard-deleted; cancellations mark records as `missed`          |
| **Reliability**     | Error handling       | All API errors return structured JSON with descriptive error messages              |
| **Maintainability** | Code structure       | Frontend components are modular; backend routes separated by domain                |
| **Extensibility**   | New roles            | Architecture supports adding receptionist/nurse roles without major refactoring    |
| **Extensibility**   | New analytics        | Dashboard filter system is data-driven and supports adding new filter keys easily  |

---

## 10. Future Roadmap

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

### Phase 4 — Long Term (12+ months)

- [ ] Native mobile application (React Native) for on-the-go clinic management
- [ ] Multi-clinic franchise support with centralised admin dashboard
- [ ] Telemedicine integration for remote Ayurvedic consultations
- [ ] Anonymised data insights for Ayurvedic research and publication
- [ ] Integration with national health record systems (ABDM in India)

---

## Appendix A — Environment Variables

| Variable               | Description                       | Example                      |
| ---------------------- | --------------------------------- | ---------------------------- |
| `DB_HOST`              | MySQL host                        | `localhost`                  |
| `DB_PORT`              | MySQL port                        | `3306`                       |
| `DB_NAME`              | Database name                     | `ayurveda_care`              |
| `DB_USER`              | Database username                 | `root`                       |
| `DB_PASSWORD`          | Database password                 |                              |
| `JWT_SECRET`           | Secret key for JWT signing        | `<random 256-bit string>`    |
| `JWT_EXPIRY`           | Token expiration duration         | `7d`                         |
| `PORT`                 | Express server port               | `5000`                       |
| `GOOGLE_CLIENT_ID`     | Google OAuth client ID            | `<from GCP console>`         |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret        | `<from GCP console>`         |
| `AI_API_KEY`           | LLM API key for report generation | `<from AI provider>`         |
| `AI_API_URL`           | LLM API endpoint URL              | `https://api.example.com/v1` |

---

## Appendix B — Glossary

| Term             | Definition                                                                                                                                 |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Prakriti**     | An individual's inherent Ayurvedic body constitution, determined by the dominant Dosha(s) at birth. It remains constant throughout life.   |
| **Vikriti**      | The current state of Dosha imbalance in an individual. Unlike Prakriti, Vikriti changes based on lifestyle, diet, stress, and environment. |
| **Dosha**        | One of three bio-energetic forces in Ayurveda: Vata (air + ether), Pitta (fire + water), Kapha (earth + water).                            |
| **Vata**         | The Dosha governing movement, nervous system, and communication. Associated with thin build, dry skin, irregular digestion.                |
| **Pitta**        | The Dosha governing metabolism, transformation, and intelligence. Associated with medium build, warm skin, strong digestion.               |
| **Kapha**        | The Dosha governing structure, stability, and lubrication. Associated with broad build, oily skin, slow digestion.                         |
| **Sthula**       | Gross or mild severity level of Vikriti imbalance.                                                                                         |
| **Madhyama**     | Moderate severity level of Vikriti imbalance.                                                                                              |
| **Sukshma**      | Subtle or deep severity level of Vikriti imbalance — hardest to treat.                                                                     |
| **OPD**          | Outpatient Department — refers to completed clinical visits in this system.                                                                |
| **JWT**          | JSON Web Token — a compact, URL-safe means of representing claims between the frontend and backend.                                        |
| **Sequelize**    | A Node.js ORM (Object-Relational Mapper) that provides an abstraction layer over MySQL.                                                    |
| **PatientVisit** | A database record representing a single clinical visit instance (appointment, follow-up, or OPD).                                          |

---

_Document last updated: March 2026 — Ayurveda Care v1.0.0_
