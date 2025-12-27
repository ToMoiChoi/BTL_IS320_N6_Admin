import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { API_URL } from '../../config';

const AdminProducts = ({ userInfo, onLogout }) => {
  const history = useHistory();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    TenSP: '',
    MoTa: '',
    GiaBan: '',
    RAM: '',
    BoNho: '',
    MauSac: '',
    SoLuong: ''
  });

  // Check if user is logged in
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      history.push('/login');
      return;
    }
  }, [token, history]);

  useEffect(() => {
    fetchProducts();
  }, []);

  // Update form when editProduct changes
  useEffect(() => {
    if (editProduct) {
      setFormData({
        TenSP: editProduct.TenSP || '',
        MoTa: editProduct.MoTa || '',
        GiaBan: editProduct.GiaBan || '',
        RAM: editProduct.RAM || '',
        BoNho: editProduct.BoNho || '',
        MauSac: editProduct.MauSac || '',
        SoLuong: editProduct.SoLuong || ''
      });
      // Set image preview if product has media
      if (editProduct.media && editProduct.media.length > 0) {
        setImagePreview(`${API_URL}${editProduct.media[0].DuongDanFile}`);
      } else {
        setImagePreview(null);
      }
    } else {
      resetForm();
    }
  }, [editProduct]);

  const resetForm = () => {
    setFormData({
      TenSP: '',
      MoTa: '',
      GiaBan: '',
      RAM: '',
      BoNho: '',
      MauSac: '',
      SoLuong: ''
    });
    setSelectedImage(null);
    setImagePreview(null);
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/products`);
      const data = await res.json();
      
      // Fetch specs and media for each product
      const productsWithSpecs = await Promise.all(
        data.map(async (p) => {
          try {
            const [specRes, mediaRes] = await Promise.all([
              fetch(`${API_URL}/products/${p.MaSP}/thong_so`),
              fetch(`${API_URL}/products/${p.MaSP}/media`)
            ]);
            const specs = await specRes.json();
            const media = await mediaRes.json();
            const spec = Array.isArray(specs) ? specs[0] : specs;
            return { ...p, ...spec, media: Array.isArray(media) ? media : [] };
          } catch {
            return p;
          }
        })
      );
      
      setProducts(productsWithSpecs);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (productId) => {
    if (!selectedImage) return null;
    
    const formDataImg = new FormData();
    formDataImg.append('file', selectedImage);
    
    const res = await fetch(`${API_URL}/products/${productId}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formDataImg
    });
    
    if (res.ok) {
      return await res.json();
    }
    return null;
  };

  const handleAddProduct = async () => {
    if (!formData.TenSP.trim()) {
      alert('Vui lòng nhập tên sản phẩm!');
      return;
    }
    
    setSaving(true);
    try {
      // 1. Create product
      const productRes = await fetch(`${API_URL}/products/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify([{
          TenSP: formData.TenSP,
          MoTa: formData.MoTa,
          MaDM: 1 // Default to phone category
        }])
      });
      
      if (!productRes.ok) {
        throw new Error('Failed to create product');
      }
      
      const newProducts = await productRes.json();
      const newProduct = newProducts[0];
      
      // 2. Add specs
      await fetch(`${API_URL}/products/${newProduct.MaSP}/thong_so`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify([{
          GiaBan: parseFloat(formData.GiaBan) || 0,
          RAM: formData.RAM || null,
          BoNho: formData.BoNho || null,
          MauSac: formData.MauSac || null,
          SoLuong: parseInt(formData.SoLuong) || 0
        }])
      });
      
      // 3. Upload image if selected
      if (selectedImage) {
        setUploading(true);
        await uploadImage(newProduct.MaSP);
        setUploading(false);
      }

      alert('Đã thêm sản phẩm thành công!');
      setShowAddModal(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Lỗi khi thêm sản phẩm!');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (!editProduct) return;
    
    setSaving(true);
    try {
      // Update product name/description
      await fetch(`${API_URL}/products/${editProduct.MaSP}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          TenSP: formData.TenSP,
          MoTa: formData.MoTa
        })
      });

      // Update specs if MaTSKT exists
      if (editProduct.MaTSKT) {
        await fetch(`${API_URL}/products/${editProduct.MaSP}/thong_so/${editProduct.MaTSKT}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            GiaBan: parseFloat(formData.GiaBan) || 0,
            RAM: formData.RAM,
            BoNho: formData.BoNho,
            MauSac: formData.MauSac,
            SoLuong: parseInt(formData.SoLuong) || 0
          })
        });
      }

      // Upload new image if selected
      if (selectedImage) {
        setUploading(true);
        await uploadImage(editProduct.MaSP);
        setUploading(false);
      }

      alert('Đã cập nhật sản phẩm thành công!');
      setEditProduct(null);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Lỗi khi lưu sản phẩm!');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
    
    try {
      await fetch(`${API_URL}/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      alert('Đã xóa sản phẩm!');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Lỗi khi xóa sản phẩm!');
    }
  };

  const formatPrice = (price) => {
    if (!price) return 'Chưa có giá';
    return new Intl.NumberFormat('vi-VN').format(price) + '₫';
  };

  const filteredProducts = products.filter(p =>
    p.TenSP?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Render form fields (shared between Add and Edit modals)
  const renderFormFields = () => (
    <div className="space-y-4">
      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh sản phẩm</label>
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center border-2 border-dashed border-gray-300">
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl text-gray-400">📷</span>
            )}
          </div>
          <div className="flex-1">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="inline-block px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl cursor-pointer font-medium text-gray-700 transition"
            >
              📤 Chọn ảnh
            </label>
            {uploading && <p className="text-sm text-blue-600 mt-1">Đang tải ảnh...</p>}
          </div>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm *</label>
        <input
          type="text"
          value={formData.TenSP}
          onChange={(e) => setFormData({...formData, TenSP: e.target.value})}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder="VD: iPhone 16 Pro Max"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
        <textarea
          value={formData.MoTa}
          onChange={(e) => setFormData({...formData, MoTa: e.target.value})}
          rows="2"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder="Mô tả sản phẩm..."
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Giá bán (VNĐ)</label>
          <input
            type="number"
            value={formData.GiaBan}
            onChange={(e) => setFormData({...formData, GiaBan: e.target.value})}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="VD: 35990000"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng</label>
          <input
            type="number"
            value={formData.SoLuong}
            onChange={(e) => setFormData({...formData, SoLuong: e.target.value})}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="VD: 50"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">RAM</label>
          <input
            type="text"
            value={formData.RAM}
            onChange={(e) => setFormData({...formData, RAM: e.target.value})}
            placeholder="8GB"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bộ nhớ</label>
          <input
            type="text"
            value={formData.BoNho}
            onChange={(e) => setFormData({...formData, BoNho: e.target.value})}
            placeholder="256GB"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Màu sắc</label>
          <input
            type="text"
            value={formData.MauSac}
            onChange={(e) => setFormData({...formData, MauSac: e.target.value})}
            placeholder="Đen"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
      </div>
    </div>
  );

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
            placeholder="Tìm kiếm sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
        <button
          onClick={() => { resetForm(); setShowAddModal(true); }}
          className="ml-4 px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition flex items-center gap-2"
        >
          <span>➕</span> Thêm sản phẩm
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-gray-500 text-sm">Tổng sản phẩm</p>
          <p className="text-2xl font-bold text-gray-800">{products.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-gray-500 text-sm">Còn hàng</p>
          <p className="text-2xl font-bold text-green-600">
            {products.filter(p => p.SoLuong > 0).length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-gray-500 text-sm">Hết hàng</p>
          <p className="text-2xl font-bold text-red-600">
            {products.filter(p => !p.SoLuong || p.SoLuong === 0).length}
          </p>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">ID</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Hình</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Tên sản phẩm</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Giá bán</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">RAM</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Bộ nhớ</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Tồn kho</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product.MaSP} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-600">#{product.MaSP}</td>
                    <td className="px-6 py-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                        {product.media && product.media.length > 0 ? (
                          <img 
                            src={`${API_URL}${product.media[0].DuongDanFile}`} 
                            alt={product.TenSP}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">📷</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-800 line-clamp-1 max-w-xs">
                        {product.TenSP}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-red-600">
                      {formatPrice(product.GiaBan)}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{product.RAM || '-'}</td>
                    <td className="px-6 py-4 text-gray-600">{product.BoNho || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        product.SoLuong > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {product.SoLuong || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditProduct(product)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Sửa"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(product.MaSP)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Xóa"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-400">
                    Không tìm thấy sản phẩm
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">✏️ Chỉnh sửa sản phẩm</h2>
              <button
                onClick={() => { setEditProduct(null); resetForm(); }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            {renderFormFields()}
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setEditProduct(null); resetForm(); }}
                className="flex-1 py-3 border border-gray-200 rounded-xl font-medium hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 disabled:opacity-50"
              >
                {saving ? 'Đang lưu...' : '💾 Lưu thay đổi'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">➕ Thêm sản phẩm mới</h2>
              <button
                onClick={() => { setShowAddModal(false); resetForm(); }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            {renderFormFields()}
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowAddModal(false); resetForm(); }}
                className="flex-1 py-3 border border-gray-200 rounded-xl font-medium hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleAddProduct}
                disabled={saving}
                className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 disabled:opacity-50"
              >
                {saving ? 'Đang thêm...' : '✅ Thêm sản phẩm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminProducts;
