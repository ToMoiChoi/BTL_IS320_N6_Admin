import React, { useEffect, useState } from "react";
import Card from "./Card";
import Footer from "./Footer";
import { useParams, useHistory } from "react-router-dom";
import { API_URL } from "../config";

const CategoryProducts = ({ isLoggedIn }) => {
  const { Loai } = useParams();
  const history = useHistory();
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        // Sử dụng API endpoint với Loai (loại danh mục)
        const res = await fetch(`${API_URL}/categories/by-type/${Loai}/products`);

        if (!res.ok) {
          throw new Error("Không tìm thấy danh mục");
        }

        const data = await res.json();
        setCategory(data.category);

        // Fetch specs và media cho mỗi sản phẩm
        const productsWithDetails = await Promise.all(
          data.products.map(async (p) => {
            try {
              const [specsRes, mediaRes] = await Promise.all([
                fetch(`${API_URL}/products/${p.MaSP}/thong_so`),
                fetch(`${API_URL}/products/${p.MaSP}/media`)
              ]);

              const specsData = await specsRes.json();
              const mediaData = await mediaRes.json();

              const specs = Array.isArray(specsData) ? specsData : [];
              const validSpec = specs.find(s => s && s.GiaBan && Number(s.GiaBan) > 0) || specs[0];

              return {
                ...p,
                GiaBan: validSpec?.GiaBan,
                RAM: validSpec?.RAM,
                BoNho: validSpec?.BoNho,
                media: Array.isArray(mediaData) ? mediaData : []
              };
            } catch {
              return { ...p, GiaBan: null, media: [] };
            }
          })
        );

        // Chỉ hiển thị sản phẩm có giá
        const validProducts = productsWithDetails.filter(
          p => p.GiaBan && Number(p.GiaBan) > 0
        );

        setProducts(validProducts);
      } catch (err) {
        console.error("Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryProducts();
  }, [Loai]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-xl mb-4">❌ {error}</p>
          <button
            onClick={() => history.push("/")}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="container mx-auto px-4 py-6">
            <nav className="text-sm text-gray-500 mb-4">
              <span className="hover:text-red-600 cursor-pointer" onClick={() => history.push("/")}>Trang chủ</span>
              <span className="mx-2">/</span>
              <span className="text-gray-800 font-medium">{category?.TenDM || "Danh mục"}</span>
            </nav>

            <div className="flex items-center gap-4">
              <span className="text-4xl">{category?.Icon || "📱"}</span>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">{category?.TenDM}</h1>
                <p className="text-gray-500">{category?.SoLuongSP || products.length} sản phẩm</p>
              </div>
            </div>

            {category?.MoTa && (
              <p className="mt-4 text-gray-600">{category.MoTa}</p>
            )}
          </div>
        </div>

        {/* Products Grid */}
        <div className="container mx-auto px-4 py-8">
          {products.length === 0 ? (
            <div className="text-center py-20">
              <span className="text-6xl mb-4 block">📦</span>
              <p className="text-gray-500 text-lg">Chưa có sản phẩm nào trong danh mục này.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
              {products.map((product) => (
                <Card key={product.MaSP} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer isLoggedIn={isLoggedIn} />
    </>
  );
};

export default CategoryProducts;
