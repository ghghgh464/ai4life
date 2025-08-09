import axios from 'axios';
import { SurveyData, ConsultationResult, ChatMessage, ApiResponse } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds for AI processing
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Survey API
export const submitSurvey = async (surveyData: SurveyData): Promise<ConsultationResult> => {
  try {
    const response = await api.post<ApiResponse<ConsultationResult>>('/survey/submit', surveyData);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data.error || 'Survey submission failed');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.error || error.message || 'Network error');
  }
};

// Results API
export const getConsultationResult = async (resultId: string): Promise<ConsultationResult> => {
  try {
    const response = await api.get<ApiResponse<ConsultationResult>>(`/results/${resultId}`);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data.error || 'Failed to fetch result');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.error || error.message || 'Network error');
  }
};

// Chat API
export const sendChatMessage = async (
  message: string, 
  sessionId?: string
): Promise<{ response: string; sessionId: string }> => {
  try {
    const response = await api.post<ApiResponse<{ response: string; sessionId: string }>>(
      '/ai/chat',
      { message, sessionId }
    );
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data.error || 'Chat failed');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.error || error.message || 'Network error');
  }
};

// Get chat history
export const getChatHistory = async (sessionId: string): Promise<ChatMessage[]> => {
  try {
    const response = await api.get<ApiResponse<ChatMessage[]>>(`/ai/chat/${sessionId}`);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data.error || 'Failed to fetch chat history');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.error || error.message || 'Network error');
  }
};

// Health check
export const healthCheck = async (): Promise<boolean> => {
  try {
    const response = await api.get('/health');
    return response.status === 200;
  } catch (error) {
    return false;
  }
};

// Export PDF
export const exportResultToPDF = async (resultId: string): Promise<Blob> => {
  try {
    const response = await api.get(`/results/${resultId}/pdf`, {
      responseType: 'blob',
    });
    
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || error.message || 'PDF export failed');
  }
};

// Generate QR Code
export const generateQRCode = async (resultId: string): Promise<string> => {
  try {
    const response = await api.get<ApiResponse<{ qrCode: string }>>(`/results/${resultId}/qr`);
    
    if (response.data.success && response.data.data) {
      return response.data.data.qrCode;
    } else {
      throw new Error(response.data.error || 'QR code generation failed');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.error || error.message || 'Network error');
  }
};
