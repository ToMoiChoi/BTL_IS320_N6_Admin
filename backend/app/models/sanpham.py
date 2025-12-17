from sqlmodel import SQLModel, Field, Relationship, Column, Integer, String, ForeignKey, DECIMAL,Text
from typing import Optional, List
from datetime import date


class DanhMuc(SQLModel, table=True):
    __tablename__ = "DanhMuc"

    MaDM: Optional[int] = Field(default=None, primary_key=True)
    TenDM: str = Field(max_length=255)
    Loai: Optional[str] = Field(default=None, max_length=100)
    MoTa: Optional[str] = Field(default=None)
    TrangThai: Optional[str] = Field(default=None, max_length=50)

    san_pham: List["SanPham"] = Relationship(back_populates="danh_muc")


class SanPham(SQLModel, table=True):
    __tablename__ = "SanPham"

    MaSP: Optional[int] = Field(default=None, primary_key=True)
    TenSP: str = Field(max_length=255)
    NgayTao: Optional[date] = None
    MoTa: Optional[str] = Field(default=None, sa_column=Column(Text))
    MaDM: Optional[int] = Field(default=None, foreign_key="DanhMuc.MaDM")
    ThongSo: Optional[List["ThongSoKyThuat"]] = None
    
    danh_muc: Optional[DanhMuc] = Relationship(back_populates="san_pham")


class ThongSoKyThuat(Base):
    __tablename__ = "ThongSoKyThuat"

    MaTSKT = Column(Integer, primary_key=True, index=True)
    MaSP = Column(Integer, ForeignKey("SanPham.MaSP"))
    
    # Các trường mới thêm vào
    KichThuoc: Optional[str]= Column(String(100))
    Camera:Optional[str] = Column(String(255))
    PhienBan:Optional[str] = Column(String(100))
    Chitset:Optional[str] = Column(String(100))
    RAM:Optional[str] = Column(String(50))
    BoNho:Optional[str] = Column(String(50))
    Pin:Optional[str] = Column(String(100))
    TheSim:Optional[str] = Column(String(100))
    HeDieuHanh:Optional[str] = Column(String(100))
    MauSac:Optional[str] = Column(String(50))
    GiaBan:Optional[float] = Column(DECIMAL(12, 2)) # Giá bán riêng cho phiên bản cấu hình này

    # Quan hệ ngược lại với bảng SanPham
    san_pham = Relationship("SanPham", back_populates="thong_so_ky_thuat")
