'use client';

import React, { useEffect, useState } from 'react';
import { VideoItem, youtubeAPI } from '@/lib/youtube-api';
import { VideoCard } from './video-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SuggestionsSidebarProps {
  currentVideoId?: string;
  onVideoClick: (videoId: string) => void;
}

export function SuggestionsSidebar({ currentVideoId, onVideoClick }: SuggestionsSidebarProps) {
  const [suggestions, setSuggestions] = useState<VideoItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        setIsLoading(true);
        const response = currentVideoId 
          ? await youtubeAPI.getRelatedVideos(currentVideoId, 20)
          : await youtubeAPI.getTrendingVideos(20);
        
        setSuggestions(response.items);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        // Fallback to trending videos
        try {
          const fallback = await youtubeAPI.getTrendingVideos(20);
          setSuggestions(fallback.items);
        } catch (fallbackError) {
          console.error('Error fetching fallback suggestions:', fallbackError);
          setSuggestions([]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, [currentVideoId]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Up Next</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="flex space-x-3">
                <div className="w-40 aspect-video bg-muted animate-pulse rounded" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted animate-pulse rounded" />
                  <div className="h-3 bg-muted animate-pulse rounded w-2/3" />
                  <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {currentVideoId ? 'Up Next' : 'Trending Videos'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {suggestions.map((video) => {
            const videoId = typeof video.id === 'string' ? video.id : video.id.videoId;
            return (
              <div key={videoId} className="flex space-x-3 cursor-pointer group" onClick={() => onVideoClick(videoId)}>
                <div className="w-40 aspect-video relative overflow-hidden rounded">
                  <img
                    src={video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default.url}
                    alt={video.snippet.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  {video.contentDetails?.duration && (
                    <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">
                      {youtubeAPI.formatDuration(video.contentDetails.duration)}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                    {video.snippet.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-1">
                    {video.snippet.channelTitle}
                  </p>
                  <div className="text-xs text-muted-foreground">
                    {video.statistics && (
                      <span>{youtubeAPI.formatViewCount(video.statistics.viewCount)} • </span>
                    )}
                    <span>{youtubeAPI.getTimeAgo(video.snippet.publishedAt)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}