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
    { name: 'Công nghệ thông tin', icon: '💻', color: 'from-blue-500 to-cyan-500' },
    { name: 'Thiết kế đồ họa', icon: '🎨', color: 'from-purple-500 to-pink-500' },
    { name: 'Marketing', icon: '📈', color: 'from-green-500 to-emerald-500' },
    { name: 'Kế toán', icon: '💰', color: 'from-yellow-500 to-orange-500' },
    { name: 'Quản trị kinh doanh', icon: '👔', color: 'from-indigo-500 to-purple-500' },
    { name: 'Điện tử viễn thông', icon: '📡', color: 'from-red-500 to-pink-500' },
    { name: 'Nghệ thuật', icon: '🎭', color: 'from-pink-500 to-rose-500' },
    { name: 'Thể thao', icon: '⚽', color: 'from-green-500 to-teal-500' },
    { name: 'Du lịch', icon: '✈️', color: 'from-sky-500 to-blue-500' },
    { name: 'Giáo dục', icon: '📚', color: 'from-amber-500 to-yellow-500' }
  ];

  const skillOptions = [
    { name: 'Lập trình', icon: '⌨️', color: 'from-blue-500 to-indigo-500' },
    { name: 'Thiết kế', icon: '✏️', color: 'from-purple-500 to-pink-500' },
    { name: 'Giao tiếp', icon: '💬', color: 'from-green-500 to-emerald-500' },
    { name: 'Lãnh đạo', icon: '👑', color: 'from-yellow-500 to-orange-500' },
    { name: 'Phân tích', icon: '🔍', color: 'from-cyan-500 to-blue-500' },
    { name: 'Sáng tạo', icon: '💡', color: 'from-pink-500 to-rose-500' },
    { name: 'Tính toán', icon: '🧮', color: 'from-indigo-500 to-purple-500' },
    { name: 'Ngoại ngữ', icon: '🌍', color: 'from-teal-500 to-green-500' },
    { name: 'Thuyết trình', icon: '🎤', color: 'from-red-500 to-pink-500' },
    { name: 'Làm việc nhóm', icon: '🤝', color: 'from-emerald-500 to-teal-500' }
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
          <div className="space-y-8 animate-fade-in">
            <div className="text-center mb-8">
              <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm rounded-full border border-blue-200/50 mb-6 animate-slide-down">
                <span className="text-2xl mr-3 animate-bounce">👋</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 font-semibold">
                  Bước 1: Làm quen với bạn
                </span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4 animate-slide-up">
                Thông tin cá nhân
              </h2>
              <p className="text-lg text-gray-600 animate-slide-up" style={{animationDelay: '0.2s'}}>
                Hãy cho chúng tôi biết một chút về bản thân bạn
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="group animate-slide-up" style={{animationDelay: '0.3s'}}>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <span className="flex items-center">
                    <span className="text-lg mr-2">📝</span>
                    Họ và tên của bạn *
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-4 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:border-blue-300 group-hover:shadow-lg"
                    placeholder="Nhập họ và tên của bạn"
                    required
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group animate-slide-up" style={{animationDelay: '0.4s'}}>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <span className="flex items-center">
                      <span className="text-lg mr-2">🎂</span>
                      Tuổi của bạn
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.age}
                      onChange={(e) => handleInputChange('age', parseInt(e.target.value))}
                      className="w-full px-4 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:border-green-300 group-hover:shadow-lg"
                      min="15"
                      max="25"
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                </div>
                
                <div className="group animate-slide-up" style={{animationDelay: '0.5s'}}>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <span className="flex items-center">
                      <span className="text-lg mr-2">🎓</span>
                      Lớp hiện tại
                    </span>
                  </label>
                  <div className="relative">
                    <select
                      value={formData.currentGrade}
                      onChange={(e) => handleInputChange('currentGrade', e.target.value)}
                      className="w-full px-4 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:border-purple-300 group-hover:shadow-lg appearance-none cursor-pointer"
                    >
                      <option value="9">Lớp 9</option>
                      <option value="10">Lớp 10</option>
                      <option value="11">Lớp 11</option>
                      <option value="12">Lớp 12</option>
                      <option value="graduated">Đã tốt nghiệp</option>
                    </select>
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center mb-8">
              <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500/10 to-blue-500/10 backdrop-blur-sm rounded-full border border-green-200/50 mb-6 animate-slide-down">
                <span className="text-2xl mr-3 animate-bounce">🌟</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600 font-semibold">
                  Bước 2: Khám phá đam mê
                </span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4 animate-slide-up">
                Sở thích và kỹ năng
              </h2>
              <p className="text-lg text-gray-600 animate-slide-up" style={{animationDelay: '0.2s'}}>
                Hãy chọn những lĩnh vực bạn yêu thích và kỹ năng bạn có
              </p>
            </div>
            
            <div className="space-y-8">
              <div className="animate-slide-up" style={{animationDelay: '0.3s'}}>
                <label className="block text-xl font-bold text-gray-800 mb-6 flex items-center">
                  <span className="text-2xl mr-3">💝</span>
                  Lĩnh vực bạn quan tâm
                  <span className="ml-2 text-sm font-normal text-gray-500">(chọn nhiều)</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {interestOptions.map((interest, index) => (
                    <div key={interest.name} className="animate-scale-in" style={{animationDelay: `${0.1 * index}s`}}>
                      <label className="group relative flex items-center p-4 cursor-pointer rounded-2xl border-2 border-gray-200 hover:border-transparent hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
                        <input
                          type="checkbox"
                          checked={formData.interests.includes(interest.name)}
                          onChange={() => handleArrayChange('interests', interest.name)}
                          className="sr-only"
                        />
                        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${interest.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${interest.color} flex items-center justify-center text-white text-xl mr-4 group-hover:scale-110 transition-transform duration-300`}>
                          {interest.icon}
                        </div>
                        <span className="text-gray-700 font-medium group-hover:text-gray-900 transition-colors flex-1">
                          {interest.name}
                        </span>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                          formData.interests.includes(interest.name)
                            ? `bg-gradient-to-r ${interest.color} border-transparent`
                            : 'border-gray-300 group-hover:border-gray-400'
                        }`}>
                          {formData.interests.includes(interest.name) && (
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="animate-slide-up" style={{animationDelay: '0.5s'}}>
                <label className="block text-xl font-bold text-gray-800 mb-6 flex items-center">
                  <span className="text-2xl mr-3">🚀</span>
                  Kỹ năng bạn có
                  <span className="ml-2 text-sm font-normal text-gray-500">(chọn nhiều)</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {skillOptions.map((skill, index) => (
                    <div key={skill.name} className="animate-scale-in" style={{animationDelay: `${0.6 + 0.1 * index}s`}}>
                      <label className="group relative flex items-center p-4 cursor-pointer rounded-2xl border-2 border-gray-200 hover:border-transparent hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
                        <input
                          type="checkbox"
                          checked={formData.skills.includes(skill.name)}
                          onChange={() => handleArrayChange('skills', skill.name)}
                          className="sr-only"
                        />
                        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${skill.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${skill.color} flex items-center justify-center text-white text-xl mr-4 group-hover:scale-110 transition-transform duration-300`}>
                          {skill.icon}
                        </div>
                        <span className="text-gray-700 font-medium group-hover:text-gray-900 transition-colors flex-1">
                          {skill.name}
                        </span>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                          formData.skills.includes(skill.name)
                            ? `bg-gradient-to-r ${skill.color} border-transparent`
                            : 'border-gray-300 group-hover:border-gray-400'
                        }`}>
                          {formData.skills.includes(skill.name) && (
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center mb-8">
              <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-sm rounded-full border border-purple-200/50 mb-6 animate-slide-down">
                <span className="text-2xl mr-3 animate-bounce">📊</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 font-semibold">
                  Bước 3: Đánh giá năng lực
                </span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4 animate-slide-up">
                Kết quả học tập
              </h2>
              <p className="text-lg text-gray-600 animate-slide-up" style={{animationDelay: '0.2s'}}>
                Cho chúng tôi biết điểm số các môn học của bạn
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up" style={{animationDelay: '0.3s'}}>
              {Object.entries(formData.academicScores).map(([subject, score], index) => {
                const subjectInfo = {
                  math: { name: 'Toán', icon: '🧮', color: 'from-blue-500 to-cyan-500' },
                  physics: { name: 'Vật Lý', icon: '⚡', color: 'from-purple-500 to-indigo-500' },
                  chemistry: { name: 'Hóa Học', icon: '🧪', color: 'from-green-500 to-emerald-500' },
                  biology: { name: 'Sinh Học', icon: '🌱', color: 'from-emerald-500 to-teal-500' },
                  literature: { name: 'Ngữ Văn', icon: '📖', color: 'from-pink-500 to-rose-500' },
                  english: { name: 'Tiếng Anh', icon: '🌍', color: 'from-sky-500 to-blue-500' },
                  history: { name: 'Lịch Sử', icon: '🏛️', color: 'from-amber-500 to-orange-500' },
                  geography: { name: 'Địa Lý', icon: '🗺️', color: 'from-teal-500 to-cyan-500' }
                }[subject] || { name: subject, icon: '📚', color: 'from-gray-500 to-gray-600' };

                return (
                  <div key={subject} className="group animate-scale-in" style={{animationDelay: `${0.1 * index}s`}}>
                    <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 border-2 border-gray-200 hover:border-transparent hover:shadow-xl transition-all duration-300">
                      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${subjectInfo.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                      
                      <div className="relative">
                        <div className="flex items-center justify-center mb-4">
                          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${subjectInfo.color} flex items-center justify-center text-2xl text-white group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                            {subjectInfo.icon}
                          </div>
                        </div>
                        
                        <h3 className="text-lg font-bold text-gray-800 text-center mb-4">
                          {subjectInfo.name}
                        </h3>
                        
                        <div className="relative">
                          <select
                            value={score}
                            onChange={(e) => handleScoreChange(subject, parseInt(e.target.value))}
                            className={`w-full px-4 py-3 text-center text-xl font-bold border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 transition-all duration-300 bg-white/90 backdrop-blur-sm appearance-none cursor-pointer hover:border-gray-300 focus:border-${subjectInfo.color.split('-')[1]}-500 focus:ring-${subjectInfo.color.split('-')[1]}-500/20`}
                          >
                            {[1,2,3,4,5,6,7,8,9,10].map(num => (
                              <option key={num} value={num}>{num} điểm</option>
                            ))}
                          </select>
                          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center mb-8">
              <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500/10 to-red-500/10 backdrop-blur-sm rounded-full border border-orange-200/50 mb-6 animate-slide-down">
                <span className="text-2xl mr-3 animate-bounce">🎯</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600 font-semibold">
                  Bước 4: Định hướng tương lai
                </span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4 animate-slide-up">
                Ước mơ nghề nghiệp
              </h2>
              <p className="text-lg text-gray-600 animate-slide-up" style={{animationDelay: '0.2s'}}>
                Chia sẻ với chúng tôi về mục tiêu và phong cách làm việc của bạn
              </p>
            </div>
            
            <div className="space-y-8">
              <div className="group animate-slide-up" style={{animationDelay: '0.3s'}}>
                <label className="block text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <span className="text-2xl mr-3">💭</span>
                  Mục tiêu nghề nghiệp của bạn
                </label>
                <div className="relative">
                  <textarea
                    value={formData.careerGoals}
                    onChange={(e) => handleInputChange('careerGoals', e.target.value)}
                    className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:border-orange-300 group-hover:shadow-lg resize-none h-32"
                    placeholder="Chia sẻ về ước mơ nghề nghiệp và mục tiêu tương lai của bạn... Ví dụ: Tôi muốn trở thành một lập trình viên giỏi, có thể tạo ra những ứng dụng hữu ích cho mọi người..."
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="animate-slide-up" style={{animationDelay: '0.4s'}}>
                  <label className="block text-xl font-bold text-gray-800 mb-6 flex items-center">
                    <span className="text-2xl mr-3">🧠</span>
                    Phong cách học tập
                  </label>
                  <div className="space-y-4">
                    {[
                      { value: 'visual', label: 'Học qua hình ảnh', icon: '👁️', desc: 'Thích học bằng sơ đồ, hình ảnh' },
                      { value: 'auditory', label: 'Học qua nghe', icon: '👂', desc: 'Thích nghe giảng, thảo luận' },
                      { value: 'kinesthetic', label: 'Học qua thực hành', icon: '✋', desc: 'Thích làm, thí nghiệm' },
                      { value: 'mixed', label: 'Kết hợp nhiều cách', icon: '🌈', desc: 'Linh hoạt với mọi phương pháp' }
                    ].map((option, index) => (
                      <label key={option.value} className="group relative flex items-center p-4 cursor-pointer rounded-2xl border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm">
                        <input
                          type="radio"
                          name="learningStyle"
                          value={option.value}
                          checked={formData.learningStyle === option.value}
                          onChange={(e) => handleInputChange('learningStyle', e.target.value)}
                          className="sr-only"
                        />
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mr-4 transition-all duration-300 ${
                          formData.learningStyle === option.value
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white scale-110'
                            : 'bg-gray-100 group-hover:bg-blue-50'
                        }`}>
                          {option.icon}
                        </div>
                        
                        <div className="flex-1">
                          <div className={`font-semibold transition-colors ${
                            formData.learningStyle === option.value ? 'text-blue-600' : 'text-gray-700 group-hover:text-gray-900'
                          }`}>
                            {option.label}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {option.desc}
                          </div>
                        </div>
                        
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                          formData.learningStyle === option.value
                            ? 'bg-blue-500 border-blue-500'
                            : 'border-gray-300 group-hover:border-blue-400'
                        }`}>
                          {formData.learningStyle === option.value && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="animate-slide-up" style={{animationDelay: '0.5s'}}>
                  <label className="block text-xl font-bold text-gray-800 mb-6 flex items-center">
                    <span className="text-2xl mr-3">🏢</span>
                    Môi trường làm việc mong muốn
                  </label>
                  <div className="space-y-4">
                    {[
                      { value: 'office', label: 'Văn phòng', icon: '🏢', desc: 'Làm việc tại công ty, văn phòng' },
                      { value: 'remote', label: 'Làm việc từ xa', icon: '🏠', desc: 'Làm việc online, tại nhà' },
                      { value: 'outdoor', label: 'Ngoài trời', icon: '🌳', desc: 'Làm việc ngoài trời, di chuyển' },
                      { value: 'mixed', label: 'Linh hoạt', icon: '🔄', desc: 'Kết hợp nhiều môi trường' }
                    ].map((option, index) => (
                      <label key={option.value} className="group relative flex items-center p-4 cursor-pointer rounded-2xl border-2 border-gray-200 hover:border-green-300 hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm">
                        <input
                          type="radio"
                          name="workEnvironment"
                          value={option.value}
                          checked={formData.workEnvironmentPreference === option.value}
                          onChange={(e) => handleInputChange('workEnvironmentPreference', e.target.value)}
                          className="sr-only"
                        />
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mr-4 transition-all duration-300 ${
                          formData.workEnvironmentPreference === option.value
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white scale-110'
                            : 'bg-gray-100 group-hover:bg-green-50'
                        }`}>
                          {option.icon}
                        </div>
                        
                        <div className="flex-1">
                          <div className={`font-semibold transition-colors ${
                            formData.workEnvironmentPreference === option.value ? 'text-green-600' : 'text-gray-700 group-hover:text-gray-900'
                          }`}>
                            {option.label}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {option.desc}
                          </div>
                        </div>
                        
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                          formData.workEnvironmentPreference === option.value
                            ? 'bg-green-500 border-green-500'
                            : 'border-gray-300 group-hover:border-green-400'
                        }`}>
                          {formData.workEnvironmentPreference === option.value && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
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
    <div className="max-w-6xl mx-auto relative">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-2xl animate-float"></div>
        <div className="absolute bottom-20 right-1/4 w-24 h-24 bg-gradient-to-br from-green-400/10 to-emerald-400/10 rounded-full blur-2xl animate-float" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Enhanced Progress Bar */}
      <div className="mb-12 relative z-10">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-gray-200/50 animate-slide-down">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4].map((step) => (
                  <div key={step} className="flex items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-500 ${
                      step <= currentStep
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-110'
                        : 'bg-gray-200 text-gray-500'
                    } ${step === currentStep ? 'animate-pulse-glow' : ''}`}>
                      {step}
                    </div>
                    {step < 4 && (
                      <div className={`w-16 h-1 mx-2 rounded-full transition-all duration-500 ${
                        step < currentStep ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-gray-200'
                      }`}></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                {Math.round((currentStep / 4) * 100)}%
              </div>
              <div className="text-sm text-gray-500 font-medium">
                Bước {currentStep} / 4
              </div>
            </div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 h-3 rounded-full transition-all duration-700 animate-gradient-x"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Enhanced Form Content */}
      <div className="relative z-10">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 lg:p-12 shadow-2xl border border-gray-200/50 min-h-[600px]">
          {renderStep()}

          {/* Enhanced Navigation Buttons */}
          <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-200/50">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`group flex items-center px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 ${
                currentStep === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:shadow-lg hover:scale-105'
              }`}
            >
              <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Quay lại
            </button>

            {currentStep < 4 ? (
              <button
                onClick={nextStep}
                disabled={currentStep === 1 && !formData.name.trim()}
                className="group relative bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:shadow-2xl hover:shadow-blue-500/25 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden animate-gradient-x"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-shimmer"></div>
                <span className="relative z-10 flex items-center">
                  Tiếp tục
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading || !formData.name.trim()}
                className="group relative bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:shadow-2xl hover:shadow-green-500/25 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden animate-gradient-x"
              >
                {loading && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shimmer"></div>
                )}
                <span className="relative z-10 flex items-center">
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="chttp://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Đang phân tích...
                    </>
                  ) : (
                    <>
                      <span className="text-2xl mr-2">🎉</span>
                      Hoàn thành khảo sát
                    </>
                  )}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyPage;