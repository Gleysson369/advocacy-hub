
import { Request, Response } from 'express';
import path from 'path';

export const UploadController = (req: Request, res: Response) => {
  console.log('📥 Dados da requisição:', {
    body: req.body,
    file: req.file ? {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      encoding: req.file.encoding,
      mimetype: req.file.mimetype,
      size: req.file.size,
      destination: req.file.destination,
      filename: req.file.filename,
      path: req.file.path,
    } : null
  });

  if (!req.file) {
    console.log('❌ Nenhum arquivo foi enviado');
    return res.status(400).json({ 
      success: false,
      message: 'Nenhum arquivo foi enviado.' 
    });
  }

  const fileInfo = {
    success: true,
    message: 'Arquivo enviado com sucesso.',
    file: {
      originalName: req.file.originalname,
      savedName: req.file.filename,
      mimeType: req.file.mimetype,
      size: req.file.size,
      path: `/uploads/${req.file.filename}`, // Caminho relativo para download
      downloadPath: `/uploads/${req.file.filename}`,
      fullPath: req.file.path, // Caminho completo no servidor
    }
  };

  console.log('✅ Arquivo salvo com sucesso:', fileInfo);
  return res.status(200).json(fileInfo);
};
