import React, { useState, useEffect } from 'react';
import { Route, Switch, useHistory, useLocation } from 'react-router-dom';

// Import Components
import Header from './components/Header';
import Footer from './components/Footer';
import Cart from './components/Cart';
import Account from './components/Account';

// Import Pages
import ProductDetail from './pages/ProductDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AdminLogin from './pages/admin/AdminLogin';
import AdminRegister from './pages/admin/AdminRegister';
import AdminDashboard from './pages/admin/AdminDashboard';

// --- TRANG DANH SÁCH SẢN PHẨM ---
const ProductListPage = () => {
  const [products, setProducts] = useState([]);
  const history = useHistory();

  useEffect(() => {
    fetch('http://localhost:8000/products')
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("Lỗi fetch sản phẩm:", err));
  }, []);

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">iPhone</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition cursor-pointer group"
            onClick={() => history.push(`/product/${product.id}`)}
          >
            <div className="relative p-4">
              <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                  Giảm {product.discount}%
                </span>
                <span className="bg-blue-100 text-blue-600 text-xs font-medium px-2 py-1 rounded">
                  Trả góp {product.installmentRate}
                </span>
              </div>
              <div className="aspect-square mb-4 overflow-hidden rounded-lg">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
              </div>
              <h3 className="font-medium text-sm mb-2 line-clamp-2 min-h-[40px]">
                {product.name}
              </h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {product.specs?.map((spec, index) => (
                  <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {spec}
                  </span>
                ))}
              </div>
              <div className="mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-red-600 font-bold text-lg">{product.price}</span>
                  {product.originalPrice && (
                    <span className="text-gray-400 text-sm line-through">{product.originalPrice}</span>
                  )}
                </div>
              </div>
              <div className="text-gray-600 text-xs">
                {product.status || "Trả góp 0% - 0đ phụ thu - 0đ trả trước"}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- TRANG CHI TIẾT SẢN PHẨM ---
const ProductDetailPageWrapper = ({ match }) => {
  const [product, setProduct] = useState(null);
  const id = match.params.id;

  useEffect(() => {
    fetch(`http://localhost:8000/products/${id}`)
      .then((res) => res.json())
      .then((data) => setProduct(data))
      .catch((err) => console.error("Lỗi fetch chi tiết:", err));
  }, [id]);

  if (!product) return <div className="p-10 text-center">Đang tải...</div>;
  return <ProductDetail product={product} />;
};

// --- COMPONENT CHÍNH APP ---
const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState({ name: 'Trần Văn A', phone: '0987xxxxxx', memberTier: '4MEMBER' });
  const history = useHistory();
  const location = useLocation();

  // Kiểm tra xem có đang ở trang admin hay không
  const isAdminPage = location.pathname.startsWith('/admin');

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserInfo(null);
    history.push('/');
  };

  const handleAdminSuccess = (adminData) => {
    localStorage.setItem('adminData', JSON.stringify(adminData));
    history.push('/admin/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Chỉ hiện Header nếu không phải trang admin */}
      {!isAdminPage && <Header isLoggedIn={isLoggedIn} userInfo={userInfo} />}

      <main className="flex-grow">
        <Switch>
          <Route exact path="/" component={ProductListPage} />
          <Route path="/product/:id" component={ProductDetailPageWrapper} />
          <Route path="/cart" component={Cart} />
          <Route path="/login" render={() => <Login setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/register" component={Register} />
          <Route path="/profile" render={() => <Profile userInfo={userInfo} setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/account" render={() => <Account isLoggedIn={isLoggedIn} userInfo={userInfo} onLogout={handleLogout} />} />

          {/* Admin Routes */}
          <Route
            path="/admin/login"
            render={() => (
              <AdminLogin
                onLoginSuccess={handleAdminSuccess}
                onNavigateToRegister={() => history.push('/admin/register')}
                onNavigateToHome={() => history.push('/')}
              />
            )}
          />
          <Route
            path="/admin/register"
            render={() => (
              <AdminRegister
                onRegisterSuccess={handleAdminSuccess}
                onNavigateToLogin={() => history.push('/admin/login')}
                onNavigateToHome={() => history.push('/')}
              />
            )}
          />
          <Route path="/admin/dashboard" component={AdminDashboard} />
        </Switch>
      </main>

      {!isAdminPage && <Footer />}

      {/* Floating Contact Button */}
      {!isAdminPage && (
        <button className="fixed bottom-8 right-8 bg-red-600 text-white px-6 py-4 rounded-full shadow-lg hover:bg-red-700 transition z-50 flex items-center gap-2">
          <span className="text-2xl">🎧</span>
          <span className="font-medium">Liên hệ</span>
        </button>
      )}
    </div>
  );
};

export default App;