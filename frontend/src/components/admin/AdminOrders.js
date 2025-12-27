import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { API_URL } from '../../config';

const AdminOrders = ({ userInfo, onLogout }) => {
  const history = useHistory();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Check if user is logged in
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      history.push('/login');
      return;
    }
  }, [token, history]);

  const statusOptions = [
    { value: 'pending', label: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'processing', label: 'Đang xử lý', color: 'bg-blue-100 text-blue-800' },
    { value: 'shipping', label: 'Đang giao', color: 'bg-purple-100 text-purple-800' },
    { value: 'completed', label: 'Hoàn thành', color: 'bg-green-100 text-green-800' },
    { value: 'cancelled', label: 'Đã hủy', color: 'bg-red-100 text-red-800' },
  ];

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ TrangThaiDH: newStatus }),
      });

      if (res.ok) {
        // Refresh orders list
        fetchOrders();
        alert('✅ Cập nhật trạng thái thành công!');
      } else {
        const error = await res.json();
        alert(`❌ Lỗi: ${error.detail || 'Không thể cập nhật'}`);
      }
    } catch (error) {
      console.error('Error updating order:', error);
      alert('❌ Lỗi kết nối server');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + '₫';
  };

  const getStatusInfo = (status) => {
    return statusOptions.find(s => s.value === status) || statusOptions[0];
  };

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(o => o.TrangThaiDH === filter);

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
      {/* Filter Tabs */}
      <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm border border-gray-100">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              filter === 'all' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tất cả ({orders.length})
          </button>
          {statusOptions.map((status) => {
            const count = orders.filter(o => o.TrangThaiDH === status.value).length;
            return (
              <button
                key={status.value}
                onClick={() => setFilter(status.value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                  filter === status.value ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Mã ĐH</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Ngày đặt</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Tổng tiền</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Giảm giá</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Thành tiền</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Trạng thái</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => {
                  const statusInfo = getStatusInfo(order.TrangThaiDH);
                  return (
                    <tr key={order.MaDH} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-bold text-gray-800">#{order.MaDH}</td>
                      <td className="px-6 py-4 text-gray-600">
                        {new Date(order.NgayDat).toLocaleString('vi-VN')}
                      </td>
                      <td className="px-6 py-4 text-gray-600">{formatPrice(order.TongTien)}</td>
                      <td className="px-6 py-4 text-orange-600">-{formatPrice(order.GiamGia || 0)}</td>
                      <td className="px-6 py-4 font-bold text-red-600">{formatPrice(order.ThanhTien)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <select
                            value={order.TrangThaiDH}
                            onChange={(e) => updateOrderStatus(order.MaDH, e.target.value)}
                            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                          >
                            {statusOptions.map((status) => (
                              <option key={status.value} value={status.value}>
                                {status.label}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Xem chi tiết"
                          >
                            👁️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-400">
                    Không có đơn hàng nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold">Chi tiết đơn hàng #{selectedOrder.MaDH}</h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-gray-500 text-sm">Ngày đặt</p>
                  <p className="font-medium">{new Date(selectedOrder.NgayDat).toLocaleString('vi-VN')}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Trạng thái</p>
                  <p className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getStatusInfo(selectedOrder.TrangThaiDH).color}`}>
                    {getStatusInfo(selectedOrder.TrangThaiDH).label}
                  </p>
                </div>
              </div>

              <h3 className="font-bold text-gray-800 mb-3">Sản phẩm</h3>
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                {selectedOrder.chitiets?.map((item, idx) => (
                  <div key={idx} className="flex justify-between py-2 border-b border-gray-200 last:border-0">
                    <span>SP #{item.MaSP} x {item.SoLuong}</span>
                    <span className="font-medium">{formatPrice(item.DonGia * item.SoLuong)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 text-right">
                <p>Tổng tiền: <span className="font-medium">{formatPrice(selectedOrder.TongTien)}</span></p>
                <p>Giảm giá: <span className="text-orange-600">-{formatPrice(selectedOrder.GiamGia || 0)}</span></p>
                <p className="text-lg">Thành tiền: <span className="font-bold text-red-600">{formatPrice(selectedOrder.ThanhTien)}</span></p>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminOrders;
