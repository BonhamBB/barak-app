/**
 * Email service - Nodemailer with SMTP
 * Configure via .env: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
 * Sends AI-generated drafts (Magic Onboard, Tour Summary) as plain text.
 */
import nodemailer from "nodemailer";

function getTransporter() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) {
    throw new Error(
      "Email not configured. Set SMTP_USER and SMTP_PASS in .env (see .env.example)"
    );
  }
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user, pass },
  });
}

export async function sendEmail(
  to: string,
  subject: string,
  body: string,
  options?: { html?: boolean }
): Promise<void> {
  const transporter = getTransporter();
  const from =
    process.env.EMAIL_FROM || process.env.SMTP_USER || "noreply@barak.app";
  const mailOptions = {
    from,
    to,
    subject,
    ...(options?.html ? { html: body } : { text: body }),
  };
  await transporter.sendMail(mailOptions);
}
