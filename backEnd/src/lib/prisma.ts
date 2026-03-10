import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../../generated/prisma'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.resolve(__dirname, "..", "..", ".env") })

let connectionString = `${process.env.DATABASE_URL || ""}`.trim()

if (!connectionString) {
  throw new Error("DATABASE_URL nao configurada no backEnd/.env")
}

// Compatibilidade com configs antigas que usavam host 'base'.
if (connectionString.includes("@base:")) {
  connectionString = connectionString.replace("@base:", "@localhost:")
  console.warn("[prisma] Host 'base' detectado na DATABASE_URL. Usando 'localhost'.")
}

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

export { prisma }
