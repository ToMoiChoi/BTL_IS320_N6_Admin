import React, { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { API_URL } from "../config";

const Account = ({ isLoggedIn, onLogout }) => {
  const history = useHistory();
  const [userMe, setUserMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    HoTen: "",
    SoDienThoai: "",
    DiaChi: ""
  });
  const [passwordForm, setPasswordForm] = useState({
    old_password: "",
    new_password: "",
  });
  const [updating, setUpdating] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);


  useEffect(() => {
    const fetchUserMe = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        history.push("/login");
        return;
      }

      try {
        const response = await fetch(`${API_URL}/users/me`, {
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

  const openUpdateModal = () => {
    setUpdateForm({
      HoTen: userMe.thongtin?.HoTen || "",
      SoDienThoai: userMe.thongtin?.SoDienThoai || "",
      DiaChi: userMe.thongtin?.DiaChi || ""
    });
    setShowUpdateModal(true);
  };

  const closeUpdateModal = () => {
    setShowUpdateModal(false);
  };

  const openPasswordModal = () => {
    setPasswordForm({
      old_password: "",
      new_password: "",
    });
    setShowPasswordModal(true);
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
  };
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_URL}/users/me`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateForm),
      });

      if (response.ok) {
        const updatedData = await response.json();
        setUserMe(updatedData);
        setShowUpdateModal(false);
        alert("Cập nhật hồ sơ thành công!");
      } else {
        const error = await response.json();
        alert(`Lỗi: ${error.detail || "Không thể cập nhật hồ sơ"}`);
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật:", error);
      alert("Không thể kết nối đến server");
    } finally {
      setUpdating(false);
    }
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.new_password === passwordForm.old_password) {
      alert("Mật khẩu mới không được trùng với mật khẩu cũ!");
      return;
    }
    setChangingPassword(true);

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_URL}/users/me/password`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          old_password: passwordForm.old_password,
          new_password: passwordForm.new_password
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setShowPasswordModal(false);
        alert(result.message || "Đổi mật khẩu thành công!");
      } else {
        const error = await response.json();
        alert(`Lỗi: ${error.detail || "Không thể đổi mật khẩu"}`);
      }
    } catch (error) {
      console.error("Lỗi khi đổi mật khẩu:", error);
      alert("Không thể kết nối đến server");
    } finally {
      setChangingPassword(false);
    }
  };
  if (!userMe) return null;

  // Map dữ liệu từ Model TaiKhoan (Backend)
  const userName = userMe.TenDangNhap || userMe.username || "Người dùng";
  const userEmail = userMe.Email || userMe.email || "Chưa cập nhật email";
  const FullName = userMe.thongtin?.HoTen || "User";
  const address = userMe.thongtin?.DiaChi || "Chưa cập nhật địa chỉ";
  const phoneNumber = userMe.thongtin?.SoDienThoai || "Chưa cập nhật số điện thoại";
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
                  className={`px-4 py-1 rounded-full text-xs font-bold uppercase ${isAdmin
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
                    Tên người dùng
                  </label>
                  <p className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-800 font-medium shadow-inner">
                    {FullName}
                  </p>
                </div>
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
                    Địa chỉ nhận hàng
                  </label>
                  <p className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-800 font-medium shadow-inner">
                    {address}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                    Số điện thoại
                  </label>
                  <p className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-800 font-medium shadow-inner">
                    {phoneNumber}
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
                  <button
                    onClick={openUpdateModal}
                    className="px-6 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition shadow-lg shadow-red-200">
                    Cập nhật hồ sơ
                  </button>
                  <button
                    onClick={openPasswordModal}
                    className="px-6 py-2 border border-gray-300 text-gray-600 font-bold rounded-lg hover:bg-gray-50 transition">
                    Đổi mật khẩu
                  </button>
                </div>
              </div>
            </div>

            {/* Hiển thị thêm thông tin từ bảng ThongTinCaNhan nếu có */}
            {/* {userMe.thongtin && (
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
            )} */}
          </section>
        </div>
      </main>
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
            <button
              onClick={closeUpdateModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>

            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Cập nhật hồ sơ
            </h2>

            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tên người dùng
                </label>
                <input
                  type="text"
                  value={updateForm.HoTen}
                  onChange={(e) => setUpdateForm({ ...updateForm, HoTen: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Nhập tên của bạn"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  value={updateForm.SoDienThoai}
                  onChange={(e) => setUpdateForm({ ...updateForm, SoDienThoai: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Nhập số điện thoại"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Địa chỉ nhận hàng
                </label>
                <textarea
                  value={updateForm.DiaChi}
                  onChange={(e) => setUpdateForm({ ...updateForm, DiaChi: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Nhập địa chỉ"
                  rows="3"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {updating ? "Đang cập nhật..." : "Lưu thay đổi"}
                </button>
                <button
                  type="button"
                  onClick={closeUpdateModal}
                  className="flex-1 border border-gray-300 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-50 transition"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
            <button
              onClick={closePasswordModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>

            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Đổi mật khẩu
            </h2>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mật khẩu hiện tại
                </label>
                <input
                  type="password"
                  value={passwordForm.old_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, old_password: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Nhập mật khẩu hiện tại"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mật khẩu mới
                </label>
                <input
                  type="password"
                  value={passwordForm.new_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Nhập mật khẩu mới"
                  required
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="flex-1 bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {changingPassword ? "Đang xử lý..." : "Đổi mật khẩu"}
                </button>
                <button
                  type="button"
                  onClick={closePasswordModal}
                  className="flex-1 border border-gray-300 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-50 transition"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <Footer isLoggedIn={isLoggedIn} />
    </div>
  );
};

export default Account;
