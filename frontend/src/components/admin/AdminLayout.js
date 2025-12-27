import React from 'react';
import { Link, useLocation, useHistory } from 'react-router-dom';

const AdminLayout = ({ children, userInfo, onLogout }) => {
  const location = useLocation();
  const history = useHistory();

  const menuItems = [
    { path: '/admin', icon: '📊', label: 'Dashboard' },
    { path: '/admin/orders', icon: '📦', label: 'Đơn hàng' },
    { path: '/admin/products', icon: '📱', label: 'Sản phẩm' },
    { path: '/admin/customers', icon: '👥', label: 'Khách hàng' },
  ];

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col fixed h-full">
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <Link to="/" className="text-2xl font-bold">
            <span className="text-red-500 italic">cellphone</span>
            <span className="text-white">S</span>
          </Link>
          <p className="text-gray-400 text-sm mt-1">Admin Panel</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                    isActive(item.path)
                      ? 'bg-red-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold">
              {userInfo?.TenDangNhap?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div>
              <p className="font-medium text-white">{userInfo?.TenDangNhap || 'Admin'}</p>
              <p className="text-xs text-gray-400">Quản trị viên</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => history.push('/')}
              className="flex-1 text-sm bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg transition"
            >
              🏠 Trang chủ
            </button>
            <button
              onClick={onLogout}
              className="flex-1 text-sm bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64">
        {/* Header */}
        <header className="bg-white shadow-sm px-8 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-800">
              {menuItems.find(item => isActive(item.path))?.label || 'Admin'}
            </h1>
            <div className="text-sm text-gray-500">
              {new Date().toLocaleDateString('vi-VN', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
