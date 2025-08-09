// User types
export interface User {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  createdAt: string;
}

// Survey types
export interface SurveyData {
  name: string;
  age: number;
  currentGrade: string;
  interests: string[];
  skills: string[];
  academicScores: {
    math: number;
    physics: number;
    chemistry: number;
    biology: number;
    literature: number;
    english: number;
    history: number;
    geography: number;
  };
  careerGoals: string;
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
  workEnvironmentPreference: 'office' | 'remote' | 'outdoor' | 'mixed';
}

// Major types
export interface Major {
  id: number;
  name: string;
  code: string;
  description: string;
  careerProspects: string;
  requiredSkills: string;
  subjects: string[];
}

// Consultation result types
export interface ConsultationResult {
  id: number;
  surveyId: number;
  recommendedMajors: RecommendedMajor[];
  analysisSummary: string;
  strengths: string[];
  recommendations: string[];
  confidenceScore: number;
  createdAt: string;
  user?: {
    name: string;
    age: number;
    currentGrade: string;
    interests: string[];
    skills: string[];
    academicScores: any;
    careerGoals: string;
    learningStyle: string;
    workEnvironmentPreference: string;
  };
}

export interface RecommendedMajor {
  major?: Major;
  majorName?: string;
  majorCode?: string;
  matchScore: number;
  reasons: string[];
}

// Chat types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  userId?: number;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Form validation types
export interface ValidationError {
  field: string;
  message: string;
}
