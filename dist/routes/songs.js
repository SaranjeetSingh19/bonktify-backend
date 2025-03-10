"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const youtube_1 = require("../utils/youtube");
const ytdl_core_1 = __importDefault(require("ytdl-core"));
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Get all songs for the authenticated user
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const songs = await prisma.song.findMany({
            where: { userId },
            orderBy: { priority: 'desc' },
        });
        res.json(songs);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Add a new song (max 12 songs per user)
router.post('/', auth_1.authenticateToken, async (req, res) => {
    const { url, priority } = req.body;
    if (!url) {
        return res.status(400).json({ message: 'YouTube URL is required.' });
    }
    try {
        const userId = req.user.userId;
        const songCount = await prisma.song.count({ where: { userId } });
        if (songCount >= 12) {
            return res.status(400).json({ message: 'Maximum of 12 songs allowed.' });
        }
        // Validate YouTube URL and extract info
        if (!ytdl_core_1.default.validateURL(url)) {
            return res.status(400).json({ message: 'Invalid YouTube URL.' });
        }
        const videoInfo = await (0, youtube_1.getYouTubeVideoInfo)(url);
        const song = await prisma.song.create({
            data: {
                url,
                title: videoInfo.title,
                thumbnail: videoInfo.thumbnail,
                priority: priority || 0,
                user: { connect: { id: userId } },
            }
        });
        res.status(201).json(song);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Update song priority
router.patch('/:id', auth_1.authenticateToken, async (req, res) => {
    const songId = parseInt(req.params.id, 10);
    const { priority } = req.body;
    if (priority === undefined) {
        return res.status(400).json({ message: 'Priority is required.' });
    }
    try {
        const userId = req.user.userId;
        const song = await prisma.song.findUnique({ where: { id: songId } });
        if (!song || song.userId !== userId) {
            return res.status(404).json({ message: 'Song not found.' });
        }
        const updatedSong = await prisma.song.update({
            where: { id: songId },
            data: { priority },
        });
        res.json(updatedSong);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Delete a song
router.delete('/:id', auth_1.authenticateToken, async (req, res) => {
    const songId = parseInt(req.params.id, 10);
    try {
        const userId = req.user.userId;
        const song = await prisma.song.findUnique({ where: { id: songId } });
        if (!song || song.userId !== userId) {
            return res.status(404).json({ message: 'Song not found.' });
        }
        await prisma.song.delete({ where: { id: songId } });
        res.json({ message: 'Song deleted successfully.' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Stream audio of the song (audio-only)
router.get('/:id/stream', auth_1.authenticateToken, async (req, res) => {
    const songId = parseInt(req.params.id, 10);
    try {
        const userId = req.user.userId;
        const song = await prisma.song.findUnique({ where: { id: songId } });
        if (!song || song.userId !== userId) {
            return res.status(404).json({ message: 'Song not found.' });
        }
        // Set response headers for audio streaming
        res.setHeader('Content-Type', 'audio/mpeg');
        // Use ytdl-core to stream audio only
        (0, ytdl_core_1.default)(song.url, {
            filter: 'audioonly',
            quality: 'highestaudio',
        }).pipe(res);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.default = router;
