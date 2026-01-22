import React, { useState, useEffect } from "react";
import { API_URL } from "../../config";
import AdminLayout from "./AdminLayout";

/**
 * Admin Categories Management
 * CRUD danh mục sản phẩm
 */
const AdminCategories = ({ userInfo, onLogout }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    TenDM: "",
    Loai: "",
    MoTa: "",
    Icon: "",
    TrangThai: true,
  });

  const token = localStorage.getItem("token");

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/categories?include_inactive=true`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Open modal for create/edit
  const openModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        TenDM: category.TenDM,
        Loai: category.Loai || "",
        MoTa: category.MoTa || "",
        Icon: category.Icon || "",
        TrangThai: category.TrangThai,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        TenDM: "",
        Loai: "",
        MoTa: "",
        Icon: "",
        TrangThai: true,
      });
    }
    setShowModal(true);
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingCategory
      ? `${API_URL}/categories/${editingCategory.MaDM}`
      : `${API_URL}/categories`;
    const method = editingCategory ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        fetchCategories();
        setShowModal(false);
        alert(editingCategory ? "✅ Cập nhật thành công!" : "✅ Tạo mới thành công!");
      } else {
        const error = await res.json();
        alert(`Lỗi: ${error.detail}`);
      }
    } catch (err) {
      alert("Không thể kết nối server");
    }
  };

  // Toggle status
  const toggleStatus = async (category) => {
    try {
      const res = await fetch(`${API_URL}/categories/${category.MaDM}/toggle-status`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchCategories();
      }
    } catch (err) {
      console.error("Error toggling status:", err);
    }
  };

  // Delete category
  const deleteCategory = async (category) => {
    if (!window.confirm(`Bạn có chắc muốn xóa danh mục "${category.TenDM}"?\nSản phẩm trong danh mục sẽ không bị xóa.`)) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/categories/${category.MaDM}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        alert(`✅ ${data.detail}`);
        fetchCategories();
      } else {
        const error = await res.json();
        alert(`Lỗi: ${error.detail}`);
      }
    } catch (err) {
      alert("Không thể kết nối server");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <AdminLayout userInfo={userInfo} onLogout={onLogout}>
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">📂 Quản lý danh mục</h1>
        <button
          onClick={() => openModal()}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition flex items-center gap-2"
        >
          <span>+</span> Thêm danh mục
        </button>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">ID</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Icon</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tên danh mục</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Loại</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Mô tả</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Số SP</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Trạng thái</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories.map((cat) => (
              <tr key={cat.MaDM} className={`hover:bg-gray-50 ${!cat.TrangThai ? "opacity-50" : ""}`}>
                <td className="px-4 py-3 text-sm text-gray-600">{cat.MaDM}</td>
                <td className="px-4 py-3 text-2xl">{cat.Icon || "📱"}</td>
                <td className="px-4 py-3 font-medium text-gray-800">{cat.TenDM}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{cat.Loai || "-"}</td>
                <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">{cat.MoTa || "-"}</td>
                <td className="px-4 py-3 text-center">
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-bold">
                    {cat.SoLuongSP}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => toggleStatus(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                      cat.TrangThai
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    {cat.TrangThai ? "Hoạt động" : "Tắt"}
                  </button>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => openModal(cat)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      ✏️ Sửa
                    </button>
                    <button
                      onClick={() => deleteCategory(cat)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      🗑️ Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {categories.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Chưa có danh mục nào. Nhấn "Thêm danh mục" để tạo mới.
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold mb-4">
              {editingCategory ? "✏️ Sửa danh mục" : "➕ Thêm danh mục mới"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên danh mục *</label>
                <input
                  type="text"
                  value={formData.TenDM}
                  onChange={(e) => setFormData({ ...formData, TenDM: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Icon (emoji)</label>
                <input
                  type="text"
                  value={formData.Icon}
                  onChange={(e) => setFormData({ ...formData, Icon: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="📱 hoặc 💻"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Loại</label>
                <input
                  type="text"
                  value={formData.Loai}
                  onChange={(e) => setFormData({ ...formData, Loai: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="phone, laptop, accessory..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <textarea
                  value={formData.MoTa}
                  onChange={(e) => setFormData({ ...formData, MoTa: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 h-20"
                  placeholder="Mô tả ngắn về danh mục..."
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="status"
                  checked={formData.TrangThai}
                  onChange={(e) => setFormData({ ...formData, TrangThai: e.target.checked })}
                  className="w-4 h-4 text-red-600"
                />
                <label htmlFor="status" className="text-sm text-gray-700">Kích hoạt</label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  {editingCategory ? "Cập nhật" : "Tạo mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </AdminLayout>
  );
};

export default AdminCategories;
