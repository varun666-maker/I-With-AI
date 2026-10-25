import nodemailer from "nodemailer";

type MailProvider =
  | { type: "smtp"; host: string; port: number; user: string; password: string; from: string }
  | { type: "resend"; apiKey: string; from: string };

function mailProvider(): MailProvider {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? "587");
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;
  const from = process.env.SMTP_FROM_EMAIL ?? process.env.EMAIL_FROM;
  const resendApiKey = process.env.RESEND_API_KEY;

  if (host && user && password && from && Number.isInteger(port)) {
    return { type: "smtp", host, port, user, password, from };
  }
  if (resendApiKey && from) return { type: "resend", apiKey: resendApiKey, from };

  throw new Error("EMAIL_PROVIDER_NOT_CONFIGURED");
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  })[character] ?? character);
}

async function sendMail(options: { to: string; subject: string; text: string; html: string }) {
  const provider = mailProvider();
  if (provider.type === "resend") {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${provider.apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ from: provider.from, to: [options.to], subject: options.subject, text: options.text, html: options.html }),
    });
    if (!response.ok) throw new Error("RESEND_DELIVERY_FAILED");
    return;
  }

  const transporter = nodemailer.createTransport({
    host: provider.host,
    port: provider.port,
    secure: provider.port === 465,
    auth: { user: provider.user, pass: provider.password },
  });
  await transporter.sendMail({
    from: provider.from,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  });
}

export async function sendVerificationEmail(input: {
  to: string;
  displayName: string;
  code: string;
}) {
  const name = escapeHtml(input.displayName);
  await sendMail({
    to: input.to,
    subject: "Verify your InterviewAI account",
    text: `Hi ${input.displayName},\n\nYour InterviewAI verification code is ${input.code}. It expires in 15 minutes.`,
    html: `<p>Hi ${name},</p><p>Your InterviewAI verification code is <strong>${input.code}</strong>.</p><p>This code expires in 15 minutes.</p>`,
  });
}

export async function sendPasswordResetEmail(input: {
  to: string;
  displayName: string;
  token: string;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const resetUrl = `${appUrl}/auth/reset-password?token=${encodeURIComponent(input.token)}`;
  const name = escapeHtml(input.displayName);
  await sendMail({
    to: input.to,
    subject: "Reset your InterviewAI password",
    text: `Hi ${input.displayName},\n\nReset your password here: ${resetUrl}\n\nThis link expires in 30 minutes.`,
    html: `<p>Hi ${name},</p><p><a href="${resetUrl}">Reset your InterviewAI password</a></p><p>This link expires in 30 minutes.</p>`,
  });
}
