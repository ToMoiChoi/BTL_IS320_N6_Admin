import React, { useState, useEffect } from "react";
import { API_URL, PROVINCES_API } from "../config";

const CustomerInfoModal = ({
    isOpen,
    onClose,
    userMe,
    onUpdateSuccess,
    updating,
    setUpdating
}) => {
    const [updateForm, setUpdateForm] = useState({
        HoTen: "",
        SoDienThoai: "",
        DiaChi: ""
    });

    // Provinces API states
    const [provinces, setProvinces] = useState([]);
    const [wards, setWards] = useState([]);
    const [selectedProvince, setSelectedProvince] = useState(null);
    const [selectedWard, setSelectedWard] = useState(null);
    const [addressDetail, setAddressDetail] = useState("");
    const [loadingProvinces, setLoadingProvinces] = useState(false);
    const [phoneError, setPhoneError] = useState("");

    // Validate Vietnam phone number (10 digits, starts with 0)
    const validatePhone = (phone) => {
        const cleaned = phone.replace(/\D/g, '');
        if (!cleaned) return "Vui lòng nhập số điện thoại";
        if (cleaned.length !== 10) return "Số điện thoại phải có 10 chữ số";
        if (!cleaned.startsWith('0')) return "Số điện thoại phải bắt đầu bằng 0";
        // Check valid prefixes (03x, 05x, 07x, 08x, 09x)
        const validPrefixes = ['03', '05', '07', '08', '09'];
        const prefix = cleaned.substring(0, 2);
        if (!validPrefixes.includes(prefix)) return "Đầu số không hợp lệ";
        return "";
    };

    // Format phone number as user types (0xxx xxx xxx)
    const formatPhone = (value) => {
        const cleaned = value.replace(/\D/g, '');
        if (cleaned.length <= 4) return cleaned;
        if (cleaned.length <= 7) return `${cleaned.slice(0, 4)} ${cleaned.slice(4)}`;
        return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7, 10)}`;
    };

    const handlePhoneChange = (e) => {
        const rawValue = e.target.value.replace(/\D/g, '').slice(0, 10);
        setUpdateForm({ ...updateForm, SoDienThoai: rawValue });
        setPhoneError(validatePhone(rawValue));
    };

    // Fetch provinces on mount
    useEffect(() => {
        if (isOpen) {
            fetchProvinces();
            // Initialize form with user data
            setUpdateForm({
                HoTen: userMe?.thongtin?.HoTen || "",
                SoDienThoai: userMe?.thongtin?.SoDienThoai || "",
                DiaChi: userMe?.thongtin?.DiaChi || ""
            });
            // Reset province selections
            setSelectedProvince(null);
            setSelectedWard(null);
            setWards([]);
            setAddressDetail("");
            setPhoneError("");
        }
    }, [isOpen, userMe]);

    const fetchProvinces = async () => {
        setLoadingProvinces(true);
        try {
            const response = await fetch(`${PROVINCES_API}?depth=2`);
            if (response.ok) {
                const data = await response.json();
                setProvinces(data);
            }
        } catch (error) {
            console.error("Lỗi khi tải danh sách tỉnh/thành:", error);
        } finally {
            setLoadingProvinces(false);
        }
    };

    const fetchDistricts = async (districtCode) => {
        if (!districtCode) {
            setWards([]);
            return;
        }
        try {
            const response = await fetch(`${PROVINCES_API}/p/${districtCode}?depth=2`);
            if (response.ok) {
                const data = await response.json();
                setWards(data.wards || []);
                setSelectedWard(null);
            }
        } catch (error) {
            console.error("Lỗi khi tải danh sách phường/xã:", error);
        }
    };

    const handleProvinceChange = (e) => {
        const provinceCode = e.target.value;
        const province = provinces.find(p => p.code.toString() === provinceCode);
        setSelectedProvince(province);
        fetchDistricts(provinceCode);
    };

    const handleWardChange = (e) => {
        const wardCode = e.target.value;
        const ward = wards.find(w => w.code.toString() === wardCode);
        setSelectedWard(ward);
    };

    // Combine address parts into full address
    const buildFullAddress = () => {
        const parts = [];
        if (addressDetail.trim()) parts.push(addressDetail.trim());
        if (selectedWard) parts.push(selectedWard.name);
        if (selectedProvince) parts.push(selectedProvince.name);
        return parts.join(", ");
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();

        // Build full address from selections
        const fullAddress = buildFullAddress();

        if (!updateForm.HoTen.trim() || !updateForm.SoDienThoai.trim()) {
            alert("Vui lòng điền đầy đủ thông tin!");
            return;
        }

        if (!fullAddress && !updateForm.DiaChi.trim()) {
            alert("Vui lòng nhập địa chỉ nhận hàng!");
            return;
        }

        const finalAddress = fullAddress || updateForm.DiaChi;

        setUpdating(true);
        const token = localStorage.getItem("token");

        try {
            const response = await fetch(`${API_URL}/users/me`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    HoTen: updateForm.HoTen,
                    SoDienThoai: updateForm.SoDienThoai,
                    DiaChi: finalAddress
                }),
            });

            if (response.ok) {
                const updatedData = await response.json();
                onUpdateSuccess(updatedData);
                onClose();
                alert("Cập nhật thông tin thành công!");
            } else {
                const error = await response.json();
                alert(`Lỗi: ${error.detail || "Không thể cập nhật"}`);
            }
        } catch (error) {
            console.error("Lỗi khi cập nhật:", error);
            alert("Không thể kết nối đến server");
        } finally {
            setUpdating(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-200 px-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                    ×
                </button>

                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Cập nhật thông tin nhận hàng
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                    Vui lòng cập nhật đầy đủ thông tin để tiếp tục thanh toán
                </p>

                <form onSubmit={handleUpdateSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Tên người nhận <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={updateForm.HoTen}
                            onChange={(e) => setUpdateForm({ ...updateForm, HoTen: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            placeholder="Nhập tên của bạn"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Số điện thoại <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="tel"
                            value={formatPhone(updateForm.SoDienThoai)}
                            onChange={handlePhoneChange}
                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${phoneError && updateForm.SoDienThoai
                                    ? 'border-red-500 focus:ring-red-500'
                                    : 'border-gray-300 focus:ring-red-500'
                                }`}
                            placeholder="0xxx xxx xxx"
                            maxLength={12}
                            required
                        />
                        {phoneError && updateForm.SoDienThoai && (
                            <p className="mt-1 text-sm text-red-500">{phoneError}</p>
                        )}
                        {!phoneError && updateForm.SoDienThoai.length === 10 && (
                            <p className="mt-1 text-sm text-green-600">✓ Số điện thoại hợp lệ</p>
                        )}
                    </div>

                    {/* Province/District/Ward Selectors */}
                    <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                        <p className="text-sm font-semibold text-gray-700 mb-2">
                            📍 Chọn địa chỉ <span className="text-red-500">*</span>
                        </p>

                        {/* Province */}
                        <div className="flex space-x-4" >
                            <select
                                value={selectedProvince?.code || ""}
                                onChange={handleProvinceChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                                disabled={loadingProvinces}
                            >
                                <option value="">-- Chọn Tỉnh/Thành phố --</option>
                                {provinces.map((province) => (
                                    <option key={province.code} value={province.code}>
                                        {province.name}
                                    </option>
                                ))}
                            </select>


                            {/* Ward */}
                            <select
                                value={selectedWard?.code || ""}
                                onChange={handleWardChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                                disabled={!selectedProvince}
                            >
                                <option value="">-- Chọn Phường/Xã --</option>
                                {wards.map((ward) => (
                                    <option key={ward.code} value={ward.code}>
                                        {ward.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {/* Address detail */}
                        <input
                            type="text"
                            value={addressDetail}
                            onChange={(e) => setAddressDetail(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            placeholder="Số nhà, tên đường..."
                        />

                        {/* Preview full address */}
                        {(selectedProvince || addressDetail) && (
                            <div className="mt-2 p-3 bg-white rounded-lg border border-gray-200">
                                <p className="text-xs text-gray-500 mb-1">Địa chỉ đầy đủ:</p>
                                <p className="text-sm font-medium text-gray-800">
                                    {buildFullAddress() || "Chưa đủ thông tin"}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button
                            type="submit"
                            disabled={updating}
                            className="flex-1 bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {updating ? "Đang cập nhật..." : "Lưu thay đổi"}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 border border-gray-300 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-50 transition"
                        >
                            Hủy
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CustomerInfoModal;
