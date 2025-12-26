# myCEO - AI-Powered Business Planning Platform

## Overview
myCEO is a fullstack SaaS application that helps users turn their business ideas into complete business plans using AI. It features a neobrutalist design aesthetic with cyan accent colors and thick borders.

## Project Structure
```
├── backend/           # FastAPI Python backend
│   ├── app/
│   │   ├── api/       # API route handlers
│   │   ├── core/      # Configuration, database, logging
│   │   ├── db/        # Database initialization
│   │   ├── models/    # SQLAlchemy models
│   │   ├── schemas/   # Pydantic schemas
│   │   └── services/  # Business logic (AI, Stripe)
│   ├── alembic/       # Database migrations
│   └── tests/         # Backend tests
├── frontend/          # React + Vite + TypeScript frontend
│   └── src/
│       ├── components/ # Reusable UI components
│       ├── pages/      # Page components
│       ├── services/   # API client
│       ├── store/      # Zustand state management
│       └── types/      # TypeScript type definitions
└── supabase/          # Original Supabase migrations (not used with Replit DB)
```

## Technology Stack
- **Frontend**: React 18, Vite, TypeScript, TailwindCSS, HeroUI, Zustand
- **Backend**: FastAPI, SQLAlchemy, Alembic, PostgreSQL
- **Authentication**: JWT tokens with passlib/bcrypt
- **Payments**: Stripe integration
- **AI**: OpenRouter API for AI-powered features

## Running the Application
- **Frontend**: Runs on port 5000 via Vite dev server with proxy to backend
- **Backend**: Runs on port 8000 via uvicorn

## Environment Variables
Required environment variables:
- `DATABASE_URL` - PostgreSQL connection string (auto-set by Replit)
- `SECRET_KEY` - JWT signing key
- `CORS_ORIGINS` - Allowed CORS origins
- `VITE_API_BASE_URL` - Frontend API base URL

Optional for production:
- `OPENROUTER_API_KEY` - For AI features
- `STRIPE_SECRET_KEY` - For payment processing
- `STRIPE_WEBHOOK_SECRET` - For Stripe webhooks

## AI Analysis Sections
The platform generates 10 comprehensive analysis sections:
1. **Executive Summary** - One-liner pitch, problem/solution, value proposition, unfair advantage, success metrics
2. **Market Research** - TAM/SAM/SOM with calculations, market trends, customer segments, regulatory landscape
3. **Business Plan** - Mission/vision, pricing strategy, unit economics, SWOT analysis, product roadmap
4. **Financial Model** - 5-year projections, break-even analysis, funding strategy, scenario analysis
5. **Competitor Analysis** - Detailed profiles, differentiation strategy, battle cards, market gaps
6. **Go-to-Market** - Launch phases, acquisition channels, first 100 customers strategy, viral loops
7. **Team Plan** - Founding team composition, hiring roadmap with salaries/equity, culture
8. **Risk Assessment** - Risk scores, critical risks with mitigations, kill conditions
9. **90-Day Action Plan** - Week-by-week tasks, milestones, resources/budget needed
10. **Pitch Deck** - Slide-by-slide breakdown with speaker notes, investor FAQs

## Recent Changes
- 2025-12-26: Comprehensive Business Operating System
  - Created 10 hyper-detailed AI generation prompts for comprehensive business analysis
  - Built `/results` page with tabbed interface displaying all 10 analysis sections
  - Enhanced `/generate` page with 10-step progress indicators
  - Added executive summary, go-to-market, team plan, risk assessment, and 90-day action plan sections
  - All AI generations run in parallel for speed
  
- 2025-12-26: Implemented Generate page and AI generation flow
  - Created `/generate` page with real-time progress indicators
  - Updated AI service to use `minimax/minimax-m2.1` model via OpenRouter
  - Created public `/api/v1/generate` endpoint for unauthenticated business analysis
  - Updated Landing page with open-ended textarea for business ideas
  - Added robust JSON parsing for AI responses
  - Implemented local storage fallback for page reloads
  
- 2025-12-26: Initial Replit environment setup
  - Configured Vite for port 5000 with host 0.0.0.0 and allowedHosts: true
  - Set up API proxy from frontend to backend
  - Fixed Stripe library compatibility issues
  - Ran database migrations
