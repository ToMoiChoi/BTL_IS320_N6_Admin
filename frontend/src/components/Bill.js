import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import Footer from "./Footer";
import { API_URL } from "../config";

const Bill = ({ isLoggedIn }) => {
  const history = useHistory();
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [productSpecs, setProductSpecs] = useState({});
  const [productMedia, setProductMedia] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) {
      history.push("/login");
      return;
    }
    fetchUserDetails();
    fetchOrderDetails();
  }, [isLoggedIn, orderId, history]);

  const fetchUserDetails = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/users/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserDetails(data);
      }
    } catch (error) {
      console.error("Lỗi khi tải thông tin người dùng:", error);
    }
  };

  const fetchOrderDetails = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      history.push("/login");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/orders/${orderId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("📄 Bill data:", data);
        console.log("📄 Items:", data.items || data.chitiets); 
        setOrder(data);

        // ← SỬA: Lấy orderItems từ data, KHÔNG phải từ state
        const orderItems = data.items || data.chitiets || [];
        console.log("📦 Order items to fetch:", orderItems); 

        if (orderItems.length > 0) {
          await fetchProductDetails(orderItems);
        } else {
          console.warn("⚠️ No items found in order!");
        }
      } else {
        alert("Không thể tải thông tin đơn hàng");
        history.push("/orders");
      }
    } catch (error) {
      console.error("Lỗi khi tải đơn hàng:", error);
      history.push("/orders");
    } finally {
      setLoading(false);
    }
  };

  const fetchProductDetails = async (items) => {
    const specs = {};
    const media = {};

    await Promise.all(
      items.map(async (item) => {
        if (!item.MaSP) return;

        try {
          // Fetch specs
          const specResponse = await fetch(
            `${API_URL}/products/${item.MaSP}/thong_so`
          );
          if (specResponse.ok) {
            const specData = await specResponse.json();
            console.log(`✅ Spec data for ${item.MaSP}:`, specData);
            if (item.MaTSKT && Array.isArray(specData)) {
              const matchedSpec = specData.find((s) => s.MaTSKT === item.MaTSKT);
              specs[`${item.MaSP}-${item.MaTSKT}`] = matchedSpec || specData[0];
            } else {
              const key = item.MaTSKT ? `${item.MaSP}-${item.MaTSKT}` : item.MaSP;
              specs[key] = Array.isArray(specData)
                ? specData.find((s) => s.GiaBan && s.GiaBan !== "0.00") || specData[0]
                : specData;
            }
          }

          // Fetch media
          const mediaResponse = await fetch(
            `${API_URL}/products/${item.MaSP}/media`
          );
          if (mediaResponse.ok) {
            const mediaData = await mediaResponse.json();
            media[item.MaSP] = mediaData;
          }
        } catch (error) {
          console.error(`Lỗi khi tải sản phẩm ${item.MaSP}:`, error);
        }
      })
    );

    setProductSpecs(specs);
    setProductMedia(media);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Không tìm thấy đơn hàng
            </h2>
            <button
              onClick={() => history.push("/orders")}
              className="px-6 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition"
            >
              Quay lại danh sách đơn hàng
            </button>
          </div>
        </main>
        <Footer isLoggedIn={isLoggedIn} />
      </div>
    );
  }

  const orderItems = order.items || order.chitiets || [];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-lg border-2 border-red-200 p-8 mb-6">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-red-600 mb-2">
                ✅ ĐẶT HÀNG THÀNH CÔNG!
              </h1>
              <p className="text-gray-600">
                Cảm ơn bạn đã đặt hàng tại cửa hàng của chúng tôi
              </p>
            </div>

            <div className="border-t-2 border-dashed border-gray-300 pt-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Mã đơn hàng</p>
                  <p className="text-xl font-bold text-gray-800">#{order.MaDH}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Ngày đặt</p>
                  <p className="font-bold text-gray-800">
                    {new Date(order.NgayDat).toLocaleString("vi-VN")}
                  </p>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-yellow-800">
                  🕒 Trạng thái: Chờ xác nhận
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  Đơn hàng của bạn đang được xử lý. Chúng tôi sẽ liên hệ sớm nhất!
                </p>
              </div>
            </div>
          </div>

          {/* Thông tin người nhận */}
          {userDetails?.thongtin && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
              <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                <span>📍</span> Thông tin người nhận
              </h3>
              <div className="space-y-2">
                <p className="text-gray-700">
                  <span className="font-semibold">Họ tên:</span>{" "}
                  {userDetails.thongtin.HoTen || "Chưa cập nhật"}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Số điện thoại:</span>{" "}
                  {userDetails.thongtin.SoDienThoai || "Chưa cập nhật"}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Địa chỉ:</span>{" "}
                  {userDetails.thongtin.DiaChi || "Chưa cập nhật"}
                </p>
              </div>
            </div>
          )}

          {/* Danh sách sản phẩm */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
              <span>📦</span> Danh sách sản phẩm
            </h3>
            <div className="space-y-3">
              {orderItems.map((item, index) => {
                const specKey = item.MaTSKT
                  ? `${item.MaSP}-${item.MaTSKT}`
                  : item.MaSP;
                const spec = productSpecs[specKey];
                const images = productMedia[item.MaSP];
                const imageUrl = images?.[0]?.DuongDanFile
                  ? `${API_URL}${images[0].DuongDanFile}`
                  : "https://via.placeholder.com/150?text=No+Image";
                console.log(`🎨 Rendering item ${index}:`, {
                  item,
                  specKey,
                  spec,
                  images,
                  imageUrl
                }); // ← DEBUG

                return (
                  <div
                    key={index}
                    className="flex items-center gap-4 border-b border-gray-100 pb-3 last:border-b-0"
                  >
                    <img
                      src={imageUrl}
                      alt={spec?.TenSP || "Sản phẩm"}
                      className="w-16 h-16 object-contain rounded-lg border border-gray-200"
                      onError={(e) => {
                        console.error("❌ Image load error:", imageUrl);
                        e.target.src = "https://via.placeholder.com/150?text=No+Image";
                      }}
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">
                        {spec?.TenSP || `Sản phẩm #${item.MaSP}`}
                      </p>
                      {spec && spec.RAM && spec.BoNho && spec.MauSac && (
                        <p className="text-xs text-gray-600">
                          {spec.RAM} | {spec.BoNho} - {spec.MauSac}
                        </p>
                      )}
                      <p className="text-sm text-gray-600 mt-1">
                        SL: {item.SoLuong} × {Number(item.DonGia || 0).toLocaleString("vi-VN")}₫
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600">
                        {Number((item.DonGia || 0) * item.SoLuong).toLocaleString("vi-VN")}₫
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tổng tiền */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="space-y-3">
              <div className="flex justify-between text-gray-700">
                <span>Tổng tiền hàng:</span>
                <span className="font-bold">
                  {Number(order.TongTien || 0).toLocaleString("vi-VN")}₫
                </span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Giảm giá:</span>
                <span className="font-bold text-green-600">
                  -{Number(order.GiamGia || 0).toLocaleString("vi-VN")}₫
                </span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Phí vận chuyển:</span>
                <span className="font-bold text-green-600">Miễn phí</span>
              </div>
              <hr className="border-gray-300" />
              <div className="flex justify-between text-xl font-bold">
                <span>THÀNH TIỀN:</span>
                <span className="text-red-600">
                  {Number(order.ThanhTien || 0).toLocaleString("vi-VN")}₫
                </span>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => history.push("/orders")}
              className="flex-1 bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition"
            >
              Xem đơn hàng của tôi
            </button>
            <button
              onClick={() => history.push("/")}
              className="flex-1 border border-gray-300 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-50 transition"
            >
              Tiếp tục mua sắm
            </button>
          </div>
        </div>
      </main>

      <Footer isLoggedIn={isLoggedIn} />
    </div>
  );
};

export default Bill;