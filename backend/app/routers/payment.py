from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import os
import asyncio
from dotenv import load_dotenv
from pathlib import Path

# --- LIBRARY PATCH REMOVED ---
# The mbbank library has been patched directly in .venv
# See: .venv/Lib/site-packages/mbbank/capcha_ocr.py
# -----------------------------

from ..database import get_db
from ..models import models
from ..deps import get_current_user

# Load .env file
env_path = Path(__file__).parent.parent.parent / ".env"
load_dotenv(env_path)

router = APIRouter(prefix="/payment", tags=["payment"])

def sync_mbbank_check(username, password, account, order_code, amount):
    """
    Synchronous wrapper for MBBank operations to run in a separate thread.
    """
    from mbbank import MBBank
    
    # Initialize
    mb = MBBank(username=username, password=password)
    
    # Date range for checking
    now = datetime.now()
    from_date = now - timedelta(hours=2)
    to_date = now

    history = mb.getTransactionAccountHistory(
        accountNo=account if account else None,
        from_date=from_date, 
        to_date=to_date
    )
    
    if not history or "transactionHistoryList" not in history:
        return []
        
    return history.get("transactionHistoryList", [])

async def check_mbbank_transaction(order_code: str, amount: float) -> bool:
    MB_USERNAME = os.getenv("MB_USERNAME", "")
    MB_PASSWORD = os.getenv("MB_PASSWORD", "")
    MB_ACCOUNT = os.getenv("MB_ACCOUNT", "")

    if not all([MB_USERNAME, MB_PASSWORD, MB_ACCOUNT]):
        print("⚠️ MBBank credentials missing in .env")
        return False

    try:
        # Run the heavy MBBank IO logic in a background thread to keep FastAPI responsive
        trans_list = await asyncio.to_thread(
            sync_mbbank_check, 
            MB_USERNAME, MB_PASSWORD, MB_ACCOUNT, order_code, amount
        )

        if trans_list is None: return False

        for trans in trans_list:
            description = trans.get("description", "").upper()
            credit_amount = float(trans.get("creditAmount", 0))
            
            # Match logic: Order code in text AND amount matches within 1000 VND
            if order_code.upper() in description and abs(credit_amount - amount) < 1000:
                return True
        
        return False
        
    except Exception as e:
        print(f"❌ MBBank check error: {str(e)}")
        return False

@router.get("/check/{order_id}")
async def check_payment_status(
    order_id: int, 
    db: Session = Depends(get_db), 
    user = Depends(get_current_user)
):
    order = db.query(models.DonHang).filter(models.DonHang.MaDH == order_id).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Đơn hàng không tồn tại")
    
    # Check permissions
    if getattr(user, "MaPQ", 2) != 1 and order.MaTK != user.MaTK:
        raise HTTPException(status_code=403, detail="Không có quyền")

    # Order code format used in MBBank transfers
    order_code = f"DHVNP00{order_id}"
    amount = float(order.ThanhTien)
    
    is_paid = await check_mbbank_transaction(order_code, amount)
    
    if is_paid:
        # Update to 'Processing' (2)
        order.MaTrangThai = 2
        db.commit()
        return {"paid": True, "message": "Thanh toán thành công!", "status": "processing"}
    
    return {"paid": False, "message": "Chưa nhận được thanh toán"}

@router.get("/status/{order_id}")
async def get_payment_status(order_id: int, db: Session = Depends(get_db), user = Depends(get_current_user)):
    order = db.query(models.DonHang).filter(models.DonHang.MaDH == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Đơn hàng không tồn tại")
    
    status_map = {1: "pending", 2: "processing", 3: "shipping", 4: "completed", 5: "cancelled"}
    return {
        "order_id": order_id,
        "status": status_map.get(order.MaTrangThai, "unknown"),
        "is_paid": order.MaTrangThai >= 2 and order.MaTrangThai != 5
    }