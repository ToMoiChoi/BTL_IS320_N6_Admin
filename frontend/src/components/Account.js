import React, { useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom'; // Sử dụng v5 (useHistory)
import Header from './Header';
import Footer from './Footer';

// Component trang tài khoản
const Account = ({ isLoggedIn, userInfo, onLogout }) => {
    const history = useHistory();

    // Lấy thông tin người dùng từ props
    const userName = userInfo?.name || 'Người dùng';
    const userEmail = userInfo?.email || 'Chưa cập nhật email';
    const userPhone = userInfo?.phone || 'Chưa cập nhật SĐT';

    // 1. Bảo vệ Route: Nếu chưa đăng nhập, chuyển hướng về trang login
    useEffect(() => {
        if (!isLoggedIn) {
            history.push('/login');
        }
    }, [isLoggedIn, history]);

    // Xử lý đăng xuất từ trang này
    const handleLogout = () => {
        if (onLogout) {
            onLogout();
        }
        history.push('/'); // Chuyển về trang chủ sau khi đăng xuất
    };

    // Khi đang chuyển hướng (chưa đăng nhập), không hiển thị gì
    if (!isLoggedIn) {
        return null;
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            {/* Header chung */}
            <Header isLoggedIn={isLoggedIn} userInfo={userInfo} onLogout={onLogout} />

            <main className="flex-grow container mx-auto px-4 py-8 lg:py-12">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Tài khoản của bạn</h1>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

                    {/* Cột 1: Menu điều hướng (Sidebar) */}
                    <aside className="md:col-span-1">
                        <div className="bg-white p-4 rounded-lg shadow">
                            <nav className="flex flex-col space-y-2">
                                {/* Link "Thông tin tài khoản" (đang active) */}
                                <Link
                                    to="/account"
                                    className="px-4 py-3 bg-red-50 text-red-600 font-bold rounded-md"
                                >
                                    Thông tin tài khoản
                                </Link>
                                {/* Link "Đơn hàng" (ví dụ) */}
                                <Link
                                    to="/orders" // Giả sử bạn sẽ tạo route /orders
                                    className="px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-md"
                                >
                                    Đơn hàng của tôi
                                </Link>
                                {/* Nút Đăng xuất */}
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-4 py-3 text-red-600 hover:bg-gray-100 rounded-md font-medium"
                                >
                                    Đăng xuất
                                </button>
                            </nav>
                        </div>
                    </aside>

                    {/* Cột 2: Nội dung chính (Thông tin) */}
                    <section className="md:col-span-3">
                        <div className="bg-white p-6 lg:p-8 rounded-lg shadow">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">Thông tin chung</h2>

                            <form>
                                <div className="space-y-4">
                                    {/* Tên hiển thị */}
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                            Tên hiển thị
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            value={userName}
                                            readOnly
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                                        />
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            value={userEmail}
                                            readOnly
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                                        />
                                    </div>

                                    {/* Số điện thoại */}
                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                            Số điện thoại
                                        </label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            value={userPhone}
                                            readOnly
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                                        />
                                    </div>

                                    <div className="pt-4">
                                        <button
                                            type="button"
                                            className="px-6 py-2 bg-gray-300 text-gray-600 font-medium rounded-lg cursor-not-allowed"
                                        >
                                            Chỉnh sửa thông tin
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Account;