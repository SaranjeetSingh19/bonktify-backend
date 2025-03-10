"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getYouTubeVideoInfo = void 0;
const ytdl_core_1 = __importDefault(require("ytdl-core"));
const getYouTubeVideoInfo = async (url) => {
    try {
        const info = await ytdl_core_1.default.getInfo(url);
        const title = info.videoDetails.title;
        // Pick the best available thumbnail
        const thumbnails = info.videoDetails.thumbnails;
        const thumbnail = thumbnails[thumbnails.length - 1].url;
        return { title, thumbnail };
    }
    catch (error) {
        throw new Error('Failed to get YouTube video info');
    }
};
exports.getYouTubeVideoInfo = getYouTubeVideoInfo;
