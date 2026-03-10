import nodemailer from 'nodemailer'

// Configurar o transporte de email
export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true' || false, // true para 465, false para outras portas
  auth: {
    user: process.env.SMTP_EMAIL || '',
    pass: process.env.SMTP_PASSWORD || '',
  },
})

// Testar a conexão ao inicializar
export const verifyEmailConnection = async () => {
  try {
    await transporter.verify()
    console.log('✅ Conexão SMTP verificada com sucesso!')
    return true
  } catch (error) {
    console.error('❌ Erro ao conectar SMTP:', error)
    return false
  }
}

// Função para enviar email
export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_EMAIL,
      to,
      subject,
      html,
    })
    console.log(`✅ Email enviado para ${to}:`, info.messageId)
    return true
  } catch (error) {
    console.error(`❌ Erro ao enviar email para ${to}:`, error)
    return false
  }
}
