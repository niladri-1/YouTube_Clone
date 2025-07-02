'use client';

import React from 'react';
import { Home, TrendingUp, Bookmark, Clock, ThumbsUp, Settings, Music, Gamepad2, Film, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: string;
  onViewChange: (view: string) => void;
}

const mainItems = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'trending', label: 'Trending', icon: TrendingUp },
];

const libraryItems = [
  { id: 'bookmarks', label: 'Watch Later', icon: Bookmark },
  { id: 'history', label: 'History', icon: Clock },
  { id: 'liked', label: 'Liked Videos', icon: ThumbsUp },
];

const exploreItems = [
  { id: 'music', label: 'Music', icon: Music },
  { id: 'gaming', label: 'Gaming', icon: Gamepad2 },
  { id: 'movies', label: 'Movies', icon: Film },
  { id: 'sports', label: 'Sports', icon: Trophy },
];

const settingsItems = [
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ isOpen, onClose, currentView, onViewChange }: SidebarProps) {
  const handleItemClick = (itemId: string) => {
    onViewChange(itemId);
    // Auto-close sidebar on mobile and tablet when item is clicked
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const renderItems = (items: typeof mainItems, title?: string) => (
    <div className="space-y-1">
      {title && (
        <h3 className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </h3>
      )}
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Button
            key={item.id}
            variant={currentView === item.id ? 'secondary' : 'ghost'}
            className={cn(
              "w-full justify-start h-10 px-3 font-normal",
              currentView === item.id && "bg-accent text-accent-foreground"
            )}
            onClick={() => handleItemClick(item.id)}
          >
            <Icon className="mr-6 h-5 w-5" />
            {item.label}
          </Button>
        );
      })}
    </div>
  );

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-14 z-50 h-[calc(100vh-3.5rem)] w-64 border-r bg-background transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full sidebar-scroll overflow-y-auto">
          <nav className="flex-1 space-y-6 p-2">
            {renderItems(mainItems)}
            
            <Separator />
            {renderItems(libraryItems, 'Library')}
            
            <Separator />
            {renderItems(exploreItems, 'Explore')}
            
            <Separator />
            {renderItems(settingsItems)}
          </nav>
        </div>
      </aside>
    </>
  );
}