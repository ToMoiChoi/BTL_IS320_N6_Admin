import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

const Login = ({ onLoginSuccess, onBack }) => {
    const history = useHistory();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:8000/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: formData.email,
                    password: formData.password
                })
            });
            if (!response.ok) {
                throw new Error('Đăng nhập thất bại');
            }
            const data = await response.json();
            // data nên chứa thông tin user và token
            if (onLoginSuccess) {
                onLoginSuccess(data.user || data);
            }
            // Lưu token nếu có
            if (data.access_token) {
                localStorage.setItem('access_token', data.access_token);
            }
            setIsLoading(false);
            history.push('/');
        } catch (error) {
            setIsLoading(false);
            alert(error.message || 'Đăng nhập thất bại');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white rounded-2xl shadow-xl p-8">
                {/* Back Button */}
                <button
                    onClick={() => history.push('/')}
                    className="flex items-center text-gray-600 hover:text-gray-800 transition duration-200 mb-4"
                >
                    <span className="mr-2">←</span>
                    Quay lại trang chủ
                </button>

                {/* Header */}
                <div className="text-center">
                    <div className="flex justify-center items-center mb-6">
                        <div className="text-3xl font-bold text-red-600">Cellphone S</div>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">Đăng nhập</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Chào mừng bạn trở lại!
                    </p>
                </div>

                {/* Login Form */}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email hoặc số điện thoại
                            </label>
                            <div className="relative">
                                <input
                                    id="email"
                                    name="email"
                                    type="text"
                                    required
                                    className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition duration-200"
                                    placeholder="Nhập email hoặc số điện thoại"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    <span className="text-gray-400">📧</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Mật khẩu
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition duration-200"
                                    placeholder="Nhập mật khẩu"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    <span className="text-gray-400">🔒</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                                Ghi nhớ đăng nhập
                            </label>
                        </div>

                        <button
                            type="button"
                            className="text-sm font-medium text-red-600 hover:text-red-500 transition duration-200"
                        >
                            Quên mật khẩu?
                        </button>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    Đang đăng nhập...
                                </div>
                            ) : (
                                'Đăng nhập'
                            )}
                        </button>
                    </div>

                    <div className="text-center">
                        <span className="text-sm text-gray-600">
                            Chưa có tài khoản?{' '}
                            <button
                                type="button"
                                className="font-medium text-red-600 hover:text-red-500 transition duration-200"
                            >
                                Đăng ký ngay
                            </button>
                        </span>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;