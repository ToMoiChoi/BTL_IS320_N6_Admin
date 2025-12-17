import React, { useState } from 'react';

import { useHistory } from 'react-router-dom';

const Profile = ({ userInfo, setIsLoggedIn, setCurrentPage }) => {
  const [activeTab, setActiveTab] = useState('info'); // 'info', 'purchase', 'warranty'
  const history = useHistory();
  const handleLogout = () => {
    setIsLoggedIn(false);
    history.push('/');

    alert('Đã đăng xuất.');
  };

  const tabs = [
    { id: 'info', label: 'Thông tin cá nhân', icon: '👤' },
    { id: 'purchase', label: 'Quản lý đơn hàng', icon: '📦' },
    { id: 'warranty', label: 'Tra cứu bảo hành', icon: '🛠️' },
  ];

  // --- Dữ liệu giả lập cho các tab ---
  const purchaseHistory = [
    { id: 1001, date: '10/06/2025', total: '19.990.000đ', status: 'Đã giao hàng', items: 2 },
    { id: 1002, date: '25/05/2025', total: '8.500.000đ', status: 'Đang xử lý', items: 1 },
    { id: 1003, date: '01/04/2025', total: '3.200.000đ', status: 'Đã hủy', items: 3 },
  ];

  const warrantyStatus = [
    { code: 'BH123456', product: 'iPhone 15', purchaseDate: '10/06/2025', status: 'Còn hạn', expireDate: '10/06/2026' },
    { code: 'BH987654', product: 'Tai nghe Sony', purchaseDate: '25/05/2025', status: 'Hết hạn', expireDate: '25/05/2026' },
  ];
  // ------------------------------------
  
  const renderContent = () => {
    switch (activeTab) {
      case 'info':
        return (
          // Thông tin cá nhân
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-800 border-b pb-2">Thông tin cơ bản</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-gray-500">Họ và tên</p>
                <p className="font-semibold">{userInfo.name}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-gray-500">Số điện thoại</p>
                <p className="font-semibold">{userInfo.phone}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-semibold">trana***@gmail.com</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-gray-500">Ngày sinh</p>
                <p className="font-semibold">01/01/1990</p>
              </div>
            </div>
            <button className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition">
              Cập nhật thông tin
            </button>
            <div className="pt-6 border-t mt-6">
                <button 
                    onClick={handleLogout}
                    className="text-red-500 font-semibold hover:underline"
                >
                    Đăng xuất
                </button>
            </div>
          </div>
        );

      case 'purchase':
        return (
          // Quản lý đơn hàng (Dựa trên image_675f9d.png)
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-800 border-b pb-2">Danh sách đơn hàng</h3>
            <div className="flex justify-between p-3 bg-gray-100 rounded-lg text-sm font-medium text-gray-600">
                <button className="text-red-600 border-b-2 border-red-600 pb-1">Tất cả (3)</button>
                <button className="hover:text-red-500">Đang xử lý (1)</button>
                <button className="hover:text-red-500">Đã giao hàng (1)</button>
                <button className="hover:text-red-500">Đã hủy (1)</button>
            </div>
            
            {purchaseHistory.map(order => (
              <div key={order.id} className="border border-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-gray-800">Mã đơn hàng: #{order.id}</span>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${order.status === 'Đã giao hàng' ? 'bg-green-100 text-green-700' : order.status === 'Đang xử lý' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                    {order.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500">Ngày đặt hàng: {order.date}</p>
                <p className="text-sm font-medium text-red-600">Tổng tiền: {order.total}</p>
                <p className="text-xs text-gray-500">Số lượng sản phẩm: {order.items}</p>
                <div className="text-right mt-3">
                    <button className="text-red-500 text-sm hover:underline">Xem chi tiết &gt;</button>
                </div>
              </div>
            ))}
          </div>
        );

      case 'warranty':
        return (
          // Tra cứu bảo hành (Dựa trên image_675f24.png)
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-800 border-b pb-2">Tra cứu thông tin bảo hành</h3>
            <div className="flex flex-col md:flex-row gap-3">
                <input 
                    type="text" 
                    placeholder="Nhập mã bảo hành hoặc số điện thoại" 
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:border-red-500 focus:ring-red-500"
                />
                <button className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition font-medium">
                    Tra cứu
                </button>
            </div>
            
            <div className="pt-4 space-y-4">
                {warrantyStatus.map(warranty => (
                    <div key={warranty.code} className="border border-gray-200 p-4 rounded-lg shadow-sm">
                        <div className="flex justify-between items-center mb-1">
                            <span className="font-semibold text-gray-800">{warranty.product}</span>
                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${warranty.status === 'Còn hạn' ? 'bg-pink-100 text-pink-700' : 'bg-gray-100 text-gray-700'}`}>
                                {warranty.status}
                            </span>
                        </div>
                        <p className="text-sm text-gray-500">Mã BH: {warranty.code}</p>
                        <p className="text-sm text-gray-500">Ngày mua: {warranty.purchaseDate}</p>
                        <p className="text-sm font-medium text-gray-700">Hạn BH: {warranty.expireDate}</p>
                    </div>
                ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Trang thông tin cá nhân</h1>

      <div className="flex flex-wrap lg:flex-nowrap gap-6">
        {/* Cột trái: Sidebar (Thông tin thành viên và Menu) */}
        <div className="w-full lg:w-1/4 bg-white p-6 rounded-lg shadow-lg h-fit">
          {/* Thông tin thành viên */}
          <div className="text-center pb-6 border-b border-gray-200">
            <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center text-3xl text-gray-600">
              👤
            </div>
            <h2 className="text-lg font-bold">{userInfo.name}</h2>
            <p className="text-sm text-gray-500 mb-2">{userInfo.phone}</p>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${userInfo.memberTier === '4VIP' ? 'bg-red-600 text-white' : 'bg-pink-100 text-pink-700'}`}>
              {userInfo.memberTier.toUpperCase()}
            </span>
          </div>

          {/* Menu */}
          <nav className="mt-6 space-y-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 w-full p-3 rounded-lg text-left transition ${
                  activeTab === tab.id
                    ? 'bg-red-50 text-red-600 font-semibold'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="text-sm">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Cột phải: Nội dung chi tiết */}
        <div className="w-full lg:w-3/4 bg-white p-6 rounded-lg shadow-lg">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Profile;