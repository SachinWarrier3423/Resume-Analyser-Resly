# Resly - AI Resume Analyzer

A premium, minimalist frontend and backend for an AI Resume Analyzer SaaS built with Next.js 14, TypeScript, Tailwind CSS, Framer Motion, Supabase, and Groq AI.

## Features

### Frontend
- **Landing Page** - Hero section, value proposition, animated demo preview, and CTA
- **Analyzer Page** - Resume upload and job description editor with validation
- **Progress Screen** - Animated timeline and progress indicators during AI analysis
- **Results Page** - Match score, ATS score, skill gaps, keyword heatmaps, and improvement roadmap
- **History Page** - View and compare past analyses
- **Settings Page** - Profile management, AI preferences, and data export/deletion

### Backend
- **Resume PDF Parsing** - Extract and normalize text from PDF files
- **AI Analysis** - Groq AI-powered resume analysis with streaming support
- **Database Persistence** - Supabase integration with RLS policies
- **Usage Logging** - Observability for all API requests
- **Input Validation** - Zod schemas for type-safe validation

## Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Framer Motion**
- **Lucide Icons**

### Backend
- **Next.js API Routes** (Node.js)
- **Supabase** (Database, Auth, Storage)
- **Groq AI** (LLM API)
- **Zod** (Validation)
- **pdf-parse** (PDF extraction)

## Getting Started

### Prerequisites

- Node.js 18+ 
- Supabase account
- Groq API key

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
# Copy env.example.txt to .env.local
cp env.example.txt .env.local
```

Fill in your values:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `GROQ_API_KEY` - Your Groq API key

3. Set up database:
   - Open Supabase SQL Editor
   - Run the SQL from `supabase/schema.sql`

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
/app
  /(marketing)     # Landing page
  /(app)           # Application pages
    /analyze       # Analyzer and progress pages
    /results       # Results page
    /history       # History page
    /settings      # Settings page
  /api             # API routes
    /analyze       # POST - Analyze resume
    /history       # GET - Get analysis history
/components        # Reusable components
/lib               # Backend utilities
  /supabase.ts     # Supabase client
  /validation.ts   # Zod schemas
  /pdf-parser.ts   # PDF extraction
  /ai-orchestrator.ts # Groq AI integration
  /logger.ts       # Usage logging
  /errors.ts       # Error handling
/types             # TypeScript type definitions
/supabase          # Database schema
/docs              # Documentation
```

## API Endpoints

### POST /api/analyze

Analyzes a resume against a job description.

**Request:**
- FormData: `resume` (PDF file), `jobDescription` (text)
- OR JSON: `{ resumeText: string, jobDescription: string }`

**Response:**
- JSON with analysis results
- OR SSE stream if `?stream=true`

### GET /api/history

Returns saved analyses for the authenticated user.

**Query Params:**
- `userId`: User UUID
- `limit`: Number of results (default: 20)
- `offset`: Pagination offset (default: 0)

See `docs/BACKEND.md` for detailed API documentation.

## Design Philosophy

- **Glassmorphism** - Frosted panels with blur effects
- **Floating cards** - Soft shadows and thin borders
- **Large whitespace** - Calm, breathable layouts
- **Ultra-light UI** - Minimal chrome, maximum content focus
- **Smooth animations** - 150-250ms transitions for delightful interactions
- **Friendly microcopy** - Human, approachable language throughout

## Backend Philosophy

- **Stateless** - No server-side session storage
- **Reliable** - Comprehensive error handling and validation
- **Simple** - Minimal abstractions, clear code flow
- **Secure** - Input validation, RLS policies, API key isolation
- **Observable** - Usage logging for all requests

## Build

```bash
npm run build
```

## Deployment

### Backend (Render)
1. Set environment variables in Render dashboard
2. Deploy Next.js app
3. Configure build: `npm run build`
4. Configure start: `npm start`

### Database (Supabase)
1. Run `supabase/schema.sql` in Supabase SQL editor
2. Configure RLS policies (already in schema)
3. Set up storage buckets for resume files (future)

## License

Private - YC Startup
"# Resume-Analyser-Resly" 
