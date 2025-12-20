import React from "react";
import { Link } from "react-router-dom";


import { useState } from "react";

const Card = ({ product }) => {
  if (!product) return null;

  const BASE_URL = "http://127.0.0.1:8000";
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState("");

  // 1. Logic xử lý hình ảnh
  // Nếu product.media là một mảng (đã gộp từ API), lấy DuongDanFile của phần tử đầu tiên
  const getImageUrl = () => {
    if (product.media && product.media.length > 0) {
      return `${BASE_URL}${product.media[0].DuongDanFile}`;
    }
    // Nếu có trường HinhAnh cũ thì dùng, không thì dùng placeholder
    return product.HinhAnh || "https://via.placeholder.com/300?text=No+Image";
  };

  const formatPrice = (price) => {
    if (!price) return "Liên hệ";
    return new Intl.NumberFormat("vi-VN").format(price) + "₫";
  };

  // Hàm xử lý thêm vào giỏ hàng
  const handleAddToCart = async (e) => {
    e.preventDefault(); // Ngăn chuyển trang khi bấm nút
    setAdding(true);
    setMessage("");
    try {
      // Chuẩn bị payload đúng với backend
      const payload = {
        MaSP: product.MaSP,
        SoLuongSanPham: 1,
      };
      // Nếu có cấu hình kỹ thuật (ví dụ: MaTSKT), truyền thêm
      if (product.MaTSKT) {
        payload.MaTSKT = product.MaTSKT;
      }
      const res = await fetch(`${BASE_URL}/cart/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        credentials: "include", // Nếu cần gửi cookie
      });
      if (res.ok) {
        setMessage("Đã thêm vào giỏ hàng!");
      } else {
        setMessage("Thêm vào giỏ hàng thất bại!");
      }
    } catch (err) {
      setMessage("Có lỗi xảy ra!");
    }
    setAdding(false);
  };

  return (
    <div className="relative h-full flex flex-col">
      <Link
        to={`/products/${product.MaSP}`}
        className="block bg-white rounded-xl p-4 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 h-full flex flex-col group"
      >
        {/* Ảnh sản phẩm */}
        <div className="aspect-square mb-4 overflow-hidden rounded-lg bg-gray-50 flex items-center justify-center">
          <img
            src={getImageUrl()}
            alt={product.TenSP}
            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/300?text=Error+Image";
            }}
          />
        </div>

        {/* Tên sản phẩm */}
        <h3 className="font-bold text-sm mb-2 text-gray-800 h-10 line-clamp-2 group-hover:text-red-600 transition-colors">
          {product.TenSP}
        </h3>

        {/* Phần giá và thông số */}
        <div className="mt-auto">
          <div className="text-red-600 font-bold text-lg italic">
            {formatPrice(product.GiaBan)}
          </div>

          <div className="flex flex-wrap gap-1.5 mt-2">
            {product.RAM && (
              <span className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded-md font-semibold border border-red-100">
                {product.RAM}
              </span>
            )}
            {product.BoNho && (
              <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md font-semibold border border-blue-100">
                {product.BoNho}
              </span>
            )}
          </div>
        </div>
      </Link>
      {/* Nút mua ngay */}
      <button
        className="mt-2 w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
        onClick={handleAddToCart}
        disabled={adding}
      >
        {adding ? "Đang thêm..." : "Mua ngay"}
      </button>
      {message && (
        <div className="mt-1 text-center text-sm text-green-600 font-semibold">{message}</div>
      )}
    </div>
  );
};

export default Card;
