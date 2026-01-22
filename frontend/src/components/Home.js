import React, { useMemo, useEffect, useState } from "react";
import Footer from "./Footer";
import Card from "./Card";
import { useHistory } from "react-router-dom";
import { API_URL } from "../config";

// Brand logos/icons for filter
const brands = [
  { name: "iPhone", icon: "🍎", value: "iphone" },
  { name: "Samsung", icon: "📱", value: "samsung" },
  { name: "Xiaomi", icon: "📱", value: "xiaomi" },
  { name: "Oppo", icon: "📱", value: "oppo" },
  { name: "Realme", icon: "📱", value: "realme" },
  { name: "Vivo", icon: "📱", value: "vivo" },
];

// Category filters
const categories = [
  { name: "Điện thoại chơi game", icon: "🎮", value: "gaming" },
  { name: "Pin trâu", icon: "🔋", value: "battery" },
  { name: "5G", icon: "📶", value: "5g" },
  { name: "Chụp ảnh đẹp", icon: "📷", value: "camera" },
  { name: "Điện thoại gập", icon: "📂", value: "foldable" },
];

const Home = ({
  isLoggedIn,
  userInfo,
  onLogout,
}) => {
  const [displayProducts, setDisplayProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSort, setSelectedSort] = useState("");
  const [displayCount, setDisplayCount] = useState(10); // Show 10 products initially
  const history = useHistory();

  useEffect(() => {
    const fetchFullData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/products`);
        const baseProducts = await res.json();

        const fullData = await Promise.all(
          baseProducts.map(async (p) => {
            try {
              const [resSpec, resMedia] = await Promise.all([
                fetch(`${API_URL}/products/${p.MaSP}/thong_so`),
                fetch(`${API_URL}/products/${p.MaSP}/media`),
              ]);

              const specData = await resSpec.json();
              const mediaData = await resMedia.json();
              const spec = Array.isArray(specData) ? specData[0] : specData;

              return {
                ...p,
                ...spec,
                media: Array.isArray(mediaData) ? mediaData : [],
              };
            } catch (err) {
              console.error(`Lỗi fetch data chi tiết cho SP ${p.MaSP}:`, err);
              return { ...p, media: [] };
            }
          })
        );
        setDisplayProducts(fullData);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFullData();
  }, []);

  // Sort and filter products
  const sortedProducts = useMemo(() => {
    let result = [...displayProducts];

    // Filter by brand (simple name matching)
    if (selectedBrand) {
      result = result.filter(p => 
        p.TenSP?.toLowerCase().includes(selectedBrand.toLowerCase())
      );
    }

    // Sort - push products without valid price to the end
    result.sort((a, b) => {
      const aHasPrice = a.GiaBan && a.GiaBan !== "0.00" && a.GiaBan !== 0;
      const bHasPrice = b.GiaBan && b.GiaBan !== "0.00" && b.GiaBan !== 0;
      if (!aHasPrice && !bHasPrice) return 0;
      if (!aHasPrice) return 1;
      if (!bHasPrice) return -1;
      if (selectedSort === "asc") {
        return (Number(a.GiaBan) || 0) - (Number(b.GiaBan) || 0);
      } else if (selectedSort === "desc") {
        return (Number(b.GiaBan) || 0) - (Number(a.GiaBan) || 0);
      }
      return 0;
    });

    return result;
  }, [displayProducts, selectedSort, selectedBrand]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Đang tải danh sách sản phẩm...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-6">
        
        {/* Page Title with Brand Filter */}
        <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span className="text-red-600">📱</span> Điện thoại
            </h1>
            <span className="text-sm text-gray-500">{sortedProducts.length} sản phẩm</span>
          </div>

          {/* Brand Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedBrand(null)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                !selectedBrand
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Tất cả
            </button>
            {brands.map((brand) => (
              <button
                key={brand.value}
                onClick={() => setSelectedBrand(selectedBrand === brand.value ? null : brand.value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition flex items-center gap-2 ${
                  selectedBrand === brand.value
                    ? "bg-red-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <span>{brand.icon}</span>
                <span>{brand.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Category Chips */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(selectedCategory === cat.value ? null : cat.value)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition flex items-center gap-2 whitespace-nowrap ${
                selectedCategory === cat.value
                  ? "bg-red-100 text-red-600 border-2 border-red-500"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Flash Sale Banner (Simple) */}
        <div className="bg-gradient-to-r from-red-600 to-red-500 rounded-2xl p-4 mb-6 shadow-lg">
          <div className="flex items-center gap-3">
            <span className="text-2xl animate-pulse">⚡</span>
            <div>
              <h2 className="text-white font-bold text-lg">FLASH SALE</h2>
              <p className="text-red-100 text-sm">Giảm giá sốc hôm nay</p>
            </div>
          </div>
        </div>

        {/* Sort Options */}
        <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <span className="font-bold text-gray-700">Sắp xếp theo:</span>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedSort("")}
                className={`px-4 py-2 rounded-xl border text-sm font-medium transition ${
                  !selectedSort
                    ? "bg-red-50 border-red-500 text-red-600"
                    : "bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-600"
                }`}
              >
                Nổi bật
              </button>
              <button
                onClick={() => setSelectedSort("asc")}
                className={`px-4 py-2 rounded-xl border text-sm font-medium transition ${
                  selectedSort === "asc"
                    ? "bg-red-50 border-red-500 text-red-600"
                    : "bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-600"
                }`}
              >
                Giá thấp → cao
              </button>
              <button
                onClick={() => setSelectedSort("desc")}
                className={`px-4 py-2 rounded-xl border text-sm font-medium transition ${
                  selectedSort === "desc"
                    ? "bg-red-50 border-red-500 text-red-600"
                    : "bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-600"
                }`}
              >
                Giá cao → thấp
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {sortedProducts.slice(0, displayCount).map((product) => (
            <Card key={product.MaSP} product={product} />
          ))}
        </div>

        {sortedProducts.length === 0 && !loading && (
          <div className="text-center py-20 bg-white rounded-2xl mt-6">
            <span className="text-6xl mb-4 block">📱</span>
            <p className="text-gray-500 font-medium">Không tìm thấy sản phẩm phù hợp.</p>
            <button
              onClick={() => {
                setSelectedBrand(null);
                setSelectedCategory(null);
              }}
              className="mt-4 text-red-600 font-medium hover:underline"
            >
              Xóa bộ lọc
            </button>
          </div>
        )}

        {/* Load More */}
        {sortedProducts.length > displayCount && (
          <div className="text-center mt-8">
            <button 
              onClick={() => setDisplayCount(prev => prev + 10)}
              className="px-8 py-3 bg-white border-2 border-red-600 text-red-600 font-bold rounded-xl hover:bg-red-50 transition"
            >
              Xem thêm sản phẩm ({sortedProducts.length - displayCount} còn lại)
            </button>
          </div>
        )}
      </div>
      <Footer isLoggedIn={isLoggedIn} />
    </div>
  );
};

export default Home;
