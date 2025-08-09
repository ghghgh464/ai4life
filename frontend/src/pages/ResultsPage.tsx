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
      const qrCodeData = await generateQRCode(id);
      setQrCode(qrCodeData);
    } catch (err: any) {
      alert('Không thể tạo mã QR: ' + err.message);
    }
  };

  const handleExportPDF = async () => {
    if (!id) return;

    try {
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
    }
  };

  if (loading) {
    return <LoadingSpinner message="Đang tải kết quả..." />;
  }

  if (error || !result) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h2 className="text-xl font-semibold text-red-800 mb-2">Không tìm thấy kết quả</h2>
          <p className="text-red-600 mb-4">{error || 'Kết quả không tồn tại hoặc đã bị xóa.'}</p>
          <Link to="/survey" className="btn-primary">
            Làm khảo sát mới
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Kết quả tư vấn ngành học
        </h1>
        <p className="text-gray-600">
          Dành cho {(result as any).user?.name} • Ngày {new Date(result.createdAt).toLocaleDateString('vi-VN')}
        </p>
      </div>

      {/* Confidence Score */}
      <div className="card text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center">
            <span className="text-2xl font-bold text-white">
              {Math.round(result.confidenceScore * 100)}%
            </span>
          </div>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Độ tin cậy</h3>
        <p className="text-gray-600">
          Kết quả phân tích dựa trên thông tin bạn cung cấp
        </p>
      </div>

      {/* Analysis Summary */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Phân tích tổng quan</h2>
        <p className="text-gray-700 leading-relaxed">{result.analysisSummary}</p>
      </div>

      {/* Recommended Majors */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Ngành học được gợi ý</h2>
        <div className="space-y-6">
          {result.recommendedMajors.map((rec, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    {rec.majorName || rec.major?.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Mã ngành: {rec.majorCode || rec.major?.code}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    {rec.matchScore}%
                  </div>
                  <div className="text-sm text-gray-500">Độ phù hợp</div>
                </div>
              </div>

              {rec.major?.description && (
                <p className="text-gray-700 mb-4">{rec.major.description}</p>
              )}

              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Lý do phù hợp:</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  {rec.reasons.map((reason, idx) => (
                    <li key={idx}>{reason}</li>
                  ))}
                </ul>
              </div>

              {rec.major?.careerProspects && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Cơ hội nghề nghiệp:</h4>
                  <p className="text-blue-800 text-sm">{rec.major.careerProspects}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Strengths and Recommendations */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Điểm mạnh của bạn</h2>
          <ul className="space-y-3">
            {result.strengths.map((strength, index) => (
              <li key={index} className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700">{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Khuyến nghị</h2>
          <ul className="space-y-3">
            {result.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700">{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Chart Visualization */}
      {result.recommendedMajors.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Biểu đồ phù hợp</h2>
          <ResultChart 
            majors={result.recommendedMajors} 
            type={chartType}
            onTypeChange={setChartType}
          />
        </div>
      )}

      {/* Actions */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Chia sẻ kết quả</h2>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={handleExportPDF}
            className="btn-primary flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Xuất PDF</span>
          </button>

          <button
            onClick={handleGenerateQR}
            className="btn-secondary flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            <span>Tạo mã QR</span>
          </button>

          <Link to="/chat" className="btn-secondary flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>Chat với AI</span>
          </Link>

          <Link to="/survey" className="btn-secondary flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Làm khảo sát mới</span>
          </Link>
        </div>

        {/* QR Code Display */}
        {qrCode && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg text-center">
            <h3 className="font-medium text-gray-900 mb-3">Mã QR chia sẻ kết quả</h3>
            <div className="inline-block p-4 bg-white rounded-lg shadow-sm">
              <img src={qrCode} alt="QR Code" className="w-32 h-32 mx-auto" />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Quét mã để xem kết quả trên điện thoại
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsPage;
