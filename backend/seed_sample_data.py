"""
Script to seed sample products, categories and admin user
"""
import sys
sys.path.insert(0, '.')

from app.database import SessionLocal, engine, Base
from app.models import models
import bcrypt

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def seed_sample_data():
    db = SessionLocal()
    try:
        # Create Admin user
        if db.query(models.TaiKhoan).filter(models.TaiKhoan.TenDangNhap == "admin").first() is None:
            admin = models.TaiKhoan(
                TenDangNhap="admin",
                Email="admin@cellphones.vn",
                MatKhauHash=hash_password("admin123"),
                MaPQ=1  # Admin role
            )
            db.add(admin)
            db.commit()
            print("✅ Created Admin user (admin / admin123)")
            db.add(admin)
            db.commit()
            print("✅ Created Admin user (admin / admin123)")

        # Create Categories
        if db.query(models.DanhMuc).count() == 0:
            categories = [
                models.DanhMuc(TenDM="Điện thoại", Loai="phone", MoTa="Điện thoại di động"),
                models.DanhMuc(TenDM="Máy tính bảng", Loai="tablet", MoTa="Tablet"),
                models.DanhMuc(TenDM="Phụ kiện", Loai="accessory", MoTa="Phụ kiện điện thoại"),
            ]
            db.add_all(categories)
            db.commit()
            print("✅ Created Categories")

        # Create Sample Products
        if db.query(models.SanPham).count() == 0:
            phone_cat = db.query(models.DanhMuc).filter(models.DanhMuc.Loai == "phone").first()
            
            products = [
                # iPhone
                models.SanPham(TenSP="iPhone 16 Pro Max", MoTa="Điện thoại cao cấp Apple", MaDM=phone_cat.MaDM if phone_cat else None),
                models.SanPham(TenSP="iPhone 16 Pro", MoTa="Điện thoại cao cấp Apple", MaDM=phone_cat.MaDM if phone_cat else None),
                models.SanPham(TenSP="iPhone 16", MoTa="Điện thoại Apple", MaDM=phone_cat.MaDM if phone_cat else None),
                models.SanPham(TenSP="iPhone 15 Pro Max", MoTa="Điện thoại cao cấp Apple", MaDM=phone_cat.MaDM if phone_cat else None),
                # Samsung
                models.SanPham(TenSP="Samsung Galaxy S24 Ultra", MoTa="Điện thoại cao cấp Samsung", MaDM=phone_cat.MaDM if phone_cat else None),
                models.SanPham(TenSP="Samsung Galaxy S24+", MoTa="Điện thoại Samsung", MaDM=phone_cat.MaDM if phone_cat else None),
                models.SanPham(TenSP="Samsung Galaxy Z Fold 6", MoTa="Điện thoại gập Samsung", MaDM=phone_cat.MaDM if phone_cat else None),
                # Xiaomi
                models.SanPham(TenSP="Xiaomi 14 Ultra", MoTa="Điện thoại cao cấp Xiaomi", MaDM=phone_cat.MaDM if phone_cat else None),
                models.SanPham(TenSP="Redmi Note 13 Pro", MoTa="Điện thoại tầm trung Xiaomi", MaDM=phone_cat.MaDM if phone_cat else None),
                # OPPO
                models.SanPham(TenSP="OPPO Find X7 Ultra", MoTa="Điện thoại cao cấp OPPO", MaDM=phone_cat.MaDM if phone_cat else None),
                models.SanPham(TenSP="OPPO Reno 12 Pro", MoTa="Điện thoại OPPO", MaDM=phone_cat.MaDM if phone_cat else None),
            ]
            db.add_all(products)
            db.commit()
            print("✅ Created Sample Products")

            # Add specs for each product
            products = db.query(models.SanPham).all()
            specs_data = [
                # iPhone 16 Pro Max
                {"RAM": "8GB", "BoNho": "256GB", "MauSac": "Titan Đen", "GiaBan": 34990000, "SoLuong": 50},
                {"RAM": "8GB", "BoNho": "512GB", "MauSac": "Titan Tự nhiên", "GiaBan": 40990000, "SoLuong": 30},
                # iPhone 16 Pro
                {"RAM": "8GB", "BoNho": "256GB", "MauSac": "Titan Đen", "GiaBan": 28990000, "SoLuong": 40},
                # iPhone 16
                {"RAM": "8GB", "BoNho": "128GB", "MauSac": "Đen", "GiaBan": 22990000, "SoLuong": 60},
                # iPhone 15 Pro Max
                {"RAM": "8GB", "BoNho": "256GB", "MauSac": "Titan Xanh", "GiaBan": 29990000, "SoLuong": 35},
                # Samsung S24 Ultra
                {"RAM": "12GB", "BoNho": "256GB", "MauSac": "Xám", "GiaBan": 33990000, "SoLuong": 45},
                {"RAM": "12GB", "BoNho": "512GB", "MauSac": "Tím", "GiaBan": 37990000, "SoLuong": 25},
                # Samsung S24+
                {"RAM": "12GB", "BoNho": "256GB", "MauSac": "Đen", "GiaBan": 25990000, "SoLuong": 40},
                # Samsung Z Fold 6
                {"RAM": "12GB", "BoNho": "512GB", "MauSac": "Xanh Navy", "GiaBan": 45990000, "SoLuong": 15},
                # Xiaomi 14 Ultra
                {"RAM": "16GB", "BoNho": "512GB", "MauSac": "Đen", "GiaBan": 23990000, "SoLuong": 30},
                # Redmi Note 13 Pro
                {"RAM": "8GB", "BoNho": "256GB", "MauSac": "Xanh", "GiaBan": 7990000, "SoLuong": 100},
                # OPPO Find X7 Ultra
                {"RAM": "16GB", "BoNho": "512GB", "MauSac": "Đen", "GiaBan": 24990000, "SoLuong": 20},
                # OPPO Reno 12 Pro
                {"RAM": "12GB", "BoNho": "256GB", "MauSac": "Bạc", "GiaBan": 12990000, "SoLuong": 55},
            ]
            
            spec_idx = 0
            for product in products:
                if spec_idx < len(specs_data):
                    spec = models.ThongSoKyThuat(
                        MaSP=product.MaSP,
                        RAM=specs_data[spec_idx]["RAM"],
                        BoNho=specs_data[spec_idx]["BoNho"],
                        MauSac=specs_data[spec_idx]["MauSac"],
                        GiaBan=specs_data[spec_idx]["GiaBan"],
                        SoLuong=specs_data[spec_idx]["SoLuong"],
                        KichThuoc="6.7 inch",
                        Camera="48MP + 12MP",
                        HeDieuHanh="iOS" if "iPhone" in product.TenSP else "Android",
                    )
                    db.add(spec)
                    spec_idx += 1
            
            db.commit()
            print("✅ Created Product Specs")

        print("\n🎉 Sample data seeded successfully!")
        print("📱 Admin login: admin / admin123")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_sample_data()
