import React, { useState, useEffect } from "react";
import Card from "../../../../BTL_IS320_N6_APP/src/components/Card"; // Đảm bảo đường dẫn đúng tới file Card.js của bạn

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Hàm gọi API
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/products");
        if (!response.ok) {
          throw new Error("Không thể lấy dữ liệu từ server");
        }
        const data = await response.json();
        setProducts(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading)
    return <div className="text-center p-10">Đang tải sản phẩm...</div>;
  if (error)
    return <div className="text-center p-10 text-red-500">Lỗi: {error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Danh sách sản phẩm</h2>
      {/* Grid hiển thị danh sách Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <Card key={product.MaSP} product={product} />
        ))}
      </div>
    </div>
  );
};

export default ProductList;
z