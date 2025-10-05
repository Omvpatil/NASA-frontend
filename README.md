# NASA Space Biology Knowledge Engine - Frontend

A Next.js frontend application for searching and analyzing NASA space biology research papers using AI-powered semantic search.

## Features

-   **Semantic Search**: Vector-based search through research papers with AI-generated answers
-   **On-Demand Scraping**: Real-time paper content extraction with image support
-   **Database Management**: Complete interface for managing papers and embeddings
-   **Multiple AI Models**: Support for various Google Gemini models
-   **Image Extraction**: View figures and images from research papers

## Pages

-   **Home** (`/`): Dashboard showing system status and quick access to features
-   **Search** (`/search`): Main search interface with regular and on-demand search options
-   **Database** (`/database`): Database management interface for loading and managing papers
-   **About** (`/about`): Information about the platform and API features

## API Integration

This frontend connects to a FastAPI backend that provides:

-   Vector database search powered by ChromaDB
-   Real-time paper scraping from NASA PubMed Central
-   AI-powered answer generation using Google Gemini models
-   Comprehensive database management operations

## Environment Variables

Create a `.env.local` file with:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## Removed Pages

The following pages were removed as they don't have corresponding FastAPI endpoints:

-   `/ai-chat` - Replaced by `/search` with AI-powered answers
-   `/dashboard` - Replaced by main dashboard on home page
-   `/insights` - No corresponding API for insights generation
-   `/knowledge-map` - No corresponding API for knowledge mapping

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables in `.env.local`

3. Start the development server:

```bash
npm run dev
```

4. Make sure the FastAPI backend is running on `http://localhost:8000`
