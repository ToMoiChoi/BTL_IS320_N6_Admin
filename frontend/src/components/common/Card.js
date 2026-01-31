import React from "react";
import { Link } from "react-router-dom";
import { API_URL,PROVINCES_API } from "../../config";

const Card = ({ product }) => {
  if (!product) return null;

  const BASE_URL = API_URL;

  // Logic xử lý hình ảnh
  const getImageUrl = () => {
    if (product.media && product.media.length > 0) {
      return `${BASE_URL}${product.media[0].DuongDanFile}`;
    }
    return product.HinhAnh || "https://via.placeholder.com/300?text=No+Image";
  };

  const formatPrice = (price) => {
    if (!price) return "Liên hệ";
    return new Intl.NumberFormat("vi-VN").format(price) + "₫";
  };

  // Calculate discount (fake 10-20% for demo)
  const originalPrice = product.GiaBan ? Math.round(Number(product.GiaBan) * 1.15) : null;
  const discountPercent = originalPrice ? Math.round((1 - Number(product.GiaBan) / originalPrice) * 100) : 0;

  return (
    <Link
      to={`/products/${product.MaSP}`}
      className="block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 h-full flex flex-col group relative"
    >
      {/* Discount Badge */}
      {discountPercent > 0 && (
        <div className="absolute top-3 left-3 z-10">
          <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
            Giảm {discountPercent}%
          </span>
        </div>
      )}

      {/* Installment Badge */}
      <div className="absolute top-3 right-3 z-10">
        <span className="bg-blue-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg">
          Trả góp 0%
        </span>
      </div>

      {/* Ảnh sản phẩm */}
      <div className="aspect-square p-4 overflow-hidden bg-gray-50 flex items-center justify-center">
        <img
          src={getImageUrl()}
          alt={product.TenSP}
          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/300?text=Error+Image";
          }}
        />
      </div>

      {/* Product Info */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Tên sản phẩm */}
        <h3 className="font-bold text-sm mb-3 text-gray-800 h-10 line-clamp-2 group-hover:text-red-600 transition-colors">
          {product.TenSP}
        </h3>

        {/* Phần giá */}
        <div className="mt-auto">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-red-600 font-bold text-lg">
              {formatPrice(product.GiaBan)}
            </span>
            {originalPrice && (
              <span className="text-gray-400 text-sm line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>

          {/* Specs Tags */}
          <div className="flex flex-wrap gap-1.5">
            {product.RAM && (
              <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium">
                {product.RAM}
              </span>
            )}
            {product.BoNho && (
              <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium">
                {product.BoNho}
              </span>
            )}
          </div>

          {/* Promo Text */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-[11px] text-gray-500 line-clamp-2">
              ✓ Không phí chuyển đổi khi trả góp 0% qua thẻ tín dụng
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default Card;
