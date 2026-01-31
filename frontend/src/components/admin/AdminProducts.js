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
    KichThuoc: '',
    Camera: '',
    PhienBan: '',
    Chitset: '',
    Pin: '',
    TheSim: '',
    HeDieuHanh: '',
    RAM: ''
  });

  // Variants state
  const [variants, setVariants] = useState([]);
  const [editingVariantIndex, setEditingVariantIndex] = useState(null);
  const [currentVariant, setCurrentVariant] = useState({
    BoNho: '',
    MauSac: '',
    GiaBan: '',
    SoLuong: ''
  });

  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 10;

  // Check if user is logged in
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      history.push('/login');
      return;
    }
    if (userInfo && userInfo.MaPQ !== 1) {
      alert("Bạn không có quyền truy cập trang này!");
      history.push('/');
    }
  }, [token, userInfo, history]);

  useEffect(() => {
    fetchProducts(0);
  }, []);

  // Update form when editProduct changes
  useEffect(() => {
    if (editProduct) {
      setFormData({
        TenSP: editProduct.TenSP || '',
        MoTa: editProduct.MoTa || '',
        KichThuoc: editProduct.KichThuoc || '',
        Camera: editProduct.Camera || '',
        PhienBan: editProduct.PhienBan || '',
        Chitset: editProduct.Chitset || '',
        Pin: editProduct.Pin || '',
        TheSim: editProduct.TheSim || '',
        HeDieuHanh: editProduct.HeDieuHanh || '',
        RAM: editProduct.RAM || ''
      });
      // Load existing variants
      setVariants(editProduct.thongso_list || []);
      
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
      KichThuoc: '',
      Camera: '',
      PhienBan: '',
      Chitset: '',
      Pin: '',
      TheSim: '',
      HeDieuHanh: '',
      RAM: ''
    });
    setVariants([]);
    setCurrentVariant({
      BoNho: '',
      MauSac: '',
      GiaBan: '',
      SoLuong: ''
    });
    setSelectedImage(null);
    setImagePreview(null);
  };

  const fetchProducts = async (offset = 0) => {
    try {
      if (offset === 0) setLoading(true); 
      
      const res = await fetch(`${API_URL}/products?limit=${LIMIT}&skip=${offset}`);
      const data = await res.json();
      
      const newProducts = data; 
      
      if (offset === 0) {
        setProducts(newProducts);
        setSkip(0);
      } else {
        setProducts(prev => [...prev, ...newProducts]);
      }

      if (data.length < LIMIT) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }

    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      if (offset === 0) setLoading(false);
    }
  };

  const handleLoadMore = () => {
    const nextSkip = skip + LIMIT;
    setSkip(nextSkip);
    fetchProducts(nextSkip);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const addVariant = () => {
    if (!currentVariant.BoNho || !currentVariant.MauSac || !currentVariant.GiaBan) {
      alert("Vui lòng nhập đủ Bộ nhớ, Màu sắc và Giá bán");
      return;
    }

    if (editingVariantIndex !== null) {
      // Update existing
      const updatedVariants = [...variants];
      updatedVariants[editingVariantIndex] = {
        ...updatedVariants[editingVariantIndex], // Keep MaTSKT if exists
        ...currentVariant,
        GiaBan: parseFloat(currentVariant.GiaBan),
        SoLuong: parseInt(currentVariant.SoLuong) || 0
      };
      setVariants(updatedVariants);
      setEditingVariantIndex(null);
    } else {
      // Add new
      setVariants([...variants, {
        ...currentVariant,
        GiaBan: parseFloat(currentVariant.GiaBan),
        SoLuong: parseInt(currentVariant.SoLuong) || 0
      }]);
    }

    setCurrentVariant({
      BoNho: '',
      MauSac: '',
      GiaBan: '',
      SoLuong: ''
    });
  };

  const removeVariant = (index) => {
    const item = variants[index];
    
    const confirmDelete = () => {
        const newVariants = variants.filter((_, i) => i !== index);
        setVariants(newVariants);
        if (editingVariantIndex === index) {
            setEditingVariantIndex(null);
            setCurrentVariant({ BoNho: '', MauSac: '', GiaBan: '', SoLuong: '' });
        }
    };

    if (editProduct && item.MaTSKT) {
        if(window.confirm("Bạn có chắc muốn xóa biến thể này? Hành động không thể hoàn tác.")) {
            fetch(`${API_URL}/products/thong_so/${item.MaTSKT}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            }).then(() => {
                confirmDelete();
            });
        }
    } else {
        confirmDelete();
    }
  };

  const handleEditVariant = (index) => {
      setEditingVariantIndex(index);
      const v = variants[index];
      setCurrentVariant({
          BoNho: v.BoNho,
          MauSac: v.MauSac,
          GiaBan: v.GiaBan,
          SoLuong: v.SoLuong
      });
  };

  const cancelEditVariant = () => {
      setEditingVariantIndex(null);
      setCurrentVariant({ BoNho: '', MauSac: '', GiaBan: '', SoLuong: '' });
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
    
    if (variants.length === 0) {
        if(!window.confirm("Sản phẩm chưa có biến thể nào (Màu sắc/Bộ nhớ). Bạn có chắc muốn tạo?")) return;
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
          MaDM: 1,
          KichThuoc: formData.KichThuoc,
          Camera: formData.Camera,
          PhienBan: formData.PhienBan,
          Chitset: formData.Chitset,
          Pin: formData.Pin,
          TheSim: formData.TheSim,
          HeDieuHanh: formData.HeDieuHanh
        }])
      });
      
      if (!productRes.ok) throw new Error('Failed to create product');
      
      const newProducts = await productRes.json();
      const newProduct = newProducts[0];
      
      // 2. Add specs (variants)
      if (variants.length > 0) {
          await fetch(`${API_URL}/products/${newProduct.MaSP}/thong_so`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(variants.map(v => ({
              GiaBan: parseFloat(v.GiaBan) || 0,
              RAM: v.RAM || null,
              BoNho: v.BoNho || null,
              MauSac: v.MauSac || null,
              SoLuong: parseInt(v.SoLuong) || 0
            })))
          });
      }
      
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
      // 1. Update product info (Static specs)
      await fetch(`${API_URL}/products/${editProduct.MaSP}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          TenSP: formData.TenSP,
          MoTa: formData.MoTa,
          KichThuoc: formData.KichThuoc,
          Camera: formData.Camera,
          PhienBan: formData.PhienBan,
          Chitset: formData.Chitset,
          Pin: formData.Pin,
          TheSim: formData.TheSim,
          HeDieuHanh: formData.HeDieuHanh
        })
      });

      // 2. Handle Variants
      const newVariants = variants.filter(v => !v.MaTSKT);
      const existingVariants = variants.filter(v => v.MaTSKT);

      // 2a. Add new variants
      if (newVariants.length > 0) {
          await fetch(`${API_URL}/products/${editProduct.MaSP}/thong_so`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(newVariants.map(v => ({
              GiaBan: parseFloat(v.GiaBan) || 0,
              RAM: v.RAM || null,
              BoNho: v.BoNho || null,
              MauSac: v.MauSac || null,
              SoLuong: parseInt(v.SoLuong) || 0
            })))
          });
      }

      // 2b. Update existing variants
      await Promise.all(existingVariants.map(v => 
          fetch(`${API_URL}/products/${editProduct.MaSP}/thong_so/${v.MaTSKT}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              GiaBan: parseFloat(v.GiaBan) || 0,
              RAM: v.RAM,
              BoNho: v.BoNho,
              MauSac: v.MauSac,
              SoLuong: parseInt(v.SoLuong) || 0
            })
          })
      ));

      // 3. Upload new image if selected
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

  // const formatPrice = (price) => {
  //   if (!price) return 'Chưa có giá';
  //   return new Intl.NumberFormat('vi-VN').format(price) + '₫';
  // };

  const filteredProducts = products.filter(p =>
    p.TenSP?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Render form fields (shared between Add and Edit modals)
  const renderFormFields = () => (
    <div className="space-y-6">
      {/* 1. Thông tin chung */}
      <div className="bg-gray-50 p-4 rounded-xl space-y-4">
        <h3 className="font-bold text-gray-800 border-b pb-2">📦 Thông tin chung</h3>
        
        {/* Image Upload */}
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh sản phẩm</label>
            <div className="flex items-center gap-4">
            <div className="w-24 h-24 bg-white rounded-xl overflow-hidden flex items-center justify-center border-2 border-dashed border-gray-300">
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
                className="inline-block px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl cursor-pointer font-medium text-gray-700 transition"
                >
                📤 Chọn ảnh
                </label>
                {uploading && <p className="text-sm text-blue-600 mt-1">Đang tải ảnh...</p>}
            </div>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm *</label>
                <input
                    type="text"
                    value={formData.TenSP}
                    onChange={(e) => setFormData({...formData, TenSP: e.target.value})}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="VD: iPhone 16 Pro Max"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phiên bản / Dòng</label>
                <input
                    type="text"
                    value={formData.PhienBan}
                    onChange={(e) => setFormData({...formData, PhienBan: e.target.value})}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="VD: VN/A, Quốc tế"
                />
            </div>
        </div>
        
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
            <textarea
                value={formData.MoTa}
                onChange={(e) => setFormData({...formData, MoTa: e.target.value})}
                rows="2"
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Mô tả sản phẩm..."
            />
        </div>

        <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kích thước màn hình</label>
                <input type="text" value={formData.KichThuoc} onChange={(e) => setFormData({...formData, KichThuoc: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-gray-200" placeholder="6.7 inch" />
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Camera</label>
                <input type="text" value={formData.Camera} onChange={(e) => setFormData({...formData, Camera: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-gray-200" placeholder="48MP + 12MP" />
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chipset</label>
                <input type="text" value={formData.Chitset} onChange={(e) => setFormData({...formData, Chitset: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-gray-200" placeholder="A17 Pro" />
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pin</label>
                <input type="text" value={formData.Pin} onChange={(e) => setFormData({...formData, Pin: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-gray-200" placeholder="4422 mAh" />
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thẻ SIM</label>
                <input type="text" value={formData.TheSim} onChange={(e) => setFormData({...formData, TheSim: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-gray-200" placeholder="1 Nano SIM & 1 eSIM" />
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hệ điều hành</label>
                <input type="text" value={formData.HeDieuHanh} onChange={(e) => setFormData({...formData, HeDieuHanh: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-gray-200" placeholder="iOS 17" />
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">RAM (GB)</label>
                <input type="text" value={formData.RAM} onChange={(e) => setFormData({...formData, RAM: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-gray-200" placeholder="8GB" />
             </div>
        </div>
      </div>

      {/* 2. Quản lý biến thể */}
      <div className="bg-gray-50 p-4 rounded-xl space-y-4">
        <h3 className="font-bold text-gray-800 border-b pb-2">🎨 Biến thể (Màu sắc & Bộ nhớ)</h3>
        
        {/* Table Variants */}
        {variants.length > 0 && (
            <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-100 text-gray-600 font-bold">
                        <tr>
                            <th className="p-3">Bộ nhớ</th>
                            <th className="p-3">Màu sắc</th>
                            <th className="p-3">Giá bán</th>
                            <th className="p-3">Kho</th>
                            <th className="p-3">Xóa</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {variants.map((v, idx) => (
                            <tr key={idx} className={editingVariantIndex === idx ? "bg-blue-50" : ""}>
                                <td className="p-3">{v.BoNho}</td>
                                <td className="p-3">{v.MauSac}</td>
                                <td className="p-3 font-bold text-red-600">{new Intl.NumberFormat('vi-VN').format(v.GiaBan)}₫</td>
                                <td className="p-3">{v.SoLuong}</td>
                                <td className="p-3 flex gap-2">
                                    <button onClick={() => handleEditVariant(idx)} className="text-blue-500 hover:underline">Sửa</button>
                                    <button onClick={() => removeVariant(idx)} className="text-red-500 hover:underline">Xóa</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}

        {/* Add Variant Form */}
        <div className="grid grid-cols-5 gap-2 items-end">
            <div className="col-span-1">
                <label className="text-xs font-bold text-gray-500">Bộ nhớ</label>
                <input type="text" value={currentVariant.BoNho} onChange={e => setCurrentVariant({...currentVariant, BoNho: e.target.value})} className="w-full px-2 py-2 rounded border" placeholder="128GB" />
            </div>
            <div className="col-span-1">
                <label className="text-xs font-bold text-gray-500">Màu sắc</label>
                <input type="text" value={currentVariant.MauSac} onChange={e => setCurrentVariant({...currentVariant, MauSac: e.target.value})} className="w-full px-2 py-2 rounded border" placeholder="Titan" />
            </div>
            <div className="col-span-1">
                <label className="text-xs font-bold text-gray-500 ">Giá bán</label>
                <input type="number" value={currentVariant.GiaBan} onChange={e => setCurrentVariant({...currentVariant, GiaBan: e.target.value})} className="w-full px-2 py-2 rounded border" placeholder="0" />
            </div>
            <div className="col-span-1">
                <label className="text-xs font-bold text-gray-500">Số lượng</label>
                <input type="number" value={currentVariant.SoLuong} onChange={e => setCurrentVariant({...currentVariant, SoLuong: e.target.value})} className="w-full px-2 py-2 rounded border" placeholder="0" />
            </div>
            <div className="col-span-1 flex gap-1">
                {editingVariantIndex !== null ? (
                    <>
                        <button onClick={addVariant} className="flex-1 py-2 bg-green-600 text-white font-bold rounded hover:bg-green-700 text-xs">
                            Cập nhật
                        </button>
                        <button onClick={cancelEditVariant} className="px-2 py-2 bg-gray-500 text-white font-bold rounded hover:bg-gray-600 text-xs">
                            Huỷ
                        </button>
                    </>
                ) : (
                    <button onClick={addVariant} className="w-full py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 text-sm">
                        + Thêm
                    </button>
                )}
            </div>
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
      {/* <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-gray-500 text-sm">Tổng sản phẩm</p>
          <p className="text-2xl font-bold text-gray-800">{products.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-gray-500 text-sm">Còn hàng</p>
          <p className="text-2xl font-bold text-green-600">
            {products.filter(p => p..SoLuong > 0).length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-gray-500 text-sm">Hết hàng</p>
          <p className="text-2xl font-bold text-red-600">
            {products.filter(p => !p.SoLuong || p.SoLuong === 0).length}
          </p>
        </div>
      </div> */}

      {/* Products Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">ID</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Hình</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Tên sản phẩm</th>
                {/* <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Giá bán</th> */}
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">RAM</th>
                {/* <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Bộ nhớ</th> */}
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
                    {/* <td className="px-6 py-4 font-bold text-red-600">
                      {formatPrice(product.GiaBan)}
                    </td> */}
                    <td className="px-6 py-4 text-gray-600">{product.RAM || '-'}</td>
                    {/* <td className="px-6 py-4 text-gray-600">{product.BoNho || '-'}</td> */}
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                         (product.thongso_list?.reduce((acc, curr) => acc + (curr.SoLuong || 0), 0) || 0) > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                         {(product.thongso_list?.reduce((acc, curr) => acc + (curr.SoLuong || 0), 0) || 0) > 0 
                          ? `Còn hàng (${product.thongso_list?.reduce((acc, curr) => acc + (curr.SoLuong || 0), 0)})` 
                          : 'Hết hàng'}
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
      
      {/* Load More Button */}
      {hasMore && !searchTerm && (
        <div className="mt-8 flex justify-center">
            <button 
                onClick={handleLoadMore}
                className="px-8 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center gap-2"
            >
                ⬇️ Xem thêm sản phẩm
            </button>
        </div>
      )}

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
