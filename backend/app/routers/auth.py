# app/routers/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from ..database import get_db
from ..schemas import schemas
from ..models import models
from ..utils.security import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=schemas.Token)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # 1. Check if user already exists
    exists = db.query(models.TaiKhoan).filter(
        (models.TaiKhoan.TenDangNhap == user.username) | 
        (models.TaiKhoan.Email == user.email) 
    ).first()
    
    # If found, stop here and return 400
    if exists:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Username or email already registered"
        )

    # 2. Create new user
    new_user = models.TaiKhoan(
        TenDangNhap=user.username,
        Email=user.email,
        MatKhauHash=hash_password(user.password),
        MaPQ=user.maPQ
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # 3. Create Token
    # We cast to str() to ensure the 'sub' claim is valid
    token = create_access_token({
        "sub": str(new_user.TenDangNhap), 
        "user_id": new_user.MaTK
    })
    
    return {"access_token": token, "token_type": "bearer"}

@router.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.TaiKhoan).filter(
        models.TaiKhoan.TenDangNhap == form_data.username
    ).first()

    if not user or not verify_password(form_data.password, user.MatKhauHash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token({
        "sub": str(user.TenDangNhap), 
        "user_id": user.MaTK
    })
    
    return {"access_token": token, "token_type": "bearer"}