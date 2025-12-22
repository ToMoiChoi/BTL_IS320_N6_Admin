import React from "react";
import { Link } from "react-router-dom";

const Card = ({ product }) => {
  if (!product) return null;

  const BASE_URL = "http://127.0.0.1:8000";

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

  return (
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
  );
};

export default Card;
