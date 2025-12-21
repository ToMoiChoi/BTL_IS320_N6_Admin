import React, { useEffect, useState } from "react";
import Card from "./Card";
import { useParams } from "react-router-dom";

const CATEGORY_MAP = {
  0: "iPhone",
  1: "SamSung",
};

const CategoryProducts = () => {
  const { categoryId } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://127.0.0.1:8000/products");
        const data = await res.json();
        // Lọc sản phẩm theo mã danh mục
        const filtered = data.filter((p) => String(p.MaDM) === String(categoryId));
        setProducts(filtered);
      } catch (err) {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [categoryId]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 italic text-red-600">
          Danh mục: {CATEGORY_MAP[categoryId] || categoryId}
        </h1>
        {loading ? (
          <div className="text-center py-20 text-gray-600">Đang tải sản phẩm...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-gray-400">Không có sản phẩm nào.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
            {products.map((product) => (
              <Card key={product.MaSP} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryProducts;
