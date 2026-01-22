"""
Fix database: Add Icon column to danhmuc table
Run: python fix_danhmuc.py
"""
import sqlite3

conn = sqlite3.connect('app.db')
c = conn.cursor()

print("Fixing danhmuc table...")

# 1. Check current columns
c.execute("PRAGMA table_info(danhmuc)")
columns = [col[1] for col in c.fetchall()]
print(f"Current columns: {columns}")

# 2. Add Icon column if missing
if 'Icon' not in columns:
    c.execute('ALTER TABLE danhmuc ADD COLUMN Icon VARCHAR(100)')
    print("✅ Added Icon column")
else:
    print("Icon column already exists")

# 3. Update icons
updates = [
    ("📱", "Điện thoại"),
    ("💻", "Máy tính bảng"),
    ("🎧", "Phụ kiện"),
]
for icon, name in updates:
    c.execute("UPDATE danhmuc SET Icon = ? WHERE TenDM = ?", (icon, name))

conn.commit()

# 4. Show result
print("\nResult:")
c.execute("SELECT MaDM, TenDM, Icon FROM danhmuc")
for r in c.fetchall():
    print(f"  [{r[0]}] {r[2] or '?'} {r[1]}")

conn.close()
print("\n✅ Done! Restart uvicorn server.")
