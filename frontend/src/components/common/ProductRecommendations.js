import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../../config";

/**
 * ProductRecommendations - Hiển thị sản phẩm gợi ý tương tự
 * Gọi API: GET /products/{product_id}/recommendations
 */
const ProductRecommendations = ({ productId, limit = 6 }) => {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [latency, setLatency] = useState(null);

    useEffect(() => {
        const fetchRecommendations = async () => {
            if (!productId) return;

            try {
                setLoading(true);
                setError(null);

                const response = await fetch(
                    `${API_URL}/products/${productId}/recommendations?limit=${limit}&include_out_of_stock=false`
                );

                if (!response.ok) {
                    throw new Error("Không thể tải gợi ý sản phẩm");
                }

                const data = await response.json();
                setRecommendations(data.recommendations || []);
                setLatency(data.latency_ms);
            } catch (err) {
                console.error("Error fetching recommendations:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendations();
    }, [productId, limit]);

    const formatPrice = (price) => {
        if (!price) return "Liên hệ";
        return new Intl.NumberFormat("vi-VN").format(price) + "₫";
    };

    // Không hiển thị nếu không có gợi ý
    if (!loading && recommendations.length === 0) {
        return null;
    }

    return (
        <div className="mt-12 pt-8 border-t border-gray-200">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                    🔥 Sản phẩm tương tự
                </h2>
                {latency && (
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                        ⚡ {latency}ms
                    </span>
                )}
            </div>

            {/* Loading State */}
            {loading && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {[...Array(limit)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                            <div className="bg-gray-200 aspect-square rounded-lg mb-3"></div>
                            <div className="bg-gray-200 h-4 rounded mb-2 w-3/4"></div>
                            <div className="bg-gray-200 h-5 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="text-center py-8 text-gray-500">
                    <p>Không thể tải gợi ý sản phẩm</p>
                </div>
            )}

            {/* Recommendations Grid */}
            {!loading && !error && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {recommendations.map((product) => (
                        <Link
                            key={product.MaSP}
                            to={`/products/${product.MaSP}`}
                            className="block bg-white rounded-xl p-3 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 group"
                        >
                            {/* Ảnh sản phẩm */}
                            <div className="aspect-square mb-3 overflow-hidden rounded-lg bg-gray-50 flex items-center justify-center">
                                <img
                                    src={
                                        product.AnhDaiDien
                                            ? `${API_URL}${product.AnhDaiDien}`
                                            : "https://via.placeholder.com/200?text=No+Image"
                                    }
                                    alt={product.TenSP}
                                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                                    onError={(e) => {
                                        e.target.src = "https://via.placeholder.com/200?text=No+Image";
                                    }}
                                />
                            </div>

                            {/* Tên sản phẩm */}
                            <h3 className="font-semibold text-xs mb-2 text-gray-800 h-8 line-clamp-2 group-hover:text-red-600 transition-colors">
                                {product.TenSP}
                            </h3>

                            {/* Giá */}
                            <div className="text-red-600 font-bold text-sm">
                                {formatPrice(product.GiaThapNhat)}
                            </div>

                            {/* Tồn kho */}
                            {product.TongTonKho > 0 ? (
                                <span className="text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded mt-1 inline-block">
                                    Còn hàng ({product.TongTonKho})
                                </span>
                            ) : (
                                <span className="text-[10px] text-gray-500 bg-gray-50 px-2 py-0.5 rounded mt-1 inline-block">
                                    Hết hàng
                                </span>
                            )}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductRecommendations;
