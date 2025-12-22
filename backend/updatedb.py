import sqlite3

def patch_database():
    # Kiểm tra tên file db của bạn là 'app.db' hay 'sql_app.db' trong database.py
    database_file = 'app.db' 
    
    conn = sqlite3.connect(database_file)
    cursor = conn.cursor()
    
    print(f"--- Đang kết nối tới {database_file} ---")
    
    try:
        # Thêm cột SoLuong vào bảng thongsokythuat
        cursor.execute("ALTER TABLE thongsokythuat ADD COLUMN SoLuong INTEGER DEFAULT 0")
        conn.commit()
        print("Thành công: Đã thêm cột 'SoLuong' vào bảng 'thongsokythuat'.")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e):
            print("Thông báo: Cột 'SoLuong' đã tồn tại rồi.")
        else:
            print(f"Lỗi SQL: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    patch_database()