'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Menu, Moon, Sun, Play } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { youtubeAPI } from '@/lib/youtube-api';

interface HeaderProps {
  onSearch: (query: string) => void;
  onMenuClick: () => void;
  searchQuery: string;
  onLogoClick?: () => void;
}

interface SearchSuggestion {
  text: string;
  type: 'search' | 'trending' | 'history';
}

export function Header({ onSearch, onMenuClick, searchQuery, onLogoClick }: HeaderProps) {
  const [mounted, setMounted] = useState(false);
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const { theme, setTheme } = useTheme();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    // Load search history from localStorage
    const history = localStorage.getItem('youtube-search-history');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, []);

  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localQuery.trim()) {
      performSearch(localQuery.trim());
    }
  };

  const performSearch = (query: string) => {
    onSearch(query);
    setShowSuggestions(false);
    
    // Add to search history
    const newHistory = [query, ...searchHistory.filter(h => h !== query)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('youtube-search-history', JSON.stringify(newHistory));
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalQuery(value);
    
    if (value.trim().length > 0) {
      setShowSuggestions(true);
      
      // Generate suggestions
      const newSuggestions: SearchSuggestion[] = [];
      
      // Add search history matches (case insensitive)
      const historyMatches = searchHistory
        .filter(h => h.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 3)
        .map(h => ({ text: h, type: 'history' as const }));
      
      newSuggestions.push(...historyMatches);
      
      // Add trending suggestions (case insensitive)
      const trendingSuggestions = [
        'music videos',
        'gaming highlights',
        'tech reviews',
        'cooking tutorials',
        'movie trailers',
        'funny videos',
        'news today',
        'sports highlights',
        'travel vlogs',
        'educational content'
      ]
        .filter(s => s.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 4)
        .map(s => ({ text: s, type: 'trending' as const }));
      
      newSuggestions.push(...trendingSuggestions);
      
      // Add search suggestions based on input
      const searchSuggestions = [
        `${value} tutorial`,
        `${value} review`,
        `${value} 2024`,
        `best ${value}`,
        `how to ${value}`,
        `${value} explained`,
        `${value} compilation`,
        `${value} live`
      ]
        .slice(0, 5)
        .map(s => ({ text: s, type: 'search' as const }));
      
      newSuggestions.push(...searchSuggestions);
      
      setSuggestions(newSuggestions.slice(0, 12));
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setLocalQuery(suggestion.text);
    performSearch(suggestion.text);
  };

  const handleLogoClick = () => {
    if (onLogoClick) {
      onLogoClick();
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const getThemeIcon = () => {
    if (!mounted) return <Sun className="h-5 w-5" />;
    return theme === 'light' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />;
  };

  if (!mounted) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4">
        {/* Left section */}
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="mr-4 hover:bg-accent"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <button
            onClick={handleLogoClick}
            className="flex items-center space-x-1 hover:bg-accent rounded-lg p-2 transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded bg-red-600">
              <Play className="h-4 w-4 text-white fill-white ml-0.5" />
            </div>
            <span className="font-bold text-xl hidden sm:block">YouTube</span>
          </button>
        </div>
        
        {/* Center section - Search */}
        <div className="flex-1 max-w-2xl mx-auto px-4">
          <div ref={searchRef} className="relative">
            <form onSubmit={handleSubmit} className="flex">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search"
                  value={localQuery}
                  onChange={handleInputChange}
                  onFocus={() => localQuery && setShowSuggestions(true)}
                  className="w-full h-10 px-4 py-2 text-sm bg-background border border-border rounded-l-full focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                
                {showSuggestions && suggestions.length > 0 && (
                  <div className="search-suggestions">
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="search-suggestion-item"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <span>{suggestion.text}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <Button
                type="submit"
                size="icon"
                className="rounded-l-none rounded-r-full border border-l-0 border-border bg-muted hover:bg-muted/80 h-10 w-16"
              >
                <Search className="h-4 w-4 text-foreground" />
              </Button>
            </form>
          </div>
        </div>
        
        {/* Right section */}
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme}
            className="hover:bg-accent"
          >
            {getThemeIcon()}
          </Button>
        </div>
      </div>
    </header>
  );
}