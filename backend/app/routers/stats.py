# app/routers/stats.py
from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import models
from ..deps import get_current_user
from ..schemas.schemas import RevenueByDay
from typing import List
from datetime import timedelta

router = APIRouter(prefix="/stats", tags=["stats"])

@router.get("/revenue/daily", response_model=List[RevenueByDay])
def revenue_daily(days: int = 7, db: Session = Depends(get_db), user=Depends(get_current_user)):
    """
    Trả về doanh thu trong `days` ngày gần nhất, nhóm theo ngày (ngày của DonHang.NgayDat).
    """
    # SQLite: use DATE function; for other DBs adjust accordingly.
    q = db.query(
        func.date(models.DonHang.NgayDat).label("date"),
        func.sum(models.DonHang.ThanhTien).label("revenue")
    ).group_by(func.date(models.DonHang.NgayDat)).order_by(func.date(models.DonHang.NgayDat).desc()).limit(days)
    rows = q.all()
    # map to schema
    result = [{"date": r[0], "revenue": r[1] or 0} for r in rows]
    return result

@router.get("/revenue/weekly", response_model=List[RevenueByDay])
def revenue_weekly(weeks: int = 4, db: Session = Depends(get_db), user=Depends(get_current_user)):
    """
    Doanh thu theo tuần (tuần bắt đầu Monday). Implementation simple: group by year-week.
    """
    # For SQLite, no built-in week grouping, we'll use strftime('%Y-%W')
    q = db.query(
        func.strftime("%Y-%W", models.DonHang.NgayDat).label("week"),
        func.sum(models.DonHang.ThanhTien).label("revenue")
    ).group_by(func.strftime("%Y-%W", models.DonHang.NgayDat)).order_by(func.strftime("%Y-%W", models.DonHang.NgayDat).desc()).limit(weeks)
    rows = q.all()
    # convert week string to pseudo-date (first day of week) is omitted for simplicity
    result = [{"date": r[0], "revenue": r[1] or 0} for r in rows]
    return result
