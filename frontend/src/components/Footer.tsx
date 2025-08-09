import React, { useEffect } from 'react';

const Footer: React.FC = () => {
  useEffect(() => {
    // Load Facebook SDK
    if (!(window as any).FB) {
      (window as any).fbAsyncInit = function() {
        (window as any).FB.init({
          appId: 'your-app-id',
          cookie: true,
          xfbml: true,
          version: 'v18.0'
        });
      };

      // Load the Facebook SDK asynchronously
      const script = document.createElement('script');
      script.async = true;
      script.defer = true;
      script.crossOrigin = 'anonymous';
      script.src = 'https://connect.facebook.net/vi_VN/sdk.js';
      document.head.appendChild(script);
    }
  }, []);

  return (
    <footer className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-0 left-0 w-72 h-72 bg-purple-500/10 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-yellow-500/10 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500/10 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10">
        {/* Main Footer Content */}
        <div className="container mx-auto px-6 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            
            {/* Company Info */}
            <div className="lg:col-span-1">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-2xl mr-3 shadow-lg animate-float">
                  🤖
                </div>
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                    AI4Life
                  </h3>
                  <p className="text-sm text-gray-300">Career Advisor</p>
                </div>
              </div>
              <p className="text-gray-300 leading-relaxed mb-6">
                Hệ thống tư vấn nghề nghiệp thông minh, giúp bạn tìm ra con đường phù hợp với khả năng và đam mê.
              </p>
              
              {/* Social Media */}
              <div className="flex space-x-4">
                <a href="https://www.facebook.com/fpt.poly" target="_blank" rel="noopener noreferrer" 
                   className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-600 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-pink-600 hover:bg-pink-700 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-xl font-bold mb-6 text-purple-300">Liên kết nhanh</h4>
              <ul className="space-y-4">
                <li>
                  <a href="/" className="text-gray-300 hover:text-white transition-colors duration-300 flex items-center group">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-3 group-hover:scale-125 transition-transform duration-300"></span>
                    Trang chủ
                  </a>
                </li>
                <li>
                  <a href="/survey" className="text-gray-300 hover:text-white transition-colors duration-300 flex items-center group">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-3 group-hover:scale-125 transition-transform duration-300"></span>
                    Khảo sát
                  </a>
                </li>
                <li>
                  <a href="/chat" className="text-gray-300 hover:text-white transition-colors duration-300 flex items-center group">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-3 group-hover:scale-125 transition-transform duration-300"></span>
                    Chat AI
                  </a>
                </li>
                <li>
                  <a href="/results" className="text-gray-300 hover:text-white transition-colors duration-300 flex items-center group">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-3 group-hover:scale-125 transition-transform duration-300"></span>
                    Kết quả
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-xl font-bold mb-6 text-purple-300">Liên hệ</h4>
              <div className="space-y-4">
                <div className="flex items-center text-gray-300">
                  <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center mr-4">
                    📍
                  </div>
                  <div>
                    <p className="font-medium">FPT Polytechnic</p>
                    <p className="text-sm">Hà Nội - TP.HCM - Đà Nẵng</p>
                  </div>
                </div>
                <div className="flex items-center text-gray-300">
                  <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center mr-4">
                    📞
                  </div>
                  <div>
                    <p className="font-medium">Hotline</p>
                    <p className="text-sm">0123 456 789</p>
                  </div>
                </div>
                <div className="flex items-center text-gray-300">
                  <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center mr-4">
                    ✉️
                  </div>
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm">contact@ai4life.edu.vn</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Facebook Plugin */}
            <div>
              <h4 className="text-xl font-bold mb-6 text-purple-300">Theo dõi chúng tôi</h4>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div 
                  className="fb-page" 
                  data-href="https://www.facebook.com/fpt.poly" 
                  data-tabs="timeline" 
                  data-width="300" 
                  data-height="200" 
                  data-small-header="true" 
                  data-adapt-container-width="true" 
                  data-hide-cover="false" 
                  data-show-facepile="true"
                >
                  <blockquote cite="https://www.facebook.com/fpt.poly" className="fb-xfbml-parse-ignore">
                    <a href="https://www.facebook.com/fpt.poly" className="text-purple-300 hover:text-white transition-colors">
                      FPT Polytechnic
                    </a>
                  </blockquote>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Google Maps Section */}
        <div className="border-t border-white/10 py-12">
          <div className="container mx-auto px-6">
            <h4 className="text-2xl font-bold text-center mb-8 text-purple-300">Vị trí trường học</h4>
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/20">
              <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.096956240891!2d105.78431507503113!3d21.028810980613395!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab4cd0c66f05%3A0xea31563511af2e54!2zVHLGsOG7nW5nIENhbyDEkeG6s25nIEZQVCBQb2x5dGVjaG5pYw!5e0!3m2!1svi!2s!4v1703123456789!5m2!1svi!2s"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="rounded-2xl"
                ></iframe>
              </div>
              <div className="mt-6 text-center">
                <a 
                  href="https://maps.app.goo.gl/wcEezCBZrTGn2QC17" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  <span className="mr-2">🗺️</span>
                  Xem trên Google Maps
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 py-8">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-gray-300 text-sm mb-4 md:mb-0">
                © 2024 AI4Life Career Advisor. Được phát triển với ❤️ bởi FPT Polytechnic.
              </div>
              <div className="flex space-x-6 text-sm">
                <a href="#" className="text-gray-300 hover:text-white transition-colors duration-300">
                  Chính sách bảo mật
                </a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors duration-300">
                  Điều khoản sử dụng
                </a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors duration-300">
                  Hỗ trợ
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
