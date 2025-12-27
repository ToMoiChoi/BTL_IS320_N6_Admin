import { useEffect, useRef, useCallback, useState } from 'react';

const WS_URL = 'ws://localhost:8000/ws';

/**
 * Custom hook để quản lý WebSocket connection
 * @param {string} clientType - Loại client: 'admin', 'customer', hoặc 'all'
 * @param {function} onMessage - Callback xử lý khi nhận message
 */
export const useWebSocket = (clientType = 'all', onMessage = null) => {
  const ws = useRef(null);
  const reconnectTimeout = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);

  const connect = useCallback(() => {
    try {
      ws.current = new WebSocket(`${WS_URL}/${clientType}`);

      ws.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastMessage(data);
          
          // Gọi callback nếu có
          if (onMessage) {
            onMessage(data);
          }

          // Xử lý các loại message
          switch (data.type) {
            case 'NEW_ORDER':
              console.log('🔔 Đơn hàng mới:', data.message);
              break;
            case 'INVENTORY_UPDATE':
              console.log('📦 Cập nhật tồn kho:', data.message);
              break;
            case 'STATS_UPDATE':
              console.log('📊 Cập nhật thống kê:', data.data);
              break;
            default:
              break;
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      ws.current.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        
        // Auto reconnect sau 3 giây
        reconnectTimeout.current = setTimeout(() => {
          console.log('Attempting to reconnect...');
          connect();
        }, 3000);
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (err) {
      console.error('WebSocket connection error:', err);
    }
  }, [clientType, onMessage]);

  // Gửi message đến server
  const sendMessage = useCallback((message) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    }
  }, []);

  // Ping để giữ connection alive
  const ping = useCallback(() => {
    sendMessage({ type: 'PING' });
  }, [sendMessage]);

  useEffect(() => {
    connect();

    // Ping mỗi 30 giây để giữ connection
    const pingInterval = setInterval(ping, 30000);

    return () => {
      clearInterval(pingInterval);
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [connect, ping]);

  return {
    isConnected,
    lastMessage,
    sendMessage,
  };
};

export default useWebSocket;
