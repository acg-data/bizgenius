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
- **AI**: Replit Gemini AI Integrations (google.genai SDK) for AI-powered features

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

## Local Business Features
For local/service businesses, the platform automatically:
- **Extracts location** from the business description (city, state)
- **Fetches population data** for accurate TAM/SAM/SOM calculations
- **Scrapes competitor websites** to analyze:
  - Pricing information
  - Services offered
  - Online booking availability
  - Reviews/testimonials presence
- **Identifies market gaps** based on competitor analysis
- **Enriches AI prompts** with real local market data

## Subscription & Paywall System
The platform uses a freemium model with premium sections gated behind subscription:

**Free Tier** (all users):
- Executive Summary, Market Research, Competitor Analysis
- Business Plan, Go-to-Market, Team Plan
- Risk Assessment, 90-Day Action Plan

**Pro Tier** ($10/month or $100/year):
- Financial Model (5-year projections, break-even, funding strategy)
- Pitch Deck (10-12 slides with speaker notes, investor FAQs)

**Implementation**:
- Backend: `sessions.py` has `redact_premium_sections()` that replaces premium sections with `{locked: true, preview: {...}}` for non-Pro users
- Backend: `normalize_result()` transforms Gemini output field names to frontend-expected format
- Backend: `subscriptions.py` creates Stripe checkout sessions, `payments.py` handles webhooks
- Frontend: `PaywallModal.tsx` shows upgrade options with plan selection
- Frontend: `LockedSectionCard` displays preview info and unlock button for locked sections
- Frontend: Results page checks `data.locked` before accessing any nested fields

**Stripe Environment Variables**:
- `STRIPE_SECRET_KEY` - API key for Stripe
- `STRIPE_PRICE_ID_MONTHLY` - Price ID for $10/month plan
- `STRIPE_PRICE_ID_ANNUAL` - Price ID for $100/year plan
- `STRIPE_WEBHOOK_SECRET` - Webhook signing secret

## Recent Changes
- 2025-12-29: Stripe Subscription Paywall
  - Added PaywallModal component for upgrade flow with monthly/annual plan selection
  - Created LockedSectionCard component showing teaser preview with unlock button
  - Backend redacts financial_model and pitch_deck for non-Pro users
  - Added normalize_result() to transform Gemini output to frontend-expected field names
  - Sidebar shows lock icon for premium sections when not subscribed
  - Webhook handling for checkout.session.completed, subscription updates, and invoice events
  - Users can upgrade mid-session and immediately unlock premium content

- 2025-12-28: Phased Gemini Generation Pipeline
  - Switched from parallel OpenRouter calls to phased Gemini execution via Replit AI Integrations
  - New GeminiService using google.genai SDK with automatic retry (5 attempts, exponential backoff)
  - 4-phase pipeline to prevent context window overflow:
    - Phase 1 (parallel): Market Research + Competitor Discovery
    - Phase 2 (sequential): Executive Summary → Business Plan → Financial Model + Competitor Analysis
    - Phase 3 (parallel pairs): GTM + Team Plan, then Risk + Action Plan
    - Phase 4: Pitch Deck with accumulated context
  - Context summarization: Only key insights (TAM/SAM values, positioning) passed between phases
  - Each phase saves intermediate results to database for real-time progress tracking
  - Mobile users see progress updates even if they background the browser

- 2025-12-28: Faster Questions, Location-First, Retry Logic
  - Switched question generation from slow `openai/gpt-oss-120b` to fast `google/gemini-2.0-flash-001`
  - First question now loads in ~2-3 seconds instead of 10+ seconds
  - Location is now asked FIRST if not mentioned in business idea (fixes "Spark" ambiguity)
  - Added automatic retry with exponential backoff (1s, 2s, 4s) for session creation
  - Errors only shown after 3 failed attempts, reducing transient failures

- 2025-12-28: Mobile Browser Background Resilience
  - Fixed critical bug: Generation no longer fails when users leave Safari on mobile
  - Switched from long-running POST request to async session-based architecture
  - Frontend now creates session via POST /sessions/create, polls /sessions/status/{session_id}
  - Session ID stored in localStorage for resume on return
  - Backend processes generation in background task (survives browser backgrounding)
  - Added "Welcome back! Reconnecting..." UI state for returning users
  - Users can safely leave and return during the 2-3 minute generation

