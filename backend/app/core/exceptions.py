"""
Custom exceptions and error handling for BizGenius API.
Provides consistent error responses across all endpoints.
"""
from typing import Any, Optional, Dict, List
from fastapi import HTTPException, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from pydantic import BaseModel
import logging
import traceback

logger = logging.getLogger(__name__)


# =============================================================================
# Error Response Schemas
# =============================================================================

class ErrorDetail(BaseModel):
    """Individual error detail."""
    field: Optional[str] = None
    message: str
    code: Optional[str] = None


class ErrorResponse(BaseModel):
    """Standardized error response format."""
    success: bool = False
    error: str
    message: str
    details: Optional[List[ErrorDetail]] = None
    request_id: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "success": False,
                "error": "validation_error",
                "message": "Request validation failed",
                "details": [
                    {"field": "email", "message": "Invalid email format", "code": "invalid_format"}
                ],
                "request_id": "req_abc123"
            }
        }


# =============================================================================
# Custom Exceptions
# =============================================================================

class BizGeniusException(Exception):
    """Base exception for all BizGenius errors."""
    def __init__(
        self,
        message: str,
        error_code: str = "internal_error",
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        details: Optional[List[ErrorDetail]] = None
    ):
        self.message = message
        self.error_code = error_code
        self.status_code = status_code
        self.details = details
        super().__init__(self.message)


class NotFoundError(BizGeniusException):
    """Resource not found."""
    def __init__(self, resource: str, resource_id: Any = None):
        message = f"{resource} not found"
        if resource_id:
            message = f"{resource} with ID {resource_id} not found"
        super().__init__(
            message=message,
            error_code="not_found",
            status_code=status.HTTP_404_NOT_FOUND
        )


class UnauthorizedError(BizGeniusException):
    """Authentication required or failed."""
    def __init__(self, message: str = "Authentication required"):
        super().__init__(
            message=message,
            error_code="unauthorized",
            status_code=status.HTTP_401_UNAUTHORIZED
        )


class ForbiddenError(BizGeniusException):
    """Access denied."""
    def __init__(self, message: str = "Access denied"):
        super().__init__(
            message=message,
            error_code="forbidden",
            status_code=status.HTTP_403_FORBIDDEN
        )


class BadRequestError(BizGeniusException):
    """Invalid request."""
    def __init__(self, message: str, details: Optional[List[ErrorDetail]] = None):
        super().__init__(
            message=message,
            error_code="bad_request",
            status_code=status.HTTP_400_BAD_REQUEST,
            details=details
        )


class ConflictError(BizGeniusException):
    """Resource conflict (e.g., duplicate)."""
    def __init__(self, message: str):
        super().__init__(
            message=message,
            error_code="conflict",
            status_code=status.HTTP_409_CONFLICT
        )


class RateLimitError(BizGeniusException):
    """Rate limit exceeded."""
    def __init__(self, message: str = "Rate limit exceeded. Please try again later."):
        super().__init__(
            message=message,
            error_code="rate_limit_exceeded",
            status_code=status.HTTP_429_TOO_MANY_REQUESTS
        )


class ExternalServiceError(BizGeniusException):
    """External service (AI, Stripe) error."""
    def __init__(self, service: str, message: str = "Service temporarily unavailable"):
        super().__init__(
            message=f"{service}: {message}",
            error_code="external_service_error",
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE
        )


class ValidationError(BizGeniusException):
    """Custom validation error."""
    def __init__(self, message: str, details: Optional[List[ErrorDetail]] = None):
        super().__init__(
            message=message,
            error_code="validation_error",
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            details=details
        )


# =============================================================================
# Exception Handlers
# =============================================================================

def get_request_id(request: Request) -> Optional[str]:
    """Extract request ID from headers if present."""
    return request.headers.get("X-Request-ID")


async def bizgenius_exception_handler(
    request: Request,
    exc: BizGeniusException
) -> JSONResponse:
    """Handle custom BizGenius exceptions."""
    request_id = get_request_id(request)

    logger.warning(
        f"BizGeniusException: {exc.error_code} - {exc.message}",
        extra={
            "request_id": request_id,
            "error_code": exc.error_code,
            "status_code": exc.status_code,
            "path": request.url.path,
            "method": request.method
        }
    )

    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            error=exc.error_code,
            message=exc.message,
            details=exc.details,
            request_id=request_id
        ).model_dump()
    )


async def http_exception_handler(
    request: Request,
    exc: HTTPException
) -> JSONResponse:
    """Handle FastAPI HTTPExceptions."""
    request_id = get_request_id(request)

    # Map status codes to error codes
    error_codes = {
        400: "bad_request",
        401: "unauthorized",
        403: "forbidden",
        404: "not_found",
        405: "method_not_allowed",
        409: "conflict",
        422: "validation_error",
        429: "rate_limit_exceeded",
        500: "internal_error",
        503: "service_unavailable"
    }

    error_code = error_codes.get(exc.status_code, "error")

    logger.warning(
        f"HTTPException: {exc.status_code} - {exc.detail}",
        extra={
            "request_id": request_id,
            "status_code": exc.status_code,
            "path": request.url.path,
            "method": request.method
        }
    )

    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            error=error_code,
            message=str(exc.detail),
            request_id=request_id
        ).model_dump()
    )


async def validation_exception_handler(
    request: Request,
    exc: RequestValidationError
) -> JSONResponse:
    """Handle Pydantic validation errors."""
    request_id = get_request_id(request)

    # Convert Pydantic errors to our format
    details = []
    for error in exc.errors():
        field = ".".join(str(loc) for loc in error["loc"] if loc != "body")
        details.append(ErrorDetail(
            field=field or None,
            message=error["msg"],
            code=error["type"]
        ))

    logger.warning(
        f"Validation error: {len(details)} errors",
        extra={
            "request_id": request_id,
            "errors": [d.model_dump() for d in details],
            "path": request.url.path,
            "method": request.method
        }
    )

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=ErrorResponse(
            error="validation_error",
            message="Request validation failed",
            details=details,
            request_id=request_id
        ).model_dump()
    )


async def unhandled_exception_handler(
    request: Request,
    exc: Exception
) -> JSONResponse:
    """Handle all unhandled exceptions."""
    request_id = get_request_id(request)

    # Log the full traceback for debugging
    logger.error(
        f"Unhandled exception: {type(exc).__name__}: {str(exc)}",
        extra={
            "request_id": request_id,
            "path": request.url.path,
            "method": request.method,
            "traceback": traceback.format_exc()
        },
        exc_info=True
    )

    # Return generic error to client (don't leak internal details)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=ErrorResponse(
            error="internal_error",
            message="An unexpected error occurred. Please try again later.",
            request_id=request_id
        ).model_dump()
    )


def register_exception_handlers(app) -> None:
    """Register all exception handlers with the FastAPI app."""
    app.add_exception_handler(BizGeniusException, bizgenius_exception_handler)
    app.add_exception_handler(HTTPException, http_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(Exception, unhandled_exception_handler)
