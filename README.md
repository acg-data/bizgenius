# BizGenius

AI-powered business planning platform that helps entrepreneurs turn ideas into comprehensive business plans.

## Project Structure

This is a monorepo containing:

- **frontend/** - React + TypeScript frontend application
- **backend/** - FastAPI Python backend service
- **supabase/** - Database migrations and configuration

## Quick Start

### Local Development

```bash
# Frontend
cd frontend
npm install
npm run dev

# Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Docker Development

```bash
docker-compose up
```

## Deployment

The application is configured for deployment on multiple platforms:

- **DigitalOcean App Platform**: See `.do/app.yaml`
- **Docker**: See `docker-compose.prod.yml`
- **GitHub Actions**: See `.github/workflows/deploy.yml`

### Environment Variables

**Frontend:**
- `VITE_API_BASE_URL` - Backend API URL
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

**Backend:**
- `DATABASE_URL` - PostgreSQL connection string
- `SECRET_KEY` - JWT secret key
- `OPENROUTER_API_KEY` - OpenRouter API key for AI features
- `STRIPE_SECRET_KEY` - Stripe payment processing
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signature
- `CORS_ORIGINS` - Allowed CORS origins

## Tech Stack

**Frontend:**
- React 18
- TypeScript
- Vite
- TailwindCSS
- HeroUI
- Zustand (state management)
- React Router

**Backend:**
- Python 3.11+
- FastAPI
- SQLAlchemy
- Alembic (migrations)
- Pydantic
- Supabase (PostgreSQL)

## License

MIT
