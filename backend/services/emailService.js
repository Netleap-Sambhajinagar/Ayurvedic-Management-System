const SibApiV3Sdk = require("sib-api-v3-sdk");
require("dotenv").config();

const defaultClient = SibApiV3Sdk.ApiClient.instance;
defaultClient.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

const DOSHA_MAP = {
  "Thin, difficulty gaining weight": "Vata",
  "Medium build, muscular": "Pitta",
  "Broad, easily gains weight": "Kapha",
};

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

async function sendEmail(to, toName, subject, html) {
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  sendSmtpEmail.sender = {
    name: process.env.CLINIC_NAME || "Ayurveda Care",
    email: process.env.EMAIL_USER,
  };
  sendSmtpEmail.to = [{ email: to, name: toName }];
  sendSmtpEmail.subject = subject;
  sendSmtpEmail.htmlContent = html;
  return apiInstance.sendTransacEmail(sendSmtpEmail);
}

async function sendReportEmail(patient, visits) {
  const dosha = DOSHA_MAP[patient.bodyBuild] || patient.bodyBuild || "N/A";
  const doctorName = process.env.DOCTOR_NAME || "Your Doctor";
  const clinicName = process.env.CLINIC_NAME || "Ayurveda Care";

  const visitRows = visits
    .map(
      (v, i) => `
    <tr style="background:${i % 2 === 0 ? "#f9fafb" : "#ffffff"}">
      <td style="padding:10px 14px; font-size:13px; color:#374151;">${formatDate(v.visitDate)}</td>
      <td style="padding:10px 14px; font-size:13px; color:#374151; text-transform:capitalize;">${v.visitType}</td>
      <td style="padding:10px 14px; font-size:13px;">
        <span style="
          background:${v.status === "completed" ? "#dcfce7" : v.status === "missed" ? "#fee2e2" : "#fef9c3"};
          color:${v.status === "completed" ? "#166534" : v.status === "missed" ? "#991b1b" : "#854d0e"};
          padding:2px 10px; border-radius:999px; font-size:12px; font-weight:600;
        ">${v.status}</span>
      </td>
    </tr>
  `,
    )
    .join("");

  const nextFollowup =
    patient.isFollowup === "yes" && patient.followupDate
      ? `<div style="margin:20px 0; padding:16px 20px; background:#f0fdf4; border-left:4px solid #16a34a; border-radius:8px;">
        <p style="margin:0; font-size:14px; color:#166534; font-weight:600;">Next Appointment</p>
        <p style="margin:6px 0 0; font-size:15px; color:#15803d; font-weight:700;">${formatDate(patient.followupDate)}</p>
        <p style="margin:4px 0 0; font-size:12px; color:#4ade80;">${patient.followupDuration} follow-up</p>
      </div>`
      : `<div style="margin:20px 0; padding:16px 20px; background:#f9fafb; border-left:4px solid #d1d5db; border-radius:8px;">
        <p style="margin:0; font-size:14px; color:#6b7280;">No follow-up scheduled at this time.</p>
      </div>`;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0; padding:0; background:#f3f4f6; font-family:'Segoe UI', Arial, sans-serif;">
  <div style="max-width:640px; margin:32px auto; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08);">

    <div style="background:linear-gradient(135deg, #166534, #16a34a); padding:32px 36px;">
      <p style="margin:0; font-size:13px; color:#bbf7d0; letter-spacing:1px; text-transform:uppercase;">${clinicName}</p>
      <h1 style="margin:8px 0 0; font-size:24px; color:#ffffff; font-weight:700;">Your Treatment Report</h1>
      <p style="margin:6px 0 0; font-size:13px; color:#86efac;">Prepared by ${doctorName}</p>
    </div>

    <div style="padding:32px 36px;">
      <p style="font-size:15px; color:#374151; margin:0 0 6px;">Hi <strong>${patient.name}</strong>,</p>
      <p style="font-size:14px; color:#6b7280; margin:0 0 28px; line-height:1.6;">
        Thank you for your visit. Please find your personalised Ayurvedic treatment report below.
        Keep this for your records and refer to it before your next appointment.
      </p>

      <div style="background:#f9fafb; border:1px solid #e5e7eb; border-radius:12px; padding:20px 24px; margin-bottom:24px;">
        <h2 style="margin:0 0 16px; font-size:15px; color:#111827; font-weight:700; border-bottom:1px solid #e5e7eb; padding-bottom:10px;">
          Patient Details
        </h2>
        <table style="width:100%; border-collapse:collapse;">
          <tr>
            <td style="padding:5px 0; font-size:13px; color:#9ca3af; width:40%;">Full Name</td>
            <td style="padding:5px 0; font-size:13px; color:#111827; font-weight:600;">${patient.name}</td>
          </tr>
          <tr>
            <td style="padding:5px 0; font-size:13px; color:#9ca3af;">Email</td>
            <td style="padding:5px 0; font-size:13px; color:#111827;">${patient.email}</td>
          </tr>
          <tr>
            <td style="padding:5px 0; font-size:13px; color:#9ca3af;">Age</td>
            <td style="padding:5px 0; font-size:13px; color:#111827;">${patient.age} years</td>
          </tr>
          <tr>
            <td style="padding:5px 0; font-size:13px; color:#9ca3af;">Height / Weight</td>
            <td style="padding:5px 0; font-size:13px; color:#111827;">${patient.height} cm / ${patient.weight} kg</td>
          </tr>
          <tr>
            <td style="padding:5px 0; font-size:13px; color:#9ca3af;">Contact</td>
            <td style="padding:5px 0; font-size:13px; color:#111827;">${patient.contactNo}</td>
          </tr>
          <tr>
            <td style="padding:5px 0; font-size:13px; color:#9ca3af;">Prakriti (Dosha)</td>
            <td style="padding:5px 0;">
              <span style="background:#dcfce7; color:#166534; padding:2px 10px; border-radius:999px; font-size:12px; font-weight:700;">${dosha}</span>
            </td>
          </tr>
          <tr>
            <td style="padding:5px 0; font-size:13px; color:#9ca3af;">Vikriti (Imbalance)</td>
            <td style="padding:5px 0; font-size:13px; color:#111827; font-weight:600;">${patient.vikritiType || "Pending Assessment"}</td>
          </tr>
          <tr>
            <td style="padding:5px 0; font-size:13px; color:#9ca3af;">Severity</td>
            <td style="padding:5px 0; font-size:13px; color:#111827;">${patient.severity || "—"}</td>
          </tr>
        </table>
      </div>

      <div style="margin-bottom:24px;">
        <h2 style="margin:0 0 14px; font-size:15px; color:#111827; font-weight:700;">Visit History</h2>
        <table style="width:100%; border-collapse:collapse; border:1px solid #e5e7eb; border-radius:10px; overflow:hidden;">
          <thead>
            <tr style="background:#166534;">
              <th style="padding:10px 14px; font-size:12px; color:#ffffff; text-align:left; font-weight:600;">Date</th>
              <th style="padding:10px 14px; font-size:12px; color:#ffffff; text-align:left; font-weight:600;">Visit Type</th>
              <th style="padding:10px 14px; font-size:12px; color:#ffffff; text-align:left; font-weight:600;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${visitRows.length > 0 ? visitRows : `<tr><td colspan="3" style="padding:16px; text-align:center; color:#9ca3af; font-size:13px;">No visits recorded yet.</td></tr>`}
          </tbody>
        </table>
      </div>

      <h2 style="margin:0 0 8px; font-size:15px; color:#111827; font-weight:700;">Next Appointment</h2>
      ${nextFollowup}

      <div style="margin:24px 0;">
        <h2 style="margin:0 0 12px; font-size:15px; color:#111827; font-weight:700;">Treatment Report</h2>
        <div style="background:#f9fafb; border:1px solid #e5e7eb; border-radius:12px; padding:20px 24px;">
          <p style="font-size:13px; color:#6b7280; margin:0 0 14px;">AI-generated assessment based on Prakriti & Vikriti analysis:</p>
          <p style="font-size:14px; color:#374151; line-height:1.8; margin:0; white-space:pre-line;">${patient.aiReport || "Report not yet generated."}</p>
        </div>
      </div>
    </div>

    <div style="background:#f9fafb; border-top:1px solid #e5e7eb; padding:20px 36px; text-align:center;">
      <p style="margin:0; font-size:12px; color:#9ca3af;">
        This report was automatically generated by <strong>${clinicName}</strong>.<br/>
        Please do not reply to this email. For queries, contact your doctor directly.
      </p>
      <p style="margin:8px 0 0; font-size:11px; color:#d1d5db;">© ${new Date().getFullYear()} ${clinicName}</p>
    </div>

  </div>
</body>
</html>`;

  await sendEmail(
    patient.email,
    patient.name,
    `Your Ayurvedic Treatment Report — ${clinicName}`,
    html,
  );
}

async function sendPasswordResetEmail(doctor, resetLink) {
  const clinicName = process.env.CLINIC_NAME || "Ayurveda Care Clinic";

  const html = `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f4ede0;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:520px;margin:40px auto;background:white;border-radius:16px;overflow:hidden;border:1px solid rgba(39,103,73,.12);">
    <div style="background:linear-gradient(135deg,#1c4532,#276749);padding:32px 36px;">
      <h1 style="margin:0;color:white;font-size:22px;font-weight:400;">Password Reset</h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,.7);font-size:14px;">${clinicName}</p>
    </div>
    <div style="padding:32px 36px;">
      <p style="font-size:15px;color:#374151;margin:0 0 16px;">Hello Dr. ${doctor.name},</p>
      <p style="font-size:14px;color:#6b7280;margin:0 0 24px;line-height:1.7;">
        We received a request to reset your password. Click the button below to set a new password.
        This link will expire in <strong>15 minutes</strong>.
      </p>
      <a href="${resetLink}"
        style="display:inline-block;background:linear-gradient(135deg,#1c4532,#276749);color:white;
        text-decoration:none;padding:14px 28px;border-radius:50px;font-size:14px;font-weight:500;">
        Reset Password →
      </a>
      <p style="font-size:12px;color:#9ca3af;margin:24px 0 0;">
        If you didn't request this, you can safely ignore this email. Your password will not change.
      </p>
    </div>
    <div style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 36px;text-align:center;">
      <p style="margin:0;font-size:11px;color:#d1d5db;">© ${new Date().getFullYear()} ${clinicName}</p>
    </div>
  </div>
</body>
</html>`;

  await sendEmail(
    doctor.email,
    `Dr. ${doctor.name}`,
    `Password Reset — ${clinicName}`,
    html,
  );
}

module.exports = { sendReportEmail, sendPasswordResetEmail };
