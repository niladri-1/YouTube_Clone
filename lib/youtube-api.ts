const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

export interface VideoItem {
  id: {
    kind: string;
    videoId: string;
  } | string;
  snippet: {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: {
      default: { url: string; width: number; height: number };
      medium: { url: string; width: number; height: number };
      high: { url: string; width: number; height: number };
      standard?: { url: string; width: number; height: number };
      maxres?: { url: string; width: number; height: number };
    };
    channelTitle: string;
    tags?: string[];
    categoryId?: string;
    liveBroadcastContent: string;
    localized?: {
      title: string;
      description: string;
    };
    defaultAudioLanguage?: string;
  };
  statistics?: {
    viewCount: string;
    likeCount: string;
    dislikeCount: string;
    favoriteCount: string;
    commentCount: string;
  };
  contentDetails?: {
    duration: string;
    dimension: string;
    definition: string;
    caption: string;
    licensedContent: boolean;
    regionRestriction?: {
      allowed?: string[];
      blocked?: string[];
    };
  };
}

export interface SearchResponse {
  kind: string;
  etag: string;
  nextPageToken?: string;
  prevPageToken?: string;
  regionCode: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
  items: VideoItem[];
}

export interface VideoDetailsResponse {
  kind: string;
  etag: string;
  items: VideoItem[];
}

class YouTubeAPI {
  private apiKey: string;

  constructor() {
    this.apiKey = YOUTUBE_API_KEY || '';
    if (!this.apiKey) {
      console.warn('YouTube API key not found. Please set NEXT_PUBLIC_YOUTUBE_API_KEY in your environment variables.');
    }
  }

  private async makeRequest(endpoint: string, params: Record<string, string>): Promise<any> {
    if (!this.apiKey) {
      throw new Error('YouTube API key is required');
    }

    const url = new URL(`${YOUTUBE_API_BASE}/${endpoint}`);
    url.searchParams.append('key', this.apiKey);
    
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    try {
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status} ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('YouTube API request failed:', error);
      throw error;
    }
  }

  async searchVideos(query: string, maxResults: number = 25, pageToken?: string): Promise<SearchResponse> {
    const params: Record<string, string> = {
      part: 'snippet',
      type: 'video',
      q: query,
      maxResults: maxResults.toString(),
      order: 'relevance',
      safeSearch: 'moderate',
      videoEmbeddable: 'true',
    };

    if (pageToken) {
      params.pageToken = pageToken;
    }

    return this.makeRequest('search', params);
  }

  async getVideoDetails(videoIds: string[]): Promise<VideoDetailsResponse> {
    const params = {
      part: 'snippet,statistics,contentDetails',
      id: videoIds.join(','),
    };

    return this.makeRequest('videos', params);
  }

  async getTrendingVideos(maxResults: number = 25, regionCode: string = 'US', categoryId: string = '0'): Promise<SearchResponse> {
    const params = {
      part: 'snippet,statistics,contentDetails',
      chart: 'mostPopular',
      maxResults: maxResults.toString(),
      regionCode,
      videoCategoryId: categoryId,
    };

    const response = await this.makeRequest('videos', params);
    
    // Transform the response to match SearchResponse format
    return {
      kind: response.kind,
      etag: response.etag,
      nextPageToken: response.nextPageToken,
      prevPageToken: response.prevPageToken,
      regionCode: response.regionCode || regionCode,
      pageInfo: response.pageInfo,
      items: response.items.map((item: any) => ({
        id: { kind: 'youtube#video', videoId: item.id },
        snippet: item.snippet,
        statistics: item.statistics,
        contentDetails: item.contentDetails,
      })),
    };
  }

  async getRelatedVideos(videoId: string, maxResults: number = 12): Promise<SearchResponse> {
    // Since YouTube removed related videos from API, we'll search for videos from the same channel
    try {
      const videoDetails = await this.getVideoDetails([videoId]);
      if (videoDetails.items.length > 0) {
        const channelId = videoDetails.items[0].snippet.channelId;
        const channelTitle = videoDetails.items[0].snippet.channelTitle;
        
        return this.searchVideos(`${channelTitle}`, maxResults);
      }
    } catch (error) {
      console.error('Error getting related videos:', error);
    }

    // Fallback to trending videos
    return this.getTrendingVideos(maxResults);
  }

  formatDuration(duration: string): string {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return '0:00';

    const hours = (match[1] || '').replace('H', '');
    const minutes = (match[2] || '').replace('M', '');
    const seconds = (match[3] || '').replace('S', '');

    const h = hours ? parseInt(hours) : 0;
    const m = minutes ? parseInt(minutes) : 0;
    const s = seconds ? parseInt(seconds) : 0;

    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  formatViewCount(viewCount: string): string {
    const count = parseInt(viewCount);
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M views`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K views`;
    }
    return `${count} views`;
  }

  getTimeAgo(publishedAt: string): string {
    const now = new Date();
    const published = new Date(publishedAt);
    const diffInSeconds = Math.floor((now.getTime() - published.getTime()) / 1000);

    const intervals = [
      { label: 'year', seconds: 31536000 },
      { label: 'month', seconds: 2592000 },
      { label: 'week', seconds: 604800 },
      { label: 'day', seconds: 86400 },
      { label: 'hour', seconds: 3600 },
      { label: 'minute', seconds: 60 },
    ];

    for (const interval of intervals) {
      const count = Math.floor(diffInSeconds / interval.seconds);
      if (count >= 1) {
        return `${count} ${interval.label}${count !== 1 ? 's' : ''} ago`;
      }
    }

    return 'Just now';
  }
}

export const youtubeAPI = new YouTubeAPI();