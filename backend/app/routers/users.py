# app/routers/users.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas import schemas
from ..models import models
from ..deps import get_current_user

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/me", response_model=schemas.UserOut)
def me(user=Depends(get_current_user)):
    return user

@router.get("/", response_model=list[schemas.UserOut])
def list_users(skip: int = 0, limit: int = 50, db: Session = Depends(get_db), _u=Depends(get_current_user)):
    # require admin? for demo allow any authenticated user
    users = db.query(models.TaiKhoan).offset(skip).limit(limit).all()
    return users

@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    p = db.query(models.TaiKhoan).filter(models.TaiKhoan.MaTK == user_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(p)
    db.commit()
    return {"user": "deleted"}