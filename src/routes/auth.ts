import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Signup route
router.post('/signup', asyncHandler(async (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }
  
  // Check if user exists
  const existingUser = await prisma.user.findUnique({ where: { username } });
  if (existingUser) {
    return res.status(409).json({ message: 'Username already taken.' });
  }
  
  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const user = await prisma.user.create({
    data: {
      username,
      password: hashedPassword,
    }
  });
  
  res.status(201).json({ message: 'User created successfully', userId: user.id });
}));

// Login route
router.post('/login', asyncHandler(async (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }
  
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  
  const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
}));

export default router;
