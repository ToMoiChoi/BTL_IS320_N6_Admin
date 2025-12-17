import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, User, Package, X } from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [currentItem, setCurrentItem] = useState(null);

  // Dữ liệu sản phẩm mẫu
  const [products, setProducts] = useState([
    {
      id: 1,
      name: 'iPhone 15 Pro Max 256GB',
      price: '26490000',
      originalPrice: '34990000',
      discount: 24,
      image: 'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-15-pro-max_3.png',
      specs: ['6.7 inches', '8 GB', '256 GB'],
      stock: 50
    },
    {
      id: 2,
      name: 'iPhone 16 Pro 128GB',
      price: '25990000',
      originalPrice: '28990000',
      discount: 10,
      image: 'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-16-pro_1.png',
      specs: ['6.3 inches', '128 GB'],
      stock: 30
    }
  ]);

  // Dữ liệu khách hàng mẫu
  const [customers, setCustomers] = useState([
    {
      id: 1,
      name: 'Nguyễn Văn A',
      email: 'nguyenvana@gmail.com',
      phone: '0987654321',
      memberTier: '4MEMBER',
      totalOrders: 5,
      totalSpent: '45000000'
    },
    {
      id: 2,
      name: 'Trần Thị B',
      email: 'tranthib@gmail.com',
      phone: '0912345678',
      memberTier: '4VIP',
      totalOrders: 12,
      totalSpent: '120000000'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({});

  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + 'đ';
  };

  const openModal = (mode, item = null) => {
    setModalMode(mode);
    setCurrentItem(item);
    if (item) {
      setFormData(item);
    } else {
      setFormData(activeTab === 'products' ? {
        name: '',
        price: '',
        originalPrice: '',
        discount: 0,
        image: '',
        specs: [],
        stock: 0
      } : {
        name: '',
        email: '',
        phone: '',
        memberTier: '4MEMBER',
        totalOrders: 0,
        totalSpent: '0'
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentItem(null);
    setFormData({});
  };

  const handleSubmit = () => {
    if (activeTab === 'products') {
      if (modalMode === 'add') {
        const newProduct = {
          ...formData,
          id: products.length + 1,
          specs: typeof formData.specs === 'string' ? formData.specs.split(',').map(s => s.trim()) : formData.specs
        };
        setProducts([...products, newProduct]);
      } else {
        setProducts(products.map(p => p.id === currentItem.id ? { ...formData, id: currentItem.id } : p));
      }
    } else {
      if (modalMode === 'add') {
        const newCustomer = {
          ...formData,
          id: customers.length + 1
        };
        setCustomers([...customers, newCustomer]);
      } else {
        setCustomers(customers.map(c => c.id === currentItem.id ? { ...formData, id: currentItem.id } : c));
      }
    }
    closeModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa?')) {
      if (activeTab === 'products') {
        setProducts(products.filter(p => p.id !== id));
      } else {
        setCustomers(customers.filter(c => c.id !== id));
      }
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Admin Dashboard - Cellphones</h1>
            <button className="bg-white/20 px-4 py-2 rounded-lg hover:bg-white/30 transition">
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Tổng sản phẩm</p>
                <p className="text-2xl font-bold text-gray-800">{products.length}</p>
              </div>
              <Package className="w-12 h-12 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Tổng khách hàng</p>
                <p className="text-2xl font-bold text-gray-800">{customers.length}</p>
              </div>
              <User className="w-12 h-12 text-green-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Tổng đơn hàng</p>
                <p className="text-2xl font-bold text-gray-800">
                  {customers.reduce((sum, c) => sum + c.totalOrders, 0)}
                </p>
              </div>
              <Package className="w-12 h-12 text-orange-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Doanh thu</p>
                <p className="text-xl font-bold text-gray-800">
                  {formatPrice(customers.reduce((sum, c) => sum + parseInt(c.totalSpent), 0))}
                </p>
              </div>
              <Package className="w-12 h-12 text-red-500" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition ${
                activeTab === 'products'
                  ? 'border-b-2 border-red-500 text-red-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Package className="w-5 h-5" />
              Quản lý sản phẩm
            </button>
            <button
              onClick={() => setActiveTab('customers')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition ${
                activeTab === 'customers'
                  ? 'border-b-2 border-red-500 text-red-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <User className="w-5 h-5" />
              Quản lý khách hàng
            </button>
          </div>

          {/* Search and Add Button */}
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder={activeTab === 'products' ? 'Tìm kiếm sản phẩm...' : 'Tìm kiếm khách hàng...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <button
                onClick={() => openModal('add')}
                className="flex items-center gap-2 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
              >
                <Plus className="w-5 h-5" />
                Thêm {activeTab === 'products' ? 'sản phẩm' : 'khách hàng'}
              </button>
            </div>

            {/* Products Table */}
            {activeTab === 'products' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="text-left p-4 font-semibold text-gray-700">ID</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Hình ảnh</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Tên sản phẩm</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Giá</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Giảm giá</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Tồn kho</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="border-b hover:bg-gray-50">
                        <td className="p-4">{product.id}</td>
                        <td className="p-4">
                          <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded" />
                        </td>
                        <td className="p-4 font-medium">{product.name}</td>
                        <td className="p-4">
                          <div className="text-red-600 font-bold">{formatPrice(product.price)}</div>
                          <div className="text-gray-400 text-sm line-through">{formatPrice(product.originalPrice)}</div>
                        </td>
                        <td className="p-4">
                          <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm font-medium">
                            -{product.discount}%
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-sm font-medium ${
                            product.stock > 20 ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                          }`}>
                            {product.stock} sản phẩm
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openModal('edit', product)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Customers Table */}
            {activeTab === 'customers' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="text-left p-4 font-semibold text-gray-700">ID</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Họ tên</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Email</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Số điện thoại</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Hạng thành viên</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Đơn hàng</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Tổng chi tiêu</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.map((customer) => (
                      <tr key={customer.id} className="border-b hover:bg-gray-50">
                        <td className="p-4">{customer.id}</td>
                        <td className="p-4 font-medium">{customer.name}</td>
                        <td className="p-4 text-gray-600">{customer.email}</td>
                        <td className="p-4">{customer.phone}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            customer.memberTier === '4VIP'
                              ? 'bg-red-100 text-red-600'
                              : 'bg-pink-100 text-pink-600'
                          }`}>
                            {customer.memberTier}
                          </span>
                        </td>
                        <td className="p-4">{customer.totalOrders}</td>
                        <td className="p-4 font-bold text-red-600">{formatPrice(customer.totalSpent)}</td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openModal('edit', customer)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(customer.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-800">
                {modalMode === 'add' ? 'Thêm' : 'Chỉnh sửa'} {activeTab === 'products' ? 'sản phẩm' : 'khách hàng'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {activeTab === 'products' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm</label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Giá bán</label>
                      <input
                        type="number"
                        value={formData.price || ''}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Giá gốc</label>
                      <input
                        type="number"
                        value={formData.originalPrice || ''}
                        onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Giảm giá (%)</label>
                      <input
                        type="number"
                        value={formData.discount || 0}
                        onChange={(e) => setFormData({ ...formData, discount: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tồn kho</label>
                      <input
                        type="number"
                        value={formData.stock || 0}
                        onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">URL hình ảnh</label>
                    <input
                      type="text"
                      value={formData.image || ''}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Thông số (cách nhau bởi dấu phẩy)</label>
                    <input
                      type="text"
                      value={Array.isArray(formData.specs) ? formData.specs.join(', ') : formData.specs || ''}
                      onChange={(e) => setFormData({ ...formData, specs: e.target.value })}
                      placeholder="6.7 inches, 8 GB, 256 GB"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                    <input
                      type="tel"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hạng thành viên</label>
                    <select
                      value={formData.memberTier || '4MEMBER'}
                      onChange={(e) => setFormData({ ...formData, memberTier: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="4MEMBER">4MEMBER</option>
                      <option value="4VIP">4VIP</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tổng đơn hàng</label>
                      <input
                        type="number"
                        value={formData.totalOrders || 0}
                        onChange={(e) => setFormData({ ...formData, totalOrders: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tổng chi tiêu</label>
                      <input
                        type="number"
                        value={formData.totalSpent || 0}
                        onChange={(e) => setFormData({ ...formData, totalSpent: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSubmit}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition font-medium"
                >
                  {modalMode === 'add' ? 'Thêm mới' : 'Cập nhật'}
                </button>
                <button
                  onClick={closeModal}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition font-medium"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;