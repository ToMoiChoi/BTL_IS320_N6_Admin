import React, { useState, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { API_URL } from '../../config';

const AdminDashboard = ({ userInfo, onLogout }) => {
  const history = useHistory();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalCustomers: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in and is admin
  const token = localStorage.getItem('token');
  const isAdmin = userInfo?.MaPQ === 1;

  useEffect(() => {
    if (!token) {
      history.push('/login');
      return;
    }
  }, [token, history]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem('token');
      try {
        // Fetch orders
        const ordersRes = await fetch(`${API_URL}/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const orders = await ordersRes.json();

        // Fetch products
        const productsRes = await fetch(`${API_URL}/products`);
        const products = await productsRes.json();

        // Fetch users
        const usersRes = await fetch(`${API_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const users = await usersRes.json();

        // Calculate stats - exclude cancelled orders from revenue
        const totalRevenue = Array.isArray(orders) 
          ? orders
              .filter(o => o.TrangThaiDH !== 'cancelled')
              .reduce((sum, o) => sum + Number(o.ThanhTien || 0), 0) 
          : 0;

        setStats({
          totalOrders: Array.isArray(orders) ? orders.length : 0,
          totalRevenue,
          totalProducts: Array.isArray(products) ? products.length : 0,
          totalCustomers: Array.isArray(users) ? users.length : 0,
        });

        // Recent orders (last 5)
        setRecentOrders(Array.isArray(orders) ? orders.slice(0, 5) : []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + '₫';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipping': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Chờ xử lý';
      case 'processing': return 'Đang xử lý';
      case 'shipping': return 'Đang giao';
      case 'completed': return 'Hoàn thành';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  if (loading) {
    return (
      <AdminLayout userInfo={userInfo} onLogout={onLogout}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout userInfo={userInfo} onLogout={onLogout}>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Tổng đơn hàng</p>
              <p className="text-3xl font-bold text-gray-800">{stats.totalOrders}</p>
            </div>
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-2xl">
              📦
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Doanh thu</p>
              <p className="text-2xl font-bold text-green-600">{formatPrice(stats.totalRevenue)}</p>
            </div>
            <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center text-2xl">
              💰
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Sản phẩm</p>
              <p className="text-3xl font-bold text-gray-800">{stats.totalProducts}</p>
            </div>
            <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center text-2xl">
              📱
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Khách hàng</p>
              <p className="text-3xl font-bold text-gray-800">{stats.totalCustomers}</p>
            </div>
            <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center text-2xl">
              👥
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Link to="/admin/orders" className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition group">
          <div className="flex items-center gap-4">
            <span className="text-4xl group-hover:scale-110 transition">📦</span>
            <div>
              <h3 className="font-bold text-lg">Quản lý đơn hàng</h3>
              <p className="text-blue-100 text-sm">Xem và cập nhật đơn hàng</p>
            </div>
          </div>
        </Link>

        <Link to="/admin/products" className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition group">
          <div className="flex items-center gap-4">
            <span className="text-4xl group-hover:scale-110 transition">📱</span>
            <div>
              <h3 className="font-bold text-lg">Quản lý sản phẩm</h3>
              <p className="text-purple-100 text-sm">Thêm, sửa, xóa sản phẩm</p>
            </div>
          </div>
        </Link>

        <Link to="/admin/customers" className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition group">
          <div className="flex items-center gap-4">
            <span className="text-4xl group-hover:scale-110 transition">👥</span>
            <div>
              <h3 className="font-bold text-lg">Quản lý khách hàng</h3>
              <p className="text-orange-100 text-sm">Xem thông tin tài khoản</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">Đơn hàng gần đây</h2>
          <Link to="/admin/orders" className="text-red-600 text-sm font-medium hover:underline">
            Xem tất cả →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Mã ĐH</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Ngày đặt</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Thành tiền</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <tr key={order.MaDH} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-800">#{order.MaDH}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(order.NgayDat).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 font-bold text-red-600">
                      {formatPrice(order.ThanhTien)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(order.TrangThaiDH)}`}>
                        {getStatusText(order.TrangThaiDH)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-400">
                    Chưa có đơn hàng nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
