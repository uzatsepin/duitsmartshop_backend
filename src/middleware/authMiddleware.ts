import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from "dotenv";
dotenv.config();

interface AuthenticatedRequest extends Request {
    user?: {
      id: number;
      email: string;
    };
  }
const JWT_SECRET = process.env.SECRET_JWT || '';

export const authenticateJWT = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
  
    if (authHeader) {
      const token = authHeader.split(' ')[1];
  
      jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
          return res.status(403).json({ message: 'Дія заборонена' });
        }
        
        req.user = decoded as { id: number; email: string, roleId: number};
        next();
      });
    } else {
      res.status(401).json({ message: 'Користувач не авторизований' });
    }
  };