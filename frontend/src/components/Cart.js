import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

const Cart = ({ isLoggedIn, userInfo, onLogout }) => {
  const history = useHistory();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [productSpecs, setProductSpecs] = useState({}); // Lưu thông số kỹ thuật của từng sản phẩm

  useEffect(() => {
    if (!isLoggedIn) {
      history.push("/login");
      return;
    }
    fetchCart();
  }, [isLoggedIn, history]);

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
        
        // Fetch thông số kỹ thuật cho từng sản phẩm
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
    
    // Fetch thông số kỹ thuật cho từng sản phẩm
    await Promise.all(
      items.map(async (item) => {
        try {
          const response = await fetch(
            `http://127.0.0.1:8000/products/${item.MaSP}/thong_so`
          );
          if (response.ok) {
            const data = await response.json();
            // Nếu có MaTSKT, tìm spec tương ứng
            if (item.MaTSKT && Array.isArray(data)) {
              const matchedSpec = data.find(s => s.MaTSKT === item.MaTSKT);
              specs[item.MaSP] = matchedSpec || data[0];
            } else {
              // Lấy spec đầu tiên hoặc spec có giá
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
  const handleCheckout = async () => {
    if (cartItems.length === 0) {
        alert("Giỏ hàng trống!");
        return;
    }

    const token = localStorage.getItem("token");
    
    // Chuẩn bị dữ liệu đơn hàng
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
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const cartItems = cart?.items || [];
  
  // Tính tổng tiền từ thông số kỹ thuật
  const totalAmount = cartItems.reduce((sum, item) => {
    const spec = productSpecs[item.MaSP];
    const price = spec?.GiaBan || item.sanpham?.GiaBan || 0;
    return sum + Number(price) * item.SoLuongSanPham;
  }, 0);

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
                const spec = productSpecs[item.MaSP]; // Lấy thông số kỹ thuật
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

            {/* Tóm tắt đơn hàng */}
            <div className="lg:col-span-1">
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
                  className="w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition shadow-lg"
                >
                  Tiến hành thanh toán
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

      <Footer isLoggedIn={isLoggedIn} />
    </div>
  );
};

export default Cart;