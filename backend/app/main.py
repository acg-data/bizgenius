from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import time
import uuid
import os
from pathlib import Path

from app.core.config import settings
from app.core.logging import setup_logging, get_logger
from app.core.exceptions import register_exception_handlers
from app.api import auth, users, ideas, subscriptions, payments, documents, generate
from app.db.init_db import init_db

# Initialize structured logging
setup_logging()
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up BizGenius API...", extra={"environment": settings.ENVIRONMENT})
    await init_db()
    logger.info("Startup complete!")
    yield
    logger.info("Shutting down BizGenius API...")


app = FastAPI(
    title="BizGenius API",
    description="AI-powered business planning SaaS",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register custom exception handlers
register_exception_handlers(app)


@app.middleware("http")
async def request_logging_middleware(request: Request, call_next):
    """Log all requests with timing and request ID."""
    request_id = request.headers.get("X-Request-ID", str(uuid.uuid4())[:8])
    start_time = time.time()

    # Add request ID to response headers
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id

    # Calculate duration
    duration_ms = round((time.time() - start_time) * 1000, 2)

    # Log the request (skip health checks to reduce noise)
    if request.url.path != "/health":
        logger.info(
            f"{request.method} {request.url.path} - {response.status_code}",
            extra={
                "request_id": request_id,
                "method": request.method,
                "path": request.url.path,
                "status_code": response.status_code,
                "duration_ms": duration_ms
            }
        )

    return response


app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])
app.include_router(ideas.router, prefix="/api/v1/ideas", tags=["Ideas"])
app.include_router(subscriptions.router, prefix="/api/v1/subscriptions", tags=["Subscriptions"])
app.include_router(payments.router, prefix="/api/v1/payments", tags=["Payments"])
app.include_router(documents.router, prefix="/api/v1/documents", tags=["Documents"])
app.include_router(generate.router, prefix="/api/v1/generate", tags=["Generate"])


@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}


@app.get("/api")
async def api_root():
    return {
        "name": "myCEO API",
        "version": "1.0.0",
        "description": "AI-powered business planning SaaS"
    }

frontend_dist = Path(__file__).parent.parent.parent / "frontend" / "dist"
if frontend_dist.exists():
    app.mount("/", StaticFiles(directory=str(frontend_dist), html=True), name="static")
