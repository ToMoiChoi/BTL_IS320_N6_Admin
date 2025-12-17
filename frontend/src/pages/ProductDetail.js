import React from 'react';
import { useHistory } from 'react-router-dom';


const ProductDetail = ({ product }) => {
  const history = useHistory();
  // Mock data cho các tab
  const tabs = [
    { label: 'Thông tin sản phẩm', content: 'Chi tiết về sản phẩm...' },
    { label: 'Thông số kỹ thuật', content: 'Màn hình: 6.43 inches...' },
    { label: 'Đánh giá', content: 'Hiện chưa có đánh giá...' },
  ];
  const [activeTab, setActiveTab] = React.useState('Thông tin sản phẩm');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Thanh Breadcrumb */}
      <div className="container mx-auto px-4 py-3 text-sm text-gray-500">
        <span className="cursor-pointer hover:text-red-500" onClick={() => history.push('/')}>Điện thoại</span> &gt; OPPO &gt; {product.name}

      </div>

      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-semibold mb-6">{product.name}</h1>

        <div className="flex flex-wrap lg:flex-nowrap gap-6">
          {/* Cột trái: Hình ảnh, Thông tin cơ bản, Cam kết */}
          <div className="w-full lg:w-2/3 bg-white p-6 rounded-lg shadow">
            
            {/* Vùng Hình ảnh và Nổi bật */}
            <div className="flex flex-col md:flex-row gap-6 mb-8">
              <div className="w-full md:w-2/5 flex flex-col items-center">
                <img src={product.image} alt={product.name} className="w-full h-auto max-w-xs object-contain" />
                <div className="flex mt-4 gap-2">
                  <div className="w-10 h-10 border border-red-500 p-1 rounded"><img src={product.image} alt="thumb" className="w-full h-full object-cover rounded" /></div>
                  {/* Thêm ảnh nhỏ khác */}
                  <div className="w-10 h-10 border border-gray-300 p-1 rounded"><img src={product.image} alt="thumb" className="w-full h-full object-cover rounded opacity-50" /></div>
                </div>
              </div>
              <div className="w-full md:w-3/5">
                <h2 className="text-lg font-bold text-red-600 mb-2">TÍNH NĂNG NỔI BẬT</h2>
                <div className="text-sm text-gray-700 space-y-2 border-l-4 border-red-500 pl-3">
                  <p>✅ Chip MediaTek Dimensity 920 mạnh mẽ, tối ưu game.</p>
                  <p>✅ Camera 64MP chất lượng, ảnh chụp đẹp, sắc nét.</p>
                  <p>✅ Màn hình AMOLED 6.43 inches, tần số quét 90Hz mượt mà.</p>
                </div>
              </div>
            </div>

            {/* Vùng Cam kết & Tab */}
            <div className="border-t pt-4">
                <h2 className="text-lg font-bold mb-4">Cam kết sản phẩm</h2>
                <div className="flex flex-wrap justify-between text-xs text-gray-700">
                    <div className="w-1/2 md:w-1/4 p-2">✅ Bảo hành 12 tháng</div>
                    <div className="w-1/2 md:w-1/4 p-2">✅ Hỗ trợ đổi mới trong 30 ngày</div>
                    <div className="w-1/2 md:w-1/4 p-2">✅ Giao hàng miễn phí</div>
                    <div className="w-1/2 md:w-1/4 p-2">✅ Hỗ trợ trả góp 0%</div>
                </div>
            </div>

            {/* Vùng Tabs Thông tin */}
            <div className="mt-8">
                <div className="flex border-b border-gray-200">
                    {tabs.map((tab) => (
                        <button
                            key={tab.label}
                            onClick={() => setActiveTab(tab.label)}
                            className={`py-3 px-6 text-sm font-medium transition duration-150 ${
                                activeTab === tab.label
                                    ? 'border-b-2 border-red-600 text-red-600'
                                    : 'text-gray-500 hover:text-red-500'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
                <div className="pt-4">
                    {activeTab === 'Thông số kỹ thuật' && (
                        <table className="w-full text-sm text-left text-gray-700">
                            <tbody>
                                {product.specs.map((spec, index) => (
                                    <tr key={index} className="border-b hover:bg-gray-50">
                                        <td className="py-2 font-medium w-1/3">{spec.label}</td>
                                        <td className="py-2">{spec.detail}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                    {/* Placeholder cho các tab khác */}
                    {activeTab !== 'Thông số kỹ thuật' && (
                         <div className="text-gray-500">{tabs.find(t => t.label === activeTab).content}</div>
                    )}
                </div>
            </div>

          </div>

          {/* Cột phải: Giá, Lựa chọn, Khuyến mãi */}
          <div className="w-full lg:w-1/3">
            <div className="bg-white p-6 rounded-lg shadow sticky top-24">
              
              {/* Giá và Tình trạng */}
              <div className="mb-4">
                <div className="flex items-end gap-3">
                  <span className="text-3xl font-bold text-red-600">{product.price}</span>
                  <span className="text-lg text-gray-400 line-through">{product.originalPrice}</span>
                </div>
                <div className="text-sm font-medium text-red-600 mt-1">{product.discountText}</div>
                <div className="bg-green-100 text-green-700 text-sm font-medium px-3 py-1 rounded mt-2">
                    ✅ Còn hàng tại Hồ Chí Minh
                </div>
              </div>

              {/* Lựa chọn RAM/ROM */}
              <h3 className="font-bold mb-3">Phiên bản</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {product.ramRomOptions.map((option, index) => (
                    <button 
                        key={index}
                        className={`px-4 py-2 text-sm rounded-lg border transition ${
                            option.active 
                            ? 'border-red-500 bg-red-50 text-red-600 font-semibold' 
                            : 'border-gray-300 hover:border-red-500'
                        }`}
                    >
                        {option.label}
                        <div className="text-xs text-gray-500">{option.specs}</div>
                    </button>
                ))}
              </div>

              {/* Lựa chọn Màu sắc */}
              <h3 className="font-bold mb-3">Màu sắc: <span className="text-red-600">{product.color}</span></h3>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full border-2 border-red-500 flex items-center justify-center cursor-pointer">
                    <span className="block w-6 h-6 bg-blue-500 rounded-full" title="Xanh dương"></span>
                </div>
                <div className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center cursor-pointer">
                    <span className="block w-6 h-6 bg-black rounded-full" title="Đen"></span>
                </div>
                <div className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center cursor-pointer">
                    <span className="block w-6 h-6 bg-pink-300 rounded-full" title="Hồng"></span>
                </div>
              </div>

              {/* Khu vực mua hàng */}
              <button className="w-full bg-red-600 text-white font-bold py-3 rounded-lg text-lg mb-2 hover:bg-red-700 transition">
                MUA NGAY
              </button>
              <button className="w-full bg-blue-500 text-white font-bold py-3 rounded-lg text-lg hover:bg-blue-600 transition">
                TRẢ GÓP 0%
              </button>
              
              <p className="text-center text-xs text-gray-500 mt-2">Hoặc gọi <span className="font-semibold text-red-600">1800.1500</span> để được tư vấn mua hàng</p>

              {/* Khuyến mãi */}
              <div className="mt-6 border-t pt-4">
                <h3 className="font-bold mb-3 text-red-600">🔥 Khuyến mãi áp dụng</h3>
                <ul className="space-y-3 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                        <span className="text-red-600">🎁</span> 
                        Tặng gói Google One Premium 12 tháng (Trị giá 200.000đ)
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-red-600">🎉</span> 
                        Giảm thêm 500.000đ khi thanh toán qua VNPay
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-red-600">💳</span> 
                        Trả góp 0% qua thẻ tín dụng (Áp dụng 3-6 tháng)
                    </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;