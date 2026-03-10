import { prisma } from "../../lib/prisma"
import bcrypt from "bcrypt"
import { validateStrongPassword } from "../../lib/password-policy"

interface CreateUserProps {
  name: string
  email: string
  password: string
}

export const createUserService = async ({ name, email, password }: CreateUserProps) => {
  try {
    console.log("Iniciando criacao de novo usuario:", { name, email })

    const passwordError = validateStrongPassword(password)
    if (passwordError) {
      throw new Error(passwordError)
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      console.log("Email ja cadastrado:", email)
      throw new Error("Este email ja esta cadastrado")
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    })

    console.log("Usuario criado com sucesso:", { id: user.id, email: user.email, name: user.name })
    return user
  } catch (error) {
    console.error("Erro ao criar usuario:", error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error("Error creating user")
  }
}
