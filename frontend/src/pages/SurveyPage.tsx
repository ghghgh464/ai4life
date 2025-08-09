import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SurveyData } from '../types';
import { submitSurvey } from '../services/api';

const SurveyPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<SurveyData>({
    name: '',
    age: 18,
    currentGrade: '12',
    interests: [],
    skills: [],
    academicScores: {
      math: 5,
      physics: 5,
      chemistry: 5,
      biology: 5,
      literature: 5,
      english: 5,
      history: 5,
      geography: 5,
    },
    careerGoals: '',
    learningStyle: 'mixed',
    workEnvironmentPreference: 'mixed'
  });

  const interestOptions = [
    'Công nghệ thông tin', 'Thiết kế đồ họa', 'Marketing', 
    'Kế toán', 'Quản trị kinh doanh', 'Điện tử viễn thông',
    'Nghệ thuật', 'Thể thao', 'Du lịch', 'Giáo dục'
  ];

  const skillOptions = [
    'Lập trình', 'Thiết kế', 'Giao tiếp', 'Lãnh đạo',
    'Phân tích', 'Sáng tạo', 'Tính toán', 'Ngoại ngữ',
    'Thuyết trình', 'Làm việc nhóm'
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field: 'interests' | 'skills', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleScoreChange = (subject: string, score: number) => {
    setFormData(prev => ({
      ...prev,
      academicScores: {
        ...prev.academicScores,
        [subject]: score
      }
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result = await submitSurvey(formData);
      navigate(`/results/${result.id}`);
    } catch (error) {
      console.error('Survey submission failed:', error);
      alert('Có lỗi xảy ra. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Thông tin cá nhân</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Họ và tên *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="input-field"
                placeholder="Nhập họ và tên của bạn"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tuổi
                </label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', parseInt(e.target.value))}
                  className="input-field"
                  min="15"
                  max="25"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lớp hiện tại
                </label>
                <select
                  value={formData.currentGrade}
                  onChange={(e) => handleInputChange('currentGrade', e.target.value)}
                  className="input-field"
                >
                  <option value="9">Lớp 9</option>
                  <option value="10">Lớp 10</option>
                  <option value="11">Lớp 11</option>
                  <option value="12">Lớp 12</option>
                  <option value="graduated">Đã tốt nghiệp</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Sở thích và kỹ năng</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Lĩnh vực bạn quan tâm (chọn nhiều)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {interestOptions.map((interest) => (
                  <label key={interest} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.interests.includes(interest)}
                      onChange={() => handleArrayChange('interests', interest)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{interest}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Kỹ năng bạn có (chọn nhiều)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {skillOptions.map((skill) => (
                  <label key={skill} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.skills.includes(skill)}
                      onChange={() => handleArrayChange('skills', skill)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{skill}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Kết quả học tập</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(formData.academicScores).map(([subject, score]) => (
                <div key={subject}>
                  <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                    {subject === 'math' ? 'Toán' :
                     subject === 'physics' ? 'Lý' :
                     subject === 'chemistry' ? 'Hóa' :
                     subject === 'biology' ? 'Sinh' :
                     subject === 'literature' ? 'Văn' :
                     subject === 'english' ? 'Anh' :
                     subject === 'history' ? 'Sử' :
                     subject === 'geography' ? 'Địa' : subject}
                  </label>
                  <select
                    value={score}
                    onChange={(e) => handleScoreChange(subject, parseInt(e.target.value))}
                    className="input-field"
                  >
                    {[1,2,3,4,5,6,7,8,9,10].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Định hướng nghề nghiệp</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mục tiêu nghề nghiệp của bạn
              </label>
              <textarea
                value={formData.careerGoals}
                onChange={(e) => handleInputChange('careerGoals', e.target.value)}
                className="input-field h-32 resize-none"
                placeholder="Chia sẻ về ước mơ nghề nghiệp và mục tiêu tương lai của bạn..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Phong cách học tập
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'visual', label: 'Học qua hình ảnh' },
                    { value: 'auditory', label: 'Học qua nghe' },
                    { value: 'kinesthetic', label: 'Học qua thực hành' },
                    { value: 'mixed', label: 'Kết hợp nhiều cách' }
                  ].map((option) => (
                    <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="learningStyle"
                        value={option.value}
                        checked={formData.learningStyle === option.value}
                        onChange={(e) => handleInputChange('learningStyle', e.target.value)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Môi trường làm việc mong muốn
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'office', label: 'Văn phòng' },
                    { value: 'remote', label: 'Làm việc từ xa' },
                    { value: 'outdoor', label: 'Ngoài trời' },
                    { value: 'mixed', label: 'Linh hoạt' }
                  ].map((option) => (
                    <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="workEnvironment"
                        value={option.value}
                        checked={formData.workEnvironmentPreference === option.value}
                        onChange={(e) => handleInputChange('workEnvironmentPreference', e.target.value)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Bước {currentStep} / 4</span>
          <span className="text-sm text-gray-500">{Math.round((currentStep / 4) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Form Content */}
      <div className="card">
        {renderStep()}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`px-6 py-2 rounded-lg font-medium ${
              currentStep === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Quay lại
          </button>

          {currentStep < 4 ? (
            <button
              onClick={nextStep}
              disabled={currentStep === 1 && !formData.name.trim()}
              className="btn-primary px-6 py-2"
            >
              Tiếp tục
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading || !formData.name.trim()}
              className="btn-primary px-6 py-2 flex items-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang xử lý...
                </>
              ) : (
                'Hoàn thành khảo sát'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SurveyPage;
