'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { VideoItem, youtubeAPI } from '@/lib/youtube-api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MoreVertical, Clock, Share, Download, Flag, ThumbsDown } from 'lucide-react';

interface VideoCardProps {
  video: VideoItem;
  onClick: (videoId: string) => void;
  showChannel?: boolean;
}

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  video: VideoItem;
}

function ContextMenu({ x, y, onClose, video }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const menuItems = [
    { icon: Clock, label: 'Save to Watch later', action: () => console.log('Save to watch later') },
    { icon: Share, label: 'Share', action: () => console.log('Share video') },
    { icon: Download, label: 'Download', action: () => console.log('Download video') },
    { icon: ThumbsDown, label: 'Not interested', action: () => console.log('Not interested') },
    { icon: Flag, label: 'Report', action: () => console.log('Report video') },
  ];

  return (
    <div
      ref={menuRef}
      className="context-menu fixed"
      style={{ left: x, top: y }}
    >
      {menuItems.map((item, index) => (
        <div
          key={index}
          className="context-menu-item"
          onClick={() => {
            item.action();
            onClose();
          }}
        >
          <item.icon className="h-4 w-4" />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

export function VideoCard({ video, onClick, showChannel = true }: VideoCardProps) {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const videoId = typeof video.id === 'string' ? video.id : video.id.videoId;
  const thumbnail = video.snippet.thumbnails.medium || video.snippet.thumbnails.default;
  const duration = video.contentDetails?.duration;

  const handleClick = () => {
    onClick(videoId);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setContextMenu({ x: rect.left, y: rect.bottom + 5 });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
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

  return (
    <>
      <Card 
        className="group cursor-pointer overflow-hidden border-0 bg-transparent hover:bg-transparent transition-all duration-200"
        onClick={handleClick}
        onContextMenu={handleContextMenu}
      >
        <CardContent className="p-0">
          <div className="relative aspect-video overflow-hidden rounded-xl mb-3">
            <Image
              src={thumbnail.url}
              alt={video.snippet.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {duration && (
              <Badge 
                variant="secondary" 
                className="absolute bottom-2 right-2 bg-black/80 text-white hover:bg-black/80 text-xs px-1.5 py-0.5"
              >
                {youtubeAPI.formatDuration(duration)}
              </Badge>
            )}
          </div>
          
          <div className="flex gap-3">
            {showChannel && (
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${getChannelAvatar(video.snippet.channelTitle)}`}>
                {video.snippet.channelTitle.charAt(0).toUpperCase()}
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm line-clamp-2 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-5">
                {truncateText(video.snippet.title, 100)}
              </h3>
              
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                  {showChannel && (
                    <div className="hover:text-foreground transition-colors mb-1">
                      {video.snippet.channelTitle}
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-1">
                    {video.statistics && (
                      <span>{youtubeAPI.formatViewCount(video.statistics.viewCount)}</span>
                    )}
                    <span>•</span>
                    <span>{youtubeAPI.getTimeAgo(video.snippet.publishedAt)}</span>
                  </div>
                </div>
                
                <button
                  onClick={handleMoreClick}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-accent rounded-full"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          video={video}
        />
      )}
    </>
  );
}