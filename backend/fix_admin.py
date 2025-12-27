"""Fix admin password with correct hash"""
import sys
sys.path.insert(0, '.')

from app.database import SessionLocal
from app.models import models
from app.utils.security import hash_password

def fix_admin():
    db = SessionLocal()
    try:
        admin = db.query(models.TaiKhoan).filter(models.TaiKhoan.TenDangNhap == "admin").first()
        if admin:
            admin.MatKhauHash = hash_password("admin123")
            db.commit()
            print("✅ Fixed admin password (admin / admin123)")
        else:
            # Create admin if not exists
            admin = models.TaiKhoan(
                TenDangNhap="admin",
                Email="admin@cellphones.vn",
                MatKhauHash=hash_password("admin123"),
                MaPQ=1
            )
            db.add(admin)
            db.commit()
            print("✅ Created admin user (admin / admin123)")
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    fix_admin()
