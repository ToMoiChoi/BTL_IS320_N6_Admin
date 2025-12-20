import React, { useState, useEffect, useRef } from "react";
import { Link, useHistory } from "react-router-dom";

// Thêm prop cartCount để hiển thị số lượng sản phẩm thực tế
const Header = ({ isLoggedIn, userInfo, onLogout, cartCount = 0 }) => {
  const history = useHistory();

  // 1. Phân loại màu sắc theo MaPQ (Quyền hạn) từ Backend
  const memberColor = userInfo?.MaPQ === 1 ? "bg-yellow-500" : "bg-white/20";

  // 2. Tên hiển thị ưu tiên TenDangNhap từ Model TaiKhoan
  const displayName = userInfo?.TenDangNhap || userInfo?.username || "User";

  // Dropdown danh mục
  const [categories, setCategories] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch(() => setCategories([]));
  }, []);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <header className="bg-gradient-to-r from-red-600 to-red-500 text-white sticky top-0 z-50 shadow-lg font-sans">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-4 relative" ref={dropdownRef}>
            <Link
              to="/"
              className="text-2xl font-extrabold cursor-pointer tracking-tighter italic"
            >
              cellphone
              <span className="text-white font-normal not-italic">S</span>
            </Link>

            <button
              className="hidden lg:flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg hover:bg-white/30 transition border border-white/10 relative"
              onClick={() => setShowDropdown((v) => !v)}
            >
              <span className="text-sm font-medium">☰ Danh mục</span>
            </button>
            {/* Dropdown danh mục */}
            {showDropdown && (
              <div className="absolute left-0 top-full mt-2 w-56 bg-white text-gray-800 rounded-xl shadow-xl z-50 border border-gray-100 animate-in fade-in slide-in-from-top-2">
                <div className="py-2">
                  {categories.length === 0 && (
                    <div className="px-4 py-2 text-sm text-gray-400">Không có danh mục</div>
                  )}
                  {categories.map((cat) => (
                    <Link
                      key={cat.MaDM}
                      to={`/category/${cat.MaDM}`}
                      className="block px-4 py-2 text-sm hover:bg-red-50 rounded-lg transition"
                      onClick={() => setShowDropdown(false)}
                    >
                      {cat.TenDM}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Thanh tìm kiếm */}
          <div className="flex-1 max-w-xl">
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors">
                🔍
              </span>
              <input
                type="text"
                placeholder="Bạn muốn mua gì hôm nay?"
                className="w-full pl-12 pr-4 py-2.5 rounded-xl text-gray-800 focus:outline-none focus:ring-4 focus:ring-red-300 transition-all border-none shadow-inner"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 lg:gap-6">
            {/* Giỏ hàng với số lượng thực tế */}
            <button
              className="flex items-center gap-2 hover:bg-white/10 p-2 rounded-xl transition cursor-pointer"
              onClick={() => history.push("/cart")}
            >
              <div className="relative">
                <span className="text-2xl">🛒</span>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-yellow-400 text-red-700 text-[10px] font-bold px-1.5 rounded-full border-2 border-red-600">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="hidden lg:block text-xs font-bold leading-tight">
                Giỏ
                <br />
                hàng
              </span>
            </button>

            {/* Trạng thái đăng nhập */}
            {isLoggedIn ? (
              <div className="group relative">
                <button
                  className="flex items-center gap-3 bg-white/10 hover:bg-white/20 p-1.5 pr-4 rounded-2xl transition border border-white/10 shadow-sm"
                  onClick={() => history.push("/account")}
                >
                  <div
                    className={`w-9 h-9 rounded-xl ${memberColor} flex items-center justify-center text-white font-black text-lg shadow-sm border border-white/20`}
                  >
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-[10px] uppercase font-bold opacity-70 tracking-wider">
                      {userInfo?.MaPQ === 1 ? "Quản trị viên" : "SMember"}
                    </div>
                    <div className="text-sm font-bold truncate max-w-[100px]">
                      {displayName}
                    </div>
                  </div>
                </button>

                {/* Dropdown Menu khi hover (Tùy chọn thêm) */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl py-2 hidden group-hover:block border border-gray-100 animate-in fade-in slide-in-from-top-2">
                  <Link
                    to="/account"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Trang cá nhân
                  </Link>
                  <Link
                    to="/orders"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Đơn hàng của tôi
                  </Link>
                  <hr className="my-1 border-gray-100" />
                  <button
                    onClick={onLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-bold"
                  >
                    Đăng xuất
                  </button>
                </div>
              </div>
            ) : (
              <button
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2.5 rounded-xl transition border border-white/10"
                onClick={() => history.push("/login")}
              >
                <span className="text-xl">👤</span>
                <span className="text-sm font-bold text-white">Đăng nhập</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
