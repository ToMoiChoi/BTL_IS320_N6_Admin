# app/routers/categories.py
"""
Categories API - Full CRUD operations
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from ..database import get_db
from ..models import models
from ..schemas import schemas
from ..deps import get_current_user

router = APIRouter(prefix="/categories", tags=["categories"])


# ============================================================
# PUBLIC ENDPOINTS
# ============================================================

@router.get("/", response_model=List[schemas.CategoryOut])
def list_categories(
    include_inactive: bool = Query(False, description="Include inactive categories (admin only)"),
    db: Session = Depends(get_db)
):
    """
    Lấy danh sách tất cả danh mục đang hoạt động.
    Bao gồm số lượng sản phẩm trong mỗi danh mục.
    """
    query = db.query(models.DanhMuc)
    
    if not include_inactive:
        query = query.filter(models.DanhMuc.TrangThai == True)
    
    categories = query.all()
    
    # Đếm số sản phẩm cho mỗi danh mục
    result = []
    for cat in categories:
        product_count = db.query(func.count(models.SanPham.MaSP)).filter(
            models.SanPham.MaDM == cat.MaDM
        ).scalar() or 0
        
        result.append(schemas.CategoryOut(
            MaDM=cat.MaDM,
            TenDM=cat.TenDM,
            Loai=cat.Loai,
            MoTa=cat.MoTa,
            Icon=cat.Icon,
            TrangThai=cat.TrangThai,
            SoLuongSP=product_count
        ))
    
    return result


@router.get("/{category_id}", response_model=schemas.CategoryOut)
def get_category(category_id: int, db: Session = Depends(get_db)):
    """Lấy thông tin chi tiết 1 danh mục."""
    category = db.query(models.DanhMuc).filter(models.DanhMuc.MaDM == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Danh mục không tồn tại")
    
    product_count = db.query(func.count(models.SanPham.MaSP)).filter(
        models.SanPham.MaDM == category_id
    ).scalar() or 0
    
    return schemas.CategoryOut(
        MaDM=category.MaDM,
        TenDM=category.TenDM,
        Loai=category.Loai,
        MoTa=category.MoTa,
        Icon=category.Icon,
        TrangThai=category.TrangThai,
        SoLuongSP=product_count
    )


@router.get("/{category_id}/products")
def get_category_products(
    category_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Lấy danh sách sản phẩm thuộc 1 danh mục."""
    category = db.query(models.DanhMuc).filter(models.DanhMuc.MaDM == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Danh mục không tồn tại")
    
    products = db.query(models.SanPham).filter(
        models.SanPham.MaDM == category_id
    ).offset(skip).limit(limit).all()
    
    total = db.query(func.count(models.SanPham.MaSP)).filter(
        models.SanPham.MaDM == category_id
    ).scalar()
    
    return {
        "category": schemas.CategoryOut(
            MaDM=category.MaDM,
            TenDM=category.TenDM,
            Loai=category.Loai,
            MoTa=category.MoTa,
            Icon=category.Icon,
            TrangThai=category.TrangThai,
            SoLuongSP=total
        ),
        "products": products,
        "total": total,
        "skip": skip,
        "limit": limit
    }


@router.get("/by-type/{loai}/products")
def get_category_products_by_type(
    loai: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Lấy danh sách sản phẩm theo loại danh mục (phone, tablet, etc)."""
    category = db.query(models.DanhMuc).filter(models.DanhMuc.Loai == loai).first()
    if not category:
        raise HTTPException(status_code=404, detail="Danh mục không tồn tại")
    
    products = db.query(models.SanPham).filter(
        models.SanPham.MaDM == category.MaDM
    ).offset(skip).limit(limit).all()
    
    total = db.query(func.count(models.SanPham.MaSP)).filter(
        models.SanPham.MaDM == category.MaDM
    ).scalar()
    
    return {
        "category": schemas.CategoryOut(
            MaDM=category.MaDM,
            TenDM=category.TenDM,
            Loai=category.Loai,
            MoTa=category.MoTa,
            Icon=category.Icon,
            TrangThai=category.TrangThai,
            SoLuongSP=total
        ),
        "products": products,
        "total": total,
        "skip": skip,
        "limit": limit
    }

# ============================================================
# ADMIN ENDPOINTS (Requires authentication)
# ============================================================

@router.post("/", response_model=schemas.CategoryOut)
def create_category(
    payload: schemas.CategoryCreate,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    """Tạo danh mục mới (Admin only)."""
    if user.MaPQ != 1:
        raise HTTPException(status_code=403, detail="Chỉ admin mới có quyền tạo danh mục")
    
    # Kiểm tra trùng tên
    existing = db.query(models.DanhMuc).filter(models.DanhMuc.TenDM == payload.TenDM).first()
    if existing:
        raise HTTPException(status_code=400, detail="Tên danh mục đã tồn tại")
    
    new_category = models.DanhMuc(
        TenDM=payload.TenDM,
        Loai=payload.Loai,
        MoTa=payload.MoTa,
        Icon=payload.Icon,
        TrangThai=payload.TrangThai if payload.TrangThai is not None else True
    )
    db.add(new_category)
    db.commit()
    db.refresh(new_category)
    
    return schemas.CategoryOut(
        MaDM=new_category.MaDM,
        TenDM=new_category.TenDM,
        Loai=new_category.Loai,
        MoTa=new_category.MoTa,
        Icon=new_category.Icon,
        TrangThai=new_category.TrangThai,
        SoLuongSP=0
    )


@router.put("/{category_id}", response_model=schemas.CategoryOut)
def update_category(
    category_id: int,
    payload: schemas.CategoryUpdate,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    """Cập nhật danh mục (Admin only)."""
    if user.MaPQ != 1:
        raise HTTPException(status_code=403, detail="Chỉ admin mới có quyền sửa danh mục")
    
    category = db.query(models.DanhMuc).filter(models.DanhMuc.MaDM == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Danh mục không tồn tại")
    
    # Cập nhật các trường được gửi
    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if value is not None:
            setattr(category, key, value)
    
    db.commit()
    db.refresh(category)
    
    product_count = db.query(func.count(models.SanPham.MaSP)).filter(
        models.SanPham.MaDM == category_id
    ).scalar() or 0
    
    return schemas.CategoryOut(
        MaDM=category.MaDM,
        TenDM=category.TenDM,
        Loai=category.Loai,
        MoTa=category.MoTa,
        Icon=category.Icon,
        TrangThai=category.TrangThai,
        SoLuongSP=product_count
    )


@router.delete("/{category_id}")
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    """
    Xóa danh mục (Admin only).
    Sản phẩm trong danh mục sẽ được chuyển về MaDM = NULL.
    """
    if user.MaPQ != 1:
        raise HTTPException(status_code=403, detail="Chỉ admin mới có quyền xóa danh mục")
    
    category = db.query(models.DanhMuc).filter(models.DanhMuc.MaDM == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Danh mục không tồn tại")
    
    # Đếm số sản phẩm sẽ bị ảnh hưởng
    affected_products = db.query(func.count(models.SanPham.MaSP)).filter(
        models.SanPham.MaDM == category_id
    ).scalar() or 0
    
    # Cập nhật sản phẩm về NULL trước khi xóa
    db.query(models.SanPham).filter(models.SanPham.MaDM == category_id).update(
        {models.SanPham.MaDM: None}
    )
    
    db.delete(category)
    db.commit()
    
    return {
        "detail": f"Đã xóa danh mục '{category.TenDM}'",
        "affected_products": affected_products
    }


@router.patch("/{category_id}/toggle-status")
def toggle_category_status(
    category_id: int,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    """Toggle trạng thái hoạt động của danh mục (Admin only)."""
    if user.MaPQ != 1:
        raise HTTPException(status_code=403, detail="Chỉ admin mới có quyền thay đổi trạng thái")
    
    category = db.query(models.DanhMuc).filter(models.DanhMuc.MaDM == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Danh mục không tồn tại")
    
    category.TrangThai = not category.TrangThai
    db.commit()
    
    return {
        "MaDM": category.MaDM,
        "TenDM": category.TenDM,
        "TrangThai": category.TrangThai,
        "message": f"Đã {'kích hoạt' if category.TrangThai else 'tắt'} danh mục"
    }
