// Đã chuyển sang fetch API, file này không còn sử dụng.

export const seriesCategories = [
    'IPHONE 17 SERIES',
    'IPHONE AIR',
    'IPHONE 16 SERIES',
    'IPHONE 15 SERIES',
    'IPHONE 14 SERIES',
    'IPHONE 13 SERIES',
    'IPHONE 12 SERIES',
    'IPHONE 11 SERIES'
];

export const filterOptions = [
    { icon: '🎛️', label: 'Bộ lọc', active: true },
    { icon: '🚚', label: 'Sẵn hàng' },
    { icon: '📦', label: 'Hàng mới về' },
    { icon: '⏰', label: 'Xem theo giá' },
    { label: 'Bộ nhớ trong', hasDropdown: true },
    { label: 'Dung lượng RAM', hasDropdown: true },
    { label: 'Kích thước màn hình', hasDropdown: true }
];

export const filterOptions2 = [
    { label: 'Nhu cầu sử dụng', hasDropdown: true },
    { label: 'Kiểu màn hình', hasDropdown: true },
    { label: 'Tính năng camera', hasDropdown: true },
    { label: 'Tần số quét', hasDropdown: true },
    { label: 'Tính năng đặc biệt', hasDropdown: true }
];

export const sortOptions = [
    { icon: '⭐', label: 'Phổ biến', value: 'popular' },
    { icon: '🔥', label: 'Khuyến mãi HOT', value: 'hot' },
    { icon: '↑', label: 'Giá Thấp - Cao', value: 'price-asc' },
    { icon: '↓', label: 'Giá Cao - Thấp', value: 'price-desc' }
];