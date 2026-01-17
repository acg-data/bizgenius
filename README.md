# BizGenius

AI-powered business planning platform that helps entrepreneurs turn ideas into comprehensive business plans.

## Project Structure

This is a monorepo containing:

- **frontend/** - React + TypeScript frontend application with Convex backend

## Quick Start

### Local Development

```bash
# Frontend
cd frontend
npm install
npm run dev
```

## Deployment

The application is configured for deployment on multiple platforms:

- **Netlify**: See `netlify.toml`
- **GitHub Actions**: See `.github/workflows/deploy.yml`

### Environment Variables

**Frontend:**
- `VITE_CONVEX_URL` - Convex deployment URL
- `VITE_SENTRY_DSN` - Sentry error tracking
- `VITE_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key

## Tech Stack

**Frontend:**
- React 18
- TypeScript
- Vite
- TailwindCSS
- HeroUI
- Zustand (state management)
- React Router
- Convex (backend, auth, database)

## License

MIT
