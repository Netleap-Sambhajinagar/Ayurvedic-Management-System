# Changes Made

## 1. Multi-Doctor Support (Per-Doctor Data Isolation)

### What changed
- **`backend/models/Patient.js`** — Added `doctorId` column (INTEGER, nullable) to every patient record.
- **`backend/services/syncPatient.js`** — When syncing from the Google Sheet, the `Select Doctor` column is read and matched to a Doctor by name or email. The matching doctor's `id` is stored as `doctorId` on the patient.
- **`backend/routes/googleWebhook.js`** — The webhook now accepts `doctorId`, `doctorEmail`, or `doctorName` in the POST body and resolves the correct doctor.
- **`backend/routes/patientRoutes.js`** — ALL queries (patients, appointments, followups, opd, history) now filter by `req.doctorId` (extracted from the JWT of the logged-in doctor). A doctor can only see their own patients.

### What you need to do in Google Forms
1. Add a **Multiple-choice** or **Dropdown** question to your Google Form titled exactly: **"Select Doctor"**
2. Add each doctor's **name** as an option (must match the name they registered with exactly, e.g. "Dr. Sharma").
3. When a patient submits the form, their selected doctor's name is saved to the Sheet under the "Select Doctor" column.
4. The sync runs every minute and maps the name to the doctor's ID automatically.

---

## 2. Editable Follow-up Date

### What changed
- **`frontend/src/components/AppointmentData.jsx`** — In the Follow-ups table, each row now has a small ✏️ edit button next to the date. Clicking it opens a date-picker modal to pick a new date and save it.
- **`backend/routes/patientRoutes.js`** — New `PATCH /patients/:id/followup-date` endpoint that updates the follow-up date and reschedules the corresponding `PatientVisit` record.
- **`frontend/src/components/PatientDetails.jsx`** — Follow-up options now include **"1 Month"** and **"Custom Date"**. Selecting "Custom Date" shows a date picker. The date is saved and included in the PDF when you export.

### How to use
- Go to **Follow-ups** page → click the ✏️ pencil icon next to any follow-up date → pick a new date → **Save Date**.
- Then go to the patient's details page and click **Export Report** to generate a PDF with the updated date.

---

## 3. Bulk Delete in History

### What changed
- **`frontend/src/components/HistoryData.jsx`** — Added a **"☑ Select"** button in the top-right of the History page. When active:
  - A checkbox appears on every row (desktop table and mobile cards).
  - A "Select All" checkbox appears in the table header.
  - A bulk action bar appears at the top showing how many records are selected with a **"Delete Selected"** button.
  - A confirmation modal appears before deletion.
- **`backend/routes/patientRoutes.js`** — New `DELETE /patients/visits` endpoint that accepts `{ ids: [1, 2, 3] }` and deletes all matching visit records in one query.

### How to use
1. Go to **History** page.
2. Click **"☑ Select"** button (top right).
3. Check individual rows or use the header checkbox to select all visible.
4. Click **"Delete Selected"** in the orange bar that appears.
5. Confirm deletion in the modal.
6. Click **"✕ Exit Select"** to return to normal mode.

---

## 4. Yes / No / Cancel Buttons Fixed

### What changed
- **`frontend/src/components/AppointmentData.jsx`** — Fixed a bug where `viewType` was referenced inside `SectionTable` but was never passed as a prop (it was only a closure variable in the outer component). This caused navigation to break. It is now passed as `currentViewType` prop.
- **Yes button**: Calls `PATCH /patients/:id/appointed` with `{ isAppointed: "yes" }` — confirms the patient entered the cabin.
- **No button**: Calls `PATCH /patients/:id/appointed` with `{ isAppointed: "no" }` — marks as not entered.
- **Cancel button**: Opens the cancel confirmation modal → calls `PATCH /patients/:id/cancel-appointment` — marks the appointment visit as "missed" and resets `isAppointed` to "no".
- All three buttons now show toast notifications confirming the action.

---

## Dependencies Added
- **`jspdf`** (`^2.5.1`) added to `frontend/package.json` for PDF generation on Export.
- Run `npm install` inside the `frontend/` folder after pulling these changes.
