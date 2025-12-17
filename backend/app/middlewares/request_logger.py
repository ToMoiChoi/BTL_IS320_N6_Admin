# app/middlewares/request_logger.py
import time
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request
from sqlalchemy.orm import Session
from ..models.models import RequestLog
from ..database import SessionLocal

class RequestLoggerMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start = time.time()
        response = await call_next(request)
        duration_ms = (time.time() - start) * 1000

        # create a DB session (quick & simple) and insert log
        db: Session = SessionLocal()
        try:
            user_id = None
            # try extract user id from header (if set by auth dependency). optional
            if "x-user-id" in request.headers:
                try:
                    user_id = int(request.headers["x-user-id"])
                except:
                    user_id = None

            log = RequestLog(
                path=str(request.url.path),
                method=request.method,
                status_code=response.status_code,
                duration_ms=duration_ms,
                user_id=user_id
            )
            db.add(log)
            db.commit()
        except Exception as e:
            db.rollback()
        finally:
            db.close()

        return response
