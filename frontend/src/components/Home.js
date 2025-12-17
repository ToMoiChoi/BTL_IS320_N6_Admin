import React, { useMemo } from 'react';

import Footer from './Footer';
import Card from './Card';
import Header from './Header';

// Hàm tiện ích để chuyển đổi chuỗi giá thành số (ví dụ: "10.000.000₫" -> 10000000)
const parsePrice = (priceString) => {
    if (!priceString) return 0;
    const cleanedPrice = priceString.replace(/\./g, '').replace(/[^0-9]/g, '');
    return parseInt(cleanedPrice, 10);
};

const Home = ({
    selectedSort,
    setSelectedSort,
    products,
    seriesCategories,
    filterOptions,
    filterOptions2,
    sortOptions,
    isLoggedIn,
    userInfo,
    onLogout
}) => {

    // 1. Dùng useMemo để tính toán danh sách sản phẩm đã sắp xếp
    const sortedProducts = useMemo(() => {
        const sortableProducts = [...products];
        if (selectedSort === 'price-asc') {
            // Sắp xếp giá thấp đến cao
            return sortableProducts.sort((a, b) => {
                const priceA = parsePrice(a.price);
                const priceB = parsePrice(b.price);
                return priceA - priceB;
            });
        } else if (selectedSort === 'price-desc') {
            // Sắp xếp giá cao đến thấp
            return sortableProducts.sort((a, b) => {
                const priceA = parsePrice(a.price);
                const priceB = parsePrice(b.price);
                return priceB - priceA;
            });
        } else if (selectedSort === 'name-asc') {
            return sortableProducts.sort((a, b) => a.name.localeCompare(b.name));
        }
        return sortableProducts;

    }, [products, selectedSort]);

    return (
        <div className="min-h-screen bg-gray-50">
            <Header
                isLoggedIn={isLoggedIn}
                userInfo={userInfo}
                onLogout={onLogout}
            />
            <div className="container mx-auto px-4 py-6">
                <h1 className="text-3xl font-bold mb-6">iPhone</h1>
                {/* ... (Các nút Series Categories) ... */}
                <div className="flex flex-wrap gap-3 mb-6">
                    {seriesCategories.map((category, index) => (
                        <button
                            key={index}
                            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-red-500 hover:text-red-500 transition text-sm font-medium"
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {/* ... (Các Filter Options) ... */}
                <h2 className="text-xl font-bold mb-4">Chọn theo tiêu chí</h2>
                <div className="flex flex-wrap gap-3 mb-3">
                    {filterOptions.map((filter, index) => (
                        <button
                            key={index}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition text-sm font-medium ${filter.active
                                ? 'bg-red-50 border-2 border-red-500 text-red-500'
                                : 'bg-gray-100 hover:bg-gray-200'
                                }`}
                        >
                            {filter.icon && <span>{filter.icon}</span>}
                            <span>{filter.label}</span>
                            {filter.hasDropdown && <span className="text-xs">▼</span>}
                        </button>
                    ))}
                </div>

                <div className="flex flex-wrap gap-3 mb-8">
                    {filterOptions2.map((filter, index) => (
                        <button
                            key={index}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
                        >
                            <span>{filter.label}</span>
                            {filter.hasDropdown && <span className="text-xs">▼</span>}
                        </button>
                    ))}
                </div>

                {/* Khu vực Sắp xếp */}
                <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                    <h2 className="text-xl font-bold">Sắp xếp theo</h2>
                    <div className="flex gap-3 flex-wrap">
                        {sortOptions.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => setSelectedSort(option.value)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full transition text-sm font-medium ${selectedSort === option.value
                                    ? 'bg-blue-50 border-2 border-blue-500 text-blue-600'
                                    : 'bg-gray-100 hover:bg-gray-200'
                                    }`}
                            >
                                {option.icon && <span>{option.icon}</span>}
                                <span>{option.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* KHU VỰC HIỂN THỊ SẢN PHẨM */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {sortedProducts.map((product) => (
                        <Card key={product.id} product={product} />
                    ))}
                </div>

            </div>

            <button className="fixed bottom-8 right-8 bg-red-600 text-white px-6 py-4 rounded-full shadow-lg hover:bg-red-700 transition z-50 flex items-center gap-2">
                <span className="text-2xl">🎧</span>
                <span className="font-medium">Liên hệ</span>
            </button>
            <Footer />
        </div>
    );
};
export default Home;