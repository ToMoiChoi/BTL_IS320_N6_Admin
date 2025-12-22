from pydantic import BaseModel, EmailStr, condecimal, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

# --- ENUMS (Định nghĩa các tập hợp giá trị cố định) ---

class OrderStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    SHIPPING = "shipping"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"

class MediaType(str, Enum):
    IMAGE = "image"
    VIDEO = "video"

# --- CATEGORY (DANH MỤC) ---
class CategoryOut(BaseModel):
    MaDM: int
    TenDM: str
    Loai: Optional[str] = None
    MoTa: Optional[str] = None
    TrangThai: Optional[bool] = True
    
    class Config:
        from_attributes = True

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
    Loai: MediaType  # Sử dụng Enum MediaType thay cho str
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
    MaTSKT: Optional[int] = None
    SoLuongSanPham: int = 1

class CartItemUpdate(BaseModel):
    SoLuongSanPham: int

class CartItemOut(BaseModel):
    MaCTGH: int
    MaSP: int
    MaTSKT: Optional[int]
    SoLuongSanPham: int
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
    MaTSKT: Optional[int] = None
    SoLuong: int
    DonGia: condecimal(max_digits=12, decimal_places=2)
    class Config:
        from_attributes = True

class OrderCreate(BaseModel):
    items: List[OrderItemCreate]
    GiamGia: Optional[condecimal(max_digits=12, decimal_places=2)] = 0

class OrderOut(BaseModel):
    MaDH: int 
    MaTK: int
    NgayDat: datetime
    ThanhTien: condecimal(max_digits=14, decimal_places=2)
    TongTien: condecimal(max_digits=14, decimal_places=2)
    TrangThaiDH: OrderStatus = OrderStatus.PENDING # Giá trị mặc định từ Enum
    
    items: List[OrderItemOut] = Field(default=[], alias="chitiets")

    class Config:
        from_attributes = True
        populate_by_name = True

class OrderStatusUpdate(BaseModel):
    # Khi dùng Enum ở đây, Swagger sẽ tự hiển thị Dropdown
    TrangThaiDH: OrderStatus = Field(..., description="Chọn trạng thái từ danh sách")

    class Config:
        from_attributes = True
        use_enum_values = True
# --- STATS ---
class RevenueByDay(BaseModel):
    date: datetime
    revenue: condecimal(max_digits=14, decimal_places=2)