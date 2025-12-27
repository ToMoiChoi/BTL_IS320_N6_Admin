# app/models.py
from sqlalchemy import (
    Column, Integer, String, Numeric, Text, ForeignKey, TIMESTAMP, Boolean, DateTime
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base

# DanhMuc
class DanhMuc(Base):
    __tablename__ = "danhmuc"
    MaDM = Column(Integer, primary_key=True, index=True)
    TenDM = Column(String(255), nullable=False)
    Loai = Column(String(100))
    MoTa = Column(Text)
    TrangThai = Column(Boolean, default=True)

    sanphams = relationship("SanPham", back_populates="danhmuc")

# SanPham
class SanPham(Base):
    __tablename__ = "sanpham"
    MaSP = Column(Integer, primary_key=True, index=True)
    TenSP = Column(String(255), nullable=False)
    NgayTao = Column(DateTime(timezone=True), server_default=func.now())
    MoTa = Column(Text)
    MaDM = Column(Integer, ForeignKey("danhmuc.MaDM", ondelete="SET NULL"), nullable=True)
    
    danhmuc = relationship("DanhMuc", back_populates="sanphams")
    media = relationship("HinhAnhVideo", back_populates="sanpham", cascade="all, delete-orphan")
    thongso_list = relationship("ThongSoKyThuat", back_populates="sanpham", cascade="all, delete-orphan")

class ThongSoKyThuat(Base):
    __tablename__ = "thongsokythuat"
    
    MaTSKT = Column(Integer, primary_key=True, index=True)
    MaSP = Column(Integer, ForeignKey("sanpham.MaSP"))
    
    KichThuoc = Column(String(100))
    Camera = Column(String(255))
    PhienBan = Column(String(100))
    Chitset = Column(String(100))
    RAM = Column(String(50))
    BoNho = Column(String(50))
    Pin = Column(String(100))
    TheSim = Column(String(100))
    HeDieuHanh = Column(String(100))
    MauSac = Column(String(50))
    
    GiaBan = Column(Numeric(12, 2)) # Giá riêng cho phiên bản này
    SoLuong = Column(Integer, default=0)

    sanpham = relationship("SanPham", back_populates="thongso_list")

# Media
class HinhAnhVideo(Base):
    __tablename__ = "hinhanhvideo"
    MaMedia = Column(Integer, primary_key=True)
    MaSP = Column(Integer, ForeignKey("sanpham.MaSP", ondelete="CASCADE"))
    Loai = Column(String(50))
    DuongDanFile = Column(Text)

    sanpham = relationship("SanPham", back_populates="media")

# TaiKhoan (users)
class TaiKhoan(Base):
    __tablename__ = "taikhoan"
    MaTK = Column(Integer, primary_key=True, index=True)
    TenDangNhap = Column(String(150), unique=True, index=True, nullable=False)
    MatKhauHash = Column(String(255), nullable=False)
    Email = Column(String(255), unique=True, index=True, nullable=False)
    MaPQ = Column(Integer, default=2, nullable=False)  # 1=admin, 2=user
    CreatedAt = Column(DateTime(timezone=True), server_default=func.now())

    thongtin = relationship("ThongTinCaNhan", back_populates="taikhoan", uselist=False)
    donhangs = relationship("DonHang", back_populates="taikhoan")

# ThongTinCaNhan (customer info)
class ThongTinCaNhan(Base):
    __tablename__ = "thongtincanhan"
    MaKH = Column(Integer, primary_key=True)
    HoTen = Column(String(255))
    SoDienThoai = Column(String(50))
    DiaChi = Column(Text)
    NgayTao = Column(DateTime(timezone=True), server_default=func.now())
    MaTK = Column(Integer, ForeignKey("taikhoan.MaTK"))

    taikhoan = relationship("TaiKhoan", back_populates="thongtin")

# GioHang + ChiTietGioHang
class GioHang(Base):
    __tablename__ = "giohang"
    MAGH = Column(Integer, primary_key=True)
    MaTK = Column(Integer, ForeignKey("taikhoan.MaTK"))
    CreatedAt = Column(DateTime(timezone=True), server_default=func.now())

    items = relationship("ChiTietGioHang", back_populates="giohang", cascade="all, delete-orphan")

class ChiTietGioHang(Base):
    __tablename__ = "chitietgiohang"
    MaCTGH = Column(Integer, primary_key=True)
    MaSP = Column(Integer, ForeignKey("sanpham.MaSP"))
    MAGH = Column(Integer, ForeignKey("giohang.MAGH"))
    
    MaTSKT = Column(Integer, ForeignKey("thongsokythuat.MaTSKT"), nullable=True)
    
    SoLuongSanPham = Column(Integer, nullable=False, default=1)

    giohang = relationship("GioHang", back_populates="items")
    sanpham = relationship("SanPham")  # Thêm dòng này
    tskt = relationship("ThongSoKyThuat")  # Thêm dòng này

# DonHang + ChiTietDonHang
class DonHang(Base):
    __tablename__ = "donhang"
    MaDH = Column(Integer, primary_key=True)
    MaTK = Column(Integer, ForeignKey("taikhoan.MaTK"))
    NgayDat = Column(DateTime(timezone=True), server_default=func.now())
    GiamGia = Column(Numeric(12,2), default=0)
    ThanhTien = Column(Numeric(14,2), nullable=False)
    TongTien = Column(Numeric(14,2), nullable=False)
    TrangThaiDH = Column(String(50), default="pending")

    taikhoan = relationship("TaiKhoan", back_populates="donhangs")
    chitiets = relationship("ChiTietDonHang", back_populates="donhang", cascade="all, delete-orphan")

class ChiTietDonHang(Base):
    __tablename__ = "chitietdonhang"
    MaCTDH = Column(Integer, primary_key=True)
    MaSP = Column(Integer, ForeignKey("sanpham.MaSP"))
    MaDH = Column(Integer, ForeignKey("donhang.MaDH"))
    MaTSKT = Column(Integer, ForeignKey("thongsokythuat.MaTSKT"), nullable=True)
    SoLuong = Column(Integer, nullable=False, default=1)
    DonGia = Column(Numeric(12,2), nullable=False) 
    
    donhang = relationship("DonHang", back_populates="chitiets")
    

# ThanhToan
class ThanhToan(Base):
    __tablename__ = "thanhtoan"
    MaTT = Column(Integer, primary_key=True)
    MaDH = Column(Integer, ForeignKey("donhang.MaDH"))
    PhuongThuc = Column(String(100))
    SoTienTT = Column(Numeric(14,2))
    TrangThaiTT = Column(String(50))
    NgayTT = Column(DateTime(timezone=True), server_default=func.now())

# KhuyenMai
class KhuyenMai(Base):
    __tablename__ = "khuyenmai"
    MaKM = Column(Integer, primary_key=True)
    TenKM = Column(String(255))
    LoaiKM = Column(String(100))
    MaGiamGia = Column(Numeric(12,2))
    GiaTriGiam = Column(Numeric(12,2))
    NgayBatDau = Column(DateTime(timezone=True))
    NgayKetThuc = Column(DateTime(timezone=True))

class ApDungKhuyenMai(Base):
    __tablename__ = "apdungkhuyenmai"
    MaADKM = Column(Integer, primary_key=True)
    MaDH = Column(Integer, ForeignKey("donhang.MaDH"))
    MaKM = Column(Integer, ForeignKey("khuyenmai.MaKM"))
    GiaTriGiamThucTe = Column(Numeric(12,2))
    NgayApDung = Column(DateTime(timezone=True), server_default=func.now())

# Request log
class RequestLog(Base):
    __tablename__ = "requestlog"
    id = Column(Integer, primary_key=True)
    path = Column(Text)
    method = Column(String(10))
    status_code = Column(Integer)
    duration_ms = Column(Numeric(10,2))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user_id = Column(Integer, nullable=True)