# BizGenius - AI-Powered Business Planning Platform

## Overview
BizGenius is a fullstack SaaS application that helps users turn their business ideas into complete business plans using AI.

## Project Structure
```
├── frontend/          # React + Vite + TypeScript frontend
│   └── src/
│       ├── components/ # Reusable UI components
│       ├── pages/      # Page components
│       ├── convex/     # Convex backend functions
│       ├── store/      # Zustand state management
│       └── types/      # TypeScript type definitions
```

## Technology Stack
- **Frontend**: React 18, Vite, TypeScript, TailwindCSS, HeroUI, Zustand
- **Backend**: Convex (serverless functions, database, auth)
- **Authentication**: Convex Auth
- **Payments**: Stripe integration
- **AI**: OpenRouter for AI-powered features

## Running the Application
- **Frontend**: Runs on port 5000 via Vite dev server
- **Convex**: Runs locally via `npx convex dev`

## Environment Variables
Required environment variables:
- `VITE_CONVEX_URL` - Convex deployment URL (auto-set by `npx convex dev`)
- `VITE_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key

Optional for production:
- `OPENROUTER_API_KEY` - For AI features
- `STRIPE_SECRET_KEY` - For payment processing
- `STRIPE_WEBHOOK_SECRET` - For Stripe webhooks
- `VITE_SENTRY_DSN` - For error tracking

## Subscription & Paywall System
The platform uses a freemium model with premium sections gated behind subscription:

**Free Tier** (all users):
- Executive Summary, Market Research, Competitor Analysis
- Business Plan, Go-to-Market, Team Plan
- Risk Assessment, 90-Day Action Plan

**Premium Tier** ($10/month or $100/year):
- Financial Model (5-year projections, break-even, funding strategy)
- Pitch Deck (10-12 slides with speaker notes, investor FAQs)

**Expert Tier** (unlimited):
- All sections plus custom branding and priority support
