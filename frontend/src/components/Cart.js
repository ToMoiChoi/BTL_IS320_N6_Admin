import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

const Cart = ({ isLoggedIn, userInfo, onLogout }) => {
  const history = useHistory();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [productSpecs, setProductSpecs] = useState({});
  const [userMe, setUserMe] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    HoTen: "",
    SoDienThoai: "",
    DiaChi: ""
  });

  useEffect(() => {
    if (!isLoggedIn) {
      history.push("/login");
      return;
    }
    fetchUserInfo();
    fetchCart();
  }, [isLoggedIn, history]);

  const fetchUserInfo = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      history.push("/login");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/users/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserMe(data);
      }
    } catch (error) {
      console.error("Lỗi khi tải thông tin người dùng:", error);
    }
  };

  const fetchCart = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      history.push("/login");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/cart", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCart(data);
        
        if (data.items && data.items.length > 0) {
          await fetchProductSpecs(data.items);
        }
      } else {
        console.error("Không thể tải giỏ hàng");
      }
    } catch (error) {
      console.error("Lỗi khi tải giỏ hàng:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductSpecs = async (items) => {
    const specs = {};
    
    await Promise.all(
      items.map(async (item) => {
        try {
          const response = await fetch(
            `http://127.0.0.1:8000/products/${item.MaSP}/thong_so`
          );
          if (response.ok) {
            const data = await response.json();
            if (item.MaTSKT && Array.isArray(data)) {
              const matchedSpec = data.find(s => s.MaTSKT === item.MaTSKT);
              specs[item.MaSP] = matchedSpec || data[0];
            } else {
              specs[item.MaSP] = Array.isArray(data) 
                ? data.find(s => s.GiaBan && s.GiaBan !== "0.00") || data[0]
                : data;
            }
          }
        } catch (error) {
          console.error(`Lỗi khi tải thông số sản phẩm ${item.MaSP}:`, error);
        }
      })
    );
    
    setProductSpecs(specs);
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    setUpdating(true);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`http://127.0.0.1:8000/cart/items/${itemId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ SoLuongSanPham: newQuantity }),
      });

      if (response.ok) {
        await fetchCart();
      } else {
        alert("Không thể cập nhật số lượng");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật:", error);
    } finally {
      setUpdating(false);
    }
  };

  const removeItem = async (itemId) => {
    if (!window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;
    setUpdating(true);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`http://127.0.0.1:8000/cart/items/${itemId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        await fetchCart();
        alert("Đã xóa sản phẩm khỏi giỏ hàng");
      } else {
        alert("Không thể xóa sản phẩm");
      }
    } catch (error) {
      console.error("Lỗi khi xóa:", error);
    } finally {
      setUpdating(false);
    }
  };

  const checkUserInfoComplete = () => {
    const hoTen = userMe?.thongtin?.HoTen || "";
    const soDienThoai = userMe?.thongtin?.SoDienThoai || "";
    const diaChi = userMe?.thongtin?.DiaChi || "";

    // Kiểm tra nếu có giá trị rỗng hoặc giá trị mặc định
    if (!hoTen || hoTen === "User" || hoTen === "Chưa cập nhật" ||
        !soDienThoai || soDienThoai === "Chưa cập nhật" || soDienThoai === "Chưa cập nhật số điện thoại" ||
        !diaChi || diaChi === "Chưa cập nhật" || diaChi === "Chưa cập nhật địa chỉ") {
      return false;
    }
    return true;
  };

  const openUpdateModal = () => {
    setUpdateForm({
      HoTen: userMe?.thongtin?.HoTen || "",
      SoDienThoai: userMe?.thongtin?.SoDienThoai || "",
      DiaChi: userMe?.thongtin?.DiaChi || ""
    });
    setShowUpdateModal(true);
  };

  const closeUpdateModal = () => {
    setShowUpdateModal(false);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!updateForm.HoTen.trim() || !updateForm.SoDienThoai.trim() || !updateForm.DiaChi.trim()) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    setUpdating(true);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("http://127.0.0.1:8000/users/me", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateForm),
      });

      if (response.ok) {
        const updatedData = await response.json();
        setUserMe(updatedData);
        setShowUpdateModal(false);
        alert("Cập nhật thông tin thành công!");
      } else {
        const error = await response.json();
        alert(`Lỗi: ${error.detail || "Không thể cập nhật"}`);
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật:", error);
      alert("Không thể kết nối đến server");
    } finally {
      setUpdating(false);
    }
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      alert("Giỏ hàng trống!");
      return;
    }

    // Kiểm tra thông tin người nhận
    if (!checkUserInfoComplete()) {
      openUpdateModal();
      return;
    }

    const token = localStorage.getItem("token");
    
    const orderData = {
      items: cartItems.map(item => ({
        MaSP: item.MaSP,
        SoLuong: item.SoLuongSanPham,
        MaTSKT: item.MaTSKT || 0
      })),
      GiamGia: 0
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/orders", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("✅ Order created:", result);
        await clearCart(token);
        history.push(`/bill/${result.MaDH}`);
      } else {
        const error = await response.json();
        alert(`Lỗi: ${error.detail || "Không thể đặt hàng"}`);
      }
    } catch (error) {
      console.error("Lỗi khi đặt hàng:", error);
      alert("Không thể kết nối đến server");
    }
  };
  const clearCart = async (token) => {
    try {
      // Xóa từng sản phẩm trong giỏ hàng
      await Promise.all(
        cartItems.map(async (item) => {
          await fetch(`http://127.0.0.1:8000/cart/items/${item.MaCTGH}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
        })
      );
      console.log("✅ Cart cleared successfully");
    } catch (error) {
      console.error("⚠️ Lỗi khi xóa giỏ hàng:", error);
      // Không hiển thị alert vì đơn hàng đã tạo thành công
    }
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const cartItems = cart?.items || [];
  
  const totalAmount = cartItems.reduce((sum, item) => {
    const spec = productSpecs[item.MaSP];
    const price = spec?.GiaBan || item.sanpham?.GiaBan || 0;
    return sum + Number(price) * item.SoLuongSanPham;
  }, 0);

  const isUserInfoComplete = checkUserInfoComplete();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">🛒 Giỏ hàng của bạn</h1>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Giỏ hàng trống</h2>
            <p className="text-gray-600 mb-6">Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm</p>
            <button
              onClick={() => history.push("/")}
              className="px-6 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition"
            >
              Tiếp tục mua sắm
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Danh sách sản phẩm */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => {
                const product = item.sanpham;
                const spec = productSpecs[item.MaSP];
                const imageUrl = product?.media?.[0]?.DuongDanFile
                  ? `http://127.0.0.1:8000${product.media[0].DuongDanFile}`
                  : "https://via.placeholder.com/150?text=No+Image";

                return (
                  <div
                    key={item.MaCTGH}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex gap-6 items-center"
                  >
                    <img    
                      src={imageUrl}
                      alt={product?.TenSP || "Sản phẩm"}
                      className="w-24 h-24 object-contain rounded-lg border border-gray-200"
                    />

                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-800 mb-2">
                        {product?.TenSP || "Tên sản phẩm"}  
                      </h3>
                      <p className="text-red-600 font-bold text-xl">
                        {Number(spec?.GiaBan || 0).toLocaleString("vi-VN")}₫
                      </p>
                      {spec && (
                        <p className="text-sm text-gray-600 mt-1">
                          {spec.RAM} | {spec.BoNho} - {spec.MauSac}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateQuantity(item.MaCTGH, item.SoLuongSanPham - 1)}
                        disabled={updating || item.SoLuongSanPham <= 1}
                        className="w-8 h-8 bg-gray-200 rounded-lg font-bold hover:bg-gray-300 transition disabled:opacity-50"
                      >
                        −
                      </button>
                      <span className="w-12 text-center font-bold">{item.SoLuongSanPham}</span>
                      <button
                        onClick={() => updateQuantity(item.MaCTGH, item.SoLuongSanPham + 1)}
                        disabled={updating}
                        className="w-8 h-8 bg-gray-200 rounded-lg font-bold hover:bg-gray-300 transition disabled:opacity-50"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.MaCTGH)}
                      disabled={updating}
                      className="text-red-600 hover:text-red-800 font-bold text-2xl disabled:opacity-50"
                      title="Xóa sản phẩm"
                    >
                      🗑️
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Thông tin người nhận và Tóm tắt đơn hàng */}
            <div className="lg:col-span-1 space-y-4">
              {/* Thông tin người nhận */}
              {userMe && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                      <span>📍</span> Thông tin người nhận
                    </h3>
                    <button
                      onClick={openUpdateModal}
                      className="text-sm text-red-600 hover:text-red-700 font-semibold"
                    >
                      Sửa
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Tên người nhận</p>
                      <p className="text-sm font-semibold text-gray-800">
                        {userMe.thongtin?.HoTen || "Chưa cập nhật"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Số điện thoại</p>
                      <p className="text-sm font-semibold text-gray-800">
                        {userMe.thongtin?.SoDienThoai || "Chưa cập nhật"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Địa chỉ nhận hàng</p>
                      <p className="text-sm font-semibold text-gray-800">
                        {userMe.thongtin?.DiaChi || "Chưa cập nhật"}
                      </p>
                    </div>
                  </div>

                  {!isUserInfoComplete && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-xs text-yellow-800 font-semibold">
                        ⚠️ Vui lòng cập nhật đầy đủ thông tin để tiếp tục thanh toán
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Tóm tắt đơn hàng */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Tóm tắt đơn hàng</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Tạm tính ({cartItems.length} sản phẩm)</span>
                    <span className="font-bold">{totalAmount.toLocaleString("vi-VN")}₫</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Phí vận chuyển</span>
                    <span className="font-bold text-green-600">Miễn phí</span>
                  </div>
                  <hr className="border-gray-200" />
                  <div className="flex justify-between text-lg font-bold text-gray-800">
                    <span>Tổng cộng</span>
                    <span className="text-red-600">{totalAmount.toLocaleString("vi-VN")}₫</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={!isUserInfoComplete}
                  className={`w-full font-bold py-3 rounded-lg transition shadow-lg ${
                    isUserInfoComplete
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {isUserInfoComplete ? "Tiến hành thanh toán" : "Cập nhật thông tin để thanh toán"}
                </button>

                <button
                  onClick={() => history.push("/")}
                  className="w-full mt-3 border border-gray-300 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-50 transition"
                >
                  Tiếp tục mua sắm
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal cập nhật thông tin */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
            <button
              onClick={closeUpdateModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>

            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Cập nhật thông tin nhận hàng
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Vui lòng cập nhật đầy đủ thông tin để tiếp tục thanh toán
            </p>

            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tên người nhận <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={updateForm.HoTen}
                  onChange={(e) => setUpdateForm({...updateForm, HoTen: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Nhập tên của bạn"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={updateForm.SoDienThoai}
                  onChange={(e) => setUpdateForm({...updateForm, SoDienThoai: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Nhập số điện thoại"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Địa chỉ nhận hàng <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={updateForm.DiaChi}
                  onChange={(e) => setUpdateForm({...updateForm, DiaChi: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Nhập địa chỉ"
                  rows="3"
                  required
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {updating ? "Đang cập nhật..." : "Lưu thay đổi"}
                </button>
                <button
                  type="button"
                  onClick={closeUpdateModal}
                  className="flex-1 border border-gray-300 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-50 transition"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer isLoggedIn={isLoggedIn} />
    </div>
  );
};

export default Cart;