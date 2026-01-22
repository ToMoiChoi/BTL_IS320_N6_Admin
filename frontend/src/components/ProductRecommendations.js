import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../config";

/**
 * Component hiển thị sản phẩm gợi ý (cùng danh mục)
 * Tích hợp với API /products/{id}/recommendations
 */
const ProductRecommendations = ({ productId, limit = 6 }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!productId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(
          `${API_URL}/products/${productId}/recommendations?limit=${limit}`
        );
        
        if (!response.ok) {
          throw new Error("Không thể tải sản phẩm gợi ý");
        }
        
        const data = await response.json();
        setRecommendations(data.recommendations || []);
      } catch (err) {
        console.error("Error fetching recommendations:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [productId, limit]);

  // Format giá tiền VNĐ
  const formatPrice = (price) => {
    if (!price) return "Liên hệ";
    return new Intl.NumberFormat("vi-VN").format(price) + "₫";
  };

  // Không hiển thị nếu không có gợi ý
  if (!loading && recommendations.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 bg-white rounded-2xl p-6 shadow-sm">
      <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <span className="text-red-500">💡</span> Sản phẩm tương tự
      </h2>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-red-600 border-t-transparent"></div>
        </div>
      ) : error ? (
        <div className="text-center py-4 text-gray-500">
          Không thể tải sản phẩm gợi ý
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {recommendations.map((product) => (
            <Link
              key={product.MaSP}
              to={`/products/${product.MaSP}`}
              className="group bg-gray-50 rounded-xl p-3 hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-red-200"
            >
              {/* Ảnh sản phẩm */}
              <div className="aspect-square mb-3 overflow-hidden rounded-lg bg-white">
                <img
                  src={
                    product.AnhDaiDien
                      ? `${API_URL}${product.AnhDaiDien}`
                      : "https://via.placeholder.com/150?text=No+Image"
                  }
                  alt={product.TenSP}
                  className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/150?text=Error";
                  }}
                />
              </div>

              {/* Tên sản phẩm */}
              <h3 className="text-xs font-medium text-gray-800 line-clamp-2 mb-2 group-hover:text-red-600 transition-colors h-8">
                {product.TenSP}
              </h3>

              {/* Giá */}
              <div className="text-sm font-bold text-red-600">
                {formatPrice(product.GiaThapNhat)}
              </div>

              {/* Stock indicator */}
              {product.TongTonKho > 0 ? (
                <div className="mt-1 text-[10px] text-green-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  Còn hàng
                </div>
              ) : (
                <div className="mt-1 text-[10px] text-gray-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
                  Hết hàng
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductRecommendations;
