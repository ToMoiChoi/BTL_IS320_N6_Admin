# app/routers/websocket.py
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List, Dict
import json
import asyncio

router = APIRouter(tags=["websocket"])


class ConnectionManager:
    """Quản lý tất cả WebSocket connections"""
    
    def __init__(self):
        # Dict lưu trữ connections theo loại client
        self.active_connections: Dict[str, List[WebSocket]] = {
            "admin": [],      # Admin dashboard
            "customer": [],   # Customer notifications
            "all": []         # Tất cả connections
        }
    
    async def connect(self, websocket: WebSocket, client_type: str = "all"):
        """Kết nối client mới"""
        await websocket.accept()
        self.active_connections["all"].append(websocket)
        if client_type in self.active_connections:
            self.active_connections[client_type].append(websocket)
    
    def disconnect(self, websocket: WebSocket, client_type: str = "all"):
        """Ngắt kết nối client"""
        if websocket in self.active_connections["all"]:
            self.active_connections["all"].remove(websocket)
        if client_type in self.active_connections and websocket in self.active_connections[client_type]:
            self.active_connections[client_type].remove(websocket)
    
    async def send_personal_message(self, message: dict, websocket: WebSocket):
        """Gửi message đến một client cụ thể"""
        try:
            await websocket.send_json(message)
        except:
            pass
    
    async def broadcast(self, message: dict, client_type: str = "all"):
        """Broadcast message đến tất cả clients của một loại"""
        connections = self.active_connections.get(client_type, [])
        for connection in connections:
            try:
                await connection.send_json(message)
            except:
                # Client đã disconnect
                pass
    
    async def broadcast_order_notification(self, order_data: dict):
        """Thông báo đơn hàng mới đến admin"""
        message = {
            "type": "NEW_ORDER",
            "data": order_data,
            "message": f"Đơn hàng mới #{order_data.get('MaDonHang', 'N/A')}"
        }
        await self.broadcast(message, "admin")
        await self.broadcast(message, "all")
    
    async def broadcast_inventory_update(self, product_data: dict):
        """Thông báo cập nhật tồn kho"""
        message = {
            "type": "INVENTORY_UPDATE",
            "data": product_data,
            "message": f"Sản phẩm {product_data.get('TenSP', '')} đã được cập nhật"
        }
        await self.broadcast(message, "admin")
    
    async def broadcast_stats_update(self, stats_data: dict):
        """Cập nhật thống kê real-time"""
        message = {
            "type": "STATS_UPDATE",
            "data": stats_data
        }
        await self.broadcast(message, "admin")
    
    def get_connection_count(self) -> dict:
        """Lấy số lượng connections"""
        return {
            "total": len(self.active_connections["all"]),
            "admin": len(self.active_connections["admin"]),
            "customer": len(self.active_connections["customer"])
        }


# Singleton instance
manager = ConnectionManager()


@router.websocket("/ws/{client_type}")
async def websocket_endpoint(websocket: WebSocket, client_type: str = "all"):
    """
    WebSocket endpoint chính
    
    client_type có thể là:
    - "admin": Dành cho dashboard admin
    - "customer": Dành cho khách hàng
    - "all": Tất cả (mặc định)
    """
    await manager.connect(websocket, client_type)
    try:
        # Gửi thông báo kết nối thành công
        await websocket.send_json({
            "type": "CONNECTED",
            "message": "Kết nối WebSocket thành công",
            "client_type": client_type
        })
        
        while True:
            # Nhận message từ client
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                
                # Xử lý các loại message từ client
                if message.get("type") == "PING":
                    await websocket.send_json({"type": "PONG"})
                elif message.get("type") == "GET_STATS":
                    # Client yêu cầu stats
                    await websocket.send_json({
                        "type": "CONNECTION_STATS",
                        "data": manager.get_connection_count()
                    })
                else:
                    # Echo message back (for testing)
                    await websocket.send_json({
                        "type": "ECHO",
                        "data": message
                    })
            except json.JSONDecodeError:
                await websocket.send_json({
                    "type": "ERROR",
                    "message": "Invalid JSON format"
                })
                
    except WebSocketDisconnect:
        manager.disconnect(websocket, client_type)
    except Exception as e:
        manager.disconnect(websocket, client_type)


@router.get("/ws/status")
def get_websocket_status():
    """API endpoint để kiểm tra trạng thái WebSocket"""
    return {
        "status": "active",
        "connections": manager.get_connection_count()
    }
