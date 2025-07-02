'use client';

import React, { useEffect, useState } from 'react';
import { VideoItem, youtubeAPI } from '@/lib/youtube-api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown, Share, Clock, MoreHorizontal } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface VideoPlayerProps {
  videoId: string;
  onClose?: () => void;
  onAddToWatchLater?: (video: VideoItem) => void;
  onAddToLiked?: (video: VideoItem) => void;
}

export function VideoPlayer({ videoId, onClose, onAddToWatchLater, onAddToLiked }: VideoPlayerProps) {
  const [videoDetails, setVideoDetails] = useState<VideoItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isInWatchLater, setIsInWatchLater] = useState(false);

  useEffect(() => {
    const fetchVideoDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await youtubeAPI.getVideoDetails([videoId]);
        if (response.items && response.items.length > 0) {
          setVideoDetails(response.items[0]);
        } else {
          setError('Video not found');
        }
      } catch (error) {
        console.error('Error fetching video details:', error);
        setError('Failed to load video details');
      } finally {
        setIsLoading(false);
      }
    };

    if (videoId) {
      fetchVideoDetails();
    }
  }, [videoId]);

  const handleShare = () => {
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    if (navigator.share) {
      navigator.share({
        title: videoDetails?.snippet.title,
        url: url,
      });
    } else {
      navigator.clipboard.writeText(url);
      alert('YouTube link copied to clipboard!');
    }
  };

  const handleWatchLater = () => {
    if (videoDetails && onAddToWatchLater) {
      onAddToWatchLater(videoDetails);
      setIsInWatchLater(true);
    }
  };

  const handleLike = () => {
    if (videoDetails && onAddToLiked) {
      onAddToLiked(videoDetails);
      setIsLiked(true);
    }
  };

  const formatDescription = (description: string) => {
    // Convert URLs to clickable links
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return description.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
  };

  // Generate channel avatar from channel name
  const getChannelAvatar = (channelTitle: string) => {
    const colors = [
      'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
    ];
    const colorIndex = channelTitle.charCodeAt(0) % colors.length;
    return colors[colorIndex];
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="aspect-video bg-muted animate-pulse rounded-lg" />
        <div className="space-y-2">
          <div className="h-6 bg-muted animate-pulse rounded" />
          <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
        </div>
      </div>
    );
  }

  if (error || !videoDetails) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">{error || 'Video not available'}</p>
          {onClose && (
            <Button onClick={onClose} className="mt-4">
              Go Back
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  const description = videoDetails.snippet.description || '';
  const displayDescription = showFullDescription 
    ? description 
    : description.length > 300 
      ? description.substring(0, 300) + '...' 
      : description;

  return (
    <div className="space-y-4">
      {/* Video Player */}
      <div className="aspect-video">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
          title={videoDetails.snippet.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="w-full h-full rounded-lg"
        />
      </div>

      {/* Video Info */}
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold mb-3">{videoDetails.snippet.title}</h1>
          
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${getChannelAvatar(videoDetails.snippet.channelTitle)}`}>
                {videoDetails.snippet.channelTitle.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-semibold">{videoDetails.snippet.channelTitle}</h3>
                <Button variant="destructive" size="sm" className="mt-1">
                  Subscribe
                </Button>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button 
                variant={isLiked ? "default" : "outline"} 
                size="sm"
                onClick={handleLike}
              >
                <ThumbsUp className="w-4 h-4 mr-2" />
                {videoDetails.statistics?.likeCount 
                  ? parseInt(videoDetails.statistics.likeCount).toLocaleString()
                  : 'Like'
                }
              </Button>
              <Button variant="outline" size="sm">
                <ThumbsDown className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button 
                variant={isInWatchLater ? "default" : "outline"} 
                size="sm"
                onClick={handleWatchLater}
              >
                <Clock className="w-4 h-4 mr-2" />
                {isInWatchLater ? 'Saved' : 'Save'}
              </Button>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Description */}
        {description && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                {videoDetails.statistics && (
                  <span>{youtubeAPI.formatViewCount(videoDetails.statistics.viewCount)}</span>
                )}
                <span>{youtubeAPI.getTimeAgo(videoDetails.snippet.publishedAt)}</span>
              </div>
              
              <div 
                className="whitespace-pre-wrap text-sm description-content"
                dangerouslySetInnerHTML={{ __html: formatDescription(displayDescription) }}
              />
              
              {description.length > 300 && (
                <Button
                  variant="link"
                  className="p-0 h-auto mt-2 text-sm"
                  onClick={() => setShowFullDescription(!showFullDescription)}
                >
                  {showFullDescription ? 'Show less' : 'Show more'}
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Tags */}
        {videoDetails.snippet.tags && videoDetails.snippet.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {videoDetails.snippet.tags.slice(0, 10).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}