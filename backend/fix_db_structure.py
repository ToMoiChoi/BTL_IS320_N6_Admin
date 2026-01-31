
import sys
import os
from sqlalchemy import create_engine, text

# Add parent directory to path to import config if needed
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Database URL (assuming default SQLite)
SQLALCHEMY_DATABASE_URL = "sqlite:///./app.db"

def migrate_db():
    print(f"Connecting to {SQLALCHEMY_DATABASE_URL}...")
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    
    with engine.connect() as conn:
        print("Checking for existing columns...")
        # Check if columns already exist to avoid errors
        result = conn.execute(text("PRAGMA table_info(sanpham)"))
        existing_columns = [row[1] for row in result.fetchall()]
        
        new_columns = [
            ("KichThuoc", "VARCHAR(100)"),
            ("Camera", "VARCHAR(255)"),
            ("PhienBan", "VARCHAR(100)"),
            ("Chitset", "VARCHAR(100)"),
            ("Pin", "VARCHAR(100)"),
            ("TheSim", "VARCHAR(100)"),
            ("HeDieuHanh", "VARCHAR(100)"),
        ]
        
        for col_name, col_type in new_columns:
            if col_name not in existing_columns:
                print(f"Adding column '{col_name}' to table 'sanpham'...")
                try:
                    conn.execute(text(f"ALTER TABLE sanpham ADD COLUMN {col_name} {col_type}"))
                except Exception as e:
                    print(f"Error adding {col_name}: {e}")
            else:
                print(f"Column '{col_name}' already exists.")
        
        print("Migration completed!")

if __name__ == "__main__":
    migrate_db()
