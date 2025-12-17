import React from 'react';
import { useHistory } from 'react-router-dom';


const Cart = () => {
  const history = useHistory();
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Lấy token nếu có
    const token = localStorage.getItem('access_token');
    fetch('http://localhost:8000/cart', {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(data => {
        setItems(data.items || data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const totalPrice = items.reduce((sum, item) => sum + parseFloat(item.price.replace(/[.đ,]/g, '')) * item.quantity, 0);
  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + 'đ';
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Đang tải giỏ hàng...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nội dung Giỏ hàng */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-xl">
          <div className="flex items-center mb-6">
            <button 
                onClick={() => history.push('/')} 
                className="text-gray-600 hover:text-red-500 mr-4 font-semibold"
            >
                ←
            </button>
            <h1 className="text-2xl font-bold">Giỏ hàng của bạn</h1>
          </div>
          {/* Thanh tìm kiếm */}
          <div className="relative mb-6">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Tìm sản phẩm trong giỏ"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>
          <div className="mb-4 flex items-center gap-2">
            <input type="checkbox" className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 accent-green-600" defaultChecked />
            <span className="font-medium text-gray-700">Chọn tất cả</span>
          </div>
          {/* Danh sách sản phẩm */}
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-center border border-gray-200 p-4 rounded-lg">
                <input type="checkbox" className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 accent-green-600 mr-4" defaultChecked />
                <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded mr-4" />
                <div className="flex-1">
                  <h3 className="font-medium text-sm mb-1">{item.name}</h3>
                  <p className="text-red-600 font-bold">{item.price}</p>
                </div>
                <div className="flex items-center border border-gray-300 rounded-lg ml-4">
                  <button className="px-3 py-1 text-gray-500 hover:bg-gray-100 rounded-l-lg">-</button>
                  <span className="px-3 py-1 border-x border-gray-300 text-sm font-medium">{item.quantity}</span>
                  <button className="px-3 py-1 text-gray-500 hover:bg-gray-100 rounded-r-lg">+</button>
                </div>
                <button className="text-gray-400 hover:text-red-500 ml-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 10-2 0v6a1 1 0 102 0V8z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          {/* Vùng thanh toán */}
          <div className="mt-8 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-medium text-gray-700">Tạm tính:</span>
              <span className="text-lg font-bold text-red-600">{formatPrice(totalPrice)}</span>
            </div>
            <button className="w-full bg-red-600 text-white font-bold py-3 rounded-lg text-lg hover:bg-green-700 transition">
              HOÀN TẤT ĐẶT HÀNG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;