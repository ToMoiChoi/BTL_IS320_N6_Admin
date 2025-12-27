"""
Script to seed 3NF lookup tables with initial data
Run this after starting the backend to populate lookup tables
"""
import sys
sys.path.insert(0, '.')

from app.database import SessionLocal, engine, Base
from app.models import models

def seed_data():
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Seed PhanQuyen (User Roles)
        if db.query(models.PhanQuyen).count() == 0:
            roles = [
                models.PhanQuyen(MaPQ=1, TenPQ="Admin", MoTa="Quản trị viên hệ thống"),
                models.PhanQuyen(MaPQ=2, TenPQ="User", MoTa="Khách hàng thông thường"),
            ]
            db.add_all(roles)
            print("✅ Seeded PhanQuyen")

        # Seed MauSac (Colors)
        if db.query(models.MauSac).count() == 0:
            colors = [
                models.MauSac(TenMauSac="Đen", MaHex="#000000"),
                models.MauSac(TenMauSac="Trắng", MaHex="#FFFFFF"),
                models.MauSac(TenMauSac="Xám", MaHex="#808080"),
                models.MauSac(TenMauSac="Vàng", MaHex="#FFD700"),
                models.MauSac(TenMauSac="Xanh Dương", MaHex="#0000FF"),
                models.MauSac(TenMauSac="Đỏ", MaHex="#FF0000"),
                models.MauSac(TenMauSac="Hồng", MaHex="#FFC0CB"),
                models.MauSac(TenMauSac="Tím", MaHex="#800080"),
                models.MauSac(TenMauSac="Bạc", MaHex="#C0C0C0"),
            ]
            db.add_all(colors)
            print("✅ Seeded MauSac")

        # Seed TrangThaiDonHang (Order Statuses)
        if db.query(models.TrangThaiDonHang).count() == 0:
            statuses = [
                models.TrangThaiDonHang(MaTT=1, TenTrangThai="pending", MoTa="Chờ xử lý", ThuTu=1),
                models.TrangThaiDonHang(MaTT=2, TenTrangThai="processing", MoTa="Đang xử lý", ThuTu=2),
                models.TrangThaiDonHang(MaTT=3, TenTrangThai="shipping", MoTa="Đang giao hàng", ThuTu=3),
                models.TrangThaiDonHang(MaTT=4, TenTrangThai="completed", MoTa="Hoàn thành", ThuTu=4),
                models.TrangThaiDonHang(MaTT=5, TenTrangThai="cancelled", MoTa="Đã hủy", ThuTu=5),
            ]
            db.add_all(statuses)
            print("✅ Seeded TrangThaiDonHang")

        # Seed LoaiKhuyenMai (Promotion Types)
        if db.query(models.LoaiKhuyenMai).count() == 0:
            promo_types = [
                models.LoaiKhuyenMai(TenLoai="Giảm giá phần trăm", MoTa="Giảm theo % giá trị đơn hàng"),
                models.LoaiKhuyenMai(TenLoai="Giảm giá cố định", MoTa="Giảm số tiền cố định"),
                models.LoaiKhuyenMai(TenLoai="Miễn phí vận chuyển", MoTa="Free ship"),
            ]
            db.add_all(promo_types)
            print("✅ Seeded LoaiKhuyenMai")

        db.commit()
        print("\n🎉 All 3NF lookup tables seeded successfully!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
