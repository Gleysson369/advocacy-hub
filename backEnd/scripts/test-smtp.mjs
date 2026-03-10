import "dotenv/config";
import nodemailer from "nodemailer";

const provider = (process.env.MAIL_PROVIDER || "smtp").trim().toLowerCase();
const host = (process.env.SMTP_HOST || "smtp.gmail.com").trim();
const port = Number(process.env.SMTP_PORT || "587");
const user = (
  process.env.SMTP_USER ||
  process.env.SMTP_EMAIL ||
  process.env.EMAIL_USER ||
  ""
).trim();
const pass = (
  process.env.SMTP_PASS ||
  process.env.SMTP_PASSWORD ||
  process.env.EMAIL_APP_PASSWORD ||
  ""
).replace(/\s+/g, "");
const from = (process.env.MAIL_FROM || user).trim();
const to = (process.env.SMTP_TEST_TO || user).trim();
const resendApiKey = (process.env.RESEND_API_KEY || "").trim();
const resendApiUrl = (process.env.RESEND_API_URL || "https://api.resend.com/emails").trim();

try {
  if (provider === "resend") {
    if (!resendApiKey || !from || !to) {
      console.error("Resend nao configurado. Verifique RESEND_API_KEY, MAIL_FROM e SMTP_TEST_TO.");
      process.exit(1);
    }

    const response = await fetch(resendApiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: "Teste Resend LexOffice",
        text: "Se voce recebeu este e-mail, o Resend da plataforma esta funcionando.",
        html: "<p>Se voce recebeu este e-mail, o Resend da plataforma esta funcionando.</p>",
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Resend falhou (${response.status}): ${body}`);
    }

    console.log("Resend OK. Enviado para:", to);
    process.exit(0);
  }

  if (!user || !pass) {
    console.error("SMTP nao configurado. Defina EMAIL_USER/EMAIL_APP_PASSWORD (ou SMTP_USER/SMTP_PASS) no .env.");
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  await transporter.verify();
  const info = await transporter.sendMail({
    from,
    to,
    subject: "Teste SMTP LexOffice",
    text: "Se voce recebeu este e-mail, o SMTP da plataforma esta funcionando.",
    html: "<p>Se voce recebeu este e-mail, o SMTP da plataforma esta funcionando.</p>",
  });
  console.log("SMTP OK. MessageId:", info.messageId);
  console.log("Enviado para:", to);
} catch (error) {
  console.error("Falha no teste SMTP:", error?.message || error);
  process.exit(1);
}
