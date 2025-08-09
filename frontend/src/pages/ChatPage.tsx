import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import { sendChatMessage, getChatHistory } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Add welcome message with animation
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      role: 'assistant',
      content: 'Xin chào! Tôi là AI tư vấn giáo dục của FPT Polytechnic. Tôi có thể giúp bạn:\n\n• Tìm hiểu về các ngành học tại FPT Polytechnic\n• Tư vấn định hướng nghề nghiệp\n• Giải đáp thắc mắc về tuyển sinh\n• Thông tin về cơ hội việc làm\n\nBạn có câu hỏi gì muốn hỏi tôi không?',
      timestamp: new Date().toISOString()
    };
    
    setTimeout(() => {
      setMessages([welcomeMessage]);
    }, 500);
  }, []);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toISOString()
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);
    setIsTyping(true);

    try {
      // Send message to AI
      const response = await sendChatMessage(inputMessage.trim(), sessionId || undefined);
      
      // Update session ID if this is the first message
      if (!sessionId) {
        setSessionId(response.sessionId);
      }

      // Simulate typing delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Add AI response
      const aiMessage: ChatMessage = {
        id: Date.now().toString() + '_ai',
        role: 'assistant',
        content: response.response,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMessage]);

    } catch (error: any) {
      console.error('Chat error:', error);
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: Date.now().toString() + '_error',
        role: 'assistant',
        content: 'Xin lỗi, có lỗi xảy ra khi xử lý tin nhắn của bạn. Vui lòng thử lại sau.',
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      setIsTyping(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setSessionId(null);
    
    // Re-add welcome message
    const welcomeMessage: ChatMessage = {
      id: 'welcome_new',
      role: 'assistant',
      content: 'Chat đã được xóa. Bạn có thể bắt đầu cuộc trò chuyện mới! 🚀',
      timestamp: new Date().toISOString()
    };
    setMessages([welcomeMessage]);
  };

  const suggestedQuestions = [
    { text: 'Ngành Công nghệ thông tin học những gì?', icon: '💻', color: 'from-blue-500 to-cyan-500' },
    { text: 'Cơ hội việc làm sau khi tốt nghiệp ngành Thiết kế đồ họa?', icon: '🎨', color: 'from-purple-500 to-pink-500' },
    { text: 'Điều kiện tuyển sinh FPT Polytechnic như thế nào?', icon: '📚', color: 'from-green-500 to-emerald-500' },
    { text: 'So sánh ngành Marketing và Quản trị kinh doanh', icon: '📈', color: 'from-orange-500 to-red-500' },
    { text: 'Ngành nào phù hợp với người thích toán học?', icon: '🧮', color: 'from-indigo-500 to-purple-500' }
  ];

  return (
    <div className="max-w-6xl mx-auto h-screen flex flex-col relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-1/4 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-2xl animate-float"></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-gradient-to-br from-green-400/10 to-emerald-400/10 rounded-full blur-2xl animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-20 h-20 bg-gradient-to-br from-pink-400/10 to-rose-400/10 rounded-full blur-2xl animate-float" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Enhanced Header */}
      <div className="relative z-10 bg-white/80 backdrop-blur-md border-b border-gray-200/50 px-6 py-6 animate-slide-down">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white text-2xl shadow-xl animate-glow">
              🤖
            </div>
            <div>
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-gradient-x">
                AI Mentor
              </h1>
              <p className="text-sm text-gray-600 font-medium flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                Tư vấn giáo dục FPT Polytechnic 24/7
              </p>
            </div>
          </div>
          
          <button
            onClick={clearChat}
            className="group flex items-center space-x-2 px-4 py-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 hover:scale-105"
          >
            <svg className="w-5 h-5 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span className="font-medium">Xóa chat</span>
          </button>
        </div>
      </div>

      {/* Enhanced Messages Container */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50/50 to-blue-50/30 px-6 py-6 relative z-10">
        <div className="space-y-6">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex animate-slide-up ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              style={{animationDelay: `${index * 0.1}s`}}
            >
              <div className={`flex items-start space-x-3 max-w-4xl ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                {/* Avatar */}
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-lg flex-shrink-0 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white'
                    : 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white animate-pulse'
                }`}>
                  {message.role === 'user' ? '👤' : '🤖'}
                </div>
                
                {/* Message Bubble */}
                <div className={`group relative px-6 py-4 rounded-3xl shadow-xl backdrop-blur-sm border transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white border-blue-500/20'
                    : 'bg-white/90 text-gray-800 border-gray-200/50 hover:bg-white'
                }`}>
                  {/* Message tail */}
                  <div className={`absolute top-4 w-3 h-3 rotate-45 ${
                    message.role === 'user'
                      ? '-right-1.5 bg-gradient-to-br from-blue-600 to-purple-600'
                      : '-left-1.5 bg-white border-l border-b border-gray-200/50'
                  }`}></div>
                  
                  <div className="relative z-10">
                    <div className="whitespace-pre-wrap text-lg leading-relaxed font-medium">
                      {message.content}
                    </div>
                    <div className={`text-xs mt-3 font-medium ${
                      message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {new Date(message.timestamp).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  
                  {/* Hover glow effect */}
                  <div className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-blue-400 to-purple-400'
                      : 'bg-gradient-to-br from-gray-400 to-gray-600'
                  }`}></div>
                </div>
              </div>
            </div>
          ))}

          {/* Enhanced Typing Indicator */}
          {loading && (
            <div className="flex justify-start animate-slide-up">
              <div className="flex items-start space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center text-xl text-white shadow-lg animate-pulse">
                  🤖
                </div>
                <div className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-3xl px-6 py-4 shadow-xl">
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    <span className="text-sm text-gray-600 font-medium">AI đang soạn phản hồi...</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Enhanced Suggested Questions */}
      {messages.length <= 1 && (
        <div className="relative z-10 bg-white/80 backdrop-blur-md border-t border-gray-200/50 px-6 py-6 animate-slide-up">
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-3">💡</span>
            <h3 className="text-lg font-bold text-gray-800">Câu hỏi gợi ý</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => setInputMessage(question.text)}
                className={`group relative p-4 text-left bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl hover:shadow-xl hover:scale-105 transition-all duration-300 animate-scale-in overflow-hidden`}
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${question.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                <div className="relative flex items-start space-x-3">
                  <div className={`w-10 h-10 bg-gradient-to-r ${question.color} rounded-xl flex items-center justify-center text-white text-lg group-hover:scale-110 transition-transform duration-300`}>
                    {question.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800 group-hover:text-gray-900 transition-colors">
                      {question.text}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Enhanced Input Area */}
      <div className="relative z-10 bg-white/80 backdrop-blur-md border-t border-gray-200/50 px-6 py-6 animate-slide-up">
        <div className="flex items-end space-x-4">
          {/* Input Container */}
          <div className="flex-1 relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-xl"></div>
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Nhập câu hỏi của bạn..."
              className="relative w-full px-6 py-4 text-lg bg-white/90 backdrop-blur-sm border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 hover:border-gray-300 font-medium placeholder-gray-500"
              disabled={loading}
            />
            
            {/* Input decoration */}
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
          </div>

          {/* Send Button */}
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || loading}
            className={`group relative px-6 py-4 rounded-2xl font-semibold text-lg flex items-center space-x-3 transition-all duration-300 overflow-hidden ${
              inputMessage.trim() && !loading
                ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 text-white hover:shadow-2xl hover:shadow-blue-500/25 hover:scale-105 animate-gradient-x'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {/* Shimmer effect */}
            {inputMessage.trim() && !loading && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-shimmer"></div>
            )}
            
            <div className="relative z-10 flex items-center space-x-2">
              {loading ? (
                <>
                  <div className="w-5 h-5">
                    <LoadingSpinner size="sm" message="" />
                  </div>
                  <span>Đang gửi...</span>
                </>
              ) : (
                <>
                  <span>Gửi</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </>
              )}
            </div>
          </button>
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-500 font-medium flex items-center">
            <span className="text-lg mr-2">💡</span>
            Nhấn Enter để gửi tin nhắn. AI sẽ trả lời dựa trên thông tin về FPT Polytechnic.
          </p>
          
          <div className="flex items-center space-x-2 text-xs text-gray-400">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Kết nối ổn định</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;