import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ConsultationResult } from '../types';
import { getConsultationResult, generateQRCode, exportResultToPDF } from '../services/api';
import ResultChart from '../components/ResultChart';
import LoadingSpinner from '../components/LoadingSpinner';

const ResultsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [result, setResult] = useState<ConsultationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [chartType, setChartType] = useState<'bar' | 'doughnut'>('bar');
  const [qrLoading, setQrLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    const fetchResult = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const data = await getConsultationResult(id);
        setResult(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [id]);

  const handleGenerateQR = async () => {
    if (!id) return;

    try {
      setQrLoading(true);
      const qrCodeData = await generateQRCode(id);
      setQrCode(qrCodeData);
    } catch (err: any) {
      alert('Không thể tạo mã QR: ' + err.message);
    } finally {
      setQrLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!id) return;

    try {
      setPdfLoading(true);
      const pdfBlob = await exportResultToPDF(id);
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ai4life-result-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert('Không thể xuất PDF: ' + err.message);
    } finally {
      setPdfLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message="Đang tải kết quả phân tích..." />
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="max-w-2xl mx-auto py-16 relative">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-32 h-32 bg-gradient-to-br from-red-400/10 to-orange-400/10 rounded-full blur-2xl animate-float"></div>
        </div>
        
        <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-red-200/50 text-center animate-scale-in">
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-bounce">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-red-800 mb-4">Không tìm thấy kết quả</h2>
          <p className="text-red-600 mb-8 text-lg">{error || 'Kết quả không tồn tại hoặc đã bị xóa.'}</p>
          <Link to="/survey" className="group relative bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:shadow-2xl hover:shadow-blue-500/25 hover:scale-105 transition-all duration-300 inline-flex items-center space-x-2 overflow-hidden animate-gradient-x">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-shimmer"></div>
            <span className="relative z-10">Làm khảo sát mới</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 relative">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-1/4 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-2xl animate-float"></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-gradient-to-br from-green-400/10 to-emerald-400/10 rounded-full blur-2xl animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 right-1/5 w-20 h-20 bg-gradient-to-br from-pink-400/10 to-rose-400/10 rounded-full blur-2xl animate-float" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Enhanced Header */}
      <div className="relative text-center py-12 animate-slide-down">
        <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500/10 to-blue-500/10 backdrop-blur-sm rounded-full border border-green-200/50 mb-8">
          <span className="text-2xl mr-3 animate-bounce">🎉</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600 font-semibold">
            Kết quả phân tích hoàn tất
          </span>
        </div>
        
        <h1 className="text-5xl font-bold text-gray-900 mb-4 animate-slide-up">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 animate-gradient-x">
            Kết quả tư vấn ngành học
          </span>
        </h1>
        <p className="text-xl text-gray-600 animate-slide-up" style={{animationDelay: '0.2s'}}>
          Dành cho <span className="font-bold text-blue-600">{(result as any).user?.name}</span> • 
          <span className="ml-2">📅 {new Date(result.createdAt).toLocaleDateString('vi-VN')}</span>
        </p>
      </div>

      {/* Enhanced Confidence Score */}
      <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-gray-200/50 text-center animate-scale-in">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-blue-500/5 rounded-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-green-400 via-emerald-500 to-blue-500 flex items-center justify-center shadow-2xl animate-glow">
                <span className="text-4xl font-bold text-white">
                  {Math.round(result.confidenceScore * 100)}%
                </span>
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center animate-bounce">
                <span className="text-lg">⭐</span>
              </div>
            </div>
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Độ tin cậy phân tích</h3>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Kết quả được phân tích bởi AI dựa trên thông tin chi tiết bạn cung cấp
          </p>
          
          <div className="mt-6 flex items-center justify-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-600">Phân tích chính xác</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
              <span className="text-sm font-medium text-gray-600">Tư vấn cá nhân hóa</span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Analysis Summary */}
      <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-gray-200/50 animate-slide-up" style={{animationDelay: '0.2s'}}>
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white text-2xl mr-4 shadow-lg animate-float">
              📋
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Phân tích tổng quan</h2>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200/50">
            <p className="text-lg text-gray-700 leading-relaxed font-medium">{result.analysisSummary}</p>
          </div>
        </div>
      </div>

      {/* Enhanced Recommended Majors */}
      <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-gray-200/50 animate-slide-up" style={{animationDelay: '0.3s'}}>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white text-2xl mr-4 shadow-lg animate-float">
              🎯
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Ngành học được gợi ý</h2>
          </div>
          
          <div className="space-y-6">
            {result.recommendedMajors.map((rec, index) => (
              <div key={index} className="group relative bg-gradient-to-r from-white to-blue-50/50 rounded-2xl p-6 border-2 border-gray-200/50 hover:border-blue-300/50 hover:shadow-xl transition-all duration-300 animate-scale-in" style={{animationDelay: `${0.1 * index}s`}}>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl shadow-lg ${
                          index === 0 ? 'bg-gradient-to-br from-yellow-500 to-orange-500' :
                          index === 1 ? 'bg-gradient-to-br from-blue-500 to-purple-500' :
                          'bg-gradient-to-br from-green-500 to-emerald-500'
                        }`}>
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {rec.majorName || rec.major?.name}
                          </h3>
                          <p className="text-sm text-gray-500 font-medium">
                            Mã ngành: {rec.majorCode || rec.major?.code}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right ml-4">
                      <div className="relative">
                        <div className={`text-4xl font-bold mb-1 ${
                          rec.matchScore >= 80 ? 'text-green-600' :
                          rec.matchScore >= 60 ? 'text-blue-600' :
                          'text-orange-600'
                        }`}>
                          {rec.matchScore}%
                        </div>
                        <div className="text-sm text-gray-500 font-medium">Độ phù hợp</div>
                        
                        {/* Progress ring */}
                        <div className="absolute -inset-2">
                          <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                            <path
                              d="M18 2.0845
                                a 15.9155 15.9155 0 0 1 0 31.831
                                a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="#e5e7eb"
                              strokeWidth="2"
                            />
                            <path
                              d="M18 2.0845
                                a 15.9155 15.9155 0 0 1 0 31.831
                                a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke={rec.matchScore >= 80 ? '#10b981' : rec.matchScore >= 60 ? '#3b82f6' : '#f59e0b'}
                              strokeWidth="2"
                              strokeDasharray={`${rec.matchScore}, 100`}
                              className="animate-pulse"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {rec.major?.description && (
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 mb-6 border border-gray-200/50">
                      <p className="text-gray-700 leading-relaxed">{rec.major.description}</p>
                    </div>
                  )}

                  <div className="mb-6">
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                      <span className="text-lg mr-2">💡</span>
                      Lý do phù hợp:
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {rec.reasons.map((reason, idx) => (
                        <div key={idx} className="flex items-start space-x-3 bg-green-50/80 rounded-xl p-3 border border-green-200/50">
                          <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-700 font-medium">{reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {rec.major?.careerProspects && (
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200/50">
                      <h4 className="font-bold text-blue-900 mb-3 flex items-center">
                        <span className="text-lg mr-2">🚀</span>
                        Cơ hội nghề nghiệp:
                      </h4>
                      <p className="text-blue-800 leading-relaxed font-medium">{rec.major.careerProspects}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Strengths and Recommendations */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-gray-200/50 animate-slide-left" style={{animationDelay: '0.4s'}}>
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 rounded-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center text-white text-xl mr-4 shadow-lg animate-float">
                💪
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Điểm mạnh của bạn</h2>
            </div>
            
            <div className="space-y-4">
              {result.strengths.map((strength, index) => (
                <div key={index} className="flex items-start space-x-3 bg-green-50/80 rounded-xl p-4 border border-green-200/50 hover:shadow-lg transition-all duration-300 animate-scale-in" style={{animationDelay: `${0.1 * index}s`}}>
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700 font-medium leading-relaxed">{strength}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-gray-200/50 animate-slide-right" style={{animationDelay: '0.4s'}}>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-white text-xl mr-4 shadow-lg animate-float">
                💡
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Khuyến nghị</h2>
            </div>
            
            <div className="space-y-4">
              {result.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start space-x-3 bg-blue-50/80 rounded-xl p-4 border border-blue-200/50 hover:shadow-lg transition-all duration-300 animate-scale-in" style={{animationDelay: `${0.1 * index}s`}}>
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700 font-medium leading-relaxed">{recommendation}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Chart Visualization */}
      {result.recommendedMajors.length > 0 && (
        <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-gray-200/50 animate-slide-up" style={{animationDelay: '0.5s'}}>
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-white text-2xl mr-4 shadow-lg animate-float">
                📊
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Biểu đồ phù hợp</h2>
            </div>
            <ResultChart 
              majors={result.recommendedMajors} 
              type={chartType}
              onTypeChange={setChartType}
            />
          </div>
        </div>
      )}

      {/* Enhanced Actions */}
      <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-gray-200/50 animate-slide-up" style={{animationDelay: '0.6s'}}>
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 rounded-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center text-white text-2xl mr-4 shadow-lg animate-float">
              🚀
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Chia sẻ và tiếp tục</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <button
              onClick={handleExportPDF}
              disabled={pdfLoading}
              className="group relative bg-gradient-to-r from-red-600 to-pink-600 text-white px-6 py-4 rounded-2xl font-semibold hover:shadow-2xl hover:shadow-red-500/25 hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-3 disabled:opacity-50 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-shimmer"></div>
              <div className="relative z-10 flex items-center space-x-2">
                {pdfLoading ? (
                  <div className="w-5 h-5">
                    <LoadingSpinner size="sm" message="" />
                  </div>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )}
                <span>Xuất PDF</span>
              </div>
            </button>

            <button
              onClick={handleGenerateQR}
              disabled={qrLoading}
              className="group relative bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4 rounded-2xl font-semibold hover:shadow-2xl hover:shadow-green-500/25 hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-3 disabled:opacity-50 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-shimmer"></div>
              <div className="relative z-10 flex items-center space-x-2">
                {qrLoading ? (
                  <div className="w-5 h-5">
                    <LoadingSpinner size="sm" message="" />
                  </div>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                )}
                <span>Tạo mã QR</span>
              </div>
            </button>

            <Link to="/chat" className="group relative bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 rounded-2xl font-semibold hover:shadow-2xl hover:shadow-blue-500/25 hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-3 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-shimmer"></div>
              <div className="relative z-10 flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>Chat với AI</span>
              </div>
            </Link>

            <Link to="/survey" className="group relative bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-6 py-4 rounded-2xl font-semibold hover:shadow-2xl hover:shadow-indigo-500/25 hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-3 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-shimmer"></div>
              <div className="relative z-10 flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Khảo sát mới</span>
              </div>
            </Link>
          </div>

          {/* Enhanced QR Code Display */}
          {qrCode && (
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8 text-center border border-gray-200/50 animate-scale-in">
              <div className="flex items-center justify-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white text-xl mr-3 shadow-lg">
                  📱
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Mã QR chia sẻ kết quả</h3>
              </div>
              
              <div className="inline-block p-6 bg-white rounded-2xl shadow-xl border border-gray-200/50 hover:shadow-2xl transition-all duration-300">
                <img src={qrCode} alt="QR Code" className="w-40 h-40 mx-auto" />
              </div>
              
              <p className="text-lg text-gray-600 mt-4 font-medium">
                <span className="text-2xl mr-2">📲</span>
                Quét mã để xem kết quả trên điện thoại
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;