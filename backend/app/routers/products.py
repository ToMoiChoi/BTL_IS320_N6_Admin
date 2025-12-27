import os
import time
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..schemas import schemas
from ..models import models
from ..deps import get_current_user

router = APIRouter(prefix="/products", tags=["products"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ============================================================
# 1. QUẢN LÝ SẢN PHẨM (PRODUCT)
# ============================================================

@router.post("/", response_model=List[schemas.ProductOut])
def create_products(
    payload: List[schemas.ProductCreate], 
    db: Session = Depends(get_db), 
    user=Depends(get_current_user)
):
    new_products = []
    for item in payload:
        p = models.SanPham(
            TenSP=item.TenSP,
            MoTa=item.MoTa,
            MaDM=item.MaDM
        )
        db.add(p)
        new_products.append(p)
    
    db.commit()
    for p in new_products:
        db.refresh(p)
    return new_products

@router.get("/", response_model=List[schemas.ProductOut]) 
def list_products(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    return db.query(models.SanPham).offset(skip).limit(limit).all()

@router.get("/{product_id}", response_model=schemas.ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    p = db.query(models.SanPham).filter(models.SanPham.MaSP == product_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    return p

@router.delete("/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    p = db.query(models.SanPham).filter(models.SanPham.MaSP == product_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    
    db.delete(p) # Sẽ tự động xóa thongso_list và media do có cascade trong models.py
    db.commit()
    return {"detail": "Deleted product and related data"}

@router.put("/{product_id}")
def update_product(product_id: int, payload: schemas.ProductUpdate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    p = db.query(models.SanPham).filter(models.SanPham.MaSP == product_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if payload.TenSP is not None:
        p.TenSP = payload.TenSP
    if payload.MoTa is not None:
        p.MoTa = payload.MoTa
    if payload.MaDM is not None:
        p.MaDM = payload.MaDM
    
    db.commit()
    db.refresh(p)
    return p

@router.put("/{product_id}/thong_so/{tskt_id}")
def update_spec(product_id: int, tskt_id: int, payload: schemas.ThongSoKyThuatUpdate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    spec = db.query(models.ThongSoKyThuat).filter(
        models.ThongSoKyThuat.MaTSKT == tskt_id,
        models.ThongSoKyThuat.MaSP == product_id
    ).first()
    if not spec:
        raise HTTPException(status_code=404, detail="Spec not found")
    
    for field, value in payload.dict(exclude_unset=True).items():
        setattr(spec, field, value)
    
    db.commit()
    db.refresh(spec)
    return spec

# ============================================================
# 2. QUẢN LÝ BIẾN THỂ / THÔNG SỐ (SPECS)
# ============================================================

@router.post("/{product_id}/thong_so", response_model=List[schemas.ThongSoKyThuatOut])
def add_product_specs(
    product_id: int, 
    specs: List[schemas.ThongSoKyThuatCreate], 
    db: Session = Depends(get_db), 
    user=Depends(get_current_user)
):
    p = db.query(models.SanPham).filter(models.SanPham.MaSP == product_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")

    new_specs = []
    for item in specs:
        # Sử dụng **item.dict() để mapping RAM, BoNho, Pin, GiaBan... từ schema vào model
        new_spec = models.ThongSoKyThuat(
            MaSP=product_id,
            **item.dict() 
        )
        db.add(new_spec)
        new_specs.append(new_spec)

    db.commit()
    for s in new_specs:
        db.refresh(s)
    return new_specs

@router.get("/{product_id}/thong_so", response_model=List[schemas.ThongSoKyThuatOut])
def get_product_specs(product_id: int, db: Session = Depends(get_db)):
    return db.query(models.ThongSoKyThuat).filter(models.ThongSoKyThuat.MaSP == product_id).all()

@router.post("/{product_id}/thong_so", response_model=List[schemas.ThongSoKyThuatOut])
def add_product_specs(
    product_id: int, 
    specs: List[schemas.ThongSoKyThuatCreate], 
    db: Session = Depends(get_db), 
    user=Depends(get_current_user)
):
    p = db.query(models.SanPham).filter(models.SanPham.MaSP == product_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")

    new_specs = []
    for item in specs:
        # item lúc này đã bao gồm trường SoLuong từ schemas
        new_spec = models.ThongSoKyThuat(
            MaSP=product_id,
            **item.dict() 
        )
        db.add(new_spec)
        new_specs.append(new_spec)

    db.commit()
    for s in new_specs:
        db.refresh(s)
    return new_specs

@router.delete("/thong_so/{tskt_id}")
def delete_spec_item(tskt_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    spec_item = db.query(models.ThongSoKyThuat).filter(models.ThongSoKyThuat.MaTSKT == tskt_id).first()
    if not spec_item:
        raise HTTPException(status_code=404, detail="Spec item not found")
    
    db.delete(spec_item)
    db.commit()
    return {"detail": "Deleted spec item"}
@router.patch("/thong_so/{tskt_id}/stock")
def update_stock_manual(
    tskt_id: int, 
    so_luong_moi: int, 
    db: Session = Depends(get_db), 
    user=Depends(get_current_user)
):
    # Kiểm tra quyền Admin (Giả sử MaPQ == 1 là Admin)
    if user.MaPQ != 1:
        raise HTTPException(status_code=403, detail="Chỉ Admin mới có quyền cập nhật kho")

    spec = db.query(models.ThongSoKyThuat).filter(models.ThongSoKyThuat.MaTSKT == tskt_id).first()
    if not spec:
        raise HTTPException(status_code=404, detail="Không tìm thấy biến thể")

    spec.SoLuong = so_luong_moi
    db.commit()
    db.refresh(spec)
    
    return {"MaTSKT": tskt_id, "SoLuongHienTai": spec.SoLuong}  
# ============================================================
# 3. QUẢN LÝ HÌNH ẢNH (MEDIA)
# ============================================================

@router.post("/{product_id}/upload")
async def upload_image(
    product_id: int, 
    file: UploadFile = File(...), 
    db: Session = Depends(get_db), 
    user=Depends(get_current_user)
):
    p = db.query(models.SanPham).filter(models.SanPham.MaSP == product_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")

    file_ext = os.path.splitext(file.filename)[1]
    filename = f"prod_{product_id}_{int(time.time())}{file_ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    with open(filepath, "wb") as f:
        content = await file.read()
        f.write(content)

    new_media = models.HinhAnhVideo(
        MaSP=product_id,
        Loai="image",
        DuongDanFile=f"/static/{filename}"
    )
    db.add(new_media)
    db.commit()
    return {"id": new_media.MaMedia, "path": new_media.DuongDanFile}

@router.get("/{product_id}/media", response_model=List[schemas.MediaOut])
def get_product_media(product_id: int, db: Session = Depends(get_db)):
    return db.query(models.HinhAnhVideo).filter(models.HinhAnhVideo.MaSP == product_id).all()

@router.delete("/media/{media_id}")
def delete_media(media_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    media_item = db.query(models.HinhAnhVideo).filter(models.HinhAnhVideo.MaMedia == media_id).first()
    if not media_item:
        raise HTTPException(status_code=404, detail="Media not found")

    db.delete(media_item)
    db.commit()
    return {"detail": "Deleted media"}
