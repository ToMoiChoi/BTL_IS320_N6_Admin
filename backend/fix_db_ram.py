
import sys
import os
from sqlalchemy import create_engine, text

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

SQLALCHEMY_DATABASE_URL = "sqlite:///./app.db"

def migrate_ram():
    print(f"Connecting to {SQLALCHEMY_DATABASE_URL}...")
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    
    with engine.connect() as conn:
        print("Migrating RAM column...")
        
        # 1. Add RAM to sanpham table
        try:
            conn.execute(text("ALTER TABLE sanpham ADD COLUMN RAM VARCHAR(50)"))
            print("Added RAM to sanpham.")
        except Exception as e:
            print(f"RAM column might already exist in sanpham: {e}")
            
        # 2. (Optional) Copy data from thongsokythuat to sanpham
        # For simplicity in this dev environment, we might skip complex data migration
        # unless strictly needed, but let's try a simple update if possible.
        # This is tricky because one product has multiple specs with potentially different RAMs 
        # (though user said RAM is same). We'll take the MAX ram or first one.
        
        print("Migrating data...")
        try:
             conn.execute(text("""
                UPDATE sanpham 
                SET RAM = (
                    SELECT RAM FROM thongsokythuat 
                    WHERE thongsokythuat.MaSP = sanpham.MaSP 
                    LIMIT 1
                )
                WHERE RAM IS NULL
            """))
             print("Data migrated.")
        except Exception as e:
            print(f"Data migration warning: {e}")

        # 3. Drop RAM from thongsokythuat (SQLite doesn't support DROP COLUMN directly easily in older versions, 
        # but modern sqlite does. If fails, we just ignore it, it doesn't hurt).
        try:
            conn.execute(text("ALTER TABLE thongsokythuat DROP COLUMN RAM"))
            print("Dropped RAM from thongsokythuat.")
        except Exception as e:
             print(f"Could not drop RAM column (ignorable in SQLite): {e}")

        print("Migration completed!")

if __name__ == "__main__":
    migrate_ram()
