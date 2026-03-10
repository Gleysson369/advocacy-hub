import { Request, Response } from "express"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const uploadsDir = path.resolve(__dirname, "..", "..", "..", "uploads")

export const DownloadFileController = (req: Request, res: Response) => {
  const requestedPath = String(req.query.path || "").trim()

  if (!requestedPath) {
    return res.status(400).json({ message: "Parametro path e obrigatorio." })
  }

  const fileName = path.basename(requestedPath)
  if (!fileName || fileName === "." || fileName === "..") {
    return res.status(400).json({ message: "Arquivo invalido." })
  }

  const filePath = path.resolve(uploadsDir, fileName)
  if (!filePath.startsWith(`${uploadsDir}${path.sep}`)) {
    return res.status(400).json({ message: "Caminho de arquivo invalido." })
  }

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "Arquivo nao encontrado." })
  }

  return res.download(filePath, fileName, (error) => {
    if (error && !res.headersSent) {
      return res.status(500).json({ message: "Erro ao baixar arquivo." })
    }
  })
}
