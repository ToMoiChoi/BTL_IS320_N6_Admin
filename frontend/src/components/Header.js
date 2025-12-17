import React from 'react';
import { Link, useHistory } from 'react-router-dom';

const Header = ({ isLoggedIn, userInfo }) => {
  const history = useHistory();
  const memberColor = userInfo?.memberTier === '4VIP' ? 'bg-red-600' : 'bg-pink-600';



  return (
    <header className="bg-gradient-to-r from-red-500 to-pink-500 text-white sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          
          {/* Logo và Danh mục */}
          <div className="flex items-center gap-4">
            <Link to="/" className="text-2xl font-bold cursor-pointer">
              cellphone S
            </Link>
            
            <button className="hidden md:flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg hover:bg-white/30 transition">
              <span className="text-sm">☰ Danh mục</span>
              <span className="text-xs">▼</span>
            </button>
            
            <button className="hidden md:flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg hover:bg-white/30 transition">
              <span>📍</span>
              <span className="text-sm">Hồ Chí Minh</span>
              <span className="text-xs">▼</span>
            </button>
          </div>

          {/* Thanh tìm kiếm */}
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
              <input
                type="text"
                placeholder="Bạn muốn mua gì hôm nay?"
                className="w-full pl-12 pr-4 py-3 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
          </div>

          {/* Giỏ hàng và Đăng nhập/Profile */}
          <div className="flex items-center gap-4">
            <button 
              className="hidden md:flex items-center gap-2 hover:opacity-80 transition cursor-pointer"
              onClick={() => history.push('/cart')}
            >
              <span className="text-2xl">🛒</span>
              <span>Giỏ hàng</span>
            </button>

            {isLoggedIn ? (
              <button 
                className="flex items-center gap-2 hover:opacity-80 transition"
                onClick={() => history.push('/profile')}
              >
                <div className={`w-8 h-8 rounded-full ${memberColor} flex items-center justify-center text-white font-bold text-sm`}>
                  {userInfo?.name?.charAt(0) || 'U'}
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-xs opacity-80">Xin chào</div>
                  <div className="text-sm font-semibold">{userInfo?.name || 'User'}</div>
                </div>
              </button>
            ) : (
              <button 
                className="flex items-center gap-2 hover:opacity-80 transition"
                onClick={() => history.push('/login')}
              >
                <span className="text-2xl">👤</span>
                <span>Đăng nhập</span>
              </button>

            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;