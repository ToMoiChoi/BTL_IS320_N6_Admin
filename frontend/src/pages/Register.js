import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { API_URL } from "../config";

const Register = ({ onLoginSuccess }) => {
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return alert("Mật khẩu xác nhận không khớp!");
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          maPQ: 2, // Mặc định là khách hàng
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Đăng ký thất bại");
      }

      // Lưu token và cập nhật trạng thái
      if (data.access_token) {
        localStorage.setItem("token", data.access_token);
      }

      if (onLoginSuccess) onLoginSuccess(data);

      alert("Đăng ký tài khoản thành công!");
      history.push("/");
    } catch (error) {
      alert("Lỗi: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-red-600">Cellphone S</h2>
          <p className="text-gray-500 mt-2">Tạo tài khoản mới</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="username"
            placeholder="Tên đăng nhập"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-red-500"
            onChange={handleChange}
            required
          />
          <input
            name="email"
            type="email"
            placeholder="Địa chỉ Email"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-red-500"
            onChange={handleChange}
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Mật khẩu"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-red-500"
            onChange={handleChange}
            required
          />
          <input
            name="confirmPassword"
            type="password"
            placeholder="Xác nhận mật khẩu"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-red-500"
            onChange={handleChange}
            required
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition disabled:opacity-50"
          >
            {isLoading ? "Đang xử lý..." : "ĐĂNG KÝ NGAY"}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600">
          Đã có tài khoản?{" "}
          <button onClick={() => history.push("/login")} className="text-red-600 font-bold hover:underline">
            Đăng nhập
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register;