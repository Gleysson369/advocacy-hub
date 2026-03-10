import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

export interface AuthenticatedRequest extends Request {
  user?: { id?: string; userId?: string; role?: string }
}

export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication token required' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id?: string
      userId?: string
      role?: string
    }

    req.user = {
      id: decoded.id ?? decoded.userId,
      userId: decoded.userId ?? decoded.id,
      role: decoded.role,
    }

    next()
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: 'Authentication token expired' })
    }
    return res.status(401).json({ message: 'Invalid authentication token' })
  }
}
