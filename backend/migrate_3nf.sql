-- ============================================================
-- 3NF MIGRATION SCRIPT
-- Run this script to create new lookup tables and migrate data
-- ============================================================

-- 1. Create lookup tables
-- ============================================================

-- PhanQuyen (User Roles)
CREATE TABLE IF NOT EXISTS phanquyen (
    MaPQ INTEGER PRIMARY KEY AUTOINCREMENT,
    TenPQ VARCHAR(100) NOT NULL UNIQUE,
    MoTa TEXT
);

-- Seed data for PhanQuyen
INSERT OR IGNORE INTO phanquyen (MaPQ, TenPQ, MoTa) VALUES 
(1, 'Admin', 'Quản trị viên hệ thống'),
(2, 'User', 'Khách hàng thông thường');

-- MauSac (Colors)
CREATE TABLE IF NOT EXISTS mausac (
    MaMS INTEGER PRIMARY KEY AUTOINCREMENT,
    TenMauSac VARCHAR(100) NOT NULL,
    MaHex VARCHAR(7)
);

-- Seed data for MauSac
INSERT OR IGNORE INTO mausac (MaMS, TenMauSac, MaHex) VALUES 
(1, 'Đen', '#000000'),
(2, 'Trắng', '#FFFFFF'),
(3, 'Xám', '#808080'),
(4, 'Vàng', '#FFD700'),
(5, 'Xanh Dương', '#0000FF'),
(6, 'Xanh Lá', '#00FF00'),
(7, 'Đỏ', '#FF0000'),
(8, 'Hồng', '#FFC0CB'),
(9, 'Tím', '#800080'),
(10, 'Bạc', '#C0C0C0');

-- TrangThaiDonHang (Order Statuses)
CREATE TABLE IF NOT EXISTS trangthai_donhang (
    MaTT INTEGER PRIMARY KEY AUTOINCREMENT,
    TenTrangThai VARCHAR(50) NOT NULL UNIQUE,
    MoTa TEXT,
    ThuTu INTEGER DEFAULT 0
);

-- Seed data for TrangThaiDonHang
INSERT OR IGNORE INTO trangthai_donhang (MaTT, TenTrangThai, MoTa, ThuTu) VALUES 
(1, 'pending', 'Chờ xử lý', 1),
(2, 'processing', 'Đang xử lý', 2),
(3, 'shipping', 'Đang giao hàng', 3),
(4, 'completed', 'Hoàn thành', 4),
(5, 'cancelled', 'Đã hủy', 5),
(6, 'refunded', 'Đã hoàn tiền', 6);

-- LoaiKhuyenMai (Promotion Types)
CREATE TABLE IF NOT EXISTS loai_khuyenmai (
    MaLoai INTEGER PRIMARY KEY AUTOINCREMENT,
    TenLoai VARCHAR(100) NOT NULL UNIQUE,
    MoTa TEXT
);

-- Seed data for LoaiKhuyenMai
INSERT OR IGNORE INTO loai_khuyenmai (MaLoai, TenLoai, MoTa) VALUES 
(1, 'Giảm giá phần trăm', 'Giảm theo % giá trị đơn hàng'),
(2, 'Giảm giá cố định', 'Giảm số tiền cố định'),
(3, 'Miễn phí vận chuyển', 'Free ship'),
(4, 'Tặng quà', 'Tặng kèm sản phẩm');

-- ============================================================
-- 2. Alter existing tables (SQLite không hỗ trợ ALTER COLUMN, 
--    nên bạn cần tạo bảng mới hoặc sử dụng Python để migrate)
-- ============================================================

-- Với SQLite, bạn cần chạy lệnh sau trong Python:
-- Base.metadata.create_all(bind=engine)

-- ============================================================
-- 3. Migrate existing data (chạy sau khi alter tables)
-- ============================================================

-- Migrate DonHang.TrangThaiDH to DonHang.MaTrangThai
-- UPDATE donhang SET MaTrangThai = (
--     SELECT MaTT FROM trangthai_donhang WHERE TenTrangThai = donhang.TrangThaiDH
-- );

-- ============================================================
-- IMPORTANT: After running this script, restart the backend
-- to create new tables with: Base.metadata.create_all(bind=engine)
-- ============================================================
