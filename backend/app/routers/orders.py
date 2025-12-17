# app/routers/orders.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from decimal import Decimal
from typing import List # Dùng List cho tương thích tốt hơn
from ..database import get_db
from ..schemas import schemas
from ..models import models
from ..deps import get_current_user

router = APIRouter(prefix="/orders", tags=["orders"])

# 1. TẠO ĐƠN HÀNG
@router.post("/", response_model=schemas.OrderOut)
def create_order(payload: schemas.OrderCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    try:
        # --- BƯỚC 1: Chuẩn bị dữ liệu và Tính toán ---
        total = Decimal("0.00")
        items_to_create = []

        # Duyệt qua từng sản phẩm trong giỏ hàng
        for item_in in payload.items:
            if item_in.SoLuong <= 0:
                raise HTTPException(status_code=400, detail=f"Số lượng sản phẩm ID {item_in.MaSP} phải lớn hơn 0")

            # Lấy thông tin sản phẩm từ DB
            product = db.query(models.SanPham).filter(models.SanPham.MaSP == item_in.MaSP).first()
            spec_item = db.query(models.ThongSoKyThuat).filter(models.ThongSoKyThuat.MaTSKT == item_in.MaTSKT).first()
            if product.MaSP != item_in.MaSP:
                raise HTTPException(status_code=404, detail=f"Sản phẩm ID {item_in.MaSP} không có cấu hình kỹ thuật ID {item_in.MaTSKT}")
            
            if not product:
                raise HTTPException(status_code=404, detail=f"Sản phẩm ID {item_in.MaSP} không tồn tại")
            
            # (Tùy chọn) Kiểm tra tồn kho - Nếu model SanPham có trường SoLuongTon
            # if product.SoLuongTon < item_in.SoLuong:
            #     raise HTTPException(status_code=400, detail=f"Sản phẩm {product.TenSP} không đủ hàng")

            price = Decimal(str(spec_item.GiaBan)) if spec_item else Decimal("0.00")
            line_total = price * item_in.SoLuong
            total += line_total
            
            # Lưu tạm thông tin để tạo ChiTietDonHang sau
            items_to_create.append({
                "MaSP": item_in.MaSP,
                "MaTSKT": spec_item.MaTSKT if spec_item else None,
                "SoLuong": item_in.SoLuong,
                "DonGia": price,
            })

            # product.SoLuongTon -= item_in.SoLuong

        # --- BƯỚC 2: Tính tổng tiền cuối cùng ---
        tong_tien = total
        giam_gia = Decimal(str(payload.GiamGia or 0))
        thanh_tien = (tong_tien - giam_gia) if (tong_tien - giam_gia) >= 0 else Decimal("0.00")

        # --- BƯỚC 3: Tạo Đơn hàng (Master) ---
        # Lưu ý: Lấy MaTK từ user đang đăng nhập (token) chứ không lấy từ payload để bảo mật
        new_order = models.DonHang(
            MaTK=user.MaTK, 
            TongTien=tong_tien,
            GiamGia=giam_gia,
            ThanhTien=thanh_tien,
            TrangThaiDH="pending" # Mặc định là Chờ xử lý
        )
        db.add(new_order)
        db.flush() # flush để database sinh ra MaDH (ID tự tăng) nhưng chưa commit hẳn

        # --- BƯỚC 4: Tạo Chi tiết đơn hàng (Detail) ---
        for it in items_to_create:
            detail_item = models.ChiTietDonHang(
                MaDH=new_order.MaDH, # Lấy ID vừa sinh ra ở trên
                MaSP=it["MaSP"],
                SoLuong=it["SoLuong"],
                DonGia=it["DonGia"]
            )
            db.add(detail_item)

        # Nếu mọi thứ ổn, commit tất cả vào DB
        db.commit()
        db.refresh(new_order)
        return new_order

    except HTTPException as he:
        # Nếu lỗi logic (hết hàng, ko tìm thấy SP) -> throw ra ngoài
        db.rollback()
        raise he
    except Exception as e:
        # Nếu lỗi Database hoặc lỗi code khác -> Rollback toàn bộ transaction
        db.rollback()
        print(f"Error creating order: {e}") # Log lỗi để debug
        raise HTTPException(status_code=500, detail="Không thể tạo đơn hàng, vui lòng thử lại")

# 2. LẤY DANH SÁCH ĐƠN HÀNG
@router.get("/", response_model=List[schemas.OrderOut])
def list_orders(db: Session = Depends(get_db), user=Depends(get_current_user)):
    # Logic phân quyền:
    # Nếu là Admin (MaPQ = 1) -> Xem được TOÀN BỘ đơn hàng
    if getattr(user, "MaPQ", 2) == 1:
        orders = db.query(models.DonHang).all()
    else:
        # Nếu là User thường -> Chỉ xem đơn CỦA MÌNH
        orders = db.query(models.DonHang).filter(models.DonHang.MaTK == user.MaTK).all()
    
    return orders

# 3. (Bổ sung) XEM CHI TIẾT 1 ĐƠN HÀNG
# Bạn cần tạo thêm Schema OrderDetailOut bao gồm list items nếu muốn dùng hàm này
@router.get("/{order_id}", response_model=schemas.OrderOut)
def get_order_detail(order_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    order = db.query(models.DonHang).filter(models.DonHang.MaDH == order_id).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Đơn hàng không tồn tại")
    
    # Bảo mật: Nếu không phải Admin VÀ đơn hàng này không phải của User đó -> Chặn
    if getattr(user, "MaPQ", 2) != 1 and order.MaTK != user.MaTK:
        raise HTTPException(status_code=403, detail="Bạn không có quyền xem đơn hàng này")
        
    return order