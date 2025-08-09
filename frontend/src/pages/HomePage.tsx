import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="text-center py-20 relative overflow-hidden">
        {/* Animated background blobs */}
        <div className="absolute inset-0">
          <div className="absolute -top-40 -right-32 w-96 h-96 bg-gradient-to-br from-blue-400/30 to-purple-600/30 rounded-full blur-3xl animate-blob"></div>
          <div className="absolute -bottom-40 -left-32 w-96 h-96 bg-gradient-to-br from-green-400/30 to-blue-600/30 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
        </div>
        
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-float opacity-60"></div>
          <div className="absolute top-40 right-1/3 w-1 h-1 bg-purple-400 rounded-full animate-float opacity-40" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-60 left-1/2 w-1.5 h-1.5 bg-green-400 rounded-full animate-float opacity-50" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-80 right-1/4 w-1 h-1 bg-pink-400 rounded-full animate-float opacity-30" style={{animationDelay: '3s'}}></div>
        </div>
        
        <div className="relative z-10">
          {/* Animated badge */}
          <div className="inline-flex items-center px-6 py-3 bg-white/80 backdrop-blur-sm border border-blue-200/50 rounded-full text-blue-700 text-sm font-semibold mb-8 shadow-lg hover:shadow-xl transition-all duration-300 animate-slide-down">
            <span className="animate-pulse mr-2 text-lg">🚀</span>
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI-Powered Career Guidance
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full animate-pulse-glow"></div>
          </div>
          
          {/* Main heading with staggered animations */}
          <h1 className="text-6xl md:text-8xl font-bold text-gray-900 mb-8 leading-tight">
            <span className="inline-block animate-slide-up">Khám phá</span>{' '}
            <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 animate-gradient-x animate-slide-up" style={{animationDelay: '0.2s'}}>
              tương lai
            </span>
            <br />
            <span className="inline-block animate-slide-up" style={{animationDelay: '0.4s'}}>của bạn với</span>{' '}
            <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 animate-gradient-x animate-slide-up" style={{animationDelay: '0.6s'}}>
              AI
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed animate-fade-in" style={{animationDelay: '0.8s'}}>
            Ứng dụng AI thông minh giúp bạn tìm ra ngành học phù hợp nhất tại{' '}
            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">FPT Polytechnic</span>{' '}
            dựa trên phân tích sâu về tính cách, sở thích và khả năng của bạn.
          </p>
          
          {/* Enhanced CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
            <Link
              to="/survey"
              className="group relative bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 text-white text-lg px-10 py-5 rounded-2xl font-bold hover:shadow-2xl hover:shadow-blue-500/25 hover:scale-110 transition-all duration-500 inline-flex items-center justify-center min-w-[240px] overflow-hidden animate-scale-in"
              style={{animationDelay: '1s'}}
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 -top-px bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-shimmer"></div>
              
              <span className="mr-3 text-xl group-hover:animate-bounce">📋</span>
              <span className="relative z-10">Bắt đầu khảo sát</span>
              <svg className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 blur opacity-0 group-hover:opacity-50 transition-opacity duration-500 -z-10"></div>
            </Link>
            
            <Link
              to="/chat"
              className="group relative bg-white/80 backdrop-blur-sm border-2 border-gray-200/50 text-gray-700 text-lg px-10 py-5 rounded-2xl font-bold hover:border-purple-300/50 hover:text-purple-600 hover:shadow-2xl hover:shadow-purple-500/10 hover:scale-110 transition-all duration-500 inline-flex items-center justify-center min-w-[240px] animate-scale-in"
              style={{animationDelay: '1.2s'}}
            >
              <span className="mr-3 text-xl group-hover:animate-bounce">💬</span>
              <span className="relative z-10">Chat với AI</span>
              <svg className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              
              {/* Hover background */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-50 to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
            </Link>
          </div>
          
          <div className="text-sm text-gray-500">
            ⏱️ Chỉ mất 5 phút • 🎯 Kết quả chính xác 95% • 🆓 Hoàn toàn miễn phí
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Tại sao chọn AI4Life?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Công nghệ AI tiên tiến kết hợp với chuyên môn giáo dục
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-200 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <span className="text-3xl">🧠</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Phân tích thông minh</h3>
            <p className="text-gray-600 text-lg leading-relaxed">
              AI phân tích đa chiều về tính cách, sở thích, năng lực và điểm số để đưa ra gợi ý ngành học phù hợp nhất với bạn
            </p>
          </div>

          <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-green-200 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <span className="text-3xl">📊</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Báo cáo trực quan</h3>
            <p className="text-gray-600 text-lg leading-relaxed">
              Nhận báo cáo infographic đẹp mắt với biểu đồ tương tác, phân tích chi tiết và lộ trình học tập cá nhân hóa
            </p>
          </div>

          <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-purple-200 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <span className="text-3xl">💬</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">AI Mentor 24/7</h3>
            <p className="text-gray-600 text-lg leading-relaxed">
              Chat với AI mentor thông minh để được tư vấn chi tiết về ngành học, định hướng nghề nghiệp và giải đáp mọi thắc mắc
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-green-600 rounded-3xl p-12 text-white text-center">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-20 -translate-y-20"></div>
          <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-20 translate-y-20"></div>
        </div>
        
        <div className="relative z-10">
          <div className="inline-flex items-center px-4 py-2 bg-white/20 rounded-full text-sm font-medium mb-6">
            <span className="mr-2">⭐</span>
            Được tin tưởng bởi cộng đồng
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Hàng nghìn học sinh đã tìm thấy
          </h2>
          <p className="text-xl mb-12 opacity-90">
            định hướng nghề nghiệp phù hợp với AI4Life
          </p>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="group">
              <div className="text-5xl md:text-6xl font-bold mb-3 group-hover:scale-110 transition-transform">2,500+</div>
              <div className="text-white/80 text-lg">Học sinh đã sử dụng</div>
            </div>
            <div className="group">
              <div className="text-5xl md:text-6xl font-bold mb-3 group-hover:scale-110 transition-transform">96%</div>
              <div className="text-white/80 text-lg">Độ chính xác AI</div>
            </div>
            <div className="group">
              <div className="text-5xl md:text-6xl font-bold mb-3 group-hover:scale-110 transition-transform">8</div>
              <div className="text-white/80 text-lg">Ngành học FPT</div>
            </div>
            <div className="group">
              <div className="text-5xl md:text-6xl font-bold mb-3 group-hover:scale-110 transition-transform">24/7</div>
              <div className="text-white/80 text-lg">Hỗ trợ AI Mentor</div>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-white/20">
            <p className="text-lg opacity-90">
              "AI4Life đã giúp tôi tìm thấy đam mê thực sự và định hướng rõ ràng cho tương lai" 
              <span className="block mt-2 text-sm opacity-70">- Nguyễn Minh Anh, Sinh viên IT FPT</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
