import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export interface AuthRequest extends Request {
  user?: { userId: number; username: string };
}


export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      res.sendStatus(401);
      return;
    }
    
    const token = authHeader.split(' ')[1];
    if (!token) {
      res.sendStatus(401);
      return;
    }
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        console.error(err);
        res.sendStatus(403);
        return;
      }
      req.user = user as { userId: number; username: string };
      next();
    });
  };