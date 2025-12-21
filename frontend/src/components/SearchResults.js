import React, { useEffect, useState } from "react";
import { useLocation, useHistory } from "react-router-dom";
import Card from "./Card";
import Breadcrumb from "./Breadcrumb";
import SortBar from "./SortBar";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const SearchResults = () => {
  const query = useQuery();
  const history = useHistory();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState(query.get("q") || "");
  const [selectedSort, setSelectedSort] = useState("");

  useEffect(() => {
    setSearchText(query.get("q") || "");
  }, [query]);

  useEffect(() => {
    if (!searchText) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch("http://127.0.0.1:8000/products")
      .then((res) => res.json())
      .then(async (data) => {
        const filtered = data.filter((p) =>
          p.TenSP?.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "").includes(
            searchText.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "")
          )
        );
        // Lấy specs và media cho từng sản phẩm
        const merged = await Promise.all(filtered.map(async (p) => {
          // Lấy thông số kỹ thuật
          let specs = [];
          try {
            const res = await fetch(`http://127.0.0.1:8000/products/${p.MaSP}/thong_so`);
            if (res.ok) specs = await res.json();
          } catch {}
          // Lấy media
          let media = [];
          try {
            const res = await fetch(`http://127.0.0.1:8000/products/${p.MaSP}/media`);
            if (res.ok) media = await res.json();
          } catch {}
          // Lấy biến thể đầu tiên có giá > 0, nếu không có thì lấy cái đầu tiên
          let spec = Array.isArray(specs) ? specs.find(s => s && s.GiaBan && s.GiaBan !== "0.00") || specs[0] : {};
          return {
            ...p,
            RAM: spec?.RAM,
            BoNho: spec?.BoNho,
            GiaBan: spec?.GiaBan,
            media: Array.isArray(media) ? media : [],
          };
        }));
        setProducts(merged);
      })
      .finally(() => setLoading(false));
  }, [searchText]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb searchText={searchText} />
        <SortBar selectedSort={selectedSort} setSelectedSort={setSelectedSort} />
        {loading ? (
          <div className="text-center py-20 text-gray-600">Đang tải kết quả...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-gray-400">Không tìm thấy sản phẩm phù hợp.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
            {[...products]
              .sort((a, b) => {
                const aHasPrice = a.GiaBan && a.GiaBan !== "0.00" && a.GiaBan !== 0;
                const bHasPrice = b.GiaBan && b.GiaBan !== "0.00" && b.GiaBan !== 0;
                if (!aHasPrice && !bHasPrice) return 0;
                if (!aHasPrice) return 1;
                if (!bHasPrice) return -1;
                if (selectedSort === "asc") {
                  return (Number(a.GiaBan) || 0) - (Number(b.GiaBan) || 0);
                } else if (selectedSort === "desc") {
                  return (Number(b.GiaBan) || 0) - (Number(a.GiaBan) || 0);
                }
                return 0;
              })
              .map((product) => (
                <Card key={product.MaSP} product={product} />
              ))}
          </div>
        )}
        <button
          className="mt-8 px-6 py-3 bg-gray-200 rounded-xl text-gray-700 font-bold hover:bg-gray-300"
          onClick={() => history.goBack()}
        >
          Quay lại
        </button>
      </div>
    </div>
  );
};

export default SearchResults;
