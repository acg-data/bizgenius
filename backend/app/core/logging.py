"""
Structured logging configuration for BizGenius API.
Provides JSON logging for production and readable logs for development.
"""
import logging
import sys
import json
from datetime import datetime
from typing import Any, Dict, Optional
import uuid

from app.core.config import settings


class JSONFormatter(logging.Formatter):
    """
    JSON log formatter for structured logging.
    Outputs logs in JSON format for easy parsing by log aggregators.
    """

    def format(self, record: logging.LogRecord) -> str:
        log_data: Dict[str, Any] = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }

        # Add extra fields if present
        if hasattr(record, "request_id"):
            log_data["request_id"] = record.request_id
        if hasattr(record, "user_id"):
            log_data["user_id"] = record.user_id
        if hasattr(record, "path"):
            log_data["path"] = record.path
        if hasattr(record, "method"):
            log_data["method"] = record.method
        if hasattr(record, "status_code"):
            log_data["status_code"] = record.status_code
        if hasattr(record, "duration_ms"):
            log_data["duration_ms"] = record.duration_ms
        if hasattr(record, "error_code"):
            log_data["error_code"] = record.error_code

        # Add exception info if present
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)

        # Add any additional extra fields
        for key, value in record.__dict__.items():
            if key not in [
                "name", "msg", "args", "created", "filename", "funcName",
                "levelname", "levelno", "lineno", "module", "msecs",
                "pathname", "process", "processName", "relativeCreated",
                "stack_info", "exc_info", "exc_text", "thread", "threadName",
                "request_id", "user_id", "path", "method", "status_code",
                "duration_ms", "error_code", "message"
            ] and not key.startswith("_"):
                log_data[key] = value

        return json.dumps(log_data, default=str)


class DevelopmentFormatter(logging.Formatter):
    """
    Human-readable formatter for development.
    Colorized output with clear formatting.
    """

    COLORS = {
        "DEBUG": "\033[36m",     # Cyan
        "INFO": "\033[32m",      # Green
        "WARNING": "\033[33m",   # Yellow
        "ERROR": "\033[31m",     # Red
        "CRITICAL": "\033[35m",  # Magenta
    }
    RESET = "\033[0m"

    def format(self, record: logging.LogRecord) -> str:
        color = self.COLORS.get(record.levelname, self.RESET)

        # Build the base message
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        base_msg = f"{color}{timestamp} | {record.levelname:8} | {record.name}{self.RESET}"
        message = f"{base_msg} | {record.getMessage()}"

        # Add extra context if present
        extras = []
        if hasattr(record, "request_id"):
            extras.append(f"req_id={record.request_id}")
        if hasattr(record, "user_id"):
            extras.append(f"user={record.user_id}")
        if hasattr(record, "path"):
            extras.append(f"path={record.path}")
        if hasattr(record, "duration_ms"):
            extras.append(f"duration={record.duration_ms}ms")

        if extras:
            message += f" [{', '.join(extras)}]"

        # Add exception info if present
        if record.exc_info:
            message += f"\n{self.formatException(record.exc_info)}"

        return message


def setup_logging() -> None:
    """
    Configure logging for the application.
    Uses JSON format in production, readable format in development.
    """
    # Determine log level
    log_level = logging.DEBUG if settings.DEBUG else logging.INFO

    # Create the root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)

    # Remove existing handlers
    root_logger.handlers = []

    # Create console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(log_level)

    # Choose formatter based on environment
    if settings.ENVIRONMENT == "production":
        formatter = JSONFormatter()
    else:
        formatter = DevelopmentFormatter()

    console_handler.setFormatter(formatter)
    root_logger.addHandler(console_handler)

    # Reduce noise from third-party libraries
    logging.getLogger("uvicorn").setLevel(logging.WARNING)
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)


class RequestContextLogger:
    """
    Logger adapter that adds request context to all log messages.
    """

    def __init__(self, logger: logging.Logger, request_id: Optional[str] = None):
        self.logger = logger
        self.request_id = request_id or str(uuid.uuid4())[:8]
        self.extra: Dict[str, Any] = {"request_id": self.request_id}

    def set_user(self, user_id: int) -> None:
        """Add user context to logs."""
        self.extra["user_id"] = user_id

    def _log(self, level: int, msg: str, *args, **kwargs) -> None:
        extra = {**self.extra, **kwargs.pop("extra", {})}
        self.logger.log(level, msg, *args, extra=extra, **kwargs)

    def debug(self, msg: str, *args, **kwargs) -> None:
        self._log(logging.DEBUG, msg, *args, **kwargs)

    def info(self, msg: str, *args, **kwargs) -> None:
        self._log(logging.INFO, msg, *args, **kwargs)

    def warning(self, msg: str, *args, **kwargs) -> None:
        self._log(logging.WARNING, msg, *args, **kwargs)

    def error(self, msg: str, *args, **kwargs) -> None:
        self._log(logging.ERROR, msg, *args, **kwargs)

    def critical(self, msg: str, *args, **kwargs) -> None:
        self._log(logging.CRITICAL, msg, *args, **kwargs)


def get_logger(name: str) -> logging.Logger:
    """Get a logger instance."""
    return logging.getLogger(name)
