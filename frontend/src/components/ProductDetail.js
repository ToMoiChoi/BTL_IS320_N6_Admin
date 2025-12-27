import React, { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import Footer from "./Footer";
import { API_URL } from "../config";

const ProductDetail = ({ isLoggedIn }) => {
  const { productId } = useParams();
  const history = useHistory();
  const [specs, setSpecs] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const fetchSpecsAndImage = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${API_URL}/products/${productId}/thong_so`
        );
        if (!response.ok) {
          throw new Error("Không thể tải thông số kỹ thuật sản phẩm");
        }
        const data = await response.json();
        let spec = Array.isArray(data) ? data.find(s => s && s.GiaBan && s.GiaBan !== "0.00") || data[0] : data;
        setSpecs(spec);

        const mediaRes = await fetch(`${API_URL}/products/${productId}/media`);
        if (mediaRes.ok) {
          const mediaData = await mediaRes.json();
          if (Array.isArray(mediaData) && mediaData.length > 0) {
            setImageUrl(`${API_URL}${mediaData[0].DuongDanFile}`);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchSpecsAndImage();
    }
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
          MaTSKT: specs?.MaTSKT || null, // Nếu có thông số kỹ thuật cụ thể
          SoLuongSanPham: 1
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert("✅ Đã thêm sản phẩm vào giỏ hàng!");
        // Có thể chuyển hướng đến giỏ hàng hoặc cập nhật số lượng ở header
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

  if (loading)
    return (
      <div className="text-center py-20 font-medium text-gray-600">
        Đang tải cấu hình chi tiết...
      </div>
    );
  if (error)
    return <div className="text-center py-20 text-red-500">Lỗi: {error}</div>;
  if (!specs)
    return (
      <div className="text-center py-20 text-gray-500">
        Không tìm thấy thông số kỹ thuật.
      </div>
    );

  return (
    <>
      <div className="bg-white min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Cột trái: Hình ảnh */}
            <div className="flex flex-col items-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                {specs.TenSP}
              </h2>
              <div className="w-full max-w-md bg-gray-50 rounded-2xl p-8 border border-gray-100 shadow-sm">
                <img
                  src={imageUrl || "https://via.placeholder.com/600x600?text=No+Image"}
                  alt="Sản phẩm"
                  className="w-full h-auto object-contain transition-transform hover:scale-105 duration-500"
                  onError={e => (e.target.src = "https://via.placeholder.com/600x600?text=No+Image")}
                />
              </div>
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500 italic font-medium">
                  Màu sắc: {specs.MauSac}
                </p>
              </div>
            </div>

            {/* Cột phải: Thông số kỹ thuật */}
            <div className="flex flex-col">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Thông số kỹ thuật
              </h1>
              <div className="mb-6">
                <span className="text-3xl font-extrabold text-red-600">
                  {new Intl.NumberFormat("vi-VN").format(specs.GiaBan)}₫
                </span>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                  <tbody>
                    {[
                      {
                        label: "Màn hình",
                        value: `${specs.PhienBan} (${specs.KichThuoc})`,
                      },
                      { label: "Chipset", value: specs.Chitset },
                      { label: "RAM", value: specs.RAM },
                      { label: "Bộ nhớ trong", value: specs.BoNho },
                      { label: "Hệ điều hành", value: specs.HeDieuHanh },
                      { label: "Thẻ Sim", value: specs.TheSim },
                      {
                        label: "Pin",
                        value:
                          specs.Pin === "string" ? "Đang cập nhật" : specs.Pin,
                      },
                      { label: "Camera", value: specs.Camera },
                    ].map((item, index) => (
                      <tr
                        key={index}
                        className={`${index % 2 === 0 ? "bg-gray-50" : "bg-white"
                          } border-b border-gray-100 last:border-0`}
                      >
                        <td className="px-4 py-3 font-semibold text-gray-600 w-1/3">
                          {item.label}
                        </td>
                        <td className="px-4 py-3 text-gray-800">{item.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Nút Thêm vào giỏ hàng */}
              <button
                onClick={handleAddToCart}
                disabled={addingToCart}
                className="mt-6 w-full bg-orange-500 text-white font-bold py-4 rounded-xl hover:bg-orange-600 transition-colors shadow-lg shadow-orange-200 uppercase tracking-wider disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {addingToCart ? "Đang thêm..." : "🛒 Thêm vào giỏ hàng"}
              </button>

              {/* Nút Mua ngay */}
              <button className="mt-4 w-full bg-red-600 text-white font-bold py-4 rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-200 uppercase tracking-wider">
                Mua Ngay
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer isLoggedIn={isLoggedIn} />
    </>
  );
};

export default ProductDetail;