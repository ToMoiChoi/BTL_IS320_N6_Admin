from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from decimal import Decimal
import os
import asyncio

from ..database import get_db
from ..models import models
from ..deps import get_current_user

router = APIRouter(prefix="/payment", tags=["payment"])

# MBBank credentials from environment variables
MB_USERNAME = os.getenv("MB_USERNAME", "")
MB_PASSWORD = os.getenv("MB_PASSWORD", "")
MB_ACCOUNT = os.getenv("MB_ACCOUNT", "0989148966")

async def check_mbbank_transaction(order_code: str, amount: float) -> bool:
    """
    Check if a transaction with the order code exists in MBBank history.
    Returns True if payment found, False otherwise.
    """
    if not MB_USERNAME or not MB_PASSWORD:
        print("⚠️ MBBank credentials not configured")
        return False
    
    try:
        from mbbank import MBBankAsync
        
        mb = MBBankAsync(username=MB_USERNAME, password=MB_PASSWORD)
        
        # Get transaction history for last 7 days
        from_date = datetime.now() - timedelta(days=7)
        to_date = datetime.now()
        
        history = await mb.getTransactionAccountHistory(
            accountNo=MB_ACCOUNT,
            from_date=from_date,
            to_date=to_date
        )
        
        if not history or "transactionHistoryList" not in history:
            return False
        
        # Search for matching transaction
        for trans in history["transactionHistoryList"]:
            description = trans.get("description", "").upper()
            credit_amount = float(trans.get("creditAmount", 0))
            
            # Check if order code is in description and amount matches (within 1000 VND tolerance)
            if order_code.upper() in description and abs(credit_amount - amount) < 1000:
                print(f"✅ Found matching transaction: {description} - {credit_amount}")
                return True
        
        return False
        
    except Exception as e:
        print(f"❌ MBBank check error: {e}")
        return False


@router.get("/check/{order_id}")
async def check_payment_status(
    order_id: int, 
    db: Session = Depends(get_db), 
    user = Depends(get_current_user)
):
    """
    Check if payment for an order has been received.
    Returns {"paid": true/false, "message": "..."}
    """
    # Get the order
    order = db.query(models.DonHang).filter(models.DonHang.MaDH == order_id).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Đơn hàng không tồn tại")
    
    # Check if user owns this order (unless admin)
    if getattr(user, "MaPQ", 2) != 1 and order.MaTK != user.MaTK:
        raise HTTPException(status_code=403, detail="Không có quyền xem đơn hàng này")
    
    # Order code format: DHVNP00{order_id}
    order_code = f"DHVNP00{order_id}"
    amount = float(order.ThanhTien)
    
    # Check MBBank transaction history
    is_paid = await check_mbbank_transaction(order_code, amount)
    
    if is_paid:
        # Update order status to "processing" (paid, awaiting shipment)
        order.MaTrangThai = 2  # processing
        db.commit()
        
        return {
            "paid": True,
            "message": "Đã nhận được thanh toán!",
            "order_id": order_id,
            "amount": amount
        }
    
    return {
        "paid": False,
        "message": "Chưa nhận được thanh toán",
        "order_id": order_id,
        "amount": amount
    }


@router.get("/status/{order_id}")
async def get_payment_status(
    order_id: int,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    """
    Get current payment status of an order (without checking bank).
    """
    order = db.query(models.DonHang).filter(models.DonHang.MaDH == order_id).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Đơn hàng không tồn tại")
    
    if getattr(user, "MaPQ", 2) != 1 and order.MaTK != user.MaTK:
        raise HTTPException(status_code=403, detail="Không có quyền xem đơn hàng này")
    
    # Status mapping
    status_names = {
        1: "pending",
        2: "processing", 
        3: "shipping",
        4: "completed",
        5: "cancelled",
        6: "refunded"
    }
    
    return {
        "order_id": order_id,
        "status_id": order.MaTrangThai,
        "status": status_names.get(order.MaTrangThai, "pending"),
        "is_paid": order.MaTrangThai >= 2 and order.MaTrangThai != 5,
        "amount": float(order.ThanhTien)
    }
