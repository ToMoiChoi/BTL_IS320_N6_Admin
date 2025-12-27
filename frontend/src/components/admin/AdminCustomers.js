import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { API_URL } from '../../config';

const AdminCustomers = ({ userInfo, onLogout }) => {
  const history = useHistory();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Check if user is logged in
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      history.push('/login');
      return;
    }
  }, [token, history]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCustomers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(c =>
    c.TenDangNhap?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.Email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleLabel = (maPQ) => {
    return maPQ === 1 ? 'Admin' : 'Khách hàng';
  };

  const getRoleColor = (maPQ) => {
    return maPQ === 1 ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800';
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
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="relative flex-1 max-w-md">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-gray-500 text-sm">Tổng tài khoản</p>
          <p className="text-2xl font-bold text-gray-800">{customers.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-gray-500 text-sm">Admin</p>
          <p className="text-2xl font-bold text-yellow-600">
            {customers.filter(c => c.MaPQ === 1).length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-gray-500 text-sm">Khách hàng</p>
          <p className="text-2xl font-bold text-blue-600">
            {customers.filter(c => c.MaPQ !== 1).length}
          </p>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">ID</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Tên đăng nhập</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Email</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Số điện thoại</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Quyền</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <tr key={customer.MaTK} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-600">#{customer.MaTK}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold">
                          {customer.TenDangNhap?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <span className="font-medium text-gray-800">{customer.TenDangNhap}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{customer.Email || '-'}</td>
                    <td className="px-6 py-4 text-gray-600">{customer.SoDienThoai || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getRoleColor(customer.MaPQ)}`}>
                        {getRoleLabel(customer.MaPQ)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedCustomer(customer)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Xem chi tiết"
                      >
                        👁️
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                    Không tìm thấy khách hàng
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Chi tiết khách hàng</h2>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-2xl font-bold text-gray-600">
                {selectedCustomer.TenDangNhap?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">{selectedCustomer.TenDangNhap}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getRoleColor(selectedCustomer.MaPQ)}`}>
                  {getRoleLabel(selectedCustomer.MaPQ)}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between py-3 border-b border-gray-100">
                <span className="text-gray-500">ID</span>
                <span className="font-medium">#{selectedCustomer.MaTK}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-100">
                <span className="text-gray-500">Email</span>
                <span className="font-medium">{selectedCustomer.Email || 'Chưa cập nhật'}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-100">
                <span className="text-gray-500">Số điện thoại</span>
                <span className="font-medium">{selectedCustomer.SoDienThoai || 'Chưa cập nhật'}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-100">
                <span className="text-gray-500">Địa chỉ</span>
                <span className="font-medium text-right max-w-xs">
                  {selectedCustomer.DiaChi || 'Chưa cập nhật'}
                </span>
              </div>
            </div>

            <button
              onClick={() => setSelectedCustomer(null)}
              className="w-full mt-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminCustomers;
