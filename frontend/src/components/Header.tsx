import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-white/80 backdrop-blur-md shadow-2xl shadow-blue-500/10 border-b border-blue-100/50' 
          : 'bg-white/95 backdrop-blur-sm shadow-lg border-b border-gray-100'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Enhanced Logo */}
            <Link to="/" className="flex items-center space-x-3 group animate-slide-right">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 animate-glow">
                  <span className="text-white text-xl font-bold animate-pulse">🤖</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-400 rounded-2xl blur-md opacity-0 group-hover:opacity-70 transition-all duration-500 -z-10 animate-pulse-glow"></div>
                
                {/* Floating sparkles */}
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-ping"></div>
                <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-gradient-to-r from-green-400 to-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-ping" style={{animationDelay: '0.5s'}}></div>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 group-hover:from-purple-600 group-hover:to-blue-600 transition-all duration-500 animate-gradient-x">
                  AI4Life
                </span>
                <span className="text-xs font-medium text-transparent bg-clip-text bg-gradient-to-r from-gray-500 to-gray-600 group-hover:from-blue-500 group-hover:to-purple-500 transition-all duration-300 -mt-1">
                  🚀 Career Advisor
                </span>
              </div>
            </Link>

            {/* Enhanced Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              <Link
                to="/"
                className={`group relative flex items-center px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-500 overflow-hidden ${
                  isActive('/')
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50/80 backdrop-blur-sm'
                }`}
              >
                {/* Shimmer effect for active state */}
                {isActive('/') && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-shimmer"></div>
                )}
                
                <span className="mr-2 text-lg group-hover:animate-bounce">{isActive('/') ? '🏠' : '🏡'}</span>
                <span className="relative z-10">Trang chủ</span>
                
                {/* Glow effect */}
                {isActive('/') && (
                  <div className="absolute inset-0 rounded-2xl bg-blue-600 blur opacity-50 -z-10"></div>
                )}
              </Link>
              
              <Link
                to="/survey"
                className={`group relative flex items-center px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-500 overflow-hidden ${
                  isActive('/survey')
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30'
                    : 'text-gray-600 hover:text-green-600 hover:bg-green-50/80 backdrop-blur-sm'
                }`}
              >
                {isActive('/survey') && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-shimmer"></div>
                )}
                
                <span className="mr-2 text-lg group-hover:animate-bounce">{isActive('/survey') ? '📋' : '📝'}</span>
                <span className="relative z-10">Khảo sát</span>
                
                {isActive('/survey') && (
                  <div className="absolute inset-0 rounded-2xl bg-green-600 blur opacity-50 -z-10"></div>
                )}
              </Link>
              
              <Link
                to="/chat"
                className={`group relative flex items-center px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-500 overflow-hidden ${
                  isActive('/chat')
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/30'
                    : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50/80 backdrop-blur-sm'
                }`}
              >
                {isActive('/chat') && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-shimmer"></div>
                )}
                
                <span className="mr-2 text-lg group-hover:animate-bounce">{isActive('/chat') ? '💬' : '🤖'}</span>
                <span className="relative z-10">Chat AI</span>
                
                {isActive('/chat') && (
                  <div className="absolute inset-0 rounded-2xl bg-purple-600 blur opacity-50 -z-10"></div>
                )}
              </Link>
            </nav>

            {/* Enhanced Mobile menu button */}
            <div className="md:hidden">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="group relative p-3 rounded-2xl text-gray-600 hover:text-blue-600 hover:bg-blue-50/80 backdrop-blur-sm transition-all duration-300 animate-slide-left"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <svg className={`w-6 h-6 transition-transform duration-300 ${isMobileMenuOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md shadow-2xl border-t border-gray-100 animate-slide-down">
            <div className="px-4 py-6 space-y-3">
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center px-4 py-3 rounded-2xl text-base font-semibold transition-all duration-300 ${
                  isActive('/')
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <span className="mr-3 text-xl">🏠</span>
                Trang chủ
              </Link>
              
              <Link
                to="/survey"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center px-4 py-3 rounded-2xl text-base font-semibold transition-all duration-300 ${
                  isActive('/survey')
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                }`}
              >
                <span className="mr-3 text-xl">📋</span>
                Khảo sát
              </Link>
              
              <Link
                to="/chat"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center px-4 py-3 rounded-2xl text-base font-semibold transition-all duration-300 ${
                  isActive('/chat')
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                }`}
              >
                <span className="mr-3 text-xl">💬</span>
                Chat AI
              </Link>
            </div>
          </div>
        )}
      </header>
      
      {/* Spacer to prevent content from hiding under fixed header */}
      <div className="h-16"></div>
    </>
  );
};

export default Header;