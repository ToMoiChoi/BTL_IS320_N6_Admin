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
class CategoryBase(BaseModel):
    TenDM: str
    Loai: Optional[str] = None
    MoTa: Optional[str] = None
    Icon: Optional[str] = None
    TrangThai: Optional[bool] = True

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    TenDM: Optional[str] = None
    Loai: Optional[str] = None
    MoTa: Optional[str] = None
    Icon: Optional[str] = None
    TrangThai: Optional[bool] = None

class CategoryOut(CategoryBase):
    MaDM: int
    SoLuongSP: Optional[int] = 0  # Số sản phẩm trong danh mục
    
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
    SoLuong: int = 0

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
    TrangThaiDH: OrderStatus = Field(..., description="Chọn trạng thái đơn hàng")

    class Config:
        from_attributes = True
        use_enum_values = True

# --- STATS ---
class RevenueByDay(BaseModel):
    date: datetime
    revenue: condecimal(max_digits=14, decimal_places=2)

# --- RECOMMENDATIONS ---
class RecommendationItem(BaseModel):
    """Thông tin sản phẩm gợi ý (lightweight)."""
    MaSP: int
    TenSP: str
    GiaThapNhat: Optional[float] = None
    AnhDaiDien: Optional[str] = None
    TongTonKho: int = 0

    class Config:
        from_attributes = True

class RecommendationsResponse(BaseModel):
    """Response cho API gợi ý sản phẩm."""
    source_product_id: int
    source_category_id: Optional[int] = None
    recommendations: List[RecommendationItem] = []
    total_count: int = 0
    latency_ms: float = 0.0

    class Config:
        from_attributes = True

# --- AI CHAT ---
class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str
    source: str
    confidence: float
    
    class Config:
        from_attributes = True