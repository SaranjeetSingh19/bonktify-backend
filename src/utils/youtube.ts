import axios from 'axios';

export const extractVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  
  export const getYouTubeVideoInfo = async (url: string) => {
    try {
      const videoId = extractVideoId(url);
      const apiKey = process.env.YOUTUBE_API_KEY; // Ensure your API key is correctly loaded
      
      const response = await axios.get(
        `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet`
      );
  
      if (response.data.items.length === 0) {
        throw new Error('Video not found');
      }
  
      const videoInfo = response.data.items[0];
      return {
        title: videoInfo.snippet.title, // Extract the title
        thumbnail: videoInfo.snippet.thumbnails.default.url // Extract thumbnail
      };
    } catch (error: any) {
      console.error('Error fetching YouTube video info:', error.message);
      throw new Error('Failed to get YouTube video info');
    }
  };
  