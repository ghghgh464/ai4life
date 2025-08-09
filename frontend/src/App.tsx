import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import SurveyPage from './pages/SurveyPage';
import ResultsPage from './pages/ResultsPage';
import ChatPage from './pages/ChatPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 relative overflow-hidden">
        {/* Enhanced animated background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {/* Large floating blobs */}
          <div className="absolute -top-40 -right-32 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-600/15 rounded-full blur-3xl animate-blob"></div>
          <div className="absolute -bottom-40 -left-32 w-96 h-96 bg-gradient-to-br from-green-400/20 to-blue-600/15 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-pink-600/10 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
          
          {/* Medium floating elements */}
          <div className="absolute top-20 left-1/4 w-32 h-32 bg-gradient-to-br from-yellow-300/15 to-orange-300/10 rounded-full blur-2xl animate-float"></div>
          <div className="absolute bottom-20 right-1/4 w-24 h-24 bg-gradient-to-br from-indigo-300/15 to-purple-300/10 rounded-full blur-2xl animate-float" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/3 right-1/5 w-20 h-20 bg-gradient-to-br from-cyan-300/15 to-blue-300/10 rounded-full blur-2xl animate-float" style={{animationDelay: '3s'}}></div>
          
          {/* Small particles */}
          <div className="absolute top-40 right-1/3 w-4 h-4 bg-blue-400/30 rounded-full animate-float opacity-60"></div>
          <div className="absolute top-60 left-1/5 w-3 h-3 bg-purple-400/30 rounded-full animate-float opacity-50" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-40 left-2/3 w-2 h-2 bg-green-400/30 rounded-full animate-float opacity-40" style={{animationDelay: '3s'}}></div>
          <div className="absolute bottom-60 right-1/5 w-5 h-5 bg-pink-400/25 rounded-full animate-float opacity-30" style={{animationDelay: '4s'}}></div>
          <div className="absolute top-80 left-1/3 w-3 h-3 bg-cyan-400/25 rounded-full animate-float opacity-35" style={{animationDelay: '5s'}}></div>
          
          {/* Gradient mesh overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/3 to-transparent animate-gradient-xy opacity-50"></div>
        </div>
        
        <Header />
        <main className="relative z-10 container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/survey" element={<SurveyPage />} />
            <Route path="/results/:id" element={<ResultsPage />} />
            <Route path="/chat" element={<ChatPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
