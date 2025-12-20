from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models import models
from ..deps import get_current_user
from ..utils.security import hash_password, verify_password
from ..schemas.schemas import (
    UserOut, UserUpdate, PasswordUpdate, AdminPasswordReset
)

router = APIRouter(prefix="/users", tags=["users"])

# --- DEPENDENCY: KIỂM TRA QUYỀN ADMIN ---
def require_admin(current_user: models.TaiKhoan = Depends(get_current_user)):
    if current_user.MaPQ != 1:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền truy cập chức năng quản trị."
        )
    return current_user

# --- ENDPOINTS ---

@router.get("/me", response_model=UserOut)
def get_my_profile(current_user: models.TaiKhoan = Depends(get_current_user)):
    """Trả về thông tin tài khoản kèm thông tin cá nhân chi tiết."""
    return current_user

@router.put("/me", response_model=UserOut)
def update_my_profile(
    data: UserUpdate, 
    db: Session = Depends(get_db), 
    current_user: models.TaiKhoan = Depends(get_current_user)
):

    # 2. Xử lý bảng ThongTinCaNhan
    profile = current_user.thongtin
    if not profile:
        profile = models.ThongTinCaNhan(
            MaTK=current_user.MaTK,
            HoTen=data.HoTen,
            SoDienThoai=data.SoDienThoai,
            DiaChi=data.DiaChi,
        )
        db.add(profile)
    else:
        if data.HoTen is not None: profile.HoTen = data.HoTen
        if data.SoDienThoai is not None: profile.SoDienThoai = data.SoDienThoai
        if data.DiaChi is not None: profile.DiaChi = data.DiaChi

    db.commit()
    db.refresh(current_user)
    return current_user

@router.put("/me/password")
def change_own_password(
    data: PasswordUpdate,
    db: Session = Depends(get_db),
    current_user: models.TaiKhoan = Depends(get_current_user)
):
    """Đổi mật khẩu: Yêu cầu mật khẩu cũ chính xác."""
    if not verify_password(data.old_password, current_user.MatKhauHash):
        raise HTTPException(status_code=400, detail="Mật khẩu cũ không chính xác.")
    
    current_user.MatKhauHash = hash_password(data.new_password)
    db.commit()
    return {"message": "Đổi mật khẩu thành công."}

@router.get("/", response_model=List[UserOut])
def list_all_users(
    db: Session = Depends(get_db), 
    admin: models.TaiKhoan = Depends(require_admin)
):
    """Admin: Xem toàn bộ danh sách user kèm thông tin chi tiết."""
    return db.query(models.TaiKhoan).all()

@router.delete("/{user_id}")
def delete_user(
    user_id: int, 
    db: Session = Depends(get_db), 
    admin: models.TaiKhoan = Depends(require_admin)
):
    user = db.query(models.TaiKhoan).filter(models.TaiKhoan.MaTK == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Người dùng không tồn tại.")
    db.delete(user)
    db.commit()
    return {"message": "Xóa thành công."}