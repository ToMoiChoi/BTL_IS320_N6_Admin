import React, { useState, useEffect } from "react";
import { HashRouter as Router, Route, Switch } from "react-router-dom";
import Register from "./components/Register";
import Home from "./components/Home";
import Login from "./components/login"; // Đảm bảo đúng tên file 'Login' hoặc 'login'
import ProductDetail from "./components/ProductDetail";
import Account from "./components/Account";
import Header from "./components/Header";

const App = () => {
  const [products, setProducts] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hàm xử lý khi đăng nhập hoặc đăng ký thành công
  const handleLoginSuccess = (userData) => {
    setIsLoggedIn(true);
    setUserInfo(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setUserInfo(null);
  };

  useEffect(() => {
    const initializeApp = async () => {
      const token = localStorage.getItem("token");

      try {
        // Bước 1: Lấy danh sách sản phẩm
        const resProducts = await fetch("http://127.0.0.1:8000/products");
        const productData = await resProducts.json();
        setProducts(Array.isArray(productData) ? productData : []);

        // Bước 2: Xác thực token nếu có
        if (token) {
          const resMe = await fetch("http://127.0.0.1:8000/users/me", {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          if (resMe.ok) {
            const userData = await resMe.json();
            handleLoginSuccess(userData);
          } else {
            localStorage.removeItem("token");
            setIsLoggedIn(false);
          }
        }
      } catch (error) {
        console.error("Lỗi hệ thống:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen font-bold text-red-600">
        Đang khởi động Cellphone S...
      </div>
    );

  return (
    <Router>
      <Header
        isLoggedIn={isLoggedIn}
        userInfo={userInfo}
        onLogout={handleLogout}
      />
      <Switch>
        {/* Trang Đăng Ký */}
        <Route
          path="/register"
          render={() => <Register onLoginSuccess={handleLoginSuccess} />}
        />

        {/* Trang Chi Tiết Sản Phẩm */}
        <Route
          path="/products/:productId"
          render={(p) => <ProductDetail {...p} />}
        />

        {/* Trang Đăng Nhập */}
        <Route
          path="/login"
          render={() => <Login onLoginSuccess={handleLoginSuccess} />}
        />

        {/* Trang Tài Khoản */}
        <Route
          path="/account"
          render={() => (
            <Account
              isLoggedIn={isLoggedIn}
              userInfo={userInfo}
              onLogout={handleLogout}
            />
          )}
        />

        {/* Trang Chủ */}
        <Route
          exact
          path="/"
          render={() => (
            <Home
              products={products}
              isLoggedIn={isLoggedIn}
              userInfo={userInfo}
              onLogout={handleLogout}
            />
          )}
        />
      </Switch>
    </Router>
  );
};

export default App;
