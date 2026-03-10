import nodemailer from 'nodemailer';

// ---------------------------------------------------------------------------
// Configuração do provider
// ---------------------------------------------------------------------------
const mailProvider = (process.env.MAIL_PROVIDER || 'smtp').trim().toLowerCase();

const smtpUser =
  process.env.EMAIL_USER ||
  process.env.SMTP_EMAIL ||
  process.env.SMTP_USER ||
  '';

const smtpPassRaw =
  process.env.EMAIL_APP_PASSWORD ||
  process.env.SMTP_PASSWORD ||
  process.env.SMTP_PASS ||
  '';

// Senha de app do Gmail costuma ser copiada com espaços em blocos de 4 chars.
const smtpPass = smtpPassRaw.replace(/\s+/g, '');

const smtpHost    = process.env.SMTP_HOST   || 'smtp.gmail.com';
const smtpPort    = Number(process.env.SMTP_PORT || 587);
const smtpSecure  = process.env.SMTP_SECURE === 'true' || smtpPort === 465;
const mailFrom    = process.env.MAIL_FROM   || `"Suporte" <${smtpUser}>`;
const resendApiKey = (process.env.RESEND_API_KEY  || '').trim();
const resendApiUrl = (process.env.RESEND_API_URL  || 'https://api.resend.com/emails').trim();

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpSecure,
  auth: { user: smtpUser, pass: smtpPass },
});

function normalizeSmtpError(error: unknown): Error {
  const err = error as { code?: string; response?: string; message?: string };
  const responseText = String(err?.response || '');

  if (
    err?.code === 'EAUTH' &&
    (responseText.includes('534-5.7.9') || responseText.includes('WebLoginRequired'))
  ) {
    return new Error(
      'Falha SMTP (Gmail): conta bloqueou AUTH PLAIN. Ative verificação em 2 etapas e use Senha de app em EMAIL_APP_PASSWORD.'
    );
  }

  if (
    err?.code === 'EAUTH' &&
    (responseText.includes('535-5.7.8') || responseText.includes('BadCredentials'))
  ) {
    return new Error(
      'Falha SMTP (Gmail): usuário/senha inválidos. Configure EMAIL_USER real e EMAIL_APP_PASSWORD com senha de app válida.'
    );
  }

  return error instanceof Error ? error : new Error(String(err?.message || error));
}

function hasPlaceholderCredentials(user: string, pass: string): boolean {
  const normalizedUser = user.trim().toLowerCase();
  const normalizedPass = pass.trim().toLowerCase();

  return (
    normalizedUser.includes('seu_gmail') ||
    normalizedUser.includes('example.com') ||
    normalizedPass.includes('senha_de_app') ||
    normalizedPass.includes('your_password')
  );
}

// ---------------------------------------------------------------------------
// Fila de envio
// Garante que apenas UM email seja enviado por vez via SMTP, evitando
// rejeições por rate-limit do Gmail (500 msg/dia, ~20/hora em contas free).
// Entre cada envio há um intervalo mínimo configurável (MAIL_QUEUE_DELAY_MS).
// ---------------------------------------------------------------------------
const QUEUE_DELAY_MS = Number(process.env.MAIL_QUEUE_DELAY_MS || 1200); // 1,2 s padrão

interface QueueItem {
  task: () => Promise<void>;
  resolve: () => void;
  reject: (err: unknown) => void;
}

const queue: QueueItem[] = [];
let processing = false;

async function processQueue(): Promise<void> {
  if (processing) return;
  processing = true;

  while (queue.length > 0) {
    const item = queue.shift()!;
    try {
      await item.task();
      item.resolve();
    } catch (err) {
      item.reject(err);
    }
    // Pequena pausa entre envios para não bater no rate-limit do SMTP
    if (queue.length > 0) {
      await new Promise((r) => setTimeout(r, QUEUE_DELAY_MS));
    }
  }

  processing = false;
}

function enqueue(task: () => Promise<void>): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    queue.push({ task, resolve, reject });
    processQueue(); // inicia o loop se não estiver rodando
  });
}

// ---------------------------------------------------------------------------
// Envio de email de reset de senha
// ---------------------------------------------------------------------------
export const sendResetPasswordEmail = async (
  toEmail: string,
  resetToken: string,
): Promise<void> => {
  const frontendUrl = (
    process.env.FRONTEND_URL ||
    process.env.CORS_ORIGIN ||
    'http://localhost:5173'
  ).trim();

  const resetLink =
    `${frontendUrl}/reset-password` +
    `?token=${encodeURIComponent(resetToken)}` +
    `&email=${encodeURIComponent(toEmail)}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
      <h2>Redefinição de senha</h2>
      <p>Recebemos uma solicitação para redefinir sua senha.</p>
      <a href="${resetLink}"
         style="display:inline-block; padding:12px 24px; background:#4F46E5;
                color:#fff; border-radius:6px; text-decoration:none;">
        Redefinir senha
      </a>
      <p style="margin-top:16px; color:#888;">Este link expira em <strong>1 hora</strong>.</p>
      <p style="color:#888;">Se você não solicitou isso, ignore este email.</p>
    </div>
  `;

  // Enfileira o envio — retorna quando o email for efetivamente enviado
  return enqueue(async () => {
    if (mailProvider === 'resend') {
      if (!resendApiKey)           throw new Error('RESEND_API_KEY não configurada.');
      if (!process.env.MAIL_FROM) throw new Error('MAIL_FROM não configurado para resend.');

      const response = await fetch(resendApiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.MAIL_FROM,
          to: [toEmail],
          subject: 'Redefinição de senha',
          html,
        }),
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`Resend falhou (${response.status}): ${body}`);
      }
      return;
    }

    // SMTP
    if (!smtpUser || !smtpPass) {
      throw new Error('SMTP não configurado: defina EMAIL_USER/EMAIL_APP_PASSWORD.');
    }

    if (hasPlaceholderCredentials(smtpUser, smtpPass)) {
      throw new Error(
        'SMTP com valores de exemplo no .env. Defina EMAIL_USER real e EMAIL_APP_PASSWORD (senha de app do Google).'
      );
    }

    try {
      await transporter.sendMail({
        from: mailFrom,
        to: toEmail,
        subject: 'Redefinição de senha',
        html,
      });
    } catch (error) {
      throw normalizeSmtpError(error);
    }
  });
};
