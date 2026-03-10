import { RequestHandler } from "express"
import { Register } from "../services/register.service"

export const RegisterController: RequestHandler = async (req, res) => {
  try {
    const { email, password, name, oabNumber, specialty } = req.body

    if (!email || !password || !name || !oabNumber || !specialty) {
      return res.status(400).json({ message: "All fields are required." })
    }

    const result = await Register({
      email,
      password,
      name,
      oabNumber,
      specialty,
    })

    return res.status(201).json(result)
  } catch (error: any) {
    const message = error.message || "An error occurred during registration."
    const normalizedMessage = String(message).toLowerCase()

    if (
      normalizedMessage.includes("senha") ||
      normalizedMessage.includes("maiuscula") ||
      normalizedMessage.includes("minuscula") ||
      normalizedMessage.includes("numero") ||
      normalizedMessage.includes("caractere")
    ) {
      return res.status(400).json({ message })
    }

    if (message.includes("already exists") || message.includes("already registered")) {
      return res.status(409).json({ message })
    }

    return res.status(500).json({ message })
  }
}
