import React, { useState } from "react";
import { useHistory, Link } from "react-router-dom";
import { API_URL } from "../../config";

const Login = ({ onLoginSuccess }) => {
  const history = useHistory();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(""); // Xóa lỗi khi người dùng bắt đầu nhập lại
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Dữ liệu dạng Form Data cho OAuth2PasswordRequestForm
      const params = new URLSearchParams();
      params.append("username", formData.username);
      params.append("password", formData.password);

      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Accept": "application/json",
        },
        body: params,
      });

      const data = await response.json();

      if (!response.ok) {
        // Xử lý lỗi từ FastAPI (thường nằm trong data.detail)
        const errorMsg =
          typeof data.detail === "string"
            ? data.detail
            : "Tên đăng nhập hoặc mật khẩu không đúng";
        throw new Error(errorMsg);
      }

      // Lưu Token vào localStorage
      if (data.access_token) {
        localStorage.setItem("token", data.access_token);
        
        // Fetch User Info ngay lập tức để kiểm tra quyền
        const meRes = await fetch(`${API_URL}/users/me`, {
          headers: {
            "Authorization": `Bearer ${data.access_token}`
          }
        });

        if (meRes.ok) {
          const userInfo = await meRes.json();
          if (onLoginSuccess) onLoginSuccess(userInfo);

          // Redirect Admin -> /admin, User -> /
          if (userInfo.MaPQ === 1) {
            history.push("/admin");
          } else {
            history.push("/");
          }
        } else {
           // Fallback nếu không lấy được info
           history.push("/");
        }
      } else {
         history.push("/");
      }

    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 border border-gray-100">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-extrabold text-red-600 tracking-tighter italic">
            Cellphone<span className="text-gray-900">S</span>
          </h2>
          <p className="text-gray-500 mt-3 font-medium text-lg">
            Chào mừng bạn trở lại!
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-medium rounded-md animate-pulse">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 px-1">
              Tên đăng nhập
            </label>
            <input
              name="username"
              type="text"
              className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-red-100 focus:border-red-500 outline-none transition-all duration-200 bg-gray-50 focus:bg-white"
              placeholder="Nhập tên đăng nhập"
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 px-1">
              Mật khẩu
            </label>
            <input
              name="password"
              type="password"
              className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-red-100 focus:border-red-500 outline-none transition-all duration-200 bg-gray-50 focus:bg-white"
              placeholder="••••••••"
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex items-center justify-between text-sm px-1">
            <label className="flex items-center text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                className="mr-2 rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              Ghi nhớ đăng nhập
            </label>
            <Link
              to="/forgot-password"
              size="small"
              className="text-red-600 font-bold hover:underline"
            >
              Quên mật khẩu?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-red-600 text-white py-4 rounded-2xl font-black text-xl hover:bg-red-700 shadow-xl shadow-red-200 active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest"
          >
            {isLoading ? "Đang xác thực..." : "Đăng nhập"}
          </button>
        </form>

        <div className="mt-10 pt-6 border-t border-gray-100 text-center">
          <p className="text-gray-600 font-medium">
            Bạn là khách hàng mới?{" "}
            <Link
              to="/register"
              className="text-red-600 font-extrabold hover:underline transition-all"
            >
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
