"""
Script cập nhật sản phẩm vào đúng danh mục
Chạy: python update_product_categories.py
"""
import sqlite3

def main():
    conn = sqlite3.connect('app.db')
    c = conn.cursor()
    
    # Get all products
    c.execute('SELECT MaSP, TenSP FROM sanpham')
    products = c.fetchall()
    
    print('📦 Updating products to correct categories...\n')
    
    updated_count = {1: 0, 2: 0, 3: 0}
    
    for ma_sp, ten_sp in products:
        ten_lower = (ten_sp or '').lower()
        
        # iPhone, Samsung, Xiaomi -> Category 1 (Điện thoại)
        if any(brand in ten_lower for brand in ['iphone', 'samsung', 'galaxy', 'xiaomi', 'redmi', 'oppo', 'vivo', 'realme', 'huawei', 'oneplus', 'poco']):
            new_dm = 1
        # iPad, tablet -> Category 2 (Máy tính bảng)
        elif any(word in ten_lower for word in ['ipad', 'tab', 'tablet', 'máy tính bảng']):
            new_dm = 2
        # Phụ kiện
        elif any(word in ten_lower for word in ['case', 'ốp', 'sạc', 'cáp', 'tai nghe', 'airpod', 'watch', 'đồng hồ', 'phụ kiện']):
            new_dm = 3
        else:
            new_dm = 1  # Default to phones
        
        c.execute('UPDATE sanpham SET MaDM = ? WHERE MaSP = ?', (new_dm, ma_sp))
        updated_count[new_dm] += 1
        print(f'  [{ma_sp}] {ten_sp[:40]:<40} -> Category {new_dm}')
    
    conn.commit()
    conn.close()
    
    print(f'\n✅ Done!')
    print(f'   - Điện thoại: {updated_count[1]} sản phẩm')
    print(f'   - Máy tính bảng: {updated_count[2]} sản phẩm')
    print(f'   - Phụ kiện: {updated_count[3]} sản phẩm')

if __name__ == '__main__':
    main()
