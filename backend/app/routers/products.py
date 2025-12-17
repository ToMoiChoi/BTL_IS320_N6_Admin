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

# 1. CREATE PRODUCT
# Sửa payload từ schemas.ProductCreate thành List[schemas.ProductCreate]
@router.post("/", response_model=List[schemas.ProductOut]) # Trả về list
def create_product(
    payload: List[schemas.ProductCreate], # <--- Nhận vào List
    db: Session = Depends(get_db), 
    user=Depends(get_current_user)
):
    new_products = []
    for item in payload:
        p = models.SanPham(
            TenSP=item.TenSP,
            MoTa=item.MoTa,
            MaDM=item.MaDM,
        )
        db.add(p)
        new_products.append(p)
    
    db.commit()
    
    for p in new_products:
        db.refresh(p)
        
    return new_products

# 2. LIST PRODUCTS
@router.get("/", response_model=List[schemas.ProductOut]) 
def list_products(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    products = db.query(models.SanPham).offset(skip).limit(limit).all()
    return products

# 3. GET PRODUCT BY ID
@router.get("/{product_id}", response_model=schemas.ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    p = db.query(models.SanPham).filter(models.SanPham.MaSP == product_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    return p

# 4. UPDATE PRODUCT INFO (General)
@router.put("/{product_id}", response_model=schemas.ProductOut)
def update_product_info(product_id: int, payload: schemas.ProductCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    p = db.query(models.SanPham).filter(models.SanPham.MaSP == product_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    
    p.TenSP = payload.TenSP
    p.MoTa = payload.MoTa
    p.MaDM = payload.MaDM

    db.commit()
    db.refresh(p)
    return p

# ============================================================
# 5. QUẢN LÝ THÔNG SỐ KỸ THUẬT (BIẾN THỂ SẢN PHẨM)
# ============================================================


@router.post("/{product_id}/thong_so", response_model=schemas.ProductOut) 
def add_product_specs(
    product_id: int, 
    specs: List[schemas.ThongSoKyThuatCreate], 
    db: Session = Depends(get_db), 
    user=Depends(get_current_user)
):
    # 1. Tìm sản phẩm cha
    p = db.query(models.SanPham).filter(models.SanPham.MaSP == product_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")

    # 2. Insert các thông số mới
    for item in specs:
        spec_data = item.dict(exclude_unset=True)
        new_spec = models.ThongSoKyThuat(
            MaSP=product_id, 
            **spec_data      
        )
        db.add(new_spec)

    db.commit()
    db.refresh(p) 
        
    return p

# API: Lấy danh sách thông số/biến thể của 1 sản phẩm
@router.get("/{product_id}/thong_so", response_model=List[schemas.ThongSoKyThuatOut])
def get_product_specs(product_id: int, db: Session = Depends(get_db)):
    specs_list = db.query(models.ThongSoKyThuat).filter(models.ThongSoKyThuat.MaSP == product_id).all()
    return specs_list

# API: Xóa một biến thể 
@router.delete("/thong_so/{thong_so_id}")
def delete_spec_item(spec_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    spec_item = db.query(models.ThongSoKyThuat).filter(models.ThongSoKyThuat.MaTSKT == spec_id).first()
    
    if not spec_item:
        raise HTTPException(status_code=404, detail="Variant (Spec) not found")
    
    db.delete(spec_item)
    db.commit()
    return {"detail": "Deleted spec item"}
# API: Thêm mới một danh sách thông số cho sản phẩm
@router.post("/{product_id}/thong_so", response_model=List[schemas.ThongSoKyThuatOut])
def add_product_specs(
    product_id: int, 
    specs: List[schemas.ThongSoKyThuatCreate], # Nhận vào một LIST (Mảng)
    db: Session = Depends(get_db), 
    user=Depends(get_current_user)
):
    # 1. Kiểm tra sản phẩm có tồn tại không
    p = db.query(models.SanPham).filter(models.SanPham.MaSP == product_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")

    new_specs = []
    # 2. Lặp qua danh sách gửi lên và thêm vào DB
    for item in specs:
        # Tùy chọn: Kiểm tra xem thông số này đã có chưa để Update hay Create
        # Ở đây làm đơn giản là Create (Thêm mới)
        new_spec = models.ThongSoKyThuat(
            MaSP=product_id,
            TenThongSo=item.TenThongSo,
            GiaTri=item.GiaTri
        )
        db.add(new_spec)
        new_specs.append(new_spec)

    db.commit()
    
    # Refresh từng item để lấy ID vừa tạo
    for s in new_specs:
        db.refresh(s)
        
    return new_specs

# API: Lấy toàn bộ danh sách thông số của 1 sản phẩm
@router.get("/{product_id}/thong_so", response_model=List[schemas.ThongSoKyThuatOut])
def get_product_specs(product_id: int, db: Session = Depends(get_db)):
    # 1. Tìm TẤT CẢ thông số (dùng .all() thay vì .first())
    specs_list = db.query(models.ThongSoKyThuat).filter(models.ThongSoKyThuat.MaSP == product_id).all()
    
    return specs_list

# API: Xóa một dòng thông số cụ thể (Ví dụ: Xóa dòng RAM 8GB nhập sai)
@router.delete("/thong_so/{thong_so_id}")
def delete_spec_item(thong_so_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    spec_item = db.query(models.ThongSoKyThuat).filter(models.ThongSoKyThuat.MaThongSo == thong_so_id).first()
    if not spec_item:
        raise HTTPException(status_code=404, detail="Spec item not found")
    
    db.delete(spec_item)
    db.commit()
    return {"detail": "Deleted spec item"}
# 6. DELETE PRODUCT
@router.delete("/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    p = db.query(models.SanPham).filter(models.SanPham.MaSP == product_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    
    db.delete(p)
    db.commit()
    return {"detail": "deleted"}

# 7. UPLOAD IMAGE
@router.post("/{product_id}/upload", response_model=dict)
async def upload_image(product_id: int, file: UploadFile = File(...), db: Session = Depends(get_db), user=Depends(get_current_user)):
    p = db.query(models.SanPham).filter(models.SanPham.MaSP == product_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")

    file_extension = os.path.splitext(file.filename)[1]
    filename = f"{product_id}_{int(time.time())}{file_extension}"
    
    filepath = os.path.join(UPLOAD_DIR, filename)
    with open(filepath, "wb") as f:
        content = await file.read()
        f.write(content)

    relative_path = f"/static/{filename}"
    
    media = models.HinhAnhVideo(MaSP=product_id, Loai="image", DuongDanFile=relative_path)
    db.add(media)
    db.commit()
    db.refresh(media)
    
    return {"filename": filename, "path": relative_path}