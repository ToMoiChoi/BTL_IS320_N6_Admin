import pandas as pd
from sqlalchemy import create_engine
from datetime import datetime

# 1. KẾT NỐI DB
# Connection string tới app.db (Source)
SRC_DB_URL = "sqlite:///./app.db" # Ví dụ SQLite, bạn đổi lại thành PostgreSQL nếu dùng
src_engine = create_engine(SRC_DB_URL)

# # Connection string tới Data Warehouse (Target) 
# # (Ở đây mình demo dùng chung 1 file sqlite khác để dễ hình dung, thực tế nên là 1 DB khác)
# TGT_DB_URL = "sqlite:///./data_warehouse.db" 
# tgt_engine = create_engine(TGT_DB_URL)

def extract_data():
    print("--- [1] EXTRACTING DATA ---")
    
    # Lấy dữ liệu đơn hàng và chi tiết
    query_sales = """
    SELECT 
        ct.MaCTDH, ct.MaDH, ct.MaSP, ct.MaTSKT, ct.SoLuong, ct.DonGia,
        dh.NgayDat, dh.MaTK, dh.TrangThaiDH
    FROM chitietdonhang ct
    JOIN donhang dh ON ct.MaDH = dh.MaDH
    WHERE dh.TrangThaiDH != 'cancelled' 
    """
    df_sales = pd.read_sql(query_sales, src_engine)
    
    # Lấy dữ liệu Sản phẩm & Thông số (để làm Dim_Product)
    query_products = """
    SELECT 
        ts.MaTSKT, sp.TenSP, sp.MaDM,
        ts.MauSac, ts.BoNho, ts.RAM, ts.GiaBan as GiaNiemYet
    FROM thongsokythuat ts
    JOIN sanpham sp ON ts.MaSP = sp.MaSP
    """
    df_products = pd.read_sql(query_products, src_engine)
    
    # Lấy dữ liệu User (để làm Dim_User)
    query_users = "SELECT MaTK, TenDangNhap, Email FROM taikhoan"
    df_users = pd.read_sql(query_users, src_engine)
    
    return df_sales, df_products, df_users

def transform_data(df_sales, df_products, df_users):
    print("--- [2] TRANSFORMING DATA ---")
    
    # 2.1 Xử lý Dim_Product
    # Đổi tên cột cho chuẩn format Data Warehouse
    dim_product = df_products.rename(columns={
        "TenSP": "ProductName", 
        "MauSac": "Color",
        "BoNho": "Storage"
    })
    
    # 2.2 Xử lý Dim_User
    dim_user = df_users.rename(columns={"TenDangNhap": "UserName"})
    
    # 2.3 Xử lý Fact_Sales
    # Merge Sales với Product để lấy tên SP (nếu cần denormalize vào fact) hoặc chỉ giữ Key
    # Ở đây ta giữ nguyên Key để nối với Dim
    
    # Tính toán thêm cột: Doanh Thu = Số Lượng * Đơn Giá
    df_sales['Revenue'] = df_sales['SoLuong'] * df_sales['DonGia']
    
    # Chuyển đổi ngày tháng
    df_sales['NgayDat'] = pd.to_datetime(df_sales['NgayDat'])
    df_sales['DateKey'] = df_sales['NgayDat'].dt.strftime('%Y%m%d').astype(int) # Vd: 20251204
    
    fact_sales = df_sales[[
        'MaCTDH', 'MaDH', 'MaSP', 'MaTSKT', 'MaTK', 'DateKey', 
        'SoLuong', 'DonGia', 'Revenue'
    ]]
    
    return fact_sales, dim_product, dim_user

def load_data(fact_sales, dim_product, dim_user):
    print("--- [3] LOADING DATA ---")
    
    # Lưu vào DB đích (Data Warehouse)
    # if_exists='replace': Xóa bảng cũ tạo lại (Full Load). 
    # Thực tế nên dùng 'append' và xử lý trùng lặp (Incremental Load).
    
    dim_product.to_sql('Dim_Product', tgt_engine, if_exists='replace', index=False)
    dim_user.to_sql('Dim_User', tgt_engine, if_exists='replace', index=False)
    fact_sales.to_sql('Fact_Sales', tgt_engine, if_exists='replace', index=False)
    
    print(">>> ETL COMPLETED SUCCESSFULLY!")

if __name__ == "__main__":
    # Chạy quy trình
    raw_sales, raw_products, raw_users = extract_data()
    fact, d_prod, d_user = transform_data(raw_sales, raw_products, raw_users)
    load_data(fact, d_prod, d_user)