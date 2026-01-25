import React, { useState, useEffect, useRef } from "react";
import { Link, useHistory } from "react-router-dom";
import { API_URL } from "../config";

// Thêm prop cartCount để hiển thị số lượng sản phẩm thực tế
const Header = ({ isLoggedIn, userInfo, onLogout, cartCount = 0 }) => {
  const history = useHistory();

  // 1. Phân loại màu sắc theo MaPQ (Quyền hạn) từ Backend
  const memberColor = userInfo?.MaPQ === 1 ? "bg-yellow-500" : "bg-white/20";

  // 2. Tên hiển thị ưu tiên TenDangNhap từ Model TaiKhoan
  const displayName = userInfo?.TenDangNhap || userInfo?.username || "User";

  // Dropdown danh mục động
  const [showDropdown, setShowDropdown] = useState(false);
  const [categories, setCategories] = useState([]);
  const dropdownRef = useRef(null);

  // Tìm kiếm sản phẩm
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeout = useRef();

  useEffect(() => {
    if (!searchText) {
      setSearchResults([]);
      setShowSuggestions(false);
      return;
    }
    // Debounce fetch
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(`${API_URL}/products`);
        const data = await res.json();
        // Lọc sản phẩm theo tên gần đúng (không phân biệt hoa thường, có dấu)
        const filtered = data.filter((p) =>
          p.TenSP?.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "").includes(
            searchText.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "")
          )
        );

        // Lấy thông số và media cho mỗi sản phẩm, chỉ giữ sản phẩm có giá
        const productsWithPrice = await Promise.all(
          filtered.slice(0, 10).map(async (p) => {
            try {
              // Gọi API lấy thông số kỹ thuật (bao gồm giá)
              const [resSpec, resMedia] = await Promise.all([
                fetch(`${API_URL}/products/${p.MaSP}/thong_so`),
                fetch(`${API_URL}/products/${p.MaSP}/media`),
              ]);
              const specData = await resSpec.json();
              const mediaData = await resMedia.json();

              // Lấy biến thể đầu tiên có giá > 0
              const specs = Array.isArray(specData) ? specData : [];
              const spec = specs.find(s => s && s.GiaBan && s.GiaBan !== "0.00" && Number(s.GiaBan) > 0) || specs[0];

              return {
                ...p,
                GiaBan: spec?.GiaBan,
                RAM: spec?.RAM,
                BoNho: spec?.BoNho,
                media: Array.isArray(mediaData) ? mediaData : [],
              };
            } catch {
              return { ...p, GiaBan: null, media: [] };
            }
          })
        );

        // Chỉ hiển thị sản phẩm có giá hợp lệ
        const validProducts = productsWithPrice.filter(
          p => p.GiaBan && p.GiaBan !== "0.00" && Number(p.GiaBan) > 0
        );

        setSearchResults(validProducts.slice(0, 6)); // Hiện tối đa 6 gợi ý
        setShowSuggestions(true);
      } catch {
        setSearchResults([]);
        setShowSuggestions(false);
      }
    }, 300);
    return () => clearTimeout(searchTimeout.current);
  }, [searchText]);
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

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_URL}/categories`);
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

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
            {/* Dropdown danh mục động */}
            {showDropdown && (
              <div className="absolute left-0 top-full mt-2 w-56 bg-white text-gray-800 rounded-xl shadow-xl z-50 border border-gray-100 animate-in fade-in slide-in-from-top-2">
                <div className="py-2">
                  {categories.length > 0 ? (
                    categories.map((cat) => (
                      <Link
                        key={cat.MaDM}
                        to={`/category=${cat.Loai}`}
                        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-red-50 rounded-lg transition"
                        onClick={() => setShowDropdown(false)}
                      >
                        <span>{cat.Icon || "📱"}</span>
                        <span>{cat.TenDM}</span>
                        <span className="ml-auto text-xs text-gray-400">({cat.SoLuongSP})</span>
                      </Link>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-sm text-gray-400">Không có danh mục</div>
                  )}
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
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                onFocus={() => searchResults.length > 0 && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                onKeyDown={e => {
                  if (e.key === "Enter" && searchText) {
                    history.push(`/search?q=${encodeURIComponent(searchText)}`);
                    setShowSuggestions(false);
                  }
                }}
              />
              {/* Gợi ý sản phẩm */}
              {showSuggestions && searchResults.length > 0 && (
                <div className="absolute left-0 right-0 top-full bg-white text-gray-800 rounded-xl shadow-xl z-50 border border-gray-100 mt-2 animate-in fade-in slide-in-from-top-2">
                  {searchResults.map((item) => (
                    <div
                      key={item.MaSP}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-red-50 cursor-pointer rounded-lg transition"
                      onMouseDown={() => {
                        history.push(`/products/${item.MaSP}`);
                        setShowSuggestions(false);
                      }}
                    >
                      <img
                        src={item.media && item.media.length > 0 ? `${API_URL}${item.media[0].DuongDanFile}` : "https://via.placeholder.com/40x40?text=No+Image"}
                        alt={item.TenSP}
                        className="w-10 h-10 object-contain rounded-lg border"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-sm truncate">{item.TenSP}</div>
                        <div className="text-xs text-gray-500">{Number(item.GiaBan).toLocaleString("vi-VN")}₫</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
                Giỏ hàng
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
