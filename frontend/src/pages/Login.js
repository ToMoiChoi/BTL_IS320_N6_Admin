import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
const Login = ({ setCurrentPage, setIsLoggedIn }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const history = useHistory();

  const handleLogin = (e) => {
    e.preventDefault();
    // Logic giả lập: Nếu có thông tin, coi như đăng nhập thành công
    if (phone && password) {
        setIsLoggedIn(true); // Cập nhật trạng thái đăng nhập
        history.push('/profile');
        setCurrentPage('list'); // Chuyển về trang chủ
        alert('Đăng nhập thành công!');
    } else {
        alert('Vui lòng nhập đầy đủ Số điện thoại và Mật khẩu.');
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-10">
      <div className="container mx-auto px-4 flex flex-wrap lg:flex-nowrap max-w-5xl shadow-xl rounded-xl overflow-hidden">
        
        {/* Cột trái: Giới thiệu ưu đãi */}
        <div className="w-full lg:w-1/2 bg-gray-50 p-8 flex flex-col justify-center items-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Nhập hội khách hàng thành viên <span className="text-pink-600">4MEMBER</span>
            <br />
            Để không bỏ lỡ các ưu đãi hấp dẫn từ <span className="text-pink-600">Nhóm 4</span>
          </h2>

          <div className="p-4 border-2 border-red-400 rounded-xl bg-gray-100/70 mb-6 w-full max-w-sm">
            <ul className="text-sm space-y-3 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">⭐</span> Chiết khấu **5%** khi mua các sản phẩm mua tại Nhóm 4
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">🚚</span> Miễn phí giao hàng cho thành viên 4MEM, 4VIP và cho đơn hàng từ **300.000đ**
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">🎁</span> Tặng voucher sinh nhật đến **500.000đ** cho khách hàng thành viên
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">💰</span> Trợ giá thu cũ lên đến **1 triệu**
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">🎫</span> Thăng hạng nhận voucher đến **300.000đ**
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">👑</span> Đặc quyền 4-Student/4-Teacher ưu đãi thêm **10%**
              </li>
            </ul>
            <div className="text-center mt-4">
                <a href="#" className="text-red-500 text-sm font-semibold hover:underline">
                    Xem chi tiết chính sách ưu đãi 4member &gt;
                </a>
            </div>
          </div>
          
          <img src="https://via.placeholder.com/150x150.png?text=4MEMBER_BOT" alt="4MEMBER Robot" className="w-32 h-auto" />
        </div>

        {/* Cột phải: Form Đăng nhập */}
        <div className="w-full lg:w-1/2 p-8 md:p-12">
          <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Đăng nhập 4MEMBER</h1>

          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Số điện thoại</label>
              <input
                type="tel"
                id="phone"
                placeholder="Nhập số điện thoại của bạn"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 w-full border border-gray-300 p-3 rounded-lg focus:border-red-500 focus:ring-red-500"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Mật khẩu</label>
              <div className="relative">
                <input
                  type="password"
                  id="password"
                  placeholder="Nhập mật khẩu của bạn"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full border border-gray-300 p-3 rounded-lg pr-10 focus:border-red-500 focus:ring-red-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer">
                    👁️
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-red-500 text-white font-bold py-3 rounded-lg text-lg hover:bg-red-600 transition duration-150"
            >
              Đăng nhập
            </button>

            <p className="text-center text-sm">
                <a href="#" className="text-red-500 hover:underline">Quên mật khẩu?</a>
            </p>

            <div className="text-center pt-4 border-t border-gray-200">
                <p className="mb-2 text-sm text-gray-600">Bạn chưa có tài khoản? 
                    <button 
                        type="button" 
                        onClick={() => history.push('/register')} 
                        className="text-red-500 font-semibold hover:underline ml-1"
                    >
                        Đăng ký ngay
                    </button>
                </p>
                <p className="text-xs text-gray-400">
                    Mua sắm, sửa chữa tại <a href="#" className="text-red-500 hover:underline">nhom4.com.vn</a> và <a href="#" className="text-red-500 hover:underline">dienthoaixinh.com.vn</a>
                </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;