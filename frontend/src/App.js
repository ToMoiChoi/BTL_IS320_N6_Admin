import React, { useState, useEffect } from "react";
import { HashRouter as Router, Route, Switch } from "react-router-dom";
import Register from "./components/Register";
import Home from "./components/Home";
import Login from "./components/login";
import ProductDetail from "./components/ProductDetail";
import Account from "./components/Account";
import Header from "./components/Header";
import CategoryProducts from "./components/CategoryProducts";
import SearchResults from "./components/SearchResults";
import Cart from "./components/Cart";
import Order from "./components/Order";
import Bill from "./components/Bill";
import AdminDashboard from "./components/admin/AdminDashboard";
import AdminOrders from "./components/admin/AdminOrders";
import AdminProducts from "./components/admin/AdminProducts";
import AdminCustomers from "./components/admin/AdminCustomers";
import AdminCategories from "./components/admin/AdminCategories";
import ChatBot from "./components/ChatBot";
import { API_URL } from "./config";

const App = () => {
  const [products, setProducts] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

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
        const resProducts = await fetch(`${API_URL}/products`);
        const productData = await resProducts.json();
        setProducts(Array.isArray(productData) ? productData : []);

        if (token) {
          const resMe = await fetch(`${API_URL}/users/me`, {
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
      {/* Hide Header on admin routes */}
      <Route render={({ location }) =>
        !location.pathname.startsWith('/admin') && (
          <Header
            isLoggedIn={isLoggedIn}
            userInfo={userInfo}
            onLogout={handleLogout}
          />
        )
      } />
      <Switch>
        {/* Admin Routes */}
        <Route
          exact
          path="/admin"
          render={() => (
            <AdminDashboard userInfo={userInfo} onLogout={handleLogout} />
          )}
        />
        <Route
          path="/admin/orders"
          render={() => (
            <AdminOrders userInfo={userInfo} onLogout={handleLogout} />
          )}
        />
        <Route
          path="/admin/products"
          render={() => (
            <AdminProducts userInfo={userInfo} onLogout={handleLogout} />
          )}
        />
        <Route
          path="/admin/customers"
          render={() => (
            <AdminCustomers userInfo={userInfo} onLogout={handleLogout} />
          )}
        />
        <Route
          path="/admin/categories"
          render={() => (
            <AdminCategories userInfo={userInfo} onLogout={handleLogout} />
          )}
        />
        {/* Trang giỏ hàng */}
        <Route
          path="/cart"
          render={() => (
            <Cart
              isLoggedIn={isLoggedIn}
              userInfo={userInfo}
              onLogout={handleLogout}
            />
          )}
        />

        {/* Trang sản phẩm theo danh mục */}
        <Route
          path="/category=:Loai"
          render={() => <CategoryProducts isLoggedIn={isLoggedIn} />}
        />

        {/* Trang kết quả tìm kiếm */}
        <Route
          path="/search"
          component={SearchResults}
        />

        {/* Trang Đăng Ký */}
        <Route
          path="/register"
          render={() => <Register onLoginSuccess={handleLoginSuccess} />}
        />

        {/* Trang Chi Tiết Sản Phẩm */}
        <Route
          path="/products/:productId"
          render={(p) => <ProductDetail {...p} isLoggedIn={isLoggedIn} />}
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

        {/* Trang sản phẩm theo thương hiệu */}
        <Route
          path="/brand=:brandValue"
          render={() => (
            <Home
              products={products}
              isLoggedIn={isLoggedIn}
              userInfo={userInfo}
              onLogout={handleLogout}
            />
          )}
        />

        <Route
          path="/orders"
          render={() => (
            <Order
              isLoggedIn={isLoggedIn}
              userInfo={userInfo}
              onLogout={handleLogout}
            />
          )}
        />
        <Route path="/bill/:orderId">
          <Bill isLoggedIn={isLoggedIn} />
        </Route>
      </Switch>
      <ChatBot />
    </Router>
  );
};

export default App;