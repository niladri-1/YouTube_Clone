'use client';

import React from 'react';
import { VideoItem } from '@/lib/youtube-api';
import { VideoCard } from './video-card';

interface VideoGridProps {
	videos: VideoItem[];
	onVideoClick: (videoId: string) => void;
	isLoading?: boolean;
	showChannel: boolean;
}

export function VideoGrid({ videos, onVideoClick, isLoading, showChannel }: VideoGridProps) {
	if (isLoading) {
		return (
			<div className="video-grid">
				{Array.from({ length: 12 }).map((_, index) => (
					<div key={index} className="space-y-3">
						<div className="aspect-video bg-muted animate-pulse rounded-xl" />
						<div className="flex gap-3">
							<div className="w-9 h-9 bg-muted animate-pulse rounded-full flex-shrink-0" />
							<div className="flex-1 space-y-2">
								<div className="h-4 bg-muted animate-pulse rounded" />
								<div className="h-3 bg-muted animate-pulse rounded w-2/3" />
								<div className="h-3 bg-muted animate-pulse rounded w-1/2" />
							</div>
						</div>
					</div>
				))}
			</div>
		);
	}

	if (videos.length === 0) {
		return (
			<div className="text-center py-12">
				<p className="text-muted-foreground">No videos found</p>
			</div>
		);
	}

	return (
		<div className="video-grid">
			{videos.map((video) => {
				const videoId = typeof video.id === 'string' ? video.id : video.id.videoId;
				return (
					<VideoCard
						key={videoId}
						video={video}
						onClick={onVideoClick}
						showChannel={showChannel}
					/>
				);
			})}
		</div>
	);
}