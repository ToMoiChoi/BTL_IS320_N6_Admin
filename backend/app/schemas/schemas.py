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

class UserOut(BaseModel):
    MaTK: int
    TenDangNhap: str
    Email: EmailStr
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

class ProductOut(ProductBase):
    MaSP: int
    NgayTao: Optional[datetime] = None
    # thong_so: List[ThongSoKyThuatOut] = [] 
    class Config:
        from_attributes = True

# --- MEDIA (HÌNH ẢNH, VIDEO) ---
class MediaOut(BaseModel):
    MaMedia: int
    MaSP: int
    Loai: str
    DuongDanFile: str

    class Config:
        orm_mode = True
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

# --- STATS ---
class RevenueByDay(BaseModel):
    date: datetime
    revenue: condecimal(max_digits=14, decimal_places=2)

