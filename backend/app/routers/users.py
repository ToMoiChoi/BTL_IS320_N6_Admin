# app/routers/users.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import models
from ..deps import get_current_user

router = APIRouter(prefix="/users", tags=["users"])

# --- DEPENDENCY KIỂM TRA QUYỀN ADMIN ---
def require_admin(current_user: models.TaiKhoan = Depends(get_current_user)):
    # Kiểm tra MaPQ trực tiếp từ model TaiKhoan
    if current_user.MaPQ != 1:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền truy cập chức năng quản trị."
        )
    return current_user

# --- ENDPOINTS ---

@router.get("/me")
def get_my_profile(current_user: models.TaiKhoan = Depends(get_current_user)):
    """Ai đăng nhập cũng xem được chính mình"""
    return current_user

@router.get("/")
def list_all_users(
    db: Session = Depends(get_db), 
    admin: models.TaiKhoan = Depends(require_admin)
):
    """Chỉ Admin (MaPQ=1) mới thấy danh sách toàn bộ user"""
    return db.query(models.TaiKhoan).all()

@router.delete("/{user_id}")
def delete_user_by_admin(
    user_id: int, 
    db: Session = Depends(get_db), 
    admin: models.TaiKhoan = Depends(require_admin)
):
    """Chỉ Admin mới có quyền xóa người dùng"""
    user = db.query(models.TaiKhoan).filter(models.TaiKhoan.MaTK == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Không tìm thấy người dùng.")
    
    db.delete(user)
    db.commit()
    return {"message": "Đã xóa tài khoản thành công."}