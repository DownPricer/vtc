import nodemailer from "nodemailer";
import type Mail from "nodemailer/lib/mailer";

export type SmtpEnv = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  mailFrom: string;
  mailTo: string;
  replyTo?: string;
  mailToCopy?: string;
};

function parseBool(v: string | undefined, defaultFalse: boolean): boolean {
  if (v == null || v === "") return defaultFalse;
  return ["1", "true", "yes", "on"].includes(v.toLowerCase());
}

export function getSmtpEnv(): SmtpEnv | null {
  const host = process.env.SMTP_HOST?.trim();
  const portRaw = process.env.SMTP_PORT?.trim();
  const mailFrom = process.env.MAIL_FROM?.trim();
  const mailTo = process.env.MAIL_TO?.trim();
  if (!host || !portRaw || !mailFrom || !mailTo) return null;

  const port = Number(portRaw);
  if (!Number.isFinite(port)) return null;

  const user = process.env.SMTP_USER?.trim() || "";
  const pass = process.env.SMTP_PASS?.trim() || "";
  const secure = parseBool(process.env.SMTP_SECURE, port === 465);

  return {
    host,
    port,
    secure,
    user,
    pass,
    mailFrom,
    mailTo,
    replyTo: process.env.MAIL_REPLY_TO?.trim() || undefined,
    mailToCopy: process.env.MAIL_TO_COPY?.trim() || undefined,
  };
}

export function assertSmtpConfigured(): SmtpEnv {
  const e = getSmtpEnv();
  if (!e) {
    throw new Error(
      "Configuration SMTP incomplète. Définissez SMTP_HOST, SMTP_PORT, MAIL_FROM, MAIL_TO (et SMTP_USER / SMTP_PASS si authentification requise)."
    );
  }
  return e;
}

export async function sendSmtpMessage(options: {
  env: SmtpEnv;
  subject: string;
  text: string;
  html: string;
  to?: string;
  bcc?: string;
  /** Priorité sur MAIL_REPLY_TO pour cette envoi */
  replyTo?: string;
  /** Si vrai, n’ajoute pas MAIL_TO_COPY automatiquement */
  omitAutoBcc?: boolean;
}): Promise<void> {
  const { env, subject, text, html, to, bcc, replyTo, omitAutoBcc } = options;
  const transporter = nodemailer.createTransport({
    host: env.host,
    port: env.port,
    secure: env.secure,
    auth:
      env.user || env.pass
        ? {
            user: env.user,
            pass: env.pass,
          }
        : undefined,
  });

  const mail: Mail.Options = {
    from: env.mailFrom,
    to: to ?? env.mailTo,
    subject,
    text,
    html,
    replyTo: replyTo ?? env.replyTo,
    bcc: omitAutoBcc ? bcc : bcc || env.mailToCopy,
  };

  await transporter.sendMail(mail);
}
