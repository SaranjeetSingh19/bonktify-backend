"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getYouTubeVideoInfo = exports.extractVideoId = void 0;
const axios_1 = __importDefault(require("axios"));
const extractVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
};
exports.extractVideoId = extractVideoId;
const getYouTubeVideoInfo = async (url) => {
    try {
        const videoId = (0, exports.extractVideoId)(url);
        const apiKey = process.env.YOUTUBE_API_KEY; // Ensure your API key is correctly loaded
        const response = await axios_1.default.get(`https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet`);
        if (response.data.items.length === 0) {
            throw new Error('Video not found');
        }
        const videoInfo = response.data.items[0];
        return {
            title: videoInfo.snippet.title, // Extract the title
            thumbnail: videoInfo.snippet.thumbnails.default.url // Extract thumbnail
        };
    }
    catch (error) {
        console.error('Error fetching YouTube video info:', error.message);
        throw new Error('Failed to get YouTube video info');
    }
};
exports.getYouTubeVideoInfo = getYouTubeVideoInfo;
