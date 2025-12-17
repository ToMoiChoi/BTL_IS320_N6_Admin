import requests
import json

# 1. Access Token đã lấy từ bước đăng nhập
ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJzdHJpbmciLCJ1c2VyX2lkIjoxLCJleHAiOjE3NjQ4NDg2ODUuMTU1MDI3fQ.CevYfr3EeDqwF8R-a4d8aN16IbUGUPN1pMTiPWGu5jo" 
# (Thay thế bằng Token thực tế)

# 2. Xây dựng Headers
headers = {
    "Authorization": f"Bearer {ACCESS_TOKEN}"
}

# 3. Gửi yêu cầu GET tới endpoint đã bảo vệ
response = requests.get("http://127.0.0.1:8000/products", headers=headers)

if response.status_code == 200:
    print("Truy cập thành công!")
    print(response.json())
else:
    # Nếu không thành công, bạn sẽ nhận được lỗi 401 Unauthorized
    print(f"Lỗi: {response.status_code} - {response.text}")