import React, { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import Footer from "./Footer";
import { API_URL } from "../config";

const ProductDetail = ({ isLoggedIn }) => {
  const { productId } = useParams();
  const history = useHistory();
  const [product, setProduct] = useState(null);
  const [allSpecs, setAllSpecs] = useState([]);
  const [selectedSpec, setSelectedSpec] = useState(null);
  const [mediaList, setMediaList] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        
        // Fetch product info
        const productRes = await fetch(`${API_URL}/products/${productId}`);
        if (!productRes.ok) throw new Error("Không thể tải thông tin sản phẩm");
        const productData = await productRes.json();
        setProduct(productData);

        // Fetch all specs (for storage/color options)
        const specsRes = await fetch(`${API_URL}/products/${productId}/thong_so`);
        if (specsRes.ok) {
          const specsData = await specsRes.json();
          const specs = Array.isArray(specsData) ? specsData : [specsData];
          setAllSpecs(specs);
          // Select first spec with valid price
          const validSpec = specs.find(s => s && s.GiaBan && s.GiaBan !== "0.00") || specs[0];
          setSelectedSpec(validSpec);
        }

        // Fetch media
        const mediaRes = await fetch(`${API_URL}/products/${productId}/media`);
        if (mediaRes.ok) {
          const mediaData = await mediaRes.json();
          setMediaList(Array.isArray(mediaData) ? mediaData : []);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (productId) fetchProductData();
  }, [productId]);

  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      alert("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng");
      history.push("/login");
      return;
    }

    setAddingToCart(true);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_URL}/cart/items`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          MaSP: parseInt(productId),
          MaTSKT: selectedSpec?.MaTSKT || null,
          SoLuongSanPham: 1
        }),
      });

      if (response.ok) {
        alert("✅ Đã thêm sản phẩm vào giỏ hàng!");
      } else {
        const error = await response.json();
        alert(`Lỗi: ${error.detail || "Không thể thêm vào giỏ hàng"}`);
      }
    } catch (error) {
      console.error("Lỗi khi thêm vào giỏ hàng:", error);
      alert("Không thể kết nối đến server");
    } finally {
      setAddingToCart(false);
    }
  };

  // Get unique storage options
  const storageOptions = [...new Set(allSpecs.map(s => s.BoNho).filter(Boolean))];
  
  // Get unique color options with prices
  const colorOptions = allSpecs.reduce((acc, spec) => {
    if (spec.MauSac && !acc.find(c => c.color === spec.MauSac)) {
      acc.push({ color: spec.MauSac, price: spec.GiaBan, spec });
    }
    return acc;
  }, []);

  const currentImage = mediaList[selectedImage]?.DuongDanFile 
    ? `${API_URL}${mediaList[selectedImage].DuongDanFile}`
    : "https://via.placeholder.com/600x600?text=No+Image";

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Đang tải thông tin sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-500">
          <span className="text-6xl mb-4 block">❌</span>
          <p className="text-xl font-medium">Lỗi: {error}</p>
        </div>
      </div>
    );
  }

  if (!selectedSpec) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500 text-lg">Không tìm thấy thông tin sản phẩm.</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gray-50 min-h-screen">
        {/* Breadcrumb */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-3">
            <nav className="text-sm text-gray-500">
              <span className="hover:text-red-600 cursor-pointer" onClick={() => history.push("/")}>Trang chủ</span>
              <span className="mx-2">/</span>
              <span className="hover:text-red-600 cursor-pointer">Điện thoại</span>
              <span className="mx-2">/</span>
              <span className="text-gray-800 font-medium">{selectedSpec.TenSP || product?.TenSP}</span>
            </nav>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left Column - Product Gallery */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              {/* Main Image */}
              <div className="relative mb-4 bg-gray-50 rounded-xl p-4 group overflow-hidden">
                <img
                  src={currentImage}
                  alt={selectedSpec.TenSP || "Sản phẩm"}
                  className="w-full h-[400px] object-contain transition-transform duration-500 group-hover:scale-110"
                  onError={e => (e.target.src = "https://via.placeholder.com/600x600?text=No+Image")}
                />
                {/* Navigation Arrows */}
                {mediaList.length > 1 && (
                  <>
                    <button 
                      onClick={() => setSelectedImage(prev => prev > 0 ? prev - 1 : mediaList.length - 1)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full shadow-lg flex items-center justify-center hover:bg-white transition opacity-0 group-hover:opacity-100"
                    >
                      ❮
                    </button>
                    <button 
                      onClick={() => setSelectedImage(prev => prev < mediaList.length - 1 ? prev + 1 : 0)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full shadow-lg flex items-center justify-center hover:bg-white transition opacity-0 group-hover:opacity-100"
                    >
                      ❯
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {mediaList.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {mediaList.map((media, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg border-2 overflow-hidden transition ${
                        selectedImage === index ? 'border-red-500' : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <img
                        src={`${API_URL}${media.DuongDanFile}`}
                        alt={`Ảnh ${index + 1}`}
                        className="w-full h-full object-contain"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Feature Highlights */}
              <div className="mt-6 border-t pt-6">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="text-red-500">✨</span> Tính năng nổi bật
                </h3>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Màn hình {selectedSpec.KichThuoc || "đẹp"} - {selectedSpec.PhienBan || "Super Retina"}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Camera {selectedSpec.Camera || "chuyên nghiệp"}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Chip {selectedSpec.Chitset || "mạnh mẽ"} - Hiệu năng vượt trội</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Pin {selectedSpec.Pin || "dung lượng lớn"} - Sử dụng cả ngày</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right Column - Product Info */}
            <div className="space-y-4">
              {/* Product Title */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                  {selectedSpec.TenSP || product?.TenSP}
                </h1>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <span className="text-yellow-400">★★★★★</span>
                    <span>(Đánh giá)</span>
                  </span>
                  <span>|</span>
                  <span className="text-blue-600 hover:underline cursor-pointer">So sánh</span>
                </div>
              </div>

              {/* Price Section */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="text-3xl lg:text-4xl font-extrabold text-red-600">
                    {new Intl.NumberFormat("vi-VN").format(selectedSpec.GiaBan)}₫
                  </span>
                  {selectedSpec.GiaBan && (
                    <span className="text-lg text-gray-400 line-through">
                      {new Intl.NumberFormat("vi-VN").format(Number(selectedSpec.GiaBan) * 1.1)}₫
                    </span>
                  )}
                  <span className="bg-red-100 text-red-600 text-sm font-bold px-2 py-1 rounded">
                    -10%
                  </span>
                </div>

                {/* Storage Options */}
                {storageOptions.length > 1 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Dung lượng:</p>
                    <div className="flex flex-wrap gap-2">
                      {storageOptions.map((storage, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            const spec = allSpecs.find(s => s.BoNho === storage);
                            if (spec) setSelectedSpec(spec);
                          }}
                          className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition ${
                            selectedSpec.BoNho === storage
                              ? 'border-red-500 bg-red-50 text-red-600'
                              : 'border-gray-200 hover:border-gray-400 text-gray-700'
                          }`}
                        >
                          {storage}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Color Options */}
                {colorOptions.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Màu sắc: <span className="text-red-600">{selectedSpec.MauSac}</span></p>
                    <div className="flex flex-wrap gap-2">
                      {colorOptions.map((option, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedSpec(option.spec)}
                          className={`px-4 py-2 rounded-lg border-2 text-sm transition ${
                            selectedSpec.MauSac === option.color
                              ? 'border-red-500 bg-red-50'
                              : 'border-gray-200 hover:border-gray-400'
                          }`}
                        >
                          <span className="font-medium text-gray-800">{option.color}</span>
                          <div className="text-xs text-gray-500">
                            {new Intl.NumberFormat("vi-VN").format(option.price)}₫
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Promotions Box */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-green-200">
                <h3 className="font-bold text-green-700 mb-3 flex items-center gap-2">
                  <span>🎁</span> Khuyến mãi
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2 text-gray-700">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Giảm đến <strong className="text-red-600">500.000đ</strong> khi thanh toán qua VNPAY-QR</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-700">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Trả góp <strong className="text-red-600">0%</strong> lãi suất qua thẻ tín dụng</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-700">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Tặng kèm <strong>ốp lưng chính hãng</strong> trị giá 500.000đ</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-700">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Bảo hành chính hãng <strong>12 tháng</strong></span>
                  </li>
                </ul>
              </div>

              {/* Buy Buttons */}
              <div className="bg-white rounded-2xl p-6 shadow-sm space-y-3">
                <button 
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className="w-full bg-red-600 text-white font-bold py-4 rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-200 text-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {addingToCart ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">⏳</span> Đang thêm...
                    </span>
                  ) : (
                    <span>MUA NGAY</span>
                  )}
                </button>
                
                <div className="grid grid-cols-2 gap-3">
                  <button className="bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-all text-sm">
                    <div>TRẢ GÓP 0%</div>
                    <div className="text-xs font-normal opacity-80">Duyệt nhanh qua điện thoại</div>
                  </button>
                  <button 
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                    className="border-2 border-red-600 text-red-600 font-bold py-3 rounded-xl hover:bg-red-50 transition-all text-sm disabled:opacity-50"
                  >
                    <div>🛒 THÊM VÀO GIỎ</div>
                    <div className="text-xs font-normal">Mua sau</div>
                  </button>
                </div>
              </div>

              {/* Quick Info */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="grid grid-cols-3 gap-4 text-center text-sm">
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <div className="text-2xl mb-1">🚚</div>
                    <div className="font-medium text-gray-800">Giao hàng</div>
                    <div className="text-xs text-gray-500">Miễn phí</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <div className="text-2xl mb-1">✅</div>
                    <div className="font-medium text-gray-800">Chính hãng</div>
                    <div className="text-xs text-gray-500">100%</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <div className="text-2xl mb-1">🔄</div>
                    <div className="font-medium text-gray-800">Đổi trả</div>
                    <div className="text-xs text-gray-500">30 ngày</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Specs Section */}
          <div className="mt-8 bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="text-red-500">📋</span> Thông số kỹ thuật
            </h2>
            <div className="overflow-hidden rounded-xl border border-gray-200">
              <table className="w-full">
                <tbody>
                  {[
                    { label: "Màn hình", value: `${selectedSpec.PhienBan || ""} ${selectedSpec.KichThuoc ? `(${selectedSpec.KichThuoc})` : ""}`.trim() || "Đang cập nhật" },
                    { label: "Hệ điều hành", value: selectedSpec.HeDieuHanh || "Đang cập nhật" },
                    { label: "Chip xử lý", value: selectedSpec.Chitset || "Đang cập nhật" },
                    { label: "RAM", value: selectedSpec.RAM || "Đang cập nhật" },
                    { label: "Bộ nhớ trong", value: selectedSpec.BoNho || "Đang cập nhật" },
                    { label: "Camera sau", value: selectedSpec.Camera || "Đang cập nhật" },
                    { label: "Camera trước", value: selectedSpec.CameraTruoc || "Đang cập nhật" },
                    { label: "Pin", value: selectedSpec.Pin === "string" ? "Đang cập nhật" : selectedSpec.Pin || "Đang cập nhật" },
                    { label: "Thẻ SIM", value: selectedSpec.TheSim || "Đang cập nhật" },
                    { label: "Màu sắc", value: selectedSpec.MauSac || "Đang cập nhật" },
                  ].map((item, index) => (
                    <tr
                      key={index}
                      className={`${index % 2 === 0 ? "bg-gray-50" : "bg-white"} border-b border-gray-100 last:border-0`}
                    >
                      <td className="px-6 py-4 font-medium text-gray-600 w-1/3">{item.label}</td>
                      <td className="px-6 py-4 text-gray-800">{item.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Back Button */}
          <div className="mt-6">
            <button
              onClick={() => history.goBack()}
              className="flex items-center gap-2 px-6 py-3 bg-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-300 transition"
            >
              <span>←</span> Quay lại
            </button>
          </div>
        </div>
      </div>
      <Footer isLoggedIn={isLoggedIn} />
    </>
  );
};

export default ProductDetail;