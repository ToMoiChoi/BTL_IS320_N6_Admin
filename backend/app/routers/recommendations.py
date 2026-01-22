# app/routers/recommendations.py
"""
Product Recommendations API - Low Latency
Giải pháp: In-memory cache + Category-based filtering
Target latency: < 50ms
"""

import time
from typing import List, Dict, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas import schemas
from ..models import models


router = APIRouter(prefix="/products", tags=["recommendations"])


# ============================================================
# IN-MEMORY CACHE - Lưu sản phẩm theo category vào RAM
# ============================================================

class ProductCache:
    """
    Cache sản phẩm theo category để truy vấn nhanh.
    Load 1 lần khi khởi động server, refresh khi có update.
    """
    
    def __init__(self):
        self._cache: Dict[int, List[dict]] = {}  # {category_id: [products]}
        self._all_products: Dict[int, dict] = {}  # {product_id: product_data}
        self._last_refresh: float = 0
        self._is_loaded: bool = False
    
    def load_products(self, db: Session) -> None:
        """Load tất cả sản phẩm vào cache, nhóm theo category."""
        start_time = time.time()
        
        # Query tất cả sản phẩm với relationships
        products = db.query(models.SanPham).all()
        
        # Reset cache
        self._cache.clear()
        self._all_products.clear()
        
        for product in products:
            # Lấy giá thấp nhất từ các biến thể
            min_price = None
            total_stock = 0
            if product.thongso_list:
                prices = [ts.GiaBan for ts in product.thongso_list if ts.GiaBan]
                if prices:
                    min_price = min(prices)
                total_stock = sum(ts.SoLuong or 0 for ts in product.thongso_list)
            
            # Lấy ảnh đầu tiên
            first_image = None
            if product.media:
                first_image = product.media[0].DuongDanFile
            
            product_data = {
                "MaSP": product.MaSP,
                "TenSP": product.TenSP,
                "MoTa": product.MoTa,
                "MaDM": product.MaDM,
                "NgayTao": product.NgayTao,
                "GiaThapNhat": float(min_price) if min_price else None,
                "TongTonKho": total_stock,
                "AnhDaiDien": first_image,
            }
            
            # Lưu vào all_products
            self._all_products[product.MaSP] = product_data
            
            # Nhóm theo category
            category_id = product.MaDM or 0  # 0 cho sản phẩm không có category
            if category_id not in self._cache:
                self._cache[category_id] = []
            self._cache[category_id].append(product_data)
        
        self._last_refresh = time.time()
        self._is_loaded = True
        
        load_time_ms = (time.time() - start_time) * 1000
        print(f"[ProductCache] Loaded {len(self._all_products)} products in {load_time_ms:.2f}ms")
    
    def get_product(self, product_id: int) -> Optional[dict]:
        """Lấy thông tin 1 sản phẩm từ cache."""
        return self._all_products.get(product_id)
    
    def get_similar_products(
        self, 
        product_id: int, 
        limit: int = 6,
        exclude_out_of_stock: bool = True
    ) -> List[dict]:
        """
        Lấy sản phẩm tương tự (cùng category).
        Latency target: < 20ms
        """
        product = self._all_products.get(product_id)
        if not product:
            return []
        
        category_id = product.get("MaDM") or 0
        category_products = self._cache.get(category_id, [])
        
        # Lọc và sắp xếp
        result = []
        for p in category_products:
            # Bỏ qua sản phẩm hiện tại
            if p["MaSP"] == product_id:
                continue
            
            # Bỏ qua sản phẩm hết hàng (nếu yêu cầu)
            if exclude_out_of_stock and p["TongTonKho"] <= 0:
                continue
            
            result.append(p)
        
        # Sắp xếp: ưu tiên có hàng, sau đó theo ngày tạo mới nhất
        result.sort(
            key=lambda x: (
                -(x["TongTonKho"] or 0),  # Nhiều tồn kho trước
                -(x["NgayTao"].timestamp() if x["NgayTao"] else 0)  # Mới nhất trước
            )
        )
        
        return result[:limit]
    
    @property
    def is_loaded(self) -> bool:
        return self._is_loaded
    
    @property
    def stats(self) -> dict:
        return {
            "total_products": len(self._all_products),
            "total_categories": len(self._cache),
            "last_refresh": self._last_refresh,
            "is_loaded": self._is_loaded,
        }


# Global cache instance
product_cache = ProductCache()


def ensure_cache_loaded(db: Session) -> ProductCache:
    """Đảm bảo cache đã được load, nếu chưa thì load."""
    if not product_cache.is_loaded:
        product_cache.load_products(db)
    return product_cache


# ============================================================
# API ENDPOINTS
# ============================================================

@router.get("/{product_id}/recommendations", response_model=schemas.RecommendationsResponse)
def get_recommendations(
    product_id: int,
    limit: int = Query(default=6, ge=1, le=20, description="Số sản phẩm gợi ý tối đa"),
    include_out_of_stock: bool = Query(default=False, description="Bao gồm sản phẩm hết hàng"),
    db: Session = Depends(get_db)
):
    """
    Lấy danh sách sản phẩm tương tự.
    
    **Thuật toán**: Gợi ý sản phẩm cùng danh mục, ưu tiên còn hàng và mới nhất.
    
    **Latency**: < 50ms (sử dụng in-memory cache)
    """
    start_time = time.time()
    
    # Đảm bảo cache đã load
    cache = ensure_cache_loaded(db)
    
    # Kiểm tra sản phẩm tồn tại
    source_product = cache.get_product(product_id)
    if not source_product:
        # Fallback: query database nếu cache chưa có
        db_product = db.query(models.SanPham).filter(models.SanPham.MaSP == product_id).first()
        if not db_product:
            raise HTTPException(status_code=404, detail="Sản phẩm không tồn tại")
        # Reload cache
        cache.load_products(db)
        source_product = cache.get_product(product_id)
    
    # Lấy sản phẩm tương tự từ cache
    similar_products = cache.get_similar_products(
        product_id=product_id,
        limit=limit,
        exclude_out_of_stock=not include_out_of_stock
    )
    
    # Tính latency
    latency_ms = (time.time() - start_time) * 1000
    
    return schemas.RecommendationsResponse(
        source_product_id=product_id,
        source_category_id=source_product.get("MaDM"),
        recommendations=[
            schemas.RecommendationItem(
                MaSP=p["MaSP"],
                TenSP=p["TenSP"],
                GiaThapNhat=p["GiaThapNhat"],
                AnhDaiDien=p["AnhDaiDien"],
                TongTonKho=p["TongTonKho"],
            )
            for p in similar_products
        ],
        total_count=len(similar_products),
        latency_ms=round(latency_ms, 2)
    )


@router.post("/recommendations/refresh-cache")
def refresh_recommendations_cache(db: Session = Depends(get_db)):
    """
    Làm mới cache sản phẩm (Admin endpoint).
    Gọi khi thêm/sửa/xóa sản phẩm.
    """
    start_time = time.time()
    product_cache.load_products(db)
    load_time_ms = (time.time() - start_time) * 1000
    
    return {
        "message": "Cache refreshed successfully",
        "stats": product_cache.stats,
        "load_time_ms": round(load_time_ms, 2)
    }


@router.get("/recommendations/cache-stats")
def get_cache_stats():
    """Xem thống kê cache."""
    return product_cache.stats
