# app/schemas.py
from pydantic import BaseModel, EmailStr, condecimal
from typing import Optional, List
from datetime import datetime

# --- AUTH ---
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    maPQ: int = 2

class ThongTinCaNhanOut(BaseModel):
    HoTen: Optional[str] = None
    SoDienThoai: Optional[str] = None
    DiaChi: Optional[str] = None
    
    class Config:
        from_attributes = True

class UserOut(BaseModel):
    MaTK: int
    TenDangNhap: str
    Email: EmailStr
    MaPQ: int
    CreatedAt: datetime
    thongtin: Optional[ThongTinCaNhanOut] = None 

    class Config:
        from_attributes = True

class PasswordUpdate(BaseModel):
    old_password: str
    new_password: str

class AdminPasswordReset(BaseModel):
    new_password: str

class UserUpdate(BaseModel):
    HoTen: Optional[str] = None
    SoDienThoai: Optional[str] = None
    DiaChi: Optional[str] = None

    class Config:
        from_attributes = True
    
# --- THONG SO KY THUAT (SPECS / VARIANTS) ---
class ThongSoKyThuatBase(BaseModel):
    KichThuoc: Optional[str] = None
    Camera: Optional[str] = None
    PhienBan: Optional[str] = None
    Chitset: Optional[str] = None
    RAM: Optional[str] = None
    BoNho: Optional[str] = None 
    Pin: Optional[str] = None
    TheSim: Optional[str] = None
    HeDieuHanh: Optional[str] = None
    MauSac: Optional[str] = None
    
    # Giá bán gắn liền với cấu hình này
    GiaBan: Optional[condecimal(max_digits=12, decimal_places=2)] = None

class ThongSoKyThuatCreate(ThongSoKyThuatBase):
    pass

class ThongSoKyThuatOut(ThongSoKyThuatBase):
    MaTSKT: int
    MaSP: int 
    class Config:
        from_attributes = True

# --- PRODUCT (SẢN PHẨM) ---
class ProductBase(BaseModel):
    TenSP: str
    MoTa: Optional[str] = None
    MaDM: Optional[int] = None

class ProductCreate(ProductBase):
    pass


# --- MEDIA (HÌNH ẢNH, VIDEO) ---
class MediaOut(BaseModel):
    MaMedia: int
    MaSP: int
    Loai: str
    DuongDanFile: str

    class Config:
        from_attributes = True

class ProductOut(ProductBase):
    MaSP: int
    NgayTao: Optional[datetime] = None
    thongso_list: List[ThongSoKyThuatOut] = [] 
    media: List[MediaOut] = []

    class Config:
        from_attributes = True
# --- CART SCHEMAS ---

class CartItemCreate(BaseModel):
    MaSP: int
    MaTSKT: Optional[int] = None  # Cấu hình máy (RAM/ROM) cụ thể
    SoLuongSanPham: int = 1

class CartItemUpdate(BaseModel):
    SoLuongSanPham: int

class CartItemOut(BaseModel):
    MaCTGH: int
    MaSP: int
    MaTSKT: Optional[int]
    SoLuongSanPham: int
    # Bạn có thể thêm thông tin sản phẩm để Frontend hiển thị dễ hơn
    sanpham: Optional[ProductOut] 
    
    class Config:
        from_attributes = True

class CartOut(BaseModel):
    MAGH: int
    MaTK: int
    CreatedAt: datetime
    items: List[CartItemOut] = []

    class Config:
        from_attributes = True
# --- ORDER (ĐƠN HÀNG) ---
class OrderItemCreate(BaseModel):
    MaSP: int
    SoLuong: int
    MaTSKT: int 

class OrderItemOut(BaseModel):
    MaSP: int
    MaTSKT: int
    SoLuong: int
    DonGia: condecimal(max_digits=12, decimal_places=2)
    class Config:
        from_attributes = True

# Schema TẠO đơn hàng
class OrderCreate(BaseModel):
    items: List[OrderItemCreate]
    GiamGia: Optional[condecimal(max_digits=12, decimal_places=2)] = 0

# Schema XEM đơn hàng
class OrderOut(BaseModel):
    MaDH: int
    MaTK: int
    NgayDat: datetime
    ThanhTien: condecimal(max_digits=14, decimal_places=2)
    TongTien: condecimal(max_digits=14, decimal_places=2)
    TrangThaiDH: str = "pending"
    
    items: List[OrderItemOut] = [] 

    class Config:
        from_attributes = True
class OrderStatusUpdate(BaseModel):
    TrangThaiDH: str # Ví dụ: "completed", "shipping", v.v.

    class Config:
        from_attributes = True
# --- STATS ---
class RevenueByDay(BaseModel):
    date: datetime
    revenue: condecimal(max_digits=14, decimal_places=2)

