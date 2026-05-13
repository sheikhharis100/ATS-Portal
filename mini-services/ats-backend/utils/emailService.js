/**
 * Email Service — Gmail SMTP via Nodemailer
 *
 * Set in .env:
 *   GMAIL_USER=your-gmail@gmail.com
 *   GMAIL_PASS=your-16-char-app-password   (Gmail → Security → App Passwords)
 */

const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });
  }
  return transporter;
}

/**
 * Send an email. Silently logs and returns false on failure so it never
 * crashes the main request flow.
 */
async function sendEmail({ to, subject, html }) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
    console.log('Email skipped — GMAIL_USER / GMAIL_PASS not configured.');
    return false;
  }
  try {
    await getTransporter().sendMail({
      from: `"ATS Portal" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to}: ${subject}`);
    return true;
  } catch (err) {
    console.error('Email send error:', err.message);
    return false;
  }
}

// ── Pre-built email templates ────────────────────────────────────────────────

function baseWrapper(content) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1e293b">
      <div style="background:#059669;padding:16px 24px;border-radius:8px 8px 0 0">
        <h2 style="color:#fff;margin:0">ATS Portal</h2>
      </div>
      <div style="background:#f8fafc;padding:24px;border-radius:0 0 8px 8px;border:1px solid #e2e8f0">
        ${content}
      </div>
      <p style="font-size:12px;color:#94a3b8;margin-top:16px;text-align:center">
        This is an automated message from ATS Portal. Please do not reply.
      </p>
    </div>`;
}

exports.sendStatusUpdateEmail = async ({ candidateEmail, candidateName, jobTitle, status, note }) => {
  const statusMessages = {
    'Under Review':        { color: '#d97706', label: 'Under Review',        msg: 'Your application is currently being reviewed by our team.' },
    'Shortlisted':         { color: '#059669', label: 'Shortlisted!',        msg: 'Great news! You have been shortlisted for this position.' },
    'Interview Scheduled': { color: '#7c3aed', label: 'Interview Scheduled', msg: 'An interview has been scheduled for you. Please check your application for details.' },
    'Selected':            { color: '#16a34a', label: 'Selected!',           msg: 'Congratulations! You have been selected for this position.' },
    'Rejected':            { color: '#dc2626', label: 'Not Selected',        msg: 'We appreciate your interest but have decided to move forward with other candidates at this time.' },
  };

  const info = statusMessages[status] || { color: '#64748b', label: status, msg: 'Your application status has been updated.' };

  const html = baseWrapper(`
    <p>Dear <strong>${candidateName}</strong>,</p>
    <p>Your application for <strong>${jobTitle}</strong> has been updated.</p>
    <div style="background:#fff;border-left:4px solid ${info.color};padding:12px 16px;margin:16px 0;border-radius:4px">
      <p style="margin:0;font-size:18px;font-weight:bold;color:${info.color}">${info.label}</p>
    </div>
    <p>${info.msg}</p>
    ${note ? `<p><strong>Note from HR:</strong> ${note}</p>` : ''}
    <p>Log in to the ATS Portal to view more details.</p>
  `);

  return sendEmail({ to: candidateEmail, subject: `Application Update: ${jobTitle} — ${info.label}`, html });
};

exports.sendInterviewEmail = async ({ candidateEmail, candidateName, jobTitle, interviewDate, interviewTime, interviewType, location, interviewer, message }) => {
  const html = baseWrapper(`
    <p>Dear <strong>${candidateName}</strong>,</p>
    <p>An interview has been scheduled for your application for <strong>${jobTitle}</strong>.</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0">
      <tr style="background:#f1f5f9"><td style="padding:8px 12px;font-weight:bold">Date</td><td style="padding:8px 12px">${new Date(interviewDate).toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</td></tr>
      <tr><td style="padding:8px 12px;font-weight:bold">Time</td><td style="padding:8px 12px">${interviewTime}</td></tr>
      <tr style="background:#f1f5f9"><td style="padding:8px 12px;font-weight:bold">Type</td><td style="padding:8px 12px">${interviewType}</td></tr>
      <tr><td style="padding:8px 12px;font-weight:bold">Location</td><td style="padding:8px 12px">${location || 'TBD'}</td></tr>
      ${interviewer ? `<tr style="background:#f1f5f9"><td style="padding:8px 12px;font-weight:bold">Interviewer</td><td style="padding:8px 12px">${interviewer}</td></tr>` : ''}
    </table>
    ${message ? `<p><strong>Message from HR:</strong></p><p style="background:#f8fafc;padding:12px;border-radius:4px;border:1px solid #e2e8f0">${message}</p>` : ''}
    <p>Please be on time and bring any relevant documents.</p>
  `);

  return sendEmail({ to: candidateEmail, subject: `Interview Scheduled: ${jobTitle}`, html });
};

exports.sendCustomEmail = async ({ to, subject, bodyHtml }) => {
  return sendEmail({ to, subject, html: baseWrapper(bodyHtml) });
};
