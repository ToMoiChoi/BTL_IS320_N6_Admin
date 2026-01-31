import React, { useMemo, useEffect, useState } from "react";
import Footer from "../layout/Footer";
import Card from "../common/Card";
import { useHistory, useLocation } from "react-router-dom";
import { API_URL } from "../../config";

// Brand logos/icons for filter (images in public folder)
const brands = [
  { name: "iPhone", icon: "/images/brands/frame_59.webp", value: "iphone" },
  { name: "Samsung", icon: "/images/brands/frame_60.webp", value: "samsung" },
  { name: "Xiaomi", icon: "/images/brands/frame_61.webp", value: "xiaomi" },
  { name: "Oppo", icon: "/images/brands/frame_62.webp", value: "oppo" },
  { name: "Realme", icon: "/images/brands/frame_63.webp", value: "realme" },
  { name: "Vivo", icon: "/images/brands/frame_64.webp", value: "vivo" },
];

// Category filters
const categories = [
  { name: "Điện thoại chơi game", icon: "🎮", value: "gaming", idcategory: 1 },
  { name: "Pin trâu", icon: "🔋", value: "battery", idcategory: 2 },
  { name: "5G", icon: "📶", value: "5g", idcategory: 3 },
  { name: "Chụp ảnh đẹp", icon: "📷", value: "camera", idcategory: 4 },
  { name: "Điện thoại gập", icon: "📂", value: "foldable", idcategory: 5 },
];

const Home = ({
  isLoggedIn,
  userInfo,
  onLogout,
}) => {
  const [displayProducts, setDisplayProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedBrandId, setSelectedBrandId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSort, setSelectedSort] = useState("");
  const [currentPage, setCurrentPage] = useState(0); // Track current page (0-indexed)
  const [hasMore, setHasMore] = useState(true); // Check if there are more products
  const [allProductIds, setAllProductIds] = useState([]); // Store all product IDs
  const [filteredProductIds, setFilteredProductIds] = useState([]); // Store filtered product IDs by brand
  const ITEMS_PER_PAGE = 10;
  const history = useHistory();
  const location = useLocation();

  // Read brand from URL on initial load and when URL changes
  useEffect(() => {
    const path = location.pathname;
    const brandMatch = path.match(/^\/brand=(.+)$/);
    if (brandMatch) {
      const brandValue = brandMatch[1];
      // Validate if brand exists
      const foundBrand = brands.find(b => b.value === brandValue);
      if (foundBrand) {
        setSelectedBrand(brandValue);
        setSelectedBrandId(foundBrand.idbrand);
      }
    } else if (path === '/') {
      setSelectedBrand(null);
      setSelectedBrandId(null);
    }
  }, [location.pathname]);

  // Fetch product details for a batch of product IDs
  const fetchProductDetails = async (productBatch) => {
    const fullData = await Promise.all(
      productBatch.map(async (p) => {
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
    return fullData;
  };

  // Initial load - fetch first 10 products (filtered by brand if selected)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        setDisplayProducts([]);
        setCurrentPage(0);

        // Build API URL with ten_sp parameter if brand is selected
        let apiUrl = `${API_URL}/products/`;
        if (selectedBrand) {
          apiUrl += `?ten_sp=${selectedBrand}`;
        }

        const res = await fetch(apiUrl);
        const baseProducts = await res.json();

        // Store all product IDs for later use
        setAllProductIds(baseProducts);
        setFilteredProductIds(baseProducts);

        // Fetch details for first 10 products
        const firstBatch = baseProducts.slice(0, ITEMS_PER_PAGE);
        const fullData = await fetchProductDetails(firstBatch);

        setDisplayProducts(fullData);
        setCurrentPage(1);
        setHasMore(baseProducts.length > ITEMS_PER_PAGE);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [selectedBrand]);

  // Load more products
  const loadMoreProducts = async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      const startIndex = currentPage * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;

      if (selectedBrand && filteredProductIds.length > 0) {
        // Load more from filtered products
        const nextBatch = filteredProductIds.slice(startIndex, endIndex);

        if (nextBatch.length === 0) {
          setHasMore(false);
          return;
        }

        setDisplayProducts(prev => [...prev, ...nextBatch]);
        setCurrentPage(prev => prev + 1);
        setHasMore(endIndex < filteredProductIds.length);
      } else {
        // Load more from all products
        const nextBatch = allProductIds.slice(startIndex, endIndex);

        if (nextBatch.length === 0) {
          setHasMore(false);
          return;
        }

        const newProducts = await fetchProductDetails(nextBatch);

        setDisplayProducts(prev => [...prev, ...newProducts]);
        setCurrentPage(prev => prev + 1);
        setHasMore(endIndex < allProductIds.length);
      }
    } catch (error) {
      console.error("Load more error:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  // Sort products (filtering is now done at fetch level for brand route)
  const sortedProducts = useMemo(() => {
    let result = [...displayProducts];

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
  }, [displayProducts, selectedSort]);

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
            <h1 className="text-2xl font-bold text-gray-900">Điện thoại</h1>
            <span className="text-sm text-gray-500">{sortedProducts.length} sản phẩm</span>
          </div>

          {/* Brand Filter */}
          <div className="flex flex-wrap gap-2">
            {brands.map((brand) => (
              <button
                key={brand.value}
                onClick={() => {
                  if (selectedBrand === brand.value) {
                    setSelectedBrand(null);
                    history.push('/');
                  } else {
                    setSelectedBrand(brand.value);
                    history.push(`/brand=${brand.value}`);
                  }
                }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition flex items-center gap-2 bg-white`}>
                <img src={brand.icon} alt={brand.name} className="w-24 h-24 rounded-full object-contain" />
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
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition flex items-center gap-2 whitespace-nowrap ${selectedCategory === cat.value
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
                className={`px-4 py-2 rounded-xl border text-sm font-medium transition ${!selectedSort
                  ? "bg-red-50 border-red-500 text-red-600"
                  : "bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-600"
                  }`}
              >
                Nổi bật
              </button>
              <button
                onClick={() => setSelectedSort("asc")}
                className={`px-4 py-2 rounded-xl border text-sm font-medium transition ${selectedSort === "asc"
                  ? "bg-red-50 border-red-500 text-red-600"
                  : "bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-600"
                  }`}
              >
                Giá thấp → cao
              </button>
              <button
                onClick={() => setSelectedSort("desc")}
                className={`px-4 py-2 rounded-xl border text-sm font-medium transition ${selectedSort === "desc"
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
          {sortedProducts.map((product) => (
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
        {hasMore && (
          <div className="text-center mt-8">
            <button
              onClick={loadMoreProducts}
              disabled={loadingMore}
              className={`px-8 py-3 bg-white border-2 border-red-600 text-red-600 font-bold rounded-xl hover:bg-red-50 transition ${loadingMore ? "opacity-50 cursor-not-allowed" : ""
                }`}
            >
              {loadingMore ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-red-600 border-t-transparent"></span>
                  Đang tải...
                </span>
              ) : (
                `Xem thêm`
              )}
            </button>
          </div>
        )}
      </div>
      <Footer isLoggedIn={isLoggedIn} />
    </div>
  );
};

export default Home;
