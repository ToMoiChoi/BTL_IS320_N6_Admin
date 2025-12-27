# app/routers/ai_chat.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import os
import google.generativeai as genai
from ..database import get_db
from ..models import models

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

class ChatRequest(BaseModel):
    message: str
    conversation_history: Optional[list] = []

class ChatResponse(BaseModel):
    reply: str
    products: Optional[list] = []

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

@router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(request: ChatRequest, db: Session = Depends(get_db)):
    """Chat with AI assistant for customer support"""
    
    if not GEMINI_API_KEY:
        # Fallback response if no API key
        return ChatResponse(
            reply="Xin chào! 👋 Tôi là trợ lý ảo của CellphoneS. Hiện tại hệ thống AI đang được cập nhật. Vui lòng liên hệ hotline 1800.2097 để được tư vấn trực tiếp nhé! 📞",
            products=[]
        )
    
    try:
        # Configure Gemini
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-pro')
        
        # Get products info for context
        products_info = get_products_info(db)
        
        # Build the full prompt
        full_prompt = SYSTEM_PROMPT.format(products_info=products_info)
        
        # Build conversation
        conversation = []
        for msg in request.conversation_history[-6:]:  # Keep last 6 messages for context
            conversation.append(msg)
        
        # Add current message
        conversation.append({"role": "user", "parts": [request.message]})
        
        # Create chat
        chat = model.start_chat(history=[
            {"role": "user", "parts": [full_prompt]},
            {"role": "model", "parts": ["Tôi đã hiểu. Tôi là trợ lý tư vấn của CellphoneS, sẵn sàng hỗ trợ khách hàng!"]},
        ])
        
        # Get response
        response = chat.send_message(request.message)
        
        # Extract product recommendations if any
        recommended_products = []
        for product in db.query(models.SanPham).all():
            if product.TenSP.lower() in response.text.lower():
                specs = db.query(models.ThongSoKyThuat).filter(
                    models.ThongSoKyThuat.MaSP == product.MaSP
                ).first()
                if specs:
                    recommended_products.append({
                        "MaSP": product.MaSP,
                        "TenSP": product.TenSP,
                        "GiaBan": float(specs.GiaBan) if specs.GiaBan else 0
                    })
        
        return ChatResponse(
            reply=response.text,
            products=recommended_products[:3]  # Max 3 recommendations
        )
        
    except Exception as e:
        print(f"AI Chat Error: {e}")
        return ChatResponse(
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
