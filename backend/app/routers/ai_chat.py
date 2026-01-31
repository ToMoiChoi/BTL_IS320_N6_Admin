# app/routers/ai_chat.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import os
from dotenv import load_dotenv
from google import genai
# from google.genai import types
from ..database import get_db
from ..models import models
from ..schemas import schemas
# Load environment variables
load_dotenv()

router = APIRouter(prefix="/ai", tags=["ai"])

# Configure Gemini API
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")

# System prompt for the AI assistant
SYSTEM_PROMPT = """Bạn là trợ lý tư vấn bán hàng của CellphoneS - cửa hàng điện thoại và phụ kiện hàng đầu Việt Nam.

Nhiệm vụ của bạn:
1. Tư vấn khách hàng chọn điện thoại phù hợp với nhu cầu và ngân sách
2. Giải đáp thắc mắc về sản phẩm, thông số kỹ thuật
3. So sánh giữa các sản phẩm
4. Hướng dẫn về chính sách bảo hành, đổi trả
5. Giới thiệu khuyến mãi đang có

Phong cách:
- Thân thiện, nhiệt tình, chuyên nghiệp
- Trả lời bằng tiếng Việt
- Ngắn gọn, dễ hiểu
- Sử dụng emoji phù hợp để tạo cảm giác thân thiện

Thông tin sản phẩm hiện có:
{products_info}

Lưu ý: Nếu khách hỏi về sản phẩm không có trong danh sách, hãy giới thiệu sản phẩm tương tự hoặc đề nghị liên hệ hotline 1800.2097 để được hỗ trợ thêm.
"""


def get_products_info(db: Session) -> str:
    """Get current products info for context"""
    products = db.query(models.SanPham).limit(20).all()
    
    info_list = []
    for p in products:
        specs = db.query(models.ThongSoKyThuat).filter(
            models.ThongSoKyThuat.MaSP == p.MaSP
        ).first()
        
        if specs:
            info_list.append(
                f"- {p.TenSP}: {specs.GiaBan:,.0f}đ, RAM {specs.RAM}, Bộ nhớ {specs.BoNho}, Màu {specs.MauSac}, Còn {specs.SoLuong} máy"
            )
        else:
            info_list.append(f"- {p.TenSP}")
    
    return "\n".join(info_list)

@router.post("/chat", response_model=schemas.ChatResponse)
async def chat_with_ai(request: schemas.ChatRequest, db: Session = Depends(get_db)):
    """Chat with AI assistant for customer support"""
    
    if not GEMINI_API_KEY:
        # Fallback response if no API key
        return schemas.ChatResponse(
            reply="Xin chào! 👋 Tôi là trợ lý ảo của CellphoneS. Hiện tại hệ thống AI đang được cập nhật. Vui lòng liên hệ hotline 1800.2097 để được tư vấn trực tiếp nhé! 📞",
            products=[]
        )
    
    try:
        # Create client with new SDK
        client = genai.Client(api_key=GEMINI_API_KEY)
        
        # Get products info for context
        products_info = get_products_info(db)
        
        # Build the full prompt
        full_prompt = SYSTEM_PROMPT.format(products_info=products_info)
        
        # Build conversation history for context
        history_text = ""
        for msg in request.conversation_history[-6:]:
            role = "Khách" if msg.get("role") == "user" else "Bot"
            parts = msg.get("parts", [])
            content = parts[0] if parts else ""
            history_text += f"{role}: {content}\n"
        
        # Create the full message
        user_message = f"""
{full_prompt}

Lịch sử hội thoại:
{history_text}

Khách hàng: {request.message}

Hãy trả lời ngắn gọn, thân thiện:
"""
        
        # Get response using new SDK
        response = client.models.generate_content(
            model="gemini-2.0-flash-lite",
            contents=user_message
        )
        
        reply_text = response.text if response.text else "Xin lỗi, tôi không thể xử lý yêu cầu này. Vui lòng thử lại!"
        
        # Extract product recommendations if any
        recommended_products = []
        for product in db.query(models.SanPham).all():
            if product.TenSP.lower() in reply_text.lower():
                specs = db.query(models.ThongSoKyThuat).filter(
                    models.ThongSoKyThuat.MaSP == product.MaSP
                ).first()
                if specs:
                    recommended_products.append({
                        "MaSP": product.MaSP,
                        "TenSP": product.TenSP,
                        "GiaBan": float(specs.GiaBan) if specs.GiaBan else 0
                    })
        
        return schemas.ChatResponse(
            reply=reply_text,
            products=recommended_products[:3]  # Max 3 recommendations
        )
        
    except Exception as e:
        print(f"AI Chat Error: {e}")
        return schemas.ChatResponse(
            reply=f"Xin lỗi, tôi gặp sự cố kỹ thuật. 😅 Bạn có thể liên hệ hotline 1800.2097 để được hỗ trợ ngay nhé! 📞",
            products=[]
        )

@router.get("/suggestions")
def get_suggestions():
    """Get common question suggestions"""
    return {
        "suggestions": [
            "Tư vấn điện thoại dưới 10 triệu",
            "So sánh iPhone 16 và Samsung S24",
            "Điện thoại chơi game tốt nhất?",
            "Điện thoại pin trâu nên mua gì?",
            "Chính sách bảo hành như thế nào?",
            "Có hỗ trợ trả góp không?"
        ]
    }
