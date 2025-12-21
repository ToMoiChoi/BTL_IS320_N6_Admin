import React, { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

const Account = ({ isLoggedIn, onLogout }) => {
  const history = useHistory();
  const [userMe, setUserMe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserMe = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        history.push("/login");
        return;
      }

      try {
        const response = await fetch("http://127.0.0.1:8000/users/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`, // Gửi JWT chuẩn xác thực
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUserMe(data);
        } else {
          // Xóa token nếu không hợp lệ hoặc hết hạn
          localStorage.removeItem("token");
          history.push("/login");
        }
      } catch (error) {
        console.error("Lỗi khi kết nối Backend:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserMe();
  }, [history]);

  const handleLogout = () => {
    if (onLogout) onLogout();
    history.push("/");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!userMe) return null;

  // Map dữ liệu từ Model TaiKhoan (Backend)
  const userName = userMe.TenDangNhap || userMe.username || "Người dùng";
  const userEmail = userMe.Email || userMe.email || "Chưa cập nhật email";
  const isAdmin = userMe.MaPQ === 1; // Kiểm tra quyền từ model TaiKhoan

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-grow container mx-auto px-4 py-8 lg:py-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Hồ sơ khách hàng
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="md:col-span-1">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <nav className="flex flex-col space-y-1">
                <Link
                  to="/account"
                  className="px-4 py-3 bg-red-50 text-red-600 font-bold rounded-lg transition"
                >
                  👤 Thông tin tài khoản
                </Link>
                <Link
                  to="/orders"
                  className="px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition"
                >
                  📦 Đơn hàng của tôi
                </Link>

                {/* HIỂN THỊ MENU QUẢN TRỊ NẾU LÀ ADMIN (MaPQ == 1) */}
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="px-4 py-3 text-blue-600 hover:bg-blue-50 rounded-lg font-bold border-t border-gray-100 mt-2"
                  >
                    🛡️ Quản trị hệ thống
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-red-500 hover:bg-red-50 rounded-lg transition mt-4"
                >
                  🚪 Đăng xuất
                </button>
              </nav>
            </div>
          </aside>

          {/* Nội dung chính */}
          <section className="md:col-span-3">
            <div className="bg-white p-6 lg:p-8 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Thông tin cá nhân
                </h2>
                <span
                  className={`px-4 py-1 rounded-full text-xs font-bold uppercase ${
                    isAdmin
                      ? "bg-purple-100 text-purple-700 border border-purple-200"
                      : "bg-blue-100 text-blue-700 border border-blue-200"
                  }`}
                >
                  {isAdmin ? "Quản trị viên" : "Khách hàng Member"}
                </span>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                    Tên đăng nhập
                  </label>
                  <p className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-800 font-medium shadow-inner">
                    {userName}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                    Địa chỉ Email đăng ký
                  </label>
                  <p className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-800 font-medium shadow-inner">
                    {userEmail}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                    Ngày tham gia hệ thống
                  </label>
                  <p className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-800 font-medium shadow-inner italic">
                    {userMe.CreatedAt
                      ? new Date(userMe.CreatedAt).toLocaleDateString("vi-VN")
                      : "Đang cập nhật..."}
                  </p>
                </div>

                <div className="pt-6 border-t border-gray-50 flex gap-4">
                  <button className="px-6 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition shadow-lg shadow-red-200">
                    Cập nhật hồ sơ
                  </button>
                  <button className="px-6 py-2 border border-gray-300 text-gray-600 font-bold rounded-lg hover:bg-gray-50 transition">
                    Đổi mật khẩu
                  </button>
                </div>
              </div>
            </div>

            {/* Hiển thị thêm thông tin từ bảng ThongTinCaNhan nếu có */}
            {userMe.thongtin && (
              <div className="mt-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-4">
                  📍 Địa chỉ nhận hàng mặc định
                </h3>
                <p className="text-gray-600 text-sm">
                  {userMe.thongtin.DiaChi || "Chưa thiết lập địa chỉ"}
                </p>
                <p className="text-gray-600 text-sm mt-1">
                  SĐT: {userMe.thongtin.SoDienThoai || "Chưa cập nhật"}
                </p>
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer isLoggedIn={isLoggedIn} />
    </div>
  );
};

export default Account;
