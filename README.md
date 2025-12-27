# 📱 CellphoneS - Ứng dụng Bán Điện Thoại

> Dự án BTL môn IS320 - Nhóm 6

Ứng dụng web thương mại điện tử bán điện thoại di động với đầy đủ tính năng mua sắm, quản lý giỏ hàng và đơn hàng.

---

## 📁 Cấu trúc Dự án

```
BTL_IS320_N6_Admin/
├── frontend/                    # React Frontend
│   ├── src/
│   │   ├── components/          # React Components (16 files)
│   │   │   ├── Header.js        # Header navigation
│   │   │   ├── Footer.js        # Footer
│   │   │   ├── Home.js          # Trang chủ
│   │   │   ├── Login.js         # Đăng nhập
│   │   │   ├── Register.js      # Đăng ký
│   │   │   ├── Account.js       # Quản lý tài khoản
│   │   │   ├── Cart.js          # Giỏ hàng
│   │   │   ├── Order.js         # Đơn hàng
│   │   │   ├── Bill.js          # Hóa đơn
│   │   │   ├── ProductDetail.js # Chi tiết sản phẩm
│   │   │   ├── ProductList.js   # Danh sách sản phẩm
│   │   │   ├── Card.js          # Card sản phẩm
│   │   │   ├── CategoryProducts.js # Sản phẩm theo danh mục
│   │   │   ├── SearchResults.js # Kết quả tìm kiếm
│   │   │   ├── SortBar.js       # Thanh sắp xếp
│   │   │   └── Breadcrumb.js    # Breadcrumb navigation
│   │   ├── App.js               # Main Application
│   │   ├── index.js             # Entry point
│   │   └── index.css            # Global styles
│   ├── public/
│   ├── package.json
│   ├── webpack.config.js
│   └── tailwind.config.js
│
├── backend/                     # FastAPI Backend
│   ├── app/
│   │   ├── routers/             # API Endpoints
│   │   ├── models/              # Database Models
│   │   ├── schemas/             # Pydantic Schemas
│   │   ├── middlewares/         # Custom Middlewares
│   │   ├── utils/               # Utilities
│   │   └── main.py              # FastAPI App
│   └── uploads/                 # Static files (images)
│
└── README.md
```

---

## 🛠 Công nghệ sử dụng

### Frontend
| Công nghệ | Phiên bản | Mô tả |
|-----------|-----------|-------|
| React | 17.0.2 | UI Library |
| React Router DOM | 5.3.4 | Client-side Routing (HashRouter) |
| TailwindCSS | 3.4.18 | Utility-first CSS Framework |
| Webpack | 5.102.1 | Module Bundler |
| Lucide React | 0.560.0 | Icon Library |
| Babel | 7.28.5 | JavaScript Compiler |

### Backend
| Công nghệ | Mô tả |
|-----------|-------|
| FastAPI | Web Framework |
| SQLAlchemy | ORM (1.4.52) |
| SQLite | Database |
| Uvicorn | ASGI Server |
| Passlib/Bcrypt | Password Hashing |
| Python-Jose | JWT Authentication |

---

## � Frontend Components Chi Tiết

### 🏠 Layout Components

#### `Header.js`
| Tính năng | Mô tả |
|-----------|-------|
| Logo & Branding | Logo "cellphoneS" với link về trang chủ |
| Dropdown Menu | Menu danh mục (iPhone, Samsung) |
| Search Bar | Tìm kiếm sản phẩm với gợi ý real-time (debounce 250ms) |
| Cart Icon | Hiển thị số lượng sản phẩm trong giỏ |
| User Menu | Dropdown menu: Trang cá nhân, Đơn hàng, Đăng xuất |
| Role Badge | Phân biệt "Quản trị viên" (MaPQ=1) và "SMember" |

#### `Footer.js`
- Thông tin liên hệ và bản quyền

---

### 📄 Page Components

#### `Home.js` - Trang chủ (`/`)
| Tính năng | Mô tả |
|-----------|-------|
| Product Grid | Hiển thị lưới sản phẩm (2-4 cột responsive) |
| Sort Options | Sắp xếp theo giá tăng/giảm, tên A-Z |
| Loading State | Spinner khi đang tải dữ liệu |
| Empty State | Thông báo khi không có sản phẩm |
| Floating Button | Nút "Liên hệ tư vấn" cố định góc phải |

**API Calls:**
- `GET /products` - Lấy danh sách sản phẩm
- `GET /products/{id}/thong_so` - Lấy thông số kỹ thuật
- `GET /products/{id}/media` - Lấy hình ảnh sản phẩm

---

#### `Login.js` - Đăng nhập (`/login`)
- Form đăng nhập với TenDangNhap/MatKhau
- Lưu JWT token vào localStorage
- Redirect về trang chủ sau khi đăng nhập

#### `Register.js` - Đăng ký (`/register`)
- Form đăng ký tài khoản mới
- Validation các trường bắt buộc

---

#### `ProductDetail.js` - Chi tiết sản phẩm (`/products/:productId`)
| Tính năng | Mô tả |
|-----------|-------|
| Image Gallery | Hiển thị hình ảnh sản phẩm |
| Specifications | Thông số: RAM, Bộ nhớ, Pin, Màu sắc... |
| Price Display | Giá theo từng phiên bản |
| Add to Cart | Thêm vào giỏ hàng |

