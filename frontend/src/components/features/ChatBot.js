import React, { useState, useRef, useEffect } from 'react';
import { API_URL } from '../../config';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Xin chào! 👋 Tôi là trợ lý ảo của CellphoneS. Tôi có thể giúp gì cho bạn hôm nay?'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Fetch suggestions
    const fetchSuggestions = async () => {
      try {
        const res = await fetch(`${API_URL}/ai/suggestions`);
        const data = await res.json();
        setSuggestions(data.suggestions || []);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      }
    };
    fetchSuggestions();
  }, []);

  const sendMessage = async (message) => {
    if (!message.trim() || loading) return;

    const userMessage = { role: 'user', content: message };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: message,
          conversation_history: messages.slice(-6).map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [m.content]
          }))
        })
      });

      const data = await res.json();
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.reply,
        products: data.products
      }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau! 😅'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + '₫';
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-red-600 to-red-500 text-white p-4 rounded-full shadow-2xl hover:shadow-red-500/30 transition-all z-50 transform hover:scale-110 active:scale-95"
      >
        {isOpen ? (
          <span className="text-2xl">✕</span>
        ) : (
          <span className="text-2xl animate-bounce">🎧</span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl z-50 overflow-hidden border border-gray-200 flex flex-col" style={{ height: '500px' }}>
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-500 text-white p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">🤖</span>
            </div>
            <div className="flex-1">
              <h3 className="font-bold">Trợ lý CellphoneS</h3>
              <p className="text-xs text-red-100">Powered by Gemini AI</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white text-xl"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    msg.role === 'user'
                      ? 'bg-red-600 text-white rounded-tr-none'
                      : 'bg-white text-gray-800 rounded-tl-none shadow-sm border border-gray-100'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  
                  {/* Product recommendations */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs font-medium text-gray-500">Sản phẩm gợi ý:</p>
                      {msg.products.map((product, i) => (
                        <a
                          key={i}
                          href={`/#/product/${product.MaSP}`}
                          className="block bg-gray-50 rounded-lg p-2 hover:bg-gray-100 transition"
                        >
                          <p className="font-medium text-sm text-gray-800">{product.TenSP}</p>
                          <p className="text-red-600 font-bold text-sm">{formatPrice(product.GiaBan)}</p>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 shadow-sm border border-gray-100">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          {messages.length <= 2 && suggestions.length > 0 && (
            <div className="p-3 bg-white border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-2">Câu hỏi thường gặp:</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.slice(0, 4).map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => sendMessage(suggestion)}
                    className="text-xs bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-700 px-3 py-1.5 rounded-full transition"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-gray-100">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Nhập tin nhắn..."
                className="flex-1 px-4 py-3 rounded-xl bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !inputValue.trim()}
                className="px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <span className="text-lg">📤</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatBot;
