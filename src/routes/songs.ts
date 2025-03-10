import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { getYouTubeVideoInfo } from "../utils/youtube";
import ytdl from "ytdl-core";
import { asyncHandler } from "../middleware/asyncHandler";

const router = Router();
const prisma = new PrismaClient();

// Get all songs for the authenticated user
router.get(
  "/",
  authenticateToken,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const songs = await prisma.song.findMany({
      where: { userId },
      orderBy: { priority: "desc" },
    });
    res.json(songs);
  })
);

// Add a new song (max 12 songs per user)
// router.post('/', authenticateToken, asyncHandler(async (req: AuthRequest, res: Response) => {
//   const { url, priority } = req.body;
//   if (!url) {
//     return res.status(400).json({ message: 'YouTube URL is required.' });
//   }

//   const userId = req.user!.userId;
//   const songCount = await prisma.song.count({ where: { userId } });
//   if (songCount >= 12) {
//     return res.status(400).json({ message: 'Maximum of 12 songs allowed.' });
//   }

//   // Validate YouTube URL and extract info
//   if (!ytdl.validateURL(url)) {
//     return res.status(400).json({ message: 'Invalid YouTube URL.' });
//   }

//   const videoInfo = await getYouTubeVideoInfo(url);

//   const song = await prisma.song.create({
//     data: {
//       url,
//       title: videoInfo.title,
//       thumbnail: videoInfo.thumbnail,
//       priority: priority || 0,
//       user: { connect: { id: userId } },
//     }
//   });

//   res.status(201).json(song);
// }));

// Add a new song (max 12 songs per user)
router.post(
  "/",
  authenticateToken,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { url, priority } = req.body;
    if (!url) {
      return res.status(400).json({ message: "YouTube URL is required." });
    }

    const userId = req.user!.userId;
    const songCount = await prisma.song.count({ where: { userId } });
    if (songCount >= 12) {
      return res.status(400).json({ message: "Maximum of 12 songs allowed." });
    }

    // Validate YouTube URL and extract info
    if (!ytdl.validateURL(url)) {
      return res.status(400).json({ message: "Invalid YouTube URL." });
    }

    const videoInfo = await getYouTubeVideoInfo(url); // Here you're already fetching video info

    const song = await prisma.song.create({
      data: {
        url,
        title: videoInfo.title, // Using the title from the YouTube video
        thumbnail: videoInfo.thumbnail, // Using the thumbnail from the YouTube video
        priority: priority || 0,
        user: { connect: { id: userId } },
      },
    });

    res.status(201).json(song);
  })
);

// Update song priority
router.patch(
  "/:id",
  authenticateToken,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    // Parse the song ID from the request parameters
    const songId = parseInt(req.params.id, 10);

    // Check if songId is a valid number
    if (isNaN(songId)) {
      return res.status(400).json({ message: "Invalid song ID." });
    }

    // Extract priority from the request body
    const { priority } = req.body;
    if (priority === undefined) {
      return res.status(400).json({ message: "Priority is required." });
    }

    const userId = req.user!.userId;

    // Find the song by its ID and the authenticated user's ID
    const song = await prisma.song.findUnique({ where: { id: songId } });
    if (!song || song.userId !== userId) {
      return res.status(404).json({ message: "Song not found." });
    }

    // Update the song's priority
    const updatedSong = await prisma.song.update({
      where: { id: songId },
      data: { priority },
    });

    // Return the updated song
    res.json(updatedSong);
  })
);

// Delete a song
router.delete(
  "/:id",
  authenticateToken,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const songId = parseInt(req.params.id, 10);
    const userId = req.user!.userId;
    const song = await prisma.song.findUnique({ where: { id: songId } });
    if (!song || song.userId !== userId) {
      return res.status(404).json({ message: "Song not found." });
    }

    await prisma.song.delete({ where: { id: songId } });
    res.json({ message: "Song deleted successfully." });
  })
);

// Stream audio of the song (audio-only)
router.get(
  "/:id/stream",
  authenticateToken,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const songId = parseInt(req.params.id, 10);
    const userId = req.user!.userId;
    const song = await prisma.song.findUnique({ where: { id: songId } });
    if (!song || song.userId !== userId) {
      return res.status(404).json({ message: "Song not found." });
    }

    // Set response headers for audio streaming
    res.setHeader("Content-Type", "audio/mpeg");

    // Use ytdl-core to stream audio only
    ytdl(song.url, {
      filter: "audioonly",
      quality: "highestaudio",
    }).pipe(res);
  })
);

export default router;
