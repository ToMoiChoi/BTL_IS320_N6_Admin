import React from 'react';

const Footer = () => {

  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="container mx-auto px-4 pt-10 pb-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
          {/* Cột 1: Tổng đài hỗ trợ */}
          <div>
            <h3 className="font-bold mb-3 text-gray-800">Tổng đài hỗ trợ miễn phí</h3>
            <p className="mb-1 text-gray-600">Mua hàng và tư vấn: <span className="font-semibold text-red-600">1800.1500</span> (7h30 - 22h00)</p>
            <p className="mb-4 text-gray-600">Khiếu nại: <span className="font-semibold text-red-600">1800.1744</span> (8h00 - 21h30)</p>

            <h3 className="font-bold mb-3 text-gray-800">Phương thức thanh toán</h3>
            <div className="flex flex-wrap gap-2">
              <img src="https://via.placeholder.com/30x20.png?text=VNPay" alt="VNPay" className="h-5 w-auto" />
              <img src="https://via.placeholder.com/30x20.png?text=Moca" alt="Moca" className="h-5 w-auto" />
              <img src="https://via.placeholder.com/30x20.png?text=Visa" alt="Visa" className="h-5 w-auto" />
              <img src="https://via.placeholder.com/30x20.png?text=Master" alt="MasterCard" className="h-5 w-auto" />
              <img src="https://via.placeholder.com/30x20.png?text=JCB" alt="JCB" className="h-5 w-auto" />
              <img src="https://via.placeholder.com/30x20.png?text=Payoo" alt="Payoo" className="h-5 w-auto" />
            </div>
          </div>

          {/* Cột 2: Thông tin và chính sách */}
          <div>
            <h3 className="font-bold mb-3 text-gray-800">Thông tin và chính sách</h3>
            <ul className="space-y-2 text-gray-600">
              <li><a href="#" className="hover:text-red-600">Mua hàng và thanh toán Online</a></li>
              <li><a href="#" className="hover:text-red-600">Mua hàng trả góp Online</a></li>
              <li><a href="#" className="hover:text-red-600">Mua hàng trả góp bằng thẻ tín dụng</a></li>
              <li><a href="#" className="hover:text-red-600">Chính sách giao hàng</a></li>
              <li><a href="#" className="hover:text-red-600">Chính sách đổi trả</a></li>
              <li><a href="#" className="hover:text-red-600">Tra điểm Smember</a></li>
              <li><a href="#" className="hover:text-red-600">Xem ưu đãi Smember</a></li>
              <li><a href="#" className="hover:text-red-600">Tra thông tin bảo hành</a></li>
              <li><a href="#" className="hover:text-red-600">Tra cứu hoá đơn điện tử</a></li>
            </ul>
          </div>

          {/* Cột 3: Dịch vụ và thông tin khác */}
          <div>
            <h3 className="font-bold mb-3 text-gray-800">Dịch vụ và thông tin khác</h3>
            <ul className="space-y-2 text-gray-600">
              <li><a href="#" className="hover:text-red-600">Khách hàng doanh nghiệp (B2B)</a></li>
              <li><a href="#" className="hover:text-red-600">Ưu đãi thanh toán</a></li>
              <li><a href="#" className="hover:text-red-600">Quy chế hoạt động</a></li>
              <li><a href="#" className="hover:text-red-600">Chính sách bảo mật thông tin cá nhân</a></li>
              <li><a href="#" className="hover:text-red-600">Chính sách bảo hành</a></li>
              <li><a href="#" className="hover:text-red-600">Liên hệ hợp tác kinh doanh</a></li>
              <li><a href="#" className="hover:text-red-600">Tuyển dụng</a></li>
              <li><a href="#" className="hover:text-red-600">Dịch vụ bảo hành mở rộng</a></li>
            </ul>
            
            <h3 className="font-bold my-3 text-gray-800">Mới sớm cùng:</h3>
            <div className="flex gap-2">
                <span className="bg-red-100 text-red-600 text-xs font-semibold px-2 py-1 rounded">DIENTHOAIXINH</span>
                <span className="bg-blue-100 text-blue-600 text-xs font-semibold px-2 py-1 rounded">4CARE</span>
                <span className="bg-green-100 text-green-600 text-xs font-semibold px-2 py-1 rounded">4OFFICIAL</span>
                <span className="bg-yellow-100 text-yellow-600 text-xs font-semibold px-2 py-1 rounded">4SCENE</span>
            </div>
          </div>

          {/* Cột 4: Đăng ký nhận KM */}
          <div>
            <h3 className="font-bold mb-3 text-gray-800">ĐĂNG KÝ NHẬN KHUYẾN MÃI</h3>
            <p className="text-gray-600 mb-2">Đăng ký ngay để nhận voucher giảm <span className="font-semibold text-red-600">10%</span>.</p>
            <input type="email" placeholder="Nhập Email của bạn" className="w-full border border-gray-300 p-2 rounded-lg mb-2 text-sm focus:border-red-500 focus:ring-red-500" />
            <input type="tel" placeholder="Nhập số điện thoại của bạn" className="w-full border border-gray-300 p-2 rounded-lg mb-3 text-sm focus:border-red-500 focus:ring-red-500" />
            <div className="flex items-center mb-4">
              <input type="checkbox" id="agree" className="mr-2 accent-red-600" />
              <label htmlFor="agree" className="text-xs text-gray-600">Tôi đồng ý với điều khoản của Cellphones S.</label>
            </div>
            <button className="w-full bg-red-600 text-white font-bold py-2 rounded-lg hover:bg-red-700 transition">ĐĂNG KÝ NGAY</button>
          </div>
        </div>

        <div className="mt-10 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            © 2025 Bản quyền thuộc về Cellphone S.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;   