- 2025-12-28: Premium Business OS Dashboard Redesign
  - Complete redesign of Results page as a glassmorphic business dashboard
  - Hero header with company branding (logo, name) and KPI metrics strip
  - Left navigation rail with gradient icons, section labels, and completion badges
  - GlassCard component with backdrop blur, soft shadows, and hover animations
  - Data visualizations: TAM/SAM/SOM bar chart, progress rings, financial tables
  - Command palette (⌘K) for quick actions: export CSV, new analysis, share
  - Dynamic background with animated gradient blobs
  - Premium typography and spacing throughout
  - All 10 sections redesigned with consistent glass aesthetic
  - Branding integration: displays company logo and name from branding step

- 2025-12-28: Branding Step with Logo Generation & Color Picker
  - New /branding page between Questions and Generate
  - Company name input with AI-suggested names
  - Logo generation using Gemini 2.5 Flash Image (Nano Banana)
  - 4 logo variations generated with different styles
  - Coolors.co-style color palette picker:
    - 5 color swatches with click-to-lock functionality
    - Shuffle unlocked colors button
    - AI-suggested palettes based on business type
  - Branding data (name, logo, colors) passed to Generate page
  - Backend: /api/v1/branding endpoints for names, logos, palettes

- 2025-12-28: MECE Questionnaire with Background Branding Generation
  - Redesigned Questions page with MECE (Mutually Exclusive, Collectively Exhaustive) framework
  - First question is now AI-generated based on the business idea (not hardcoded location)
  - Company name asked SECOND, triggering background logo/palette generation
  - Questions organized by MECE dimensions: Financial, Geographic, Human, Market
  - Background branding: logos and color palettes generated while user answers questions
  - Flow now skips separate Branding page - goes directly to Generate with cached branding
  - Backend updated to generate MECE-focused questions with context awareness

- 2025-12-28: Single-Question Flow with Instant First Question (Legacy)
  - Redesigned Questions page to show one question at a time
  - Progress tracker shows "Question X of Y" with visual step indicators
  - Background fetching: next questions load while user answers current one
  - Smooth slide transitions between questions
  - Green indicators for answered questions in progress bar

- 2025-12-28: Session Persistence, OAuth & Welcome Emails
  - Added GenerationSession model for database-persisted generation state
  - Users can now leave the Generate page and return without losing progress
  - Implemented Replit Auth OAuth with Google, GitHub, Apple, and email/password
  - Added OAuthUser model for storing authenticated user data
  - Created email service using Resend via Replit Connectors for welcome emails
  - New users automatically receive a branded welcome email on signup
  - Improved question generation to be contextual and avoid repetition
  - Added ConversationHistory model to track user context across sessions

- 2025-12-27: Enhanced Competitor Discovery & Financial Exports
  - Added Gemini Flash (`google/gemini-2.0-flash-001`) for competitor discovery with real sources
  - Competitor analysis now shows 5-10 direct + 3-5 indirect competitors with:
    - Clickable website links, Google reviews, Yelp links as citations
    - Competitive advantage analysis and customer review summaries
    - Market gaps and opportunities based on competitor weaknesses
  - Added "I don't know" option to all multiple choice questions
  - Added required questions: Investment Amount and Timeline (always asked)
  - Financials tab now includes Google Sheets export and CSV download
  - Questions now use openai/gpt-oss-120b for fastest generation (~1-2 seconds)

- 2025-12-27: Enhanced Discovery Questionnaire with Multiple Choice
  - Location-first questioning: AI always asks for location first (city/state for domestic, country for international)
  - Multiple choice format: Questions now show 3-5 options plus "Other (please specify)" with custom text field
  - Reordered generation: Market Research → Competitor Analysis → ICP come first, then Business Plan follows gap analysis
  - Updated Results page tabs to show Market Research and Competitors first (default tab is now Market)

- 2025-12-27: AI Discovery Questionnaire
  - Added `/api/v1/generate/questions` endpoint that generates 3-5 contextual questions based on business idea
  - Created `/questions` page with neobrutalist UI to display and collect answers
  - Updated generate flow: Landing → Questions → Generate → Results
  - AI now incorporates founder's Q&A responses into the enriched prompt for better analysis

- 2025-12-27: Local Business Intelligence
  - Added competitor website scraping service (BeautifulSoup + httpx)
  - Integrated US city population database (200+ major cities)
  - Created local_business_service.py for location extraction and market analysis
  - Updated generate API to enrich prompts with population and competitor data
  - Added "Local Market" tab to Results page showing scraped competitor data
  - AI now uses real population figures for TAM/SAM/SOM calculations
  
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
