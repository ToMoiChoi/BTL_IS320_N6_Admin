"""Fix media paths from /uploads/ to /static/"""
import sys
sys.path.insert(0, '.')

from sqlalchemy import text
from app.database import SessionLocal

def fix_paths():
    db = SessionLocal()
    try:
        result = db.execute(text("UPDATE hinhanhvideo SET DuongDanFile = REPLACE(DuongDanFile, '/uploads/', '/static/')"))
        db.commit()
        print(f"✅ Updated media paths to /static/")
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    fix_paths()
