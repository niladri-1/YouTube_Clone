# YouTube Clone

A modern, fully-featured YouTube clone built with Next.js, TypeScript, and Tailwind CSS. Features real-time video search, trending content, responsive design, and a beautiful dark/light theme system.

## Features

### Core Functionality
- **YouTube Data API v3 Integration** - Complete integration with YouTube's API for fetching videos, search results, and metadata
- **Video Search** - Real-time search with autocomplete and filtering capabilities
- **Video Player** - Embedded YouTube player with full functionality
- **Trending Videos** - Display trending content from YouTube
- **Video Suggestions** - Intelligent recommendations based on current video
- **Responsive Design** - Optimized for desktop, tablet, and mobile devices

### User Interface
- **Modern Design** - Clean, minimalistic interface inspired by YouTube
- **Theme System** - Dark/light mode with system preference detection
- **Smooth Animations** - Micro-interactions and hover effects
- **Mobile-First** - Responsive design with mobile optimization
- **Professional Typography** - Clean hierarchy with Inter font family

### Technical Features
- **Next.js 13+** - App router with server and client components
- **TypeScript** - Full type safety throughout the application
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible UI components
- **Optimized Performance** - Image optimization, lazy loading, and efficient rendering

## Setup Instructions

### Prerequisites
- Node.js 18+ 
- YouTube Data API v3 Key

### 1. Get YouTube API Key

1. Go to [Google Cloud Console](https://console.developers.google.com/)
2. Create a new project or select an existing one
3. Enable the **YouTube Data API v3**
4. Go to "Credentials" and create an **API Key**
5. Copy your API key

### 2. Environment Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Add your YouTube API key to `.env.local`:
   ```
   NEXT_PUBLIC_YOUTUBE_API_KEY=your_actual_api_key_here
   ```

### 3. Install and Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:3000` to see your YouTube clone in action!

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── layout/           # Layout components (Header, Sidebar)
│   ├── providers/        # Context providers (Theme)
│   ├── ui/              # shadcn/ui components
│   └── video/           # Video-related components
├── lib/                  # Utilities and API
│   ├── utils.ts         # Utility functions
│   └── youtube-api.ts   # YouTube API integration
└── README.md
```

## API Integration

The app uses YouTube Data API v3 for:

- **Search Videos** - `/search` endpoint for video searches
- **Video Details** - `/videos` endpoint for detailed video information
- **Trending Videos** - `/videos` with `chart=mostPopular` for trending content
- **Related Videos** - Smart suggestions based on channel and content

## Features in Detail

### Video Search
- Real-time search as you type
- Comprehensive video metadata (title, description, views, duration)
- Intelligent filtering and sorting

### Video Player
- Full YouTube embed with autoplay
- Video details, descriptions, and metadata
- Like counts, view counts, and publication dates
- Related video suggestions

### Responsive Design
- Mobile-first approach with breakpoints:
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px
- Collapsible sidebar for mobile
- Optimized touch interactions

### Theme System
- Automatic system theme detection
- Manual theme switching (Light/Dark/System)
- Smooth theme transitions
- Proper contrast ratios for accessibility

## Customization

### Styling
- Modify `tailwind.config.ts` for theme customization
- Update CSS variables in `globals.css` for color schemes
- Components use Tailwind classes for easy customization

### API Configuration
- Adjust API endpoints in `lib/youtube-api.ts`
- Modify search parameters and result counts
- Add additional YouTube API features

## Performance Optimizations

- **Image Optimization** - Next.js Image component with lazy loading
- **Code Splitting** - Automatic code splitting with Next.js
- **API Caching** - Efficient API request handling
- **Responsive Images** - Multiple image sizes for different devices

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is for educational purposes. Please respect YouTube's Terms of Service and API usage policies.

## Troubleshooting

### API Key Issues
- Ensure your API key is correctly set in `.env.local`
- Check that YouTube Data API v3 is enabled in Google Cloud Console
- Verify API key permissions and quotas

### Video Playback Issues
- Some videos may be restricted from embedding
- Check video availability in your region
- Ensure iframe embedding is allowed

### Performance Issues
- Monitor API quota usage
- Implement request debouncing for search
- Consider implementing caching for frequently accessed data

---

Built with ❤️ using Next.js, TypeScript, and the YouTube Data API.