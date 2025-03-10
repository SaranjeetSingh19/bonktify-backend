"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const asyncHandler_1 = require("../middleware/asyncHandler");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
// Signup route
router.post('/signup', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
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
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    const user = await prisma.user.create({
        data: {
            username,
            password: hashedPassword,
        }
    });
    res.status(201).json({ message: 'User created successfully', userId: user.id });
}));
// Login route
router.post('/login', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    const isValid = await bcrypt_1.default.compare(password, user.password);
    if (!isValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jsonwebtoken_1.default.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
}));
exports.default = router;
