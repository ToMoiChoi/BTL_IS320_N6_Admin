import React from "react";
import { Link } from "react-router-dom";

const Breadcrumb = ({ searchText }) => (
  <nav className="flex items-center text-gray-500 text-sm mb-6" aria-label="Breadcrumb">
    <Link to="/" className="flex items-center font-semibold hover:text-red-600">
      Trang chủ
    </Link>
    <span className="mx-2">/</span>
    <span>Kết quả tìm kiếm cho: <span className="font-semibold text-gray-700">'{searchText}'</span></span>
  </nav>
);

export default Breadcrumb;
