import { prisma } from "../../lib/prisma"
import bcrypt from "bcrypt"
import { validateStrongPassword } from "../../lib/password-policy"

interface RegisterProps {
  email: string
  password: string
  name: string
  oabNumber: string
  specialty: string
}

export const Register = async ({
  email,
  password,
  name,
  oabNumber,
  specialty,
}: RegisterProps) => {
  const passwordError = validateStrongPassword(password)
  if (passwordError) {
    throw new Error(passwordError)
  }

  const userExists = await prisma.user.findUnique({
    where: { email },
  })

  if (userExists) {
    throw new Error("User with this email already exists")
  }

  const oabExists = await prisma.user.findFirst({
    where: { oab: oabNumber },
  })

  if (oabExists) {
    throw new Error("This OAB number is already registered")
  }

  const hashPassword = await bcrypt.hash(password, 10)

  const newUser = await prisma.user.create({
    data: {
      email,
      password: hashPassword,
      name,
      role: "lawyer",
      oab: oabNumber,
      specialty,
    },
  })

  return {
    id: newUser.id,
    email: newUser.email,
    name: newUser.name,
  }
}
