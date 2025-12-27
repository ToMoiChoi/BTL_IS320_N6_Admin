from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from decimal import Decimal
from typing import List
from ..database import get_db
from ..schemas import schemas
from ..schemas.schemas import OrderStatus 
from ..models import models
from ..deps import get_current_user

router = APIRouter(prefix="/orders", tags=["orders"])

# ============================================================
# 1. TẠO ĐƠN HÀNG & TRỪ TỒN KHO
# ============================================================
@router.post("/", response_model=schemas.OrderOut)
def create_order(payload: schemas.OrderCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    try:
        total = Decimal("0.00")
        items_to_create = []

        # 1. Kiểm tra và chuẩn bị dữ liệu (Khóa dòng để tránh tranh chấp kho)
        for item_in in payload.items:
            if item_in.SoLuong <= 0:
                raise HTTPException(status_code=400, detail=f"Số lượng phải lớn hơn 0 (Sản phẩm ID: {item_in.MaSP})")

            # .with_for_update() giúp ngăn chặn các giao dịch khác sửa đổi hàng này cho đến khi commit
            spec_item = db.query(models.ThongSoKyThuat).filter(
                models.ThongSoKyThuat.MaTSKT == item_in.MaTSKT
            ).with_for_update().first()
            
            if not spec_item:
                raise HTTPException(status_code=404, detail=f"Không tìm thấy cấu hình mã {item_in.MaTSKT}")
            
            if spec_item.MaSP != item_in.MaSP:
                 raise HTTPException(status_code=400, detail="Cấu hình kỹ thuật không khớp với sản phẩm")

            # KIỂM TRA TỒN KHO
            if spec_item.SoLuong < item_in.SoLuong:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Sản phẩm {spec_item.PhienBan} chỉ còn {spec_item.SoLuong} máy. Vui lòng cập nhật lại giỏ hàng."
                )
            
            # TRỪ KHO TẠM THỜI (Sẽ lưu chính thức khi commit)
            spec_item.SoLuong -= item_in.SoLuong

            price = Decimal(str(spec_item.GiaBan))
            line_total = price * item_in.SoLuong
            total += line_total
            
            items_to_create.append({
                "MaSP": item_in.MaSP,
                "MaTSKT": spec_item.MaTSKT,
                "SoLuong": item_in.SoLuong,
                "DonGia": price,
            })

        # 2. Tính toán tiền bạc
        tong_tien = total
        giam_gia = Decimal(str(payload.GiamGia or 0))
        thanh_tien = (tong_tien - giam_gia) if (tong_tien - giam_gia) >= 0 else Decimal("0.00")

        # 3. Lưu Đơn hàng tổng
        new_order = models.DonHang(
            MaTK=user.MaTK, 
            TongTien=tong_tien,
            GiamGia=giam_gia,
            ThanhTien=thanh_tien,
            TrangThaiDH=OrderStatus.PENDING 
        )
        db.add(new_order)
        db.flush() 

        # 4. Lưu Chi tiết đơn hàng
        for it in items_to_create:
            detail_item = models.ChiTietDonHang(
                MaDH=new_order.MaDH,
                MaSP=it["MaSP"],
                MaTSKT=it["MaTSKT"],
                SoLuong=it["SoLuong"],
                DonGia=it["DonGia"],
            )
            db.add(detail_item)

        db.commit()
        db.refresh(new_order)
        return new_order

    except HTTPException as he:
        db.rollback()
        raise he
    except Exception as e:
        db.rollback()
        print(f"Checkout Error: {e}") 
        raise HTTPException(status_code=500, detail="Lỗi hệ thống khi xử lý đơn hàng")

# ============================================================
# 2. LẤY DANH SÁCH ĐƠN HÀNG
# ============================================================
@router.get("/", response_model=List[schemas.OrderOut])
def list_orders(db: Session = Depends(get_db), user=Depends(get_current_user)):
    query = db.query(models.DonHang).options(joinedload(models.DonHang.chitiets))
    
    # Nếu không phải Admin thì chỉ thấy đơn của mình
    if getattr(user, "MaPQ", 2) != 1:
        query = query.filter(models.DonHang.MaTK == user.MaTK)
    
    return query.order_by(models.DonHang.NgayDat.desc()).all()

# ============================================================
# 3. XEM CHI TIẾT 1 ĐƠN HÀNG
# ============================================================
@router.get("/{order_id}", response_model=schemas.OrderOut)
def get_order_detail(order_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    order = db.query(models.DonHang).options(
        joinedload(models.DonHang.chitiets)
    ).filter(models.DonHang.MaDH == order_id).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Đơn hàng không tồn tại")
    
    if getattr(user, "MaPQ", 2) != 1 and order.MaTK != user.MaTK:
        raise HTTPException(status_code=403, detail="Bạn không có quyền xem đơn hàng này")
        
    return order

# ============================================================
# 4. CẬP NHẬT TRẠNG THÁI & HOÀN KHO KHI HỦY
# ============================================================
@router.patch("/{order_id}/status")
def update_order_status(
    order_id: int, 
    payload: schemas.OrderStatusUpdate, # Dùng schema mới để nhận status
    db: Session = Depends(get_db), 
    user=Depends(get_current_user)
):
    if getattr(user, "MaPQ", 2) != 1:
        raise HTTPException(status_code=403, detail="Chỉ Admin mới có quyền thay đổi trạng thái")

    order = db.query(models.DonHang).options(joinedload(models.DonHang.chitiets)).filter(models.DonHang.MaDH == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Không tìm thấy đơn hàng")

    old_status = order.TrangThaiDH
    new_status = payload.TrangThaiDH

    # LOGIC HOÀN KHO: Nếu chuyển từ trạng thái khác sang CANCELLED
    if new_status == OrderStatus.CANCELLED and old_status != OrderStatus.CANCELLED:
        for detail in order.chitiets:
            if detail.MaTSKT:
                spec = db.query(models.ThongSoKyThuat).filter(models.ThongSoKyThuat.MaTSKT == detail.MaTSKT).first()
                if spec:
                    spec.SoLuong += detail.SoLuong # Cộng lại số lượng vào kho

    order.TrangThaiDH = new_status
    db.commit()
    return {"message": f"Trạng thái đơn hàng chuyển từ {old_status} sang {new_status}"}