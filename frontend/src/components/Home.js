import React, { useMemo, useEffect, useState } from "react";
import Footer from "./Footer";
import Card from "./Card";
import Header from "./Header";

const Home = ({
  selectedSort,
  setSelectedSort,
  seriesCategories = [],
  sortOptions = [],
  isLoggedIn,
  userInfo,
  onLogout,
}) => {
  const [displayProducts, setDisplayProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFullData = async () => {
      try {
        setLoading(true);
        // Bước 1: Lấy danh sách sản phẩm cơ bản
        const res = await fetch("http://127.0.0.1:8000/products");
        const baseProducts = await res.json();

        // Bước 2: Với mỗi SP, lấy thêm thông số và hình ảnh
        const fullData = await Promise.all(
          baseProducts.map(async (p) => {
            try {
              // Gọi đồng thời 2 API để tối ưu thời gian
              const [resSpec, resMedia] = await Promise.all([
                fetch(`http://127.0.0.1:8000/products/${p.MaSP}/thong_so`),
                fetch(`http://127.0.0.1:8000/products/${p.MaSP}/media`),
              ]);

              const specData = await resSpec.json();
              const mediaData = await resMedia.json();

              // Xử lý thông số (lấy bản ghi đầu tiên nếu là mảng)
              const spec = Array.isArray(specData) ? specData[0] : specData;

              // Gộp tất cả: SP cơ bản + Thông số + Mảng hình ảnh
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

  // Sắp xếp dữ liệu
  const sortedProducts = useMemo(() => {
    let result = [...displayProducts];

    if (selectedSort === "price-asc") {
      result.sort((a, b) => (Number(a.GiaBan) || 0) - (Number(b.GiaBan) || 0));
    } else if (selectedSort === "price-desc") {
      result.sort((a, b) => (Number(b.GiaBan) || 0) - (Number(a.GiaBan) || 0));
    } else if (selectedSort === "name-asc") {
      result.sort((a, b) => (a.TenSP || "").localeCompare(b.TenSP || ""));
    }
    return result;
  }, [displayProducts, selectedSort]);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
        <div className="text-gray-600 font-medium">
          Đang tải danh sách sản phẩm...
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Thêm Header vào Home */}
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6 italic text-red-600">
          cellphone<span className="text-gray-800 not-italic">S</span> - iPhone
        </h1>

        {/* Categories */}
        <div className="flex flex-wrap gap-3 mb-8">
          {seriesCategories.map((category, index) => (
            <button
              key={`cat-${index}`}
              className="px-5 py-2 bg-white border border-gray-200 rounded-xl hover:border-red-500 hover:text-red-500 transition-all text-sm font-semibold shadow-sm"
            >
              {category}
            </button>
          ))}
        </div>

        {/* Khu vực Sắp xếp */}
        <div className="bg-white p-4 rounded-2xl shadow-sm mb-8 border border-gray-100">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h2 className="text-lg font-bold text-gray-700">Sắp xếp theo</h2>
            <div className="flex gap-2 flex-wrap">
              {sortOptions.map((option, index) => (
                <button
                  key={`sort-${index}`}
                  onClick={() => setSelectedSort(option.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition text-sm font-bold border ${
                    selectedSort === option.value
                      ? "bg-red-50 border-red-500 text-red-600"
                      : "bg-gray-50 border-transparent hover:bg-gray-100 text-gray-600"
                  }`}
                >
                  {option.icon && <span>{option.icon}</span>}
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* KHU VỰC HIỂN THỊ SẢN PHẨM */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
          {sortedProducts.map((product) => (
            <Card key={product.MaSP} product={product} />
          ))}
        </div>

        {sortedProducts.length === 0 && !loading && (
          <div className="text-center py-20 text-gray-400 font-medium bg-white rounded-3xl border border-dashed border-gray-200 mt-6">
            Không có sản phẩm nào để hiển thị.
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button className="fixed bottom-8 right-8 bg-red-600 text-white px-6 py-4 rounded-2xl shadow-2xl hover:bg-red-700 transition-all z-50 flex items-center gap-2 transform hover:scale-105 active:scale-95">
        <span className="text-2xl animate-bounce">🎧</span>
        <span className="font-bold uppercase tracking-tight">
          Liên hệ tư vấn
        </span>
      </button>

      <Footer />
    </div>
  );
};

export default Home;
