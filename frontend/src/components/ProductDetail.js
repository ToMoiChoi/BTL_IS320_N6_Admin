import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const ProductDetail = () => {
  const { productId } = useParams(); // Lấy MaSP từ URL
  const [specs, setSpecs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSpecs = async () => {
      try {
        setLoading(true);
        // Gọi API lấy thông số kỹ thuật dựa trên MaSP
        const response = await fetch(
          `http://127.0.0.1:8000/products/${productId}/thong_so`
        );

        if (!response.ok) {
          throw new Error("Không thể tải thông số kỹ thuật sản phẩm");
        }

        const data = await response.json();
        setSpecs(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchSpecs();
    }
  }, [productId]);

  if (loading)
    return (
      <div className="text-center py-20 font-medium text-gray-600">
        Đang tải cấu hình chi tiết...
      </div>
    );
  if (error)
    return <div className="text-center py-20 text-red-500">Lỗi: {error}</div>;
  if (!specs)
    return (
      <div className="text-center py-20 text-gray-500">
        Không tìm thấy thông số kỹ thuật.
      </div>
    );

  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Cột trái: Hình ảnh (Bạn có thể lấy thêm data sản phẩm chung để hiện ảnh ở đây) */}
          <div className="flex flex-col items-center">
            <div className="w-full max-w-md bg-gray-50 rounded-2xl p-8 border border-gray-100 shadow-sm">
              <img
                src="https://picsum.photos/600/600" // Thay bằng product.HinhAnh thực tế
                alt="Sản phẩm"
                className="w-full h-auto object-contain transition-transform hover:scale-105 duration-500"
              />
            </div>
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500 italic font-medium">
                Màu sắc: {specs.MauSac}
              </p>
            </div>
          </div>

          {/* Cột phải: Thông số kỹ thuật */}
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Thông số kỹ thuật
            </h1>
            <div className="mb-6">
              <span className="text-3xl font-extrabold text-red-600">
                {new Intl.NumberFormat("vi-VN").format(specs.GiaBan)}₫
              </span>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <tbody>
                  {[
                    {
                      label: "Màn hình",
                      value: `${specs.PhienBan} (${specs.KichThuoc})`,
                    },
                    { label: "Chipset", value: specs.Chitset },
                    { label: "RAM", value: specs.RAM },
                    { label: "Bộ nhớ trong", value: specs.BoNho },
                    { label: "Hệ điều hành", value: specs.HeDieuHanh },
                    { label: "Thẻ Sim", value: specs.TheSim },
                    {
                      label: "Pin",
                      value:
                        specs.Pin === "string" ? "Đang cập nhật" : specs.Pin,
                    },
                    { label: "Camera", value: specs.Camera },
                  ].map((item, index) => (
                    <tr
                      key={index}
                      className={`${
                        index % 2 === 0 ? "bg-gray-50" : "bg-white"
                      } border-b border-gray-100 last:border-0`}
                    >
                      <td className="px-4 py-3 font-semibold text-gray-600 w-1/3">
                        {item.label}
                      </td>
                      <td className="px-4 py-3 text-gray-800">{item.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button className="mt-8 w-full bg-red-600 text-white font-bold py-4 rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-200 uppercase tracking-wider">
              Mua Ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
