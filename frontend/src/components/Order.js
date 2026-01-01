import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { API_URL } from "../config";

const Order = ({ isLoggedIn, userInfo, onLogout }) => {
  const history = useHistory();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const [productSpecs, setProductSpecs] = useState({});
  const [productMedia, setProductMedia] = useState({});
  const [userDetails, setUserDetails] = useState(null);
  const [productNames, setProductNames] = useState({});

  useEffect(() => {
    if (!isLoggedIn) {
      history.push("/login");
      return;
    }
    fetchUserDetails();
    fetchOrders();
  }, [isLoggedIn, history]);

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

  const fetchOrders = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      history.push("/login");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/orders/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data);

        // Fetch thông số kỹ thuật cho tất cả sản phẩm
        if (data.length > 0) {
          await fetchAllProductDetails(data);
        }
      } else {
        console.error("Không thể tải đơn hàng");
      }
    } catch (error) {
      console.error("Lỗi khi tải đơn hàng:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllProductDetails = async (orders) => {
    const specs = {};
    const media = {};
    const names = {};

    // Lấy tất cả items từ tất cả orders (chitiets hoặc items tùy backend)
    const allItems = orders.flatMap(order => order.chitiets || order.items || []);

    await Promise.all(
      allItems.map(async (item) => {
        if (!item.MaSP) return;

        try {
          const productResponse = await fetch(
            `${API_URL}/products/${item.MaSP}`
          );
          if (productResponse.ok) {
            const productData = await productResponse.json();
            names[item.MaSP] = productData.TenSP;
            console.log(`✅ Product name for ${item.MaSP}:`, productData.TenSP);
          }
          // Fetch thông số kỹ thuật
          const specResponse = await fetch(
            `${API_URL}/products/${item.MaSP}/thong_so`
          );
          if (specResponse.ok) {
            const specData = await specResponse.json();
            const specKey = item.MaTSKT
              ? `${item.MaSP}-${item.MaTSKT}`
              : `${item.MaSP}-null`;
            if (item.MaTSKT && Array.isArray(specData)) {
              const matchedSpec = specData.find(s => s.MaTSKT === item.MaTSKT);
              specs[specKey] = matchedSpec || specData[0];
            } else {
              specs[specKey] = Array.isArray(specData)
                ? specData.find(s => s.GiaBan && s.GiaBan !== "0.00") || specData[0]
                : specData;
            }
          }

          // Fetch media (ảnh)
          const mediaResponse = await fetch(
            `${API_URL}/products/${item.MaSP}/media`
          );
          if (mediaResponse.ok) {
            const mediaData = await mediaResponse.json();
            media[item.MaSP] = mediaData;
          }
        } catch (error) {
          console.error(`Lỗi khi tải thông tin sản phẩm ${item.MaSP}:`, error);
        }
      })
    );
    setProductNames(names);
    setProductSpecs(specs);
    setProductMedia(media);
  };

  const toggleOrderDetails = (orderId) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const getStatusText = (status) => {
    const statusMap = {
      pending: "Chờ xác nhận",
      confirmed: "Đã xác nhận",
      shipping: "Đang giao hàng",
      completed: "Đã giao hàng",
      cancelled: "Đã hủy",
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      confirmed: "bg-blue-100 text-blue-800 border-blue-200",
      shipping: "bg-purple-100 text-purple-800 border-purple-200",
      completed: "bg-green-100 text-green-800 border-green-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
    };
    return colorMap[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">📦 Đơn hàng của tôi</h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Chưa có đơn hàng nào
            </h2>
            <p className="text-gray-600 mb-6">
              Bạn chưa có đơn hàng nào. Hãy mua sắm ngay!
            </p>
            <button
              onClick={() => history.push("/")}
              className="px-6 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition"
            >
              Tiếp tục mua sắm
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const orderItems = order.chitiets || order.items || [];

              return (
                <div
                  key={order.MaDH}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                >
                  {/* Header đơn hàng */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-lg text-gray-800">
                          Đơn hàng #{order.MaDH}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Ngày đặt: {new Date(order.NgayDat).toLocaleString("vi-VN")}
                        </p>
                      </div>
                      <span
                        className={`px-4 py-2 rounded-full text-sm font-bold border ${getStatusColor(
                          order.TrangThaiDH
                        )}`}
                      >
                        {getStatusText(order.TrangThaiDH)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600">
                          Số lượng: <span className="font-bold">{orderItems.length} sản phẩm</span>
                        </p>
                        <p className="text-sm text-gray-600">
                          Tổng tiền: <span className="font-bold text-red-600 text-lg">
                            {Number(order.TongTien || 0).toLocaleString("vi-VN")}₫
                          </span>
                        </p>
                      </div>

                      <button
                        onClick={() => toggleOrderDetails(order.MaDH)}
                        className="px-4 py-2 text-sm font-bold text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      >
                        {expandedOrders.has(order.MaDH) ? "Ẩn chi tiết ▲" : "Xem chi tiết ▼"}
                      </button>
                    </div>
                  </div>

                  {/* Chi tiết đơn hàng */}
                  {expandedOrders.has(order.MaDH) && (
                    <div className="p-6 bg-gray-50 space-y-6">
                      {/* Thông tin người nhận */}
                      {userDetails?.thongtin && (
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <span>📍</span> Thông tin người nhận
                          </h4>
                          <div className="space-y-2 text-sm">
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

                      {/* Danh sách sản phẩm - GIỐNG CART.JS */}
                      {orderItems.length > 0 ? (
                        <div className="space-y-3">
                          <h4 className="font-bold text-gray-800 flex items-center gap-2">
                            <span>📦</span> Sản phẩm trong đơn hàng
                          </h4>
                          {orderItems.map((item, index) => {
                            const specKey = item.MaTSKT ? `${item.MaSP}-${item.MaTSKT}` : `${item.MaSP}-null`;
                            const spec = productSpecs[specKey];
                            const images = productMedia[item.MaSP];
                            const imageUrl = images?.[0]?.DuongDanFile
                              ? `${API_URL}${images[0].DuongDanFile}`
                              : "https://via.placeholder.com/150?text=No+Image";

                            return (
                              <div
                                key={index}
                                className="bg-white rounded-lg p-4 flex items-center gap-4 border border-gray-200"
                              >
                                <img
                                  src={imageUrl}
                                  alt={spec?.TenSP || "Sản phẩm"}
                                  className="w-20 h-20 object-contain rounded-lg border border-gray-200"
                                />

                                <div className="flex-1">
                                  <p className="font-semibold text-gray-800 mb-1">
                                    {productNames[item.MaSP] || spec?.TenSP || `Sản phẩm #${item.MaSP}`}
                                  </p>
                                  {spec && (
                                    <p className="text-sm text-gray-600 mb-2">
                                      {spec.RAM} | {spec.BoNho} - {spec.MauSac}
                                    </p>
                                  )}
                                  <div className="flex gap-4 text-sm text-gray-600">
                                    <p>Số lượng: <span className="font-semibold">{item.SoLuong}</span></p>
                                    <p>Đơn giá: <span className="font-semibold text-red-600">
                                      {Number(spec?.GiaBan || item.DonGia || 0).toLocaleString("vi-VN")}₫
                                    </span></p>
                                  </div>
                                </div>

                                <div className="text-right">
                                  <p className="text-sm text-gray-500 mb-1">Thành tiền</p>
                                  <p className="font-bold text-red-600 text-lg">
                                    {Number((spec?.GiaBan || item.DonGia || 0) * item.SoLuong).toLocaleString("vi-VN")}₫
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-4">
                          Không có thông tin chi tiết sản phẩm
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer isLoggedIn={isLoggedIn} />
    </div>
  );
};

export default Order;