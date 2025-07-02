'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { VideoGrid } from '@/components/video/video-grid';
import { VideoPlayer } from '@/components/video/video-player';
import { SuggestionsSidebar } from '@/components/video/suggestions-sidebar';
import { VideoItem, youtubeAPI } from '@/lib/youtube-api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentView, setCurrentView] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [watchLater, setWatchLater] = useState<VideoItem[]>([]);
  const [likedVideos, setLikedVideos] = useState<VideoItem[]>([]);
  const [history, setHistory] = useState<VideoItem[]>([]);

  useEffect(() => {
    const savedWatchLater = localStorage.getItem('youtube-watch-later');
    const savedLikedVideos = localStorage.getItem('youtube-liked-videos');
    const savedHistory = localStorage.getItem('youtube-history');

    if (savedWatchLater) setWatchLater(JSON.parse(savedWatchLater));
    if (savedLikedVideos) setLikedVideos(JSON.parse(savedLikedVideos));
    if (savedHistory) setHistory(JSON.parse(savedHistory));

    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const loadTrendingVideos = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await youtubeAPI.getTrendingVideos(100);
        setVideos(response.items);
      } catch (error) {
        console.error('Error loading trending videos:', error);
        setError('Failed to load trending videos. Please check if you have set up your YouTube API key.');
      } finally {
        setIsLoading(false);
      }
    };

    if (currentView === 'home' && !hasSearched) {
      loadTrendingVideos();
    }
  }, [currentView, hasSearched]);

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;

    try {
      setIsLoading(true);
      setError(null);
      setSearchQuery(query);
      setHasSearched(true);
      setSelectedVideoId(null);
      setCurrentView('search');

      const response = await youtubeAPI.searchVideos(query, 100);

      const videoIds = response.items.map(item =>
        typeof item.id === 'string' ? item.id : item.id.videoId
      );

      const detailsResponse = await youtubeAPI.getVideoDetails(videoIds);
      setVideos(detailsResponse.items);
    } catch (error) {
      console.error('Error searching videos:', error);
      setError('Search failed. Please try again.');
      setVideos([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVideoClick = (videoId: string) => {
    setSelectedVideoId(videoId);

    // Close sidebar on mobile when video is selected
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }

    const video = videos.find(v => {
      const id = typeof v.id === 'string' ? v.id : v.id.videoId;
      return id === videoId;
    });

    if (video) {
      const newHistory = [video, ...history.filter(h => {
        const hId = typeof h.id === 'string' ? h.id : h.id.videoId;
        return hId !== videoId;
      })].slice(0, 50);
      setHistory(newHistory);
      localStorage.setItem('youtube-history', JSON.stringify(newHistory));
    }
  };

  const handleViewChange = async (view: string) => {
    setCurrentView(view);
    setSelectedVideoId(null);
    setSearchQuery('');

    if (view === 'home') {
      setHasSearched(false);
      try {
        setIsLoading(true);
        setError(null);
        const response = await youtubeAPI.getTrendingVideos(100);
        setVideos(response.items);
      } catch (error) {
        console.error('Error loading trending videos:', error);
        setError('Failed to load videos.');
      } finally {
        setIsLoading(false);
      }
    } else if (view === 'trending') {
      try {
        setIsLoading(true);
        setError(null);
        const response = await youtubeAPI.getTrendingVideos(100, 'US', '0');
        setVideos(response.items);
      } catch (error) {
        console.error('Error loading trending videos:', error);
        setError('Failed to load trending videos.');
      } finally {
        setIsLoading(false);
      }
    } else if (['music', 'gaming', 'movies', 'sports'].includes(view)) {
      const categoryQueries = {
        music: 'music videos',
        gaming: 'gaming highlights',
        movies: 'movie trailers',
        sports: 'sports highlights'
      };

      const query = categoryQueries[view as keyof typeof categoryQueries];
      if (query) {
        handleSearch(query);
      }
    } else if (view === 'bookmarks') {
      setVideos(watchLater);
    } else if (view === 'history') {
      setVideos(history);
    } else if (view === 'liked') {
      setVideos(likedVideos);
    } else {
      setVideos([]);
    }
  };

  const handleRetry = () => {
    if (searchQuery) {
      handleSearch(searchQuery);
    } else {
      handleViewChange(currentView);
    }
  };

  const addToWatchLater = (video: VideoItem) => {
    const videoId = typeof video.id === 'string' ? video.id : video.id.videoId;
    const newWatchLater = [video, ...watchLater.filter(v => {
      const vId = typeof v.id === 'string' ? v.id : v.id.videoId;
      return vId !== videoId;
    })];
    setWatchLater(newWatchLater);
    localStorage.setItem('youtube-watch-later', JSON.stringify(newWatchLater));
  };

  const addToLiked = (video: VideoItem) => {
    const videoId = typeof video.id === 'string' ? video.id : video.id.videoId;
    const newLikedVideos = [video, ...likedVideos.filter(v => {
      const vId = typeof v.id === 'string' ? v.id : v.id.videoId;
      return vId !== videoId;
    })];
    setLikedVideos(newLikedVideos);
    localStorage.setItem('youtube-liked-videos', JSON.stringify(newLikedVideos));
  };

  const getPageTitle = () => {
    if (selectedVideoId) return 'Watching Video';
    if (searchQuery) return `Search results for "${searchQuery}"`;
    switch (currentView) {
      case 'trending': return 'Trending Videos';
      case 'music': return 'Music';
      case 'gaming': return 'Gaming';
      case 'movies': return 'Movies';
      case 'sports': return 'Sports';
      case 'bookmarks': return 'Watch Later';
      case 'history': return 'History';
      case 'liked': return 'Liked Videos';
      case 'settings': return 'Settings';
      default: return 'Home';
    }
  };

  const handleMenuClick = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogoClick = () => {
    // Navigate to home page
    setCurrentView('home');
    setSelectedVideoId(null);
    setSearchQuery('');
    setHasSearched(false);
    
    // Load trending videos
    const loadTrendingVideos = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await youtubeAPI.getTrendingVideos(100);
        setVideos(response.items);
      } catch (error) {
        console.error('Error loading trending videos:', error);
        setError('Failed to load trending videos.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTrendingVideos();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        onSearch={handleSearch}
        onMenuClick={handleMenuClick}
        onLogoClick={handleLogoClick}
        searchQuery={searchQuery}
      />

      <div className="flex">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          currentView={currentView}
          onViewChange={handleViewChange}
        />

        <main className={cn(
          "flex-1 transition-all duration-300",
          sidebarOpen
            ? "lg:ml-64"
            : "lg:ml-0"
        )}>
          <div className={cn(
            "container mx-auto px-4 py-6",
            selectedVideoId && "max-w-none"
          )}>
            {error && (
              <Card className="mb-6 border-destructive">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Error</p>
                      <p className="text-sm text-muted-foreground">{error}</p>
                    </div>
                    <Button onClick={handleRetry} size="sm" variant="outline">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Retry
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedVideoId ? (
              <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                <div className="xl:col-span-3">
                  <VideoPlayer
                    videoId={selectedVideoId}
                    onClose={() => setSelectedVideoId(null)}
                    onAddToWatchLater={addToWatchLater}
                    onAddToLiked={addToLiked}
                  />
                </div>
                <div className="xl:col-span-1">
                  <SuggestionsSidebar
                    currentVideoId={selectedVideoId}
                    onVideoClick={handleVideoClick}
                  />
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-2xl font-bold">{getPageTitle()}</h1>
                </div>

                {currentView === 'settings' ? (
                  <Card>
                    <CardContent className="p-8">
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold mb-4">Playback Settings</h3>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span>Autoplay next video</span>
                              <input type="checkbox" defaultChecked className="rounded" />
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Annotations</span>
                              <input type="checkbox" className="rounded" />
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold mb-4">Privacy Settings</h3>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span>Keep search history</span>
                              <input type="checkbox" defaultChecked className="rounded" />
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Keep watch history</span>
                              <input type="checkbox" defaultChecked className="rounded" />
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold mb-4">Notifications</h3>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span>Recommended videos</span>
                              <input type="checkbox" defaultChecked className="rounded" />
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Activity on my channel</span>
                              <input type="checkbox" className="rounded" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <VideoGrid
                    videos={videos}
                    onVideoClick={handleVideoClick}
                    isLoading={isLoading}
                    showChannel={true}
                  />
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}