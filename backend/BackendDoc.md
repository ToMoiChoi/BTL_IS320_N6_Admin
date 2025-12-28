# Tài liệu Kỹ thuật Backend - Mini Sales API

## 1. Tổng quan Dự án
Đây là hệ thống Backend phục vụ cho website bán điện thoại (CellphoneS Clone), được xây dựng bằng **FastAPI** (Python). Hệ thống cung cấp các API RESTful để quản lý sản phẩm, đơn hàng, người dùng và tích hợp AI Chatbot.

## 2. Công nghệ Cốt lõi
*   **Framework:** FastAPI (Hiệu năng cao, asynchrounous).
*   **Database ORM:** SQLAlchemy (Tương tác với SQLite).
*   **Validation:** Pydantic (Kiểm tra dữ liệu đầu vào/ra).
*   **Security:** Passlib (Hashing), Python-Jose (JWT).
*   **AI:** Google Generative AI (Gemini).

## 3. Kiến trúc Bảo mật & Middleware (Trọng tâm)
Hệ thống áp dụng mô hình bảo mật nhiều lớp (**Defense in Depth**).

### 3.1. Middleware (Lớp Mạng)
Middleware chạy trước khi request vào Router.
*   **`CORSMiddleware`** (`app/main.py`):
    *   **Chức năng:** Kiểm soát Cross-Origin Resource Sharing.
    *   **Cấu hình:** Chỉ cho phép `localhost:3000` (Frontend) truy cập.
    *   **Mục đích:** Chống lại các trang web độc hại gọi API trộm.
*   **`RequestLoggerMiddleware`** (`app/middlewares/request_logger.py`):
    *   **Chức năng:** Ghi lại mọi request (Method, Path, Time).
    *   **Mục đích:** Giám sát hệ thống, phát hiện tấn công (Brute force, Spam).

### 3.2. Authentication (Xác thực)
*   **Stateless:** Không lưu session trên server, sử dụng **JWT (JSON Web Token)**.
*   **Flow:**
    1.  User gửi `username` + `password`.
    2.  Server kiểm tra DB.
    3.  Nếu đúng => Server ký JWT (chứa `user_id`, `exp`) bằng `SECRET_KEY`.
    4.  Client lưu JWT và gửi kèm header `Authorization: Bearer <token>` trong các request sau.

### 3.3. Password Security (Bảo mật Mật khẩu)
*   **Thư viện:** `passlib` + `bcrypt`.
*   **Thuật toán:** `pbkdf2_sha256`.
    *   **Lý do chọn:** Khắc phục hạn chế độ dài 72 bytes của Bcrypt truyền thống, chống tấn công Rainbow Table nhờ Salt tự động.
    *   **Cấu hình:** `deprecated="auto"` (Cho phép nâng cấp thuật toán trong tương lai mà không làm lỗi user cũ).

### 3.4. Dependency Injection (Kiểm soát Truy cập)
*   **File:** `app/deps.py`.
*   **Hàm:** `get_current_user`.
    *   Đứng trước các Router được bảo vệ (ví dụ: Tạo đơn hàng, Admin).
    *   Tự động giải mã token, kiểm tra hạn sử dụng, và truy vấn user từ DB.
    *   Nếu token không hợp lệ => Trả lỗi **401 Unauthorized** ngay lập tức.

## 4. Cấu trúc Database (Chuẩn hóa 3NF)
Cơ sở dữ liệu đã được chuẩn hóa để đảm bảo tính toàn vẹn dữ liệu.

*   **Bảng chính:** `SanPham`, `DonHang`, `TaiKhoan`.
*   **Bảng tra cứu (Lookup):**
    *   `PhanQuyen`: Admin (1), User (2).
    *   `TrangThaiDonHang`: Pending (1), Shipping (3), ...
    *   `MauSac`: Bảng màu chuẩn.
    *   `LoaiKhuyenMai`.
*   **Lợi ích:** Tránh dư thừa dữ liệu (Data Redundancy) và dị thường khi cập nhật (Update Anomaly).

## 5. Danh sách API Chính
| Method | Endpoint | Mô tả | Auth |
| :--- | :--- | :--- | :--- |
| POST | `/auth/login` | Đăng nhập lấy Token | No |
| POST | `/auth/register` | Đăng ký tài khoản mới | No |
| GET | `/products` | Lấy danh sách sản phẩm | No |
| POST | `/products` | Thêm sản phẩm mới | **Admin** |
| POST | `/orders` | Tạo đơn hàng mới | **User** |
| GET | `/orders` | Xem lịch sử đơn hàng | **User** |
| POST | `/ai/chat` | Chat với trợ lý ảo Gemini | No |

## 6. Hướng dẫn Chạy Backend
1.  **Cài đặt môi trường:**
    ```bash
    python -m venv .venv
    .venv\Scripts\activate
    pip install -r requirements.txt
    ```
2.  **Cấu hình:**
    *   Tạo file `.env` chứa `SECRET_KEY` và `GEMINI_API_KEY`.
3.  **Khởi chạy:**
    ```bash
    python -m uvicorn app.main:app --reload
    ```
4.  **Seed dữ liệu mẫu (nếu cần):**
    ```bash
    python seed_3nf.py
    python seed_sample_data.py
    ```
