// src/components/Card.js (hoặc ProductCard.js)

import React from 'react';
// 1. IMPORT component Link (Từ React Router DOM)
import { Link } from 'react-router-dom';

const Card = ({ product }) => {
    const productSlug = product.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const productPath = `/products/${productSlug}`;

    return (
        <Link
            to={productPath}
            className="block bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition cursor-pointer group h-full"
        >
            <div className="relative p-4">
                {/* Khu vực Nhãn giảm giá và Trả góp */}
                <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                    <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                        Giảm {product.discount}%
                    </span>
                    <span className="bg-blue-100 text-blue-600 text-xs font-medium px-2 py-1 rounded">
                        Trả góp {product.installmentRate}
                    </span>
                </div>

                {/* Hình ảnh sản phẩm */}
                <div className="aspect-square mb-4 overflow-hidden rounded-lg">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                </div>

                {/* Tên sản phẩm */}
                <h3 className="font-medium text-sm mb-2 line-clamp-2 min-h-[40px] text-gray-800">
                    {product.name}
                </h3>

                {/* Thông số kỹ thuật (Specs) */}
                <div className="flex flex-wrap gap-2 mb-3">
                    {product.specs.map((spec, index) => (
                        <span
                            key={index}
                            className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600"
                        >
                            {spec}
                        </span>
                    ))}
                </div>

                {/* Giá */}
                <div className="mb-2">
                    <div className="flex items-center gap-2">
                        <span className="text-red-600 font-bold text-lg">
                            {product.price}
                        </span>
                        {product.originalPrice && (
                            <span className="text-gray-400 text-sm line-through">
                                {product.originalPrice}
                            </span>
                        )}
                    </div>
                </div>

                {/* Thông tin trả góp và trạng thái */}
                <div className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded mb-2">
                    {product.installment}
                </div>

                {product.status ? (
                    <div className="text-orange-600 text-xs font-medium">
                        {product.status}
                    </div>
                ) : (
                    <div className="text-gray-600 text-xs">
                        Trả góp 0% - 0đ phụ thu - 0đ trả trước
                    </div>
                )}
            </div>
        </Link>
    );
};

export default Card;