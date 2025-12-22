# app/routers/cart.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import models
from ..deps import get_current_user
from ..schemas.schemas import CartOut, CartItemCreate, CartItemUpdate


router = APIRouter(prefix="/cart", tags=["cart"])

@router.get("/", response_model=CartOut)
def get_my_cart(
    db: Session = Depends(get_db), 
    current_user: models.TaiKhoan = Depends(get_current_user)
):
    """Lấy giỏ hàng của người dùng hiện tại. Nếu chưa có thì tạo mới."""
    cart = db.query(models.GioHang).filter(models.GioHang.MaTK == current_user.MaTK).first()
    
    if not cart:
        cart = models.GioHang(MaTK=current_user.MaTK)
        db.add(cart)
        db.commit()
        db.refresh(cart)
    
    return cart

@router.post("/items")
def add_to_cart(
    item_in: CartItemCreate,
    db: Session = Depends(get_db),
    current_user: models.TaiKhoan = Depends(get_current_user)
):
    """Thêm sản phẩm vào giỏ hàng. Nếu sản phẩm đã tồn tại thì tăng số lượng."""
    # 1. Tìm hoặc tạo giỏ hàng
    cart = db.query(models.GioHang).filter(models.GioHang.MaTK == current_user.MaTK).first()
    if not cart:
        cart = models.GioHang(MaTK=current_user.MaTK)
        db.add(cart)
        db.commit()
        db.refresh(cart)

    # 2. Kiểm tra sản phẩm (và cấu hình TSKT) đã có trong giỏ chưa
    existing_item = db.query(models.ChiTietGioHang).filter(
        models.ChiTietGioHang.MAGH == cart.MAGH,
        models.ChiTietGioHang.MaSP == item_in.MaSP,
        models.ChiTietGioHang.MaTSKT == item_in.MaTSKT
    ).first()

    if existing_item:
        existing_item.SoLuongSanPham += item_in.SoLuongSanPham
    else:
        new_item = models.ChiTietGioHang(
            MAGH=cart.MAGH,
            MaSP=item_in.MaSP,
            MaTSKT=item_in.MaTSKT,
            SoLuongSanPham=item_in.SoLuongSanPham
        )
        db.add(new_item)

    db.commit()
    return {"message": "Đã thêm vào giỏ hàng thành công"}

@router.patch("/items/{item_id}")
def update_cart_item(
    item_id: int,
    item_update: CartItemUpdate,
    db: Session = Depends(get_db),
    current_user: models.TaiKhoan = Depends(get_current_user)
):
    """Cập nhật số lượng của một mục trong giỏ hàng."""
    cart_item = db.query(models.ChiTietGioHang).join(models.GioHang).filter(
        models.ChiTietGioHang.MaCTGH == item_id,
        models.GioHang.MaTK == current_user.MaTK
    ).first()

    if not cart_item:
        raise HTTPException(status_code=404, detail="Không tìm thấy mục trong giỏ hàng")

    if item_update.SoLuongSanPham <= 0:
        db.delete(cart_item)
    else:
        cart_item.SoLuongSanPham = item_update.SoLuongSanPham

    db.commit()
    return {"message": "Đã cập nhật số lượng"}

@router.delete("/items/{item_id}")
def remove_from_cart(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: models.TaiKhoan = Depends(get_current_user)
):
    """Xóa hoàn toàn một mục khỏi giỏ hàng."""
    cart_item = db.query(models.ChiTietGioHang).join(models.GioHang).filter(
        models.ChiTietGioHang.MaCTGH == item_id,
        models.GioHang.MaTK == current_user.MaTK
    ).first()

    if not cart_item:
        raise HTTPException(status_code=404, detail="Không tìm thấy mục cần xóa")

    db.delete(cart_item)
    db.commit()
    return {"message": "Đã xóa sản phẩm khỏi giỏ hàng"}