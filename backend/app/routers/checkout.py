from sqlalchemy.orm import Session
from fastapi import HTTPException
from ..models import models

def update_stock(db: Session, tskt_id: int, quantity_to_reduce: int):
    # 1. Tìm biến thể sản phẩm theo MaTSKT
    spec = db.query(models.ThongSoKyThuat).filter(models.ThongSoKyThuat.MaTSKT == tskt_id).with_for_update().first()
    
    if not spec:
        raise HTTPException(status_code=404, detail="Biến thể sản phẩm không tồn tại")
    
    # 2. Kiểm tra hàng trong kho
    if spec.SoLuong < quantity_to_reduce:
        raise HTTPException(
            status_code=400, 
            detail=f"Sản phẩm {spec.PhienBan} chỉ còn {spec.SoLuong} sản phẩm, không đủ để đặt hàng."
        )
    
    # 3. Trừ số lượng
    spec.SoLuong -= quantity_to_reduce
    return spec