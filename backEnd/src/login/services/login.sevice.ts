import { prisma } from '../../lib/prisma'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

interface LoginData {
  email: string
  password: string
}

const MAX_FAILED_ATTEMPTS = 3
const FAILED_ATTEMPT_WINDOW_MS = 30 * 60 * 1000
const failedLoginAttempts = new Map<string, { count: number; lastFailedAt: number }>()

const getNormalizedEmail = (email: string) => email.trim().toLowerCase()

const registerFailedAttempt = (email: string) => {
  const now = Date.now()
  const current = failedLoginAttempts.get(email)

  if (!current || now - current.lastFailedAt > FAILED_ATTEMPT_WINDOW_MS) {
    failedLoginAttempts.set(email, { count: 1, lastFailedAt: now })
    return 1
  }

  const nextCount = current.count + 1
  failedLoginAttempts.set(email, { count: nextCount, lastFailedAt: now })
  return nextCount
}

const clearFailedAttempts = (email: string) => {
  failedLoginAttempts.delete(email)
}

const getInvalidCredentialsMessage = (failedCount: number) => {
  if (failedCount > MAX_FAILED_ATTEMPTS) {
    return 'Por favor, redefina sua senha. E-mail ou senha incorretos.'
  }

  return 'Email ou senha incorretos.'
}

export const LoginService = async (data: LoginData) => {
  const normalizedEmail = getNormalizedEmail(data.email || '')
  const { password } = data

  if (!normalizedEmail || !password) {
    throw new Error('Email e senha sao obrigatorios.')
  }

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  })

  if (!user) {
    const failedCount = registerFailedAttempt(normalizedEmail)
    throw new Error(getInvalidCredentialsMessage(failedCount))
  }

  const passwordMatch = await bcrypt.compare(password, user.password)

  if (!passwordMatch) {
    const failedCount = registerFailedAttempt(normalizedEmail)
    throw new Error(getInvalidCredentialsMessage(failedCount))
  }

  clearFailedAttempts(normalizedEmail)

  const token = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET as string,
    { expiresIn: '1d' }
  )

  return {
    user: {
      id: user.id,
      email: user.email,
    },
    token,
  }
}
