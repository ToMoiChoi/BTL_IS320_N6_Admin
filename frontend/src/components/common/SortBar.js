import React from "react";

const SortBar = ({ selectedSort, setSelectedSort }) => (
  <div className="bg-white p-4 rounded-2xl shadow-sm mb-8 border border-gray-100">
    <div className="flex items-center gap-4">
      <span className="font-bold text-gray-700">Sắp xếp theo:</span>
      <button
        className={`px-4 py-2 rounded-xl border text-sm font-bold transition ${selectedSort === "asc" ? "bg-red-50 border-red-500 text-red-600" : "bg-gray-50 border-transparent hover:bg-gray-100 text-gray-600"}`}
        onClick={() => setSelectedSort("asc")}
      >
        Giá tăng dần
      </button>
      <button
        className={`px-4 py-2 rounded-xl border text-sm font-bold transition ${selectedSort === "desc" ? "bg-red-50 border-red-500 text-red-600" : "bg-gray-50 border-transparent hover:bg-gray-100 text-gray-600"}`}
        onClick={() => setSelectedSort("desc")}
      >
        Giá giảm dần
      </button>
    </div>
  </div>
);

export default SortBar;
