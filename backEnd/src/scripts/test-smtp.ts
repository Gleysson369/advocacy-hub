import "dotenv/config"
import { createRequire } from "module"

const require = createRequire(import.meta.url)
const nodemailer = require("nodemailer")

const host = (process.env.SMTP_HOST || "").trim()
const port = Number(process.env.SMTP_PORT || "587")
const user = (process.env.SMTP_USER || "").trim()
const pass = (process.env.SMTP_PASS || "").replace(/\s+/g, "")
const from = (process.env.MAIL_FROM || user).trim()
const to = (process.env.SMTP_TEST_TO || user).trim()

if (!host || !user || !pass) {
  console.error("SMTP nao configurado. Verifique SMTP_HOST, SMTP_USER e SMTP_PASS no .env.")
  process.exit(1)
}

const transporter = nodemailer.createTransport({
  host,
  port,
  secure: port === 465,
  auth: { user, pass },
})

async function main() {
  await transporter.verify()
  const info = await transporter.sendMail({
    from,
    to,
    subject: "Teste SMTP LexOffice",
    text: "Se voce recebeu este e-mail, o SMTP da plataforma esta funcionando.",
    html: "<p>Se voce recebeu este e-mail, o SMTP da plataforma esta funcionando.</p>",
  })
  console.log("SMTP OK. MessageId:", info.messageId)
  console.log("Enviado para:", to)
}

main().catch((error: any) => {
  console.error("Falha no teste SMTP:", error?.message || error)
  process.exit(1)
})