---

#### `Cart.js` - Giỏ hàng (`/cart`)
| Tính năng | Mô tả |
|-----------|-------|
| Cart Items | Danh sách sản phẩm với hình ảnh, tên, giá |
| Quantity Control | Tăng/giảm số lượng (+/-) |
| Remove Item | Xóa sản phẩm khỏi giỏ |
| Order Summary | Tổng tiền, phí vận chuyển (miễn phí) |
| User Info | Hiển thị/cập nhật thông tin người nhận |
| Update Modal | Form cập nhật: Họ tên, SĐT, Địa chỉ |
| Checkout | Kiểm tra thông tin → Tạo đơn hàng |

**API Calls:**
- `GET /cart` - Lấy giỏ hàng
- `PATCH /cart/items/{id}` - Cập nhật số lượng
- `DELETE /cart/items/{id}` - Xóa item
- `GET /users/me` - Thông tin user
- `PUT /users/me` - Cập nhật thông tin
- `POST /orders` - Tạo đơn hàng

---

#### `Order.js` - Đơn hàng (`/orders`)
- Danh sách đơn hàng của user
- Trạng thái đơn hàng (pending, confirmed, shipped...)

#### `Bill.js` - Hóa đơn (`/bill/:orderId`)
- Chi tiết hóa đơn sau khi đặt hàng thành công

---

#### `Account.js` - Tài khoản (`/account`)
- Thông tin tài khoản: Email, Username
- Thông tin cá nhân: Họ tên, SĐT, Địa chỉ
- Chỉnh sửa thông tin cá nhân

---

#### `CategoryProducts.js` - Danh mục (`/category/:categoryId`)
- Lọc sản phẩm theo danh mục (0: iPhone, 1: Samsung)

#### `SearchResults.js` - Tìm kiếm (`/search?q=...`)
- Hiển thị kết quả tìm kiếm theo từ khóa

---

### 🧩 UI Components

#### `Card.js`
- Card hiển thị sản phẩm với hình ảnh, tên, giá
- Hover effects và animations

#### `SortBar.js`
- Thanh chọn sắp xếp sản phẩm

#### `Breadcrumb.js`
- Navigation breadcrumb

#### `ProductList.js`
- Component wrapper cho danh sách sản phẩm

---

## 🗃 Database Models

| Model | Mô tả |
|-------|-------|
| `DanhMuc` | Danh mục sản phẩm (MaDM, TenDM, Loai, MoTa, TrangThai) |
| `SanPham` | Sản phẩm (MaSP, TenSP, NgayTao, MoTa, MaDM) |
| `ThongSoKyThuat` | Thông số (KichThuoc, Camera, RAM, BoNho, Pin, MauSac, GiaBan, SoLuong) |
| `HinhAnhVideo` | Media (MaMedia, MaSP, Loai, DuongDanFile) |
| `TaiKhoan` | Tài khoản (TenDangNhap, MatKhauHash, Email, MaPQ) |
| `ThongTinCaNhan` | Thông tin cá nhân (HoTen, SoDienThoai, DiaChi) |
| `GioHang` / `ChiTietGioHang` | Giỏ hàng |
| `DonHang` / `ChiTietDonHang` | Đơn hàng (NgayDat, GiamGia, ThanhTien, TongTien, TrangThaiDH) |
| `ThanhToan` | Thanh toán (PhuongThuc, SoTienTT, TrangThaiTT) |
| `KhuyenMai` | Khuyến mãi (TenKM, LoaiKM, GiaTriGiam, NgayBatDau, NgayKetThuc) |

---

## � API Endpoints

| Router | Endpoints | Chức năng |
|--------|-----------|-----------|
| `/auth` | POST /login, POST /register | Xác thực JWT |
| `/products` | GET, POST, PUT, DELETE /products | CRUD sản phẩm |
| `/products/{id}/thong_so` | GET | Thông số kỹ thuật |
| `/products/{id}/media` | GET | Hình ảnh sản phẩm |
| `/categories` | GET /categories | Danh sách danh mục |
| `/users/me` | GET, PUT | Thông tin user hiện tại |
| `/cart` | GET, POST, PATCH, DELETE | Quản lý giỏ hàng |
| `/orders` | GET, POST | Quản lý đơn hàng |
| `/stats` | GET | Thống kê |

---

## 🚀 Cài đặt & Chạy

### 1. Backend
```bash
cd backend/app
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 2. Frontend
```bash
cd frontend
npm install
npm start
```

### 3. Truy cập
| URL | Mô tả |
|-----|-------|
| http://localhost:3000 | Frontend |
| http://127.0.0.1:8000 | Backend API |
| http://127.0.0.1:8000/docs | Swagger API Docs |
| http://127.0.0.1:8000/redoc | ReDoc API Docs |

---

## 🔐 Authentication Flow

```
1. User đăng nhập → POST /auth/login
2. Server trả về JWT token
3. Frontend lưu token vào localStorage
4. Mỗi request gửi header: Authorization: Bearer {token}
5. Server xác thực token → Trả về dữ liệu user
```

---

## 👥 Nhóm 6 - IS320

Dự án Bài tập lớn môn IS320.

---

## 📄 License

MIT License
