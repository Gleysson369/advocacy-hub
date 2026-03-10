import { Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import {prisma} from '../../lib/prisma';
import { sendResetPasswordEmail } from '../../lib/mailer';

let warnedResetSecretFallback = false;

const getResetSecret = (): string | null => {
  const resetSecret = (process.env.JWT_RESET_SECRET || '').trim();
  if (resetSecret) return resetSecret;

  const jwtSecret = (process.env.JWT_SECRET || '').trim();
  if (jwtSecret) {
    if (!warnedResetSecretFallback) {
      console.warn('JWT_RESET_SECRET não configurado. Usando JWT_SECRET como fallback.');
      warnedResetSecretFallback = true;
    }
    return jwtSecret;
  }

  return null;
};

// POST /auth/forgot-password
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body as { email: string };

    const user = await prisma.user.findUnique({ where: { email } });

    // Não revela se o email existe ou não (segurança)
    if (!user) {
      res.status(200).json({ message: 'Se o email existir, você receberá as instruções.' });
      return;
    }

    const resetSecret = getResetSecret();
    if (!resetSecret) {
      console.error('forgotPassword error: JWT_RESET_SECRET/JWT_SECRET não configurado.');
      res.status(200).json({ message: 'Se o email existir, você receberá as instruções.' });
      return;
    }

    const token = jwt.sign(
      { userId: user.id },
      resetSecret,
      { expiresIn: '1h' }
    );

    const frontendUrl = (
      process.env.FRONTEND_URL ||
      process.env.CORS_ORIGIN ||
      'http://localhost:5173'
    ).trim();
    const debugEnabled =
      process.env.PASSWORD_RESET_DEBUG_RESPONSE === 'true' &&
      process.env.NODE_ENV !== 'production';
    const debugResetLink =
      frontendUrl
        ? `${frontendUrl}/reset-password` +
          `?token=${encodeURIComponent(token)}` +
          `&email=${encodeURIComponent(email)}`
        : null;

    // Em desenvolvimento, permite testar o fluxo sem depender do SMTP.
    if (debugEnabled && debugResetLink) {
      console.warn('forgotPassword debug mode: SMTP bypassed, returning reset link.');
      res.status(200).json({
        message: 'Se o email existir, você receberá as instruções.',
        debugResetLink,
      });
      return;
    }

    try {
      await sendResetPasswordEmail(email, token);
    } catch (mailError) {
      // Não expõe falha de infraestrutura para o cliente e evita quebra do fluxo.
      console.error('forgotPassword mail error:', mailError);

      // Fallback para desenvolvimento local quando SMTP estiver indisponível.
      if (debugResetLink) {
        console.warn('forgotPassword dev fallback reset link:', debugResetLink);

        if (debugEnabled) {
          res.status(200).json({
            message: 'Se o email existir, você receberá as instruções.',
            debugResetLink,
          });
          return;
        }
      }
    }

    res.status(200).json({ message: 'Se o email existir, você receberá as instruções.' });
  } catch (error) {
    console.error('forgotPassword error:', error);
    res.status(500).json({ message: 'Erro interno no servidor.' });
  }
};

// POST /auth/reset-password
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body as { token: string; newPassword: string };

    if (!token || !newPassword) {
      res.status(400).json({ message: 'Token e nova senha são obrigatórios.' });
      return;
    }

    const resetSecret = getResetSecret();
    if (!resetSecret) {
      res.status(500).json({ message: 'Configuração de segurança ausente no servidor.' });
      return;
    }

    const decoded = jwt.verify(token, resetSecret) as JwtPayload;

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: decoded.userId },
      data: { password: hashedPassword },
    });

    res.status(200).json({ message: 'Senha redefinida com sucesso!' });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ message: 'Token expirado. Solicite um novo link.' });
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ message: 'Token inválido.' });
      return;
    }
    console.error('resetPassword error:', error);
    res.status(500).json({ message: 'Erro interno no servidor.' });
  }
};
