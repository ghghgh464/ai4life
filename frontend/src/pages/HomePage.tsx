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
            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-fpt-blue to-fpt-orange">FPT Polytechnic</span>{' '}
            dựa trên phân tích sâu về tính cách, sở thích và khả năng của bạn.
          </p>
          
          {/* Enhanced CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
            <Link
              to="/survey"
              className="group relative bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 text-white text-xl px-12 py-6 rounded-3xl font-extrabold hover:shadow-2xl hover:shadow-orange-500/30 hover:scale-110 transition-all duration-500 inline-flex items-center justify-center min-w-[300px] overflow-hidden animate-scale-in"
              style={{animationDelay: '1s'}}
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 -top-px bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 group-hover:animate-shimmer"></div>
              
              <span className="mr-4 text-2xl group-hover:animate-bounce">📋</span>
              <span className="relative z-10 font-black text-xl">BẮT ĐẦU KHẢO SÁT</span>
              <svg className="ml-4 w-7 h-7 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-orange-600 to-red-600 blur opacity-0 group-hover:opacity-60 transition-opacity duration-500 -z-10"></div>
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

      {/* Survey Process Section */}
      <div className="py-20 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-1/3 w-64 h-64 bg-gradient-to-r from-orange-400/30 to-red-400/30 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-10 right-1/3 w-64 h-64 bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
        </div>

        <div className="relative z-10">
          <div className="text-center mb-16">
            <div className="inline-block animate-slide-down">
              <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 animate-gradient-x">
                  Quy trình khảo sát
                </span>
              </h2>
            </div>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto animate-fade-in" style={{animationDelay: '0.3s'}}>
              4 bước đơn giản để khám phá ngành học phù hợp với bạn
            </p>
          </div>

          {/* Survey Steps */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {/* Step 1 */}
            <div className="group relative animate-slide-up" style={{animationDelay: '0.1s'}}>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative bg-white/90 backdrop-blur-lg rounded-3xl p-8 shadow-xl hover:shadow-blue-500/25 transition-all duration-500 border border-white/20 hover:border-blue-200/50 text-center group-hover:scale-105 group-hover:-translate-y-2">
                {/* Step number */}
                <div className="absolute -top-4 left-6 w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                  1
                </div>
                
                {/* Icon */}
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl rotate-6 group-hover:rotate-12 transition-transform duration-500"></div>
                  <div className="relative bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl w-full h-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <span className="text-3xl text-white">👋</span>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                  Thông tin cá nhân
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Họ tên, tuổi, lớp học hiện tại
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="group relative animate-slide-up" style={{animationDelay: '0.2s'}}>
              <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative bg-white/90 backdrop-blur-lg rounded-3xl p-8 shadow-xl hover:shadow-green-500/25 transition-all duration-500 border border-white/20 hover:border-green-200/50 text-center group-hover:scale-105 group-hover:-translate-y-2">
                {/* Step number */}
                <div className="absolute -top-4 left-6 w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                  2
                </div>
                
                {/* Icon */}
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl -rotate-6 group-hover:-rotate-12 transition-transform duration-500"></div>
                  <div className="relative bg-gradient-to-br from-green-500 to-green-700 rounded-2xl w-full h-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <span className="text-3xl text-white">🌟</span>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors">
                  Sở thích & Kỹ năng
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Lĩnh vực quan tâm và điểm mạnh của bạn
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="group relative animate-slide-up" style={{animationDelay: '0.3s'}}>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative bg-white/90 backdrop-blur-lg rounded-3xl p-8 shadow-xl hover:shadow-purple-500/25 transition-all duration-500 border border-white/20 hover:border-purple-200/50 text-center group-hover:scale-105 group-hover:-translate-y-2">
                {/* Step number */}
                <div className="absolute -top-4 left-6 w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                  3
                </div>
                
                {/* Icon */}
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl rotate-6 group-hover:rotate-12 transition-transform duration-500"></div>
                  <div className="relative bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl w-full h-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <span className="text-3xl text-white">📊</span>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">
                  Kết quả học tập
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Điểm số các môn học quan trọng
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="group relative animate-slide-up" style={{animationDelay: '0.4s'}}>
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 to-red-600/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative bg-white/90 backdrop-blur-lg rounded-3xl p-8 shadow-xl hover:shadow-orange-500/25 transition-all duration-500 border border-white/20 hover:border-orange-200/50 text-center group-hover:scale-105 group-hover:-translate-y-2">
                {/* Step number */}
                <div className="absolute -top-4 left-6 w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                  4
                </div>
                
                {/* Icon */}
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl -rotate-6 group-hover:-rotate-12 transition-transform duration-500"></div>
                  <div className="relative bg-gradient-to-br from-orange-500 to-orange-700 rounded-2xl w-full h-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <span className="text-3xl text-white">🎯</span>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">
                  Định hướng tương lai
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Ước mơ nghề nghiệp và phong cách làm việc
                </p>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <Link
              to="/survey"
              className="group relative inline-flex items-center bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 text-white text-xl px-12 py-6 rounded-3xl font-bold hover:shadow-2xl hover:shadow-orange-500/30 hover:scale-110 transition-all duration-500 overflow-hidden animate-scale-in"
              style={{animationDelay: '0.6s'}}
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 -top-px bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 group-hover:animate-shimmer"></div>
              
              <span className="mr-4 text-2xl group-hover:animate-bounce">📋</span>
              <span className="relative z-10 font-extrabold">BẮT ĐẦU KHẢO SÁT NGAY</span>
              <svg className="ml-4 w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-orange-600 to-red-600 blur opacity-0 group-hover:opacity-60 transition-opacity duration-500 -z-10"></div>
            </Link>
            
            <p className="mt-6 text-gray-500 text-lg animate-fade-in" style={{animationDelay: '0.8s'}}>
              ⏱️ Chỉ mất 5 phút • 🎯 Kết quả chính xác 95% • 🆓 Hoàn toàn miễn phí
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 relative overflow-hidden">
        {/* Background gradient mesh */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="relative z-10">
          <div className="text-center mb-20">
            <div className="inline-block animate-slide-down">
              <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 animate-gradient-x">
                  Tại sao chọn AI4Life?
                </span>
              </h2>
            </div>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto animate-fade-in" style={{animationDelay: '0.3s'}}>
              Công nghệ AI tiên tiến kết hợp với chuyên môn giáo dục
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {/* Feature Card 1 - AI Analysis */}
            <div className="group relative animate-slide-up" style={{animationDelay: '0.1s'}}>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-2xl hover:shadow-blue-500/25 transition-all duration-500 border border-white/20 hover:border-blue-200/50 text-center group-hover:scale-105 group-hover:-translate-y-2">
                {/* 3D Icon Container */}
                <div className="relative w-24 h-24 mx-auto mb-8">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl rotate-6 group-hover:rotate-12 transition-transform duration-500 animate-glow"></div>
                  <div className="relative bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl w-full h-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <span className="text-4xl animate-float">🧠</span>
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                  Phân tích thông minh
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  AI phân tích đa chiều về tính cách, sở thích, năng lực và điểm số để đưa ra gợi ý ngành học phù hợp nhất với bạn
                </p>
                
                {/* Hover effect overlay */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-50/50 to-cyan-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
              </div>
            </div>

            {/* Feature Card 2 - Visual Reports */}
            <div className="group relative animate-slide-up" style={{animationDelay: '0.3s'}}>
              <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-2xl hover:shadow-green-500/25 transition-all duration-500 border border-white/20 hover:border-green-200/50 text-center group-hover:scale-105 group-hover:-translate-y-2">
                {/* 3D Icon Container */}
                <div className="relative w-24 h-24 mx-auto mb-8">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl -rotate-6 group-hover:-rotate-12 transition-transform duration-500 animate-glow"></div>
                  <div className="relative bg-gradient-to-br from-green-500 to-green-700 rounded-2xl w-full h-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <span className="text-4xl animate-float" style={{animationDelay: '1s'}}>📊</span>
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-green-600 transition-colors">
                  Báo cáo trực quan
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Nhận báo cáo infographic đẹp mắt với biểu đồ tương tác, phân tích chi tiết và lộ trình học tập cá nhân hóa
                </p>
                
                {/* Hover effect overlay */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-green-50/50 to-emerald-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
              </div>
            </div>

            {/* Feature Card 3 - AI Mentor */}
            <div className="group relative animate-slide-up" style={{animationDelay: '0.5s'}}>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-2xl hover:shadow-purple-500/25 transition-all duration-500 border border-white/20 hover:border-purple-200/50 text-center group-hover:scale-105 group-hover:-translate-y-2">
                {/* 3D Icon Container */}
                <div className="relative w-24 h-24 mx-auto mb-8">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl rotate-6 group-hover:rotate-12 transition-transform duration-500 animate-glow"></div>
                  <div className="relative bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl w-full h-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <span className="text-4xl animate-float" style={{animationDelay: '2s'}}>💬</span>
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-purple-600 transition-colors">
                  AI Mentor 24/7
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Chat với AI mentor thông minh để được tư vấn chi tiết về ngành học, định hướng nghề nghiệp và giải đáp mọi thắc mắc
                </p>
                
                {/* Hover effect overlay */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-50/50 to-pink-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-green-600 rounded-3xl p-12 lg:p-16 text-white text-center animate-gradient-xy">
        {/* Animated background decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-40 h-40 bg-white/10 rounded-full -translate-x-20 -translate-y-20 animate-blob"></div>
          <div className="absolute bottom-0 right-0 w-60 h-60 bg-white/10 rounded-full translate-x-20 translate-y-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-white/5 rounded-full -translate-x-16 -translate-y-16 animate-float"></div>
          
          {/* Floating particles */}
          <div className="absolute top-20 left-20 w-2 h-2 bg-white/30 rounded-full animate-float opacity-60"></div>
          <div className="absolute top-40 right-32 w-1 h-1 bg-white/40 rounded-full animate-float opacity-50" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-32 left-1/4 w-1.5 h-1.5 bg-white/20 rounded-full animate-float opacity-40" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="relative z-10">
          {/* Enhanced badge */}
          <div className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold mb-8 border border-white/30 hover:bg-white/30 transition-all duration-300 animate-slide-down">
            <span className="mr-2 text-lg animate-pulse">⭐</span>
            <span className="bg-gradient-to-r from-yellow-200 to-white bg-clip-text text-transparent">
              Được tin tưởng bởi cộng đồng
            </span>
          </div>
          
          {/* Main heading with staggered animation */}
          <h2 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="inline-block animate-slide-up">Hàng nghìn học sinh</span>
            <br />
            <span className="inline-block animate-slide-up text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-white to-cyan-200" style={{animationDelay: '0.2s'}}>
              đã tìm thấy
            </span>
          </h2>
          <p className="text-xl md:text-2xl mb-16 opacity-90 animate-fade-in" style={{animationDelay: '0.4s'}}>
            định hướng nghề nghiệp phù hợp với{' '}
            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-cyan-200">
              AI4Life
            </span>
          </p>
          
          {/* Enhanced stats grid */}
          <div className="grid md:grid-cols-4 gap-8 lg:gap-12 mb-16">
            <div className="group relative">
              <div className="absolute inset-0 bg-white/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-2 animate-scale-in" style={{animationDelay: '0.1s'}}>
                <div className="text-5xl md:text-6xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-b from-white to-cyan-200 animate-pulse-glow">
                  2,500+
                </div>
                <div className="text-white/80 text-lg font-medium">Học sinh đã sử dụng</div>
              </div>
            </div>
            
            <div className="group relative">
              <div className="absolute inset-0 bg-white/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-2 animate-scale-in" style={{animationDelay: '0.2s'}}>
                <div className="text-5xl md:text-6xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-b from-white to-green-200 animate-pulse-glow">
                  96%
                </div>
                <div className="text-white/80 text-lg font-medium">Độ chính xác AI</div>
              </div>
            </div>
            
            <div className="group relative">
              <div className="absolute inset-0 bg-white/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-2 animate-scale-in" style={{animationDelay: '0.3s'}}>
                <div className="text-5xl md:text-6xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-b from-white to-yellow-200 animate-pulse-glow">
                  8
                </div>
                <div className="text-white/80 text-lg font-medium">Ngành học FPT</div>
              </div>
            </div>
            
            <div className="group relative">
              <div className="absolute inset-0 bg-white/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-2 animate-scale-in" style={{animationDelay: '0.4s'}}>
                <div className="text-5xl md:text-6xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-b from-white to-purple-200 animate-pulse-glow">
                  24/7
                </div>
                <div className="text-white/80 text-lg font-medium">Hỗ trợ AI Mentor</div>
              </div>
            </div>
          </div>
          
          {/* Enhanced testimonial */}
          <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 animate-fade-in" style={{animationDelay: '0.6s'}}>
            <div className="absolute top-4 left-4 text-6xl text-white/20 leading-none">"</div>
            <div className="relative">
              <p className="text-xl md:text-2xl font-medium mb-4 leading-relaxed">
                AI4Life đã giúp tôi tìm thấy đam mê thực sự và định hướng rõ ràng cho tương lai
              </p>
              <div className="flex items-center justify-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-2xl">
                  👩‍🎓
                </div>
                <div className="text-left">
                  <div className="font-semibold text-lg">Nguyễn Thế Huy, Nguyễn Đình Tuấn An503  </div>
                  <div className="text-white/70 text-sm">Sinh viên IT FPT</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
