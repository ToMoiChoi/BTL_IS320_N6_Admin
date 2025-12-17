import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

const Register = () => {
  const history = useHistory();
  const [formData, setFormData] = useState({
    phone: '',
    name: '',
    dob: '',
    address: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('Mật khẩu không khớp!');
      return;
    }

    if (!formData.phone || !formData.name || !formData.password) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
      return;
    }

    console.log('Đăng ký thành công với dữ liệu:', formData);
    alert('Đăng ký thành công!');
    history.push('/login');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-10">
      <div className="container mx-auto px-4 flex flex-wrap lg:flex-nowrap max-w-5xl shadow-xl rounded-xl overflow-hidden">
          
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
          
          <img src="https://via.placeholder.com/150x150.png?text=4MEMBER_ROBOT" alt="4MEMBER Robot" className="w-32 h-auto" />
        </div>

        <div className="w-full lg:w-1/2 p-8 md:p-12">
          <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Đăng ký 4MEMBER</h1>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="reg-phone" className="block text-sm font-medium text-gray-700">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="reg-phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Nhập số điện thoại của bạn"
                className="mt-1 w-full border border-gray-300 p-3 rounded-lg focus:border-red-500 focus:ring-red-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="reg-name" className="block text-sm font-medium text-gray-700">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="reg-name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nhập họ và tên của bạn"
                className="mt-1 w-full border border-gray-300 p-3 rounded-lg focus:border-red-500 focus:ring-red-500"
                required

              />
            </div>
            
            <div>
              <label htmlFor="reg-dob" className="block text-sm font-medium text-gray-700">Ngày sinh</label>
              <input
                type="date"
                id="reg-dob"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className="mt-1 w-full border border-gray-300 p-3 rounded-lg focus:border-red-500 focus:ring-red-500"
              />
            </div>
            
            <div>
              <label htmlFor="reg-address" className="block text-sm font-medium text-gray-700">Địa chỉ</label>
              <input
                type="text"
                id="reg-address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Nhập địa chỉ của bạn"
                className="mt-1 w-full border border-gray-300 p-3 rounded-lg focus:border-red-500 focus:ring-red-500"
              />
            </div>

            <div>

              <label htmlFor="reg-password" className="block text-sm font-medium text-gray-700">
                Mật khẩu <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <input
                  type="password"
                  id="reg-password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Nhập mật khẩu của bạn"
                  className="mt-1 w-full border border-gray-300 p-3 rounded-lg pr-10 focus:border-red-500 focus:ring-red-500"
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer">
                  👁️
                </span>
              </div>
            </div>
            
            <div>
              <label htmlFor="reg-confirm-password" className="block text-sm font-medium text-gray-700">
                Nhập lại mật khẩu <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="reg-confirm-password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Nhập lại mật khẩu của bạn"
                  className="mt-1 w-full border border-gray-300 p-3 rounded-lg pr-10 focus:border-red-500 focus:ring-red-500"
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer">
                  👁️
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-red-500 text-white font-bold py-3 rounded-lg text-lg hover:bg-red-600 transition duration-150 mt-6"
            >
              Đăng ký
            </button>

            <div className="text-center pt-4">

              <p className="text-sm text-gray-600">
                Đã có tài khoản?{' '}
                <button
                  type="button"
                  onClick={() => history.push('/login')}
                  className="text-red-500 font-semibold hover:underline"
                >
                  Đăng nhập ngay
                </button>
              </p>
            </div>

            <div className="text-center pt-2">
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

export default Register;