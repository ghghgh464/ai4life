import OpenAI from 'openai';
import { db } from '../models/database';

interface SurveyData {
  name: string;
  age: number;
  currentGrade: string;
  interests: string[];
  skills: string[];
  academicScores: {
    [subject: string]: number;
  };
  careerGoals: string;
  learningStyle: string;
  workEnvironmentPreference: string;
}

interface AIAnalysisResult {
  recommendedMajors: RecommendedMajor[];
  analysisSummary: string;
  strengths: string[];
  recommendations: string[];
  confidenceScore: number;
  fullResponse: any;
}

interface RecommendedMajor {
  majorId: number;
  majorName: string;
  majorCode: string;
  matchScore: number;
  reasons: string[];
}

export class AIService {
  private openai: OpenAI;

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      console.warn('⚠️ OPENAI_API_KEY not found. AI features will be limited.');
    }

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'demo-key',
    });
  }

  async analyzeCareerFit(surveyData: SurveyData): Promise<AIAnalysisResult> {
    try {
      // Get available majors from database
      const majors = await db.all('SELECT * FROM majors');
      
      // If no API key, use fallback analysis
      if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'demo-key') {
        console.log('🔄 Using fallback rule-based analysis');
        return this.fallbackAnalysis(surveyData);
      }

      console.log('🤖 Processing AI analysis for survey:', surveyData.name);

      const prompt = `
Analyze this student's career fit based on their survey data:

Name: ${surveyData.name}
Age: ${surveyData.age}
Current Grade: ${surveyData.currentGrade}
Interests: ${surveyData.interests.join(', ')}
Skills: ${surveyData.skills.join(', ')}
Academic Scores: ${JSON.stringify(surveyData.academicScores)}
Career Goals: ${surveyData.careerGoals}
Learning Style: ${surveyData.learningStyle}
Work Environment Preference: ${surveyData.workEnvironmentPreference}

Available Majors:
${majors.map((m: any) => `- ${m.name} (${m.code}): ${m.description}`).join('\n')}

Please provide a detailed analysis in JSON format with:
1. Top 3 recommended majors with match scores (0-100) and reasons
2. Analysis summary in Vietnamese
3. Student's strengths
4. Specific recommendations for improvement
5. Overall confidence score (0-100)

Format the response as valid JSON.
      `;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are an expert career counselor for Vietnamese students. Provide detailed, accurate analysis in Vietnamese language." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from OpenAI');
      }

      // Parse the JSON response
      const analysis = JSON.parse(response);
      
      return {
        recommendedMajors: analysis.recommendedMajors || [],
        analysisSummary: analysis.analysisSummary || 'Phân tích chi tiết về phù hợp nghề nghiệp.',
        strengths: analysis.strengths || ['Có động lực học tập'],
        recommendations: analysis.recommendations || ['Tiếp tục phát triển kỹ năng'],
        confidenceScore: analysis.confidenceScore || 0.85,
        fullResponse: analysis
      };

    } catch (error: any) {
      console.error('❌ AI Analysis Error:', error);
      console.log('🔄 Using fallback rule-based analysis');
      return this.fallbackAnalysis(surveyData);
    }
  }

  private fallbackAnalysis(surveyData: SurveyData): AIAnalysisResult {
    console.log('🔄 Using fallback rule-based analysis');

    // Advanced rule-based matching
    const recommendations: RecommendedMajor[] = [];
    const scores: {[key: string]: number} = {};

    // Calculate scores for each major based on multiple factors
    
    // IT Score
    let itScore = 60; // Base score
    if (surveyData.interests.includes('Công nghệ thông tin')) itScore += 20;
    if (surveyData.skills.includes('Lập trình')) itScore += 15;
    if (surveyData.skills.includes('Tư duy logic')) itScore += 10;
    if (surveyData.academicScores.math >= 8) itScore += 15;
    if (surveyData.academicScores.physics >= 7) itScore += 10;
    if (surveyData.careerGoals.toLowerCase().includes('lập trình')) itScore += 10;
    scores['IT'] = Math.min(itScore, 98);

    // Design Score
    let designScore = 50;
    if (surveyData.interests.includes('Thiết kế đồ họa')) designScore += 25;
    if (surveyData.skills.includes('Sáng tạo')) designScore += 20;
    if (surveyData.skills.includes('Thiết kế')) designScore += 15;
    if (surveyData.interests.includes('Nghệ thuật')) designScore += 15;
    if (surveyData.learningStyle === 'visual') designScore += 10;
    scores['GD'] = Math.min(designScore, 95);

    // Marketing Score
    let marketingScore = 55;
    if (surveyData.interests.includes('Marketing')) marketingScore += 20;
    if (surveyData.skills.includes('Giao tiếp')) marketingScore += 15;
    if (surveyData.skills.includes('Thuyết trình')) marketingScore += 15;
    if (surveyData.workEnvironmentPreference === 'office') marketingScore += 5;
    if (surveyData.academicScores.english >= 7) marketingScore += 10;
    scores['MKT'] = Math.min(marketingScore, 92);

    // Sort by score and take top 3
    const sortedMajors = Object.entries(scores)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);

    const majorNames = {
      'IT': 'Công nghệ thông tin',
      'GD': 'Thiết kế đồ họa', 
      'MKT': 'Marketing'
    };

    const majorIds = {
      'IT': 1, 'GD': 2, 'MKT': 3
    };

    sortedMajors.forEach(([code, score]) => {
      const reasons = [];
      if (code === 'IT' && surveyData.academicScores.math >= 7) reasons.push('Điểm toán cao');
      if (code === 'GD' && surveyData.skills.includes('Sáng tạo')) reasons.push('Có khả năng sáng tạo');
      if (code === 'MKT' && surveyData.skills.includes('Giao tiếp')) reasons.push('Kỹ năng giao tiếp tốt');
      
      reasons.push(`Phù hợp với sở thích của bạn`);
      reasons.push(`Phù hợp với năng lực hiện tại`);

      recommendations.push({
        majorId: majorIds[code as keyof typeof majorIds],
        majorName: majorNames[code as keyof typeof majorNames],
        majorCode: code,
        matchScore: Math.round(score),
        reasons: reasons.slice(0, 3)
      });
    });

    return {
      recommendedMajors: recommendations.slice(0, 3),
      analysisSummary: `Dựa trên phân tích sở thích và kỹ năng của ${surveyData.name}, chúng tôi khuyến nghị các ngành học phù hợp với định hướng nghề nghiệp.`,
      strengths: ['Có động lực học tập', 'Quan tâm đến tương lai'],
      recommendations: ['Tiếp tục phát triển kỹ năng chuyên môn', 'Tham gia các hoạt động thực hành'],
      confidenceScore: 0.8,
      fullResponse: {
        timestamp: new Date().toISOString()
      }
    };
  }

  async generateChatResponse(message: string, context?: any): Promise<string> {
    // Always use fallback responses when no valid API key
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'demo-key') {
      console.log('🔄 Using fallback chat response');
      return this.generateFallbackChatResponse(message);
    }

    try {
      const systemPrompt = `
Bạn là chatbot tư vấn giáo dục của FPT Polytechnic. 
Hãy trả lời các câu hỏi về:
- Các ngành học tại FPT Polytechnic
- Tư vấn định hướng nghề nghiệp
- Thông tin tuyển sinh
- Cơ hội việc làm sau tốt nghiệp

Trả lời bằng tiếng Việt, thân thiện và hữu ích.
      `;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      return completion.choices[0]?.message?.content || 'Xin lỗi, tôi không thể trả lời câu hỏi này lúc này.';

    } catch (error) {
      console.error('❌ Chat AI Error:', error);
      return this.generateFallbackChatResponse(message);
    }
  }

  private generateFallbackChatResponse(message: string): string {
    // Normalize Vietnamese characters and convert to lowercase
    const msg = message.toLowerCase().normalize('NFC');
    
    // Advanced template-based pattern matching
    const templateResponse = this.matchPromptTemplates(msg);
    
    if (templateResponse && templateResponse.confidence >= 0.5) {
      return templateResponse.response;
    }
    
    // Advanced contextual pattern matching with confidence scoring
    const contextualResponses = this.analyzeContextualPatterns(msg);
    
    // Find the response with highest confidence score
    const bestResponse = this.selectBestResponse(contextualResponses);
    
    if (bestResponse && bestResponse.confidence >= 0.7) {
      return bestResponse.response;
    }
    
    // Fallback to profile-based analysis if no high-confidence match
    const userProfile = this.analyzeUserProfile(msg);
    
    // Generate personalized response based on user profile
    if (userProfile.concerns.length > 0 || userProfile.interests.length > 0) {
      return this.generatePersonalizedAdvice(userProfile, msg);
    }
    
    // Check for math concerns with IT interest (more flexible patterns)
    const mathConcerns = ['dốt toán', 'học dốt toán', 'kém toán', 'yếu toán', 'không giỏi toán', 'toán kém', 'toán dở', 'toán không tốt', 'không khá toán', 'yếu về toán', 'toán học không tốt'];
    const itInterests = ['công nghệ thông tin', 'it', 'lập trình', 'phần mềm', 'máy tính', 'developer', 'coder', 'programmer', 'software', 'app'];
    
    const hasMathConcern = mathConcerns.some(concern => msg.includes(concern));
    const hasItInterest = itInterests.some(interest => msg.includes(interest));
    
    if (hasMathConcern && hasItInterest) {
      const mathItResponses = [
        `🤔 **Học dốt toán có thể học IT không?**

✅ **Tin tốt:** HOÀN TOÀN ĐƯỢC! Nhiều lập trình viên giỏi không xuất thân từ toán học.

📊 **Thực tế về toán trong IT:**
• 70% công việc IT chỉ cần toán cơ bản (cộng, trừ, nhân, chia)
• Logic tư duy quan trọng hơn tính toán phức tạp
• Có công cụ và thư viện hỗ trợ mọi phép tính

🎯 **Các lĩnh vực IT ít cần toán:**
• Frontend Development (HTML, CSS, JavaScript)
• Mobile App Development  
• UI/UX Design
• Software Testing

💡 **Lời khuyên:**
• Tập trung vào logic và tư duy thuật toán
• Học từ cơ bản, từ từ xây dựng nền tảng
• Thực hành nhiều hơn lý thuyết

🚀 Bạn có muốn tôi tư vấn lộ trình học IT phù hợp với người mới bắt đầu không?`,

        `💻 **Toán kém vẫn có thể thành công trong IT!**

🌟 **Câu chuyện thực tế:**
Nhiều CEO công nghệ nổi tiếng như Jack Dorsey (Twitter) không giỏi toán nhưng vẫn thành công!

🧠 **Kỹ năng quan trọng hơn toán:**
• Tư duy logic và giải quyết vấn đề
• Khả năng học hỏi và thích nghi
• Kiên nhẫn và tỉ mỉ trong code
• Giao tiếp và làm việc nhóm

🎨 **Lĩnh vực IT thân thiện với người kém toán:**
• Web Design & Frontend
• Mobile App UI/UX  
• Game Development (phần thiết kế)
• Digital Marketing & SEO

💪 **Bí quyết thành công:**
• Bắt đầu với HTML/CSS đơn giản
• Học JavaScript từ từ, step by step
• Tham gia cộng đồng lập trình viên
• Làm project thực tế thay vì học thuần lý thuyết

Bạn muốn bắt đầu từ đâu? Tôi có thể gợi ý roadmap chi tiết! 🗺️`,

        `🚀 **Toán dở không phải rào cản với IT!**

📈 **Thống kê thú vị:**
• 60% lập trình viên tự học, không có nền tảng toán mạnh
• Các framework hiện đại đã giải quyết phần toán phức tạp
• AI và Low-code đang làm lập trình dễ tiếp cận hơn

🎯 **Lộ trình dành riêng cho bạn:**

**Tháng 1-2:** HTML + CSS cơ bản
• Tạo website tĩnh đơn giản
• Học Flexbox và Grid layout
• Thực hành với Bootstrap

**Tháng 3-4:** JavaScript căn bản
• Biến, hàm, điều kiện cơ bản
• DOM manipulation
• Làm calculator, todo app

**Tháng 5-6:** Framework đầu tiên
• React hoặc Vue.js
• Component thinking
• Build project portfolio

💡 **Mẹo học hiệu quả:**
• YouTube và Udemy có khóa học miễn phí
• Tham gia group Facebook "Học lập trình"
• Code mỗi ngày, dù chỉ 30 phút

Bạn có sẵn sàng bắt đầu hành trình này không? 🌟`
      ];
      return mathItResponses[Math.floor(Math.random() * mathItResponses.length)];
    }

    // Check for drawing concerns with design interest
    const drawingConcerns = ['không biết vẽ', 'không giỏi vẽ', 'vẽ dở', 'chưa biết vẽ', 'vẽ không đẹp', 'không có tài năng vẽ'];
    const designInterests = ['thiết kế', 'đồ họa', 'design', 'ui/ux', 'graphic', 'designer'];
    
    const hasDrawingConcern = drawingConcerns.some(concern => msg.includes(concern));
    const hasDesignInterest = designInterests.some(interest => msg.includes(interest));
    
    if (hasDrawingConcern && hasDesignInterest) {
      return `🎨 **Không biết vẽ có học được Thiết kế không?**

✅ **Tin tốt:** CÓ THỂ HỌC ĐƯỢC! Thiết kế hiện đại khác xa với vẽ tay truyền thống.

🖥️ **Thiết kế số hiện tại:**
• 90% làm việc trên máy tính (Photoshop, Illustrator)
• Có template và asset có sẵn
• AI hỗ trợ tạo ý tưởng và nội dung
• Tập trung vào ý tưởng hơn kỹ thuật vẽ

🎯 **Kỹ năng quan trọng hơn vẽ tay:**
• Tư duy sáng tạo và thẩm mỹ
• Hiểu tâm lý khách hàng
• Xu hướng màu sắc, font chữ
• Kỹ năng sử dụng phần mềm

💡 **Lời khuyên:**
• Bắt đầu học Photoshop cơ bản
• Tham khảo thiết kế trên Pinterest, Behance
• Thực hành làm poster, banner đơn giản

🚀 Quan trọng là CẢM THẨM MỸ, không phải tay nghề vẽ! Bạn có thích màu sắc và bố cục đẹp không?`;
    }

    // Check for financial concerns
    const financialConcerns = ['gia đình nghèo', 'không có tiền', 'kinh tế khó khăn', 'học phí cao', 'không đủ tiền'];
    const hasFinancialConcern = financialConcerns.some(concern => msg.includes(concern));
    
    if (hasFinancialConcern) {
      return `💰 **Khó khăn kinh tế có thể học được không?**

✅ **Đừng lo lắng!** FPT Polytechnic có nhiều chính sách hỗ trợ:

🎓 **Học bổng:**
• Học bổng 100% cho học sinh giỏi
• Học bổng 50% cho hoàn cảnh khó khăn
• Học bổng tài năng đặc biệt

💳 **Hỗ trợ tài chính:**
• Trả góp học phí 0% lãi suất
• Vay vốn ưu đãi từ ngân hàng
• Làm part-time tại trường

🏢 **Cơ hội việc làm:**
• Thực tập có lương từ năm 2
• Job fair với mức lương hấp dẫn
• Cam kết việc làm sau tốt nghiệp

💡 **Lời khuyên:** Hãy đăng ký tư vấn để biết các chương trình hỗ trợ cụ thể!

Bạn muốn biết thêm về học bổng nào?`;
    }

    // Greetings and general questions
    if (msg.includes('xin chào') || msg.includes('hello') || msg.includes('hi') || msg === 'chào' || 
        msg.includes('alo') || msg.includes('alô') || msg.includes('hey') || 
        msg === 'chào bạn' || msg === 'chào em' || msg.includes('good morning') || 
        msg.includes('good afternoon') || msg.includes('good evening')) {
      const greetings = [
        `Chào bạn! 👋 Tôi là AI tư vấn tuyển sinh FPT Polytechnic. Bạn đang quan tâm ngành học nào vậy?`,
        `Xin chào! 🎓 Rất vui được hỗ trợ bạn tìm hiểu về các ngành học tại FPT Polytechnic. Bạn cần tư vấn gì?`,
        `Hi bạn! ✨ Tôi có thể giúp bạn khám phá các cơ hội học tập tại FPT Polytechnic. Hãy cho tôi biết bạn quan tâm điều gì nhé!`,
        `Alô! 📞 Tôi đây, AI tư vấn FPT Polytechnic. Bạn muốn tìm hiểu ngành học nào ạ?`
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    }

    // IT related
    if (msg.includes('công nghệ thông tin') || msg.includes('it') || msg.includes('lập trình') || msg.includes('phần mềm')) {
      const itResponses = [
        `🖥️ **Ngành Công nghệ thông tin - Lựa chọn hot nhất hiện nay!**

📚 **Chương trình học:**
• Lập trình Java, Python, C#
• Phát triển Web & Mobile App  
• Database & Cloud Computing
• AI & Machine Learning cơ bản

💼 **Cơ hội nghề nghiệp:**
• Fullstack Developer (15-30 triệu)
• Mobile App Developer (12-25 triệu)
• DevOps Engineer (20-40 triệu)
• Data Analyst (15-35 triệu)

🎯 Bạn có muốn biết thêm về lộ trình học hoặc điều kiện tuyển sinh không?`,

        `💻 **IT tại FPT Polytechnic - Nơi ươm mầm lập trình viên!**

🔥 **Tại sao chọn IT:**
• Ngành có nhu cầu tuyển dụng cao nhất
• Mức lương khởi điểm hấp dẫn
• Cơ hội làm việc remote, freelance
• Phát triển sự nghiệp nhanh

🛠️ **Công nghệ được học:**
ReactJS, NodeJS, Flutter, Docker, AWS...

Bạn đã có kiến thức lập trình nào chưa? Tôi có thể tư vấn lộ trình phù hợp!`
      ];
      return itResponses[Math.floor(Math.random() * itResponses.length)];
    }

    // Random encouraging responses for unclear messages
    const randomResponses = [
      `🌟 Tôi hiểu bạn đang tìm hiểu về định hướng học tập. Hãy chia sẻ với tôi: bạn thích làm gì trong thời gian rảnh? Từ đó tôi có thể tư vấn ngành học phù hợp nhất!`,
      
      `💡 Mỗi ngành học đều có những điểm thú vị riêng! Bạn có thể kể cho tôi nghe về những môn học yêu thích ở trường không? Tôi sẽ gợi ý ngành phù hợp!`,
      
      `🎯 Để tư vấn chính xác nhất, bạn có thể cho tôi biết: bạn là người thích sáng tạo, tính toán, hay giao tiếp? Mỗi tính cách sẽ phù hợp với những ngành khác nhau!`,
      
      `🚀 FPT Polytechnic có nhiều ngành hot như IT, Thiết kế, Marketing... Bạn muốn biết ngành nào có mức lương cao nhất? Hay cơ hội việc làm tốt nhất?`
    ];

    return randomResponses[Math.floor(Math.random() * randomResponses.length)];
  }

  // Advanced user profile analysis
  private analyzeUserProfile(message: string): { concerns: string[], interests: string[], personality: string[], demographics: string[] } {
    const profile = {
      concerns: [] as string[],
      interests: [] as string[],
      personality: [] as string[],
      demographics: [] as string[]
    };

    // Academic concerns
    if (message.includes('dốt') || message.includes('kém') || message.includes('yếu') || message.includes('không giỏi')) {
      profile.concerns.push('academic_weakness');
    }

    // Financial concerns
    if (message.includes('nghèo') || message.includes('không có tiền') || message.includes('kinh tế khó khăn') || message.includes('học phí')) {
      profile.concerns.push('financial');
    }

    // Age-related concerns
    if (message.includes('tuổi') || message.includes('già') || message.includes('trẻ') || message.includes('muộn')) {
      profile.concerns.push('age');
    }

    // Gender-related
    if (message.includes('con gái') || message.includes('nữ') || message.includes('girl') || message.includes('female')) {
      profile.demographics.push('female');
    }

    // Technology interests
    if (message.includes('công nghệ') || message.includes('máy tính') || message.includes('lập trình') || message.includes('it')) {
      profile.interests.push('technology');
    }

    // Design interests
    if (message.includes('thiết kế') || message.includes('đồ họa') || message.includes('vẽ') || message.includes('design')) {
      profile.interests.push('design');
    }

    // Business interests
    if (message.includes('kinh doanh') || message.includes('marketing') || message.includes('bán hàng') || message.includes('quản lý')) {
      profile.interests.push('business');
    }

    // Personality traits
    if (message.includes('thích sáng tạo') || message.includes('sáng tạo') || message.includes('nghệ thuật')) {
      profile.personality.push('creative');
    }

    if (message.includes('thích tính toán') || message.includes('logic') || message.includes('phân tích')) {
      profile.personality.push('analytical');
    }

    if (message.includes('thích giao tiếp') || message.includes('nói chuyện') || message.includes('social')) {
      profile.personality.push('social');
    }

    return profile;
  }

  // Generate personalized advice based on user profile
  private generatePersonalizedAdvice(profile: any, originalMessage: string): string {
    // Academic weakness support
    if (profile.concerns.includes('academic_weakness')) {
      if (profile.interests.includes('technology')) {
        return this.generateAcademicSupportResponse('IT');
      } else if (profile.interests.includes('design')) {
        return this.generateAcademicSupportResponse('Design');
      }
    }

    // Financial support
    if (profile.concerns.includes('financial')) {
      return this.generateFinancialSupportResponse();
    }

    // Age-appropriate advice
    if (profile.concerns.includes('age')) {
      return this.generateAgeAppropriateResponse();
    }

    // Gender-specific encouragement
    if (profile.demographics.includes('female') && profile.interests.includes('technology')) {
      return this.generateGenderEncouragementResponse();
    }

    // Interest-based responses
    if (profile.interests.includes('technology')) {
      return this.generateTechCareerAdvice();
    } else if (profile.interests.includes('design')) {
      return this.generateDesignCareerAdvice();
    } else if (profile.interests.includes('business')) {
      return this.generateBusinessCareerAdvice();
    }

    // Personality-based responses
    if (profile.personality.includes('creative')) {
      return this.generateCreativeCareerAdvice();
    } else if (profile.personality.includes('analytical')) {
      return this.generateAnalyticalCareerAdvice();
    } else if (profile.personality.includes('social')) {
      return this.generateSocialCareerAdvice();
    }

    return this.generateGeneralEncouragement();
  }

  private generateAcademicSupportResponse(field: string): string {
    const responses = {
      'IT': `💪 **Đừng lo về học lực! Thành công trong IT không chỉ phụ thuộc vào điểm số!**

🌟 **Những điều quan trọng hơn điểm số:**
• Đam mê và kiên trì học hỏi
• Khả năng tự học và tìm hiểu
• Tư duy giải quyết vấn đề
• Thực hành và làm project

🚀 **Lộ trình phù hợp cho bạn:**
• Bắt đầu với HTML/CSS cơ bản
• Tập trung vào thực hành nhiều hơn lý thuyết
• Tham gia cộng đồng học lập trình
• Xây dựng portfolio từ project nhỏ

💡 **Câu chuyện động viên:** Nhiều lập trình viên thành công không xuất thân từ học sinh giỏi!`,

      'Design': `🎨 **Thiết kế không cần điểm số cao, cần CẢM HỨNG và SÁNG TẠO!**

✨ **Những điều quan trọng trong Design:**
• Cảm thẩm mỹ và óc sáng tạo
• Khả năng quan sát và học hỏi
• Kiên nhẫn và tỉ mỉ
• Hiểu tâm lý người dùng

🎯 **Bắt đầu ngay từ hôm nay:**
• Tải Canva hoặc Figma miễn phí
• Thực hành thiết kế poster, banner
• Theo dõi các designer nổi tiếng
• Tham gia các contest design

🌈 **Remember:** Creativity > Grades!`
    };

    return responses[field as keyof typeof responses] || responses['IT'];
  }

  private generateFinancialSupportResponse(): string {
    return `💰 **Đừng để tài chính cản trở ước mơ của bạn!**

🎓 **Các chương trình hỗ trợ tại FPT Polytechnic:**

**Học bổng:**
• 100% học phí cho học sinh xuất sắc
• 50% học phí cho hoàn cảnh khó khăn
• Học bổng tài năng đặc biệt

**Hỗ trợ tài chính:**
• Trả góp 0% lãi suất
• Vay vốn ưu đãi từ ngân hàng
• Part-time job tại trường

**Cơ hội kiếm tiền:**
• Freelance từ năm 2
• Thực tập có lương cao
• Job guarantee sau tốt nghiệp

💪 **Nhiều sinh viên đã vượt khó thành công!** Bạn cũng có thể làm được!

Liên hệ tư vấn: 1900-6969 để biết chi tiết các chương trình hỗ trợ!`;
  }

  private generateAgeAppropriateResponse(): string {
    return `⏰ **Tuổi tác chỉ là con số! Học tập không bao giờ là quá muộn!**

🌟 **Thành công không phân biệt tuổi tác:**
• Colonel Sanders thành lập KFC ở tuổi 62
• Vera Wang bắt đầu thiết kế thời trang ở tuổi 40
• Nhiều developer thành công bắt đầu sau 30 tuổi

🎯 **Lợi thế của người học muộn:**
• Kinh nghiệm sống phong phú
• Mục tiêu rõ ràng và quyết tâm cao
• Khả năng tập trung tốt hơn
• Hiểu rõ giá trị của cơ hội

💪 **Lời khuyên:**
• Tập trung vào kỹ năng thực tế
• Học online linh hoạt thời gian
• Tận dụng kinh nghiệm cũ
• Networking với người cùng tuổi

🚀 **It's never too late to start!**`;
  }

  private generateGenderEncouragementResponse(): string {
    return `👩‍💻 **Nữ giới trong IT - Sức mạnh đang lên!**

🌟 **Thống kê đáng tự hào:**
• 25% lập trình viên tại Google là nữ
• Nữ developer có mức lương ngang bằng nam
• Nhiều CEO công nghệ nổi tiếng là nữ

💪 **Ưu điểm của nữ trong IT:**
• Tỉ mỉ và cẩn thận trong code
• Khả năng giao tiếp tốt
• Tư duy đa chiều và sáng tạo
• UI/UX design xuất sắc

🎯 **Lĩnh vực nữ thường thành công:**
• Frontend Development
• UI/UX Design  
• Product Management
• Quality Assurance

🚀 **Role models:** Susan Wojcicki (YouTube CEO), Reshma Saujani (Girls Who Code)

**You can code, you can lead, you can change the world!** 💫`;
  }

  private generateTechCareerAdvice(): string {
    return `💻 **Tech Career - Tương lai rộng mở!**

🔥 **Hot trends 2024:**
• AI/Machine Learning
• Cloud Computing  
• Cybersecurity
• Mobile Development

📈 **Mức lương hấp dẫn:**
• Junior: 8-15 triệu
• Middle: 15-30 triệu  
• Senior: 30-60 triệu
• Lead: 60-100+ triệu

🎯 **Roadmap thành công:**
1. Chọn 1 ngôn ngữ để focus
2. Build portfolio với 3-5 projects
3. Contribute open source
4. Network với tech community
5. Chuẩn bị kỹ skill phỏng vấn

🚀 **Bạn muốn bắt đầu với ngôn ngữ nào? Python, JavaScript, hay Java?**`;
  }

  private generateDesignCareerAdvice(): string {
    return `🎨 **Design Career - Sáng tạo không giới hạn!**

✨ **Lĩnh vực design hot:**
• UI/UX Design
• Graphic Design
• Motion Graphics  
• 3D Visualization

💰 **Mức thu nhập:**
• Fresher: 6-12 triệu
• Junior: 12-20 triệu
• Senior: 20-40 triệu
• Art Director: 40-80 triệu

🛠️ **Tools cần master:**
• Figma/Adobe XD (UI/UX)
• Photoshop/Illustrator (Graphic)
• After Effects (Motion)
• Blender (3D)

📚 **Học từ đâu:**
• Dribbble, Behance (inspiration)
• YouTube tutorials
• Online courses (Udemy, Coursera)
• Design communities

🌟 **Bạn thích thiết kế gì nhất? Logo, website, hay app mobile?**`;
  }

  private generateBusinessCareerAdvice(): string {
    return `💼 **Business Career - Dẫn đầu xu hướng!**

📊 **Ngành kinh doanh hot:**
• Digital Marketing
• E-commerce
• Business Analytics
• Project Management

💵 **Thu nhập hấp dẫn:**
• Marketing Executive: 8-15 triệu
• Digital Marketing Manager: 15-30 triệu
• Business Analyst: 12-25 triệu
• Product Manager: 25-50 triệu

🎯 **Kỹ năng cần có:**
• Phân tích dữ liệu
• Social media marketing
• Content creation
• Leadership & communication

📈 **Trend 2024:**
• TikTok Marketing
• AI trong business
• Sustainability business
• Remote team management

🚀 **Bạn muốn focus vào marketing, sales hay management?**`;
  }

  private generateCreativeCareerAdvice(): string {
    return `🎭 **Creative Careers - Thế giới của nghệ thuật!**

🌈 **Lĩnh vực sáng tạo:**
• Content Creator/Influencer
• Video Production
• Photography
• Animation & VFX

💡 **Cơ hội kiếm tiền:**
• Freelance projects
• Brand collaboration  
• Online courses
• Digital products

🛠️ **Tools sáng tạo:**
• Canva, Figma (Design)
• Premiere Pro (Video)
• Lightroom (Photo)
• Blender (3D Animation)

📱 **Platforms để showcase:**
• Instagram, TikTok
• YouTube, Facebook
• Behance, Dribbble
• Personal website/blog

✨ **Creativity + Technology = Unlimited possibilities!**

Bạn muốn sáng tạo ở lĩnh vực nào nhất?`;
  }

  private generateAnalyticalCareerAdvice(): string {
    return `📊 **Analytical Careers - Sức mạnh của dữ liệu!**

🧮 **Nghề nghiệp phân tích:**
• Data Analyst
• Business Intelligence
• Financial Analyst  
• Research & Development

💰 **Mức lương:**
• Data Analyst: 12-25 triệu
• BI Specialist: 15-35 triệu
• Senior Analyst: 25-50 triệu
• Data Scientist: 30-80 triệu

🔧 **Tools cần biết:**
• Excel/Google Sheets (cơ bản)
• SQL (database)
• Python/R (advanced)
• Tableau/Power BI (visualization)

📈 **Xu hướng:**
• Big Data Analytics
• AI/Machine Learning
• Predictive Analytics
• Real-time Dashboard

🎯 **Perfect cho người:**
• Thích số liệu và logic
• Kiên nhẫn với detail
• Tò mò về patterns
• Muốn đưa ra quyết định dựa trên data

Bạn muốn phân tích dữ liệu về lĩnh vực nào?`;
  }

  private generateSocialCareerAdvice(): string {
    return `🤝 **Social Careers - Kết nối con người!**

👥 **Nghề nghiệp xã hội:**
• Human Resources
• Customer Success
• Sales & Marketing
• Event Management

💬 **Ưu điểm người giỏi giao tiếp:**
• Build relationships dễ dàng
• Hiểu tâm lý khách hàng
• Leadership potential cao
• Networking skills tự nhiên

💼 **Cơ hội nghề nghiệp:**
• HR Business Partner: 15-30 triệu
• Sales Manager: 20-50 triệu  
• Marketing Manager: 18-40 triệu
• Event Director: 25-60 triệu

🌟 **Kỹ năng phát triển:**
• Public speaking
• Negotiation
• Team management
• Digital communication

📱 **Platforms để phát triển:**
• LinkedIn networking
• Facebook groups
• Professional events
• Online communities

🚀 **People person = Unlimited career potential!**

Bạn thích làm việc với team nhỏ hay quản lý nhóm lớn?`;
  }

  private generateGeneralEncouragement(): string {
    const encouragements = [
      `🌟 **Mỗi người đều có tài năng riêng!**

Hãy chia sẻ với tôi:
• Bạn thích làm gì trong thời gian rảnh?
• Môn học nào bạn cảm thấy dễ nhất?
• Bạn là người thích làm việc một mình hay nhóm?

Từ đó tôi sẽ tư vấn ngành học phù hợp nhất! 🎯`,

      `💡 **Thành công không có công thức cố định!**

Một số câu hỏi để tôi hiểu bạn hơn:
• Bạn thích sáng tạo hay phân tích?
• Làm việc với máy tính hay giao tiếp với người?
• Ổn định hay thích thử thách mới?

Mỗi tính cách sẽ phù hợp với những ngành khác nhau! 🚀`,

      `🎯 **Định hướng nghề nghiệp cần thời gian!**

Đừng vội, hãy khám phá:
• Thử làm các bài test tính cách online
• Tham gia các hoạt động extracurricular  
• Nói chuyện với người làm trong ngành
• Thực tập ngắn hạn để trải nghiệm

**Journey of thousand miles begins with a single step!** ✨`
    ];

    return encouragements[Math.floor(Math.random() * encouragements.length)];
  }

  // Advanced template-based pattern matching system
  private matchPromptTemplates(message: string): {response: string, confidence: number} | null {
    const templates = this.getPromptTemplates();
    let bestMatch: {response: string, confidence: number} | null = null;
    let maxConfidence = 0;

    console.log(`🔍 Template matching for: "${message}"`);

    for (const category in templates) {
      const template = templates[category];
      const match = this.matchTemplate(message, template);
      
      if (match) {
        console.log(`📋 Category "${category}" matched with confidence: ${match.confidence}`);
      }
      
      if (match && match.confidence > maxConfidence) {
        maxConfidence = match.confidence;
        bestMatch = match;
        console.log(`🎯 New best match: ${category} (${match.confidence})`);
      }
    }

    if (bestMatch) {
      console.log(`✅ Final match: confidence ${bestMatch.confidence}`);
    } else {
      console.log(`❌ No template match found`);
    }

    return bestMatch;
  }

  // Match specific template patterns
  private matchTemplate(message: string, template: any): {response: string, confidence: number} | null {
    let bestMatch: {response: string, confidence: number} | null = null;
    let maxScore = 0;

    // Handle different template types
    if (template.patterns && Array.isArray(template.patterns)) {
      // Simple pattern matching
      for (const pattern of template.patterns) {
        const score = this.calculateTemplateScore(message, pattern, template);
        if (score > maxScore) {
          maxScore = score;
          bestMatch = {
            response: this.generateTemplateResponse(pattern, template, message),
            confidence: score
          };
        }
      }
    }

    // Handle variable patterns (e.g., {subject}, {major})
    if (template.subjects || template.activities || template.majors || template.skills) {
      const variableMatch = this.matchVariablePatterns(message, template);
      if (variableMatch && variableMatch.confidence > maxScore) {
        bestMatch = variableMatch;
      }
    }

    return bestMatch;
  }

  // Calculate template matching score
  private calculateTemplateScore(message: string, pattern: string, template: any): number {
    // Remove variable placeholders for basic matching
    const cleanPattern = pattern.replace(/\{[^}]+\}/g, '').trim();
    const keywords = cleanPattern.split(' ').filter(word => word.length > 2);
    
    let score = 0;
    let matches = 0;

    // Check for exact pattern match first
    if (message.includes(cleanPattern)) {
      return 0.95; // Very high confidence for exact matches
    }

    // Check individual keywords
    for (const keyword of keywords) {
      if (message.includes(keyword)) {
        matches++;
        score += 0.15;
      }
    }

    // Boost for partial phrase matches
    const words = cleanPattern.split(' ');
    let phraseMatches = 0;
    for (const word of words) {
      if (word.length > 2 && message.includes(word)) {
        phraseMatches++;
      }
    }
    
    if (phraseMatches >= words.length * 0.6) {
      score += 0.4; // Boost for partial phrase match
    }

    // Normalize score
    return Math.min(score, 1.0);
  }

  // Match patterns with variables like {subject}, {major}
  private matchVariablePatterns(message: string, template: any): {response: string, confidence: number} | null {
    let bestMatch: {response: string, confidence: number} | null = null;
    let maxConfidence = 0;

    // Academic subjects matching
    if (template.subjects && template.responses) {
      for (const subject of template.subjects) {
        if (message.includes(subject)) {
          for (const pattern of template.patterns) {
            const filledPattern = pattern.replace('{subject}', subject);
            const score = this.calculatePatternMatch(message, filledPattern);
            
            if (score > maxConfidence) {
              maxConfidence = score;
              const responses = template.responses[subject] || template.responses.default || [];
              if (responses.length > 0) {
                bestMatch = {
                  response: responses[Math.floor(Math.random() * responses.length)],
                  confidence: score
                };
              }
            }
          }
        }
      }
    }

    // Career interests matching
    if (template.activities) {
      for (const category in template.activities) {
        const activities = template.activities[category];
        for (const activity of activities) {
          if (message.includes(activity)) {
            maxConfidence = Math.max(maxConfidence, 0.75);
            bestMatch = {
              response: this.generateInterestResponse(category, activity),
              confidence: maxConfidence
            };
          }
        }
      }
    }

    // Salary questions matching
    if (template.patterns && template.responses && template.responses.detailed_salary) {
      const salaryKeywords = ['lương', 'thu nhập', 'mức lương', 'kiếm được', 'tiền'];
      const matchCount = salaryKeywords.filter(keyword => message.includes(keyword)).length;
      
      if (matchCount >= 1) {
        maxConfidence = 0.8;
        bestMatch = {
          response: template.responses.detailed_salary,
          confidence: maxConfidence
        };
      }
    }

    // Skill concerns matching
    if (template.skills && template.responses) {
      for (const skillCategory in template.skills) {
        const skillWords = template.skills[skillCategory];
        for (const skill of skillWords) {
          if (message.includes(skill)) {
            for (const pattern of template.patterns) {
              const filledPattern = pattern.replace('{skill}', skill);
              const score = this.calculatePatternMatch(message, filledPattern);
              
              if (score > maxConfidence && template.responses[skillCategory]) {
                maxConfidence = score;
                bestMatch = {
                  response: template.responses[skillCategory],
                  confidence: score
                };
              }
            }
          }
        }
      }
    }

    return bestMatch;
  }

  // Calculate pattern matching score
  private calculatePatternMatch(message: string, pattern: string): number {
    const patternWords = pattern.toLowerCase().split(' ');
    const messageWords = message.split(' ');
    
    let matches = 0;
    for (const word of patternWords) {
      if (word.length > 2 && messageWords.some(mWord => mWord.includes(word))) {
        matches++;
      }
    }
    
    return matches / patternWords.length;
  }

  // Generate response based on career interests
  private generateInterestResponse(category: string, activity: string): string {
    const responses: {[key: string]: string} = {
      'technology': `💻 **Bạn thích ${activity}? Tuyệt vời!**\n\n🎯 **Ngành phù hợp:**\n• Công nghệ thông tin\n• Lập trình phần mềm\n• Thiết kế UI/UX\n• Data Science\n\n🚀 **Cơ hội nghề nghiệp:**\n• Developer: 15-50 triệu\n• System Admin: 12-35 triệu\n• Tech Lead: 30-80 triệu\n\n💡 **Lời khuyên:** Hãy bắt đầu học một ngôn ngữ lập trình như Python hoặc JavaScript!`,
      
      'design': `🎨 **Graphic Design Career - Đam mê ${activity}? Tài năng thiên bẩm!**\n\n🎯 **Ngành phù hợp:**\n• Thiết kế đồ họa (Graphic Design)\n• UI/UX Design\n• Motion Graphics\n• Brand Design\n\n🚀 **Cơ hội nghề nghiệp:**\n• Graphic Designer: 8-25 triệu\n• UI/UX Designer: 12-35 triệu\n• Creative Director: 25-60 triệu\n\n💡 **Lời khuyên:** Thử học Photoshop, Illustrator hoặc Figma để khám phá tài năng!`,
      
      'business': `📈 **Quan tâm ${activity}? Tinh thần entrepreneur!**\n\n🎯 **Ngành phù hợp:**\n• Marketing Digital\n• Quản trị kinh doanh\n• E-commerce\n• Business Development\n\n🚀 **Cơ hội nghề nghiệp:**\n• Marketing Executive: 8-20 triệu\n• Business Analyst: 12-30 triệu\n• Marketing Manager: 20-50 triệu\n\n💡 **Lời khuyên:** Tìm hiểu về Digital Marketing và Social Media trends!`,
      
      'communication': `🗣️ **Giỏi ${activity}? Tài năng hiếm!**\n\n🎯 **Ngành phù hợp:**\n• Marketing & Communication\n• Public Relations\n• Content Creation\n• Sales & Customer Service\n\n🚀 **Cơ hội nghề nghiệp:**\n• Content Creator: 8-25 triệu\n• PR Specialist: 10-30 triệu\n• Sales Manager: 15-45 triệu\n\n💡 **Lời khuyên:** Phát triển kỹ năng viết content và presentation!`,
      
      'helping': `🤝 **Thích ${activity}? Trái tim nhân ái!**\n\n🎯 **Ngành phù hợp:**\n• Customer Service\n• Human Resources\n• Training & Development\n• Social Work\n\n🚀 **Cơ hội nghề nghiệp:**\n• HR Specialist: 8-22 triệu\n• Training Manager: 12-30 triệu\n• Customer Success: 10-25 triệu\n\n💡 **Lời khuyên:** Phát triển soft skills và emotional intelligence!`
    };

    return responses[category] || `🌟 **Tuyệt vời khi bạn quan tâm đến ${activity}!**\n\nHãy cho tôi biết thêm về sở thích của bạn để tư vấn cụ thể hơn nhé! 😊`;
  }

  // Generate template-based response
  private generateTemplateResponse(pattern: string, template: any, message: string): string {
    if (template.responses) {
      if (Array.isArray(template.responses)) {
        return template.responses[Math.floor(Math.random() * template.responses.length)];
      }
      
      // Handle object responses
      for (const key in template.responses) {
        return template.responses[key];
      }
    }
    
    return "Tôi hiểu câu hỏi của bạn. Hãy cho tôi biết thêm chi tiết để tư vấn tốt hơn nhé! 😊";
  }

  // Comprehensive contextual pattern analysis with confidence scoring
  private analyzeContextualPatterns(message: string): Array<{response: string, confidence: number, category: string}> {
    const responses: Array<{response: string, confidence: number, category: string}> = [];
    
    // Define comprehensive pattern categories with scoring
    const patterns = this.getComprehensivePatterns();
    
    for (const category in patterns) {
      const categoryPatterns = patterns[category];
      let maxConfidence = 0;
      let bestResponse = '';
      
      for (const pattern of categoryPatterns.patterns) {
        const confidence = this.calculatePatternConfidence(message, pattern.keywords, pattern.weights || {});
        
        if (confidence > maxConfidence) {
          maxConfidence = confidence;
          bestResponse = this.selectRandomResponse(pattern.responses);
        }
      }
      
      if (maxConfidence > 0.3) { // Minimum threshold
        responses.push({
          response: bestResponse,
          confidence: maxConfidence,
          category: category
        });
      }
    }
    
    return responses;
  }

  // Select the best response based on confidence and context relevance
  private selectBestResponse(responses: Array<{response: string, confidence: number, category: string}>): {response: string, confidence: number} | null {
    if (responses.length === 0) return null;
    
    // Sort by confidence score
    responses.sort((a, b) => b.confidence - a.confidence);
    
    // Apply category priority weights
    const categoryWeights: {[key: string]: number} = {
      'specific_concerns': 1.2,    // Highest priority for specific problems
      'academic_support': 1.15,
      'career_guidance': 1.1,
      'major_information': 1.05,
      'general_questions': 1.0,
      'greetings': 0.9,
      'encouragement': 0.8
    };
    
    // Adjust confidence with category weights
    for (const response of responses) {
      const weight = categoryWeights[response.category] || 1.0;
      response.confidence *= weight;
    }
    
    // Re-sort after applying weights
    responses.sort((a, b) => b.confidence - a.confidence);
    
    return {
      response: responses[0].response,
      confidence: responses[0].confidence
    };
  }

  // Calculate pattern matching confidence score
  private calculatePatternConfidence(message: string, keywords: string[], weights: {[key: string]: number} = {}): number {
    let score = 0;
    let totalKeywords = keywords.length;
    let matchedKeywords = 0;
    
    for (const keyword of keywords) {
      if (message.includes(keyword)) {
        matchedKeywords++;
        const weight = weights[keyword] || 1.0;
        score += weight;
      }
    }
    
    // Base score from keyword matching
    let confidence = matchedKeywords / totalKeywords;
    
    // Boost confidence for exact phrase matches
    const exactPhrases = keywords.filter(k => k.includes(' '));
    for (const phrase of exactPhrases) {
      if (message.includes(phrase)) {
        confidence += 0.2;
      }
    }
    
    // Boost confidence for multiple keyword matches
    if (matchedKeywords >= 2) {
      confidence += 0.1 * (matchedKeywords - 1);
    }
    
    // Context relevance boost
    if (this.hasContextualRelevance(message, keywords)) {
      confidence += 0.15;
    }
    
    return Math.min(confidence, 1.0);
  }

  // Check for contextual relevance
  private hasContextualRelevance(message: string, keywords: string[]): boolean {
    const contextWords = ['học', 'ngành', 'nghề', 'tương lai', 'định hướng', 'tư vấn', 'có thể', 'được không', 'làm sao'];
    return contextWords.some(word => message.includes(word)) && keywords.some(keyword => message.includes(keyword));
  }

  // Select random response from array
  private selectRandomResponse(responses: string[]): string {
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Comprehensive prompt templates for maximum coverage
  private getPromptTemplates(): {[key: string]: any} {
    return {
      // Academic performance concerns
      'academic_weakness': {
        patterns: [
          'dốt {subject}', 'kém {subject}', 'yếu {subject}', 'không giỏi {subject}', '{subject} dở',
          'học dốt {subject}', '{subject} không tốt', 'yếu về {subject}', '{subject} kém',
          'không khá {subject}', '{subject} không khỏe', 'chưa giỏi {subject}'
        ],
        subjects: ['toán', 'văn', 'anh', 'lý', 'hóa', 'sinh', 'sử', 'địa', 'gdcd'],
        responses: {
          'toán': [
            '🤔 **Dốt toán vẫn có thể thành công!**\n\n✅ **Thực tế:** 70% công việc hiện đại chỉ cần toán cơ bản\n• Logic tư duy quan trọng hơn tính toán\n• Có công cụ hỗ trợ mọi phép tính\n• Nhiều CEO tech không giỏi toán\n\n🎯 **Ngành phù hợp:**\n• Frontend Development\n• UI/UX Design\n• Content Marketing\n• Social Media Management\n\n💡 **Bí quyết:** Tập trung phát triển tư duy logic thay vì lo lắng về toán!',
            '💻 **Toán kém không cản trở sự nghiệp!**\n\n🌟 **Ví dụ thành công:**\n• Jack Dorsey (Twitter): Không xuất thân toán học\n• Jan Koum (WhatsApp): Tự học lập trình\n• David Karp (Tumblr): Bỏ học sớm\n\n🧠 **Kỹ năng thay thế:**\n• Creativity & Innovation\n• Problem-solving skills\n• Communication & Teamwork\n• Persistence & Learning ability\n\n🚀 **Lộ trình gợi ý:**\n1. Bắt đầu với HTML/CSS\n2. Học JavaScript từ cơ bản\n3. Build projects thực tế\n4. Join coding communities'
          ],
          'văn': [
            '📝 **Văn kém vẫn có cơ hội tốt!**\n\n✅ **Ngành không cần văn giỏi:**\n• Công nghệ thông tin\n• Thiết kế đồ họa\n• Kỹ thuật & Công nghệ\n• Data Analysis\n\n🎯 **Tuy nhiên nên cải thiện:**\n• Kỹ năng viết email chuyên nghiệp\n• Presentation skills\n• Documentation skills\n\n💡 **Tips:** Focus vào technical skills, văn có thể học dần!'
          ]
        }
      },

      // Career interest exploration
      'career_interests': {
        patterns: [
          'thích {activity}', 'yêu {activity}', 'đam mê {activity}', 'quan tâm {activity}',
          'muốn làm {activity}', 'ước mơ {activity}', 'mong muốn {activity}'
        ],
        activities: {
          'technology': ['máy tính', 'công nghệ', 'lập trình', 'code', 'phần mềm', 'app', 'website', 'game'],
          'design': ['thiết kế', 'vẽ', 'màu sắc', 'nghệ thuật', 'sáng tạo', 'đồ họa', 'hình ảnh'],
          'business': ['kinh doanh', 'bán hàng', 'marketing', 'quản lý', 'lãnh đạo', 'khởi nghiệp'],
          'communication': ['giao tiếp', 'nói chuyện', 'thuyết trình', 'viết', 'truyền thông'],
          'helping': ['giúp đỡ', 'hỗ trợ', 'tư vấn', 'dạy học', 'chăm sóc', 'phục vụ']
        }
      },

      // Financial concerns
      'financial_situations': {
        patterns: [
          'gia đình nghèo', 'không có tiền', 'kinh tế khó khăn', 'hoàn cảnh khó khăn',
          'không đủ tiền', 'học phí cao', 'tài chính hạn chế', 'nghèo', 'khó khăn tài chính'
        ],
        responses: [
          '💰 **Đừng để tài chính cản trở ước mơ!**\n\n🎓 **Học bổng FPT Polytechnic:**\n• 100% học phí: Học sinh xuất sắc\n• 50-75% học phí: Hoàn cảnh khó khăn\n• 25-50% học phí: Thành tích tốt\n\n💳 **Hỗ trợ tài chính:**\n• Trả góp 0% lãi suất\n• Vay vốn ưu đãi\n• Part-time jobs tại trường\n• Thực tập có lương từ năm 2\n\n📞 **Liên hệ ngay:** 1900-6969 để biết chi tiết!'
        ]
      },

      // Age-related concerns
      'age_concerns': {
        patterns: [
          'tuổi {age}', '{age} tuổi', 'đã {age}', 'bây giờ mới {age}',
          'muộn màng', 'già rồi', 'trẻ quá', 'nhỏ tuổi', 'lớn tuổi'
        ],
        responses: {
          'young': '🌱 **Tuổi trẻ là lợi thế!**\n\n✅ **Ưu điểm:**\n• Học nhanh, thích nghi tốt\n• Năng lượng và nhiệt huyết\n• Thời gian dài để phát triển\n• Dễ tiếp thu công nghệ mới\n\n🎯 **Gợi ý:** Hãy tận dụng thời gian để build foundation vững chắc!',
          'older': '🎯 **Học không bao giờ là quá muộn!**\n\n✅ **Ưu điểm người lớn tuổi:**\n• Kinh nghiệm sống phong phú\n• Mục tiêu rõ ràng\n• Kỷ luật và kiên nhẫn\n• Kỹ năng giao tiếp tốt\n\n🌟 **Nhiều người thành công học nghề sau 25, 30 tuổi!**'
        }
      },

      // Gender-related concerns
      'gender_concerns': {
        patterns: [
          'con gái', 'nữ', 'phụ nữ', 'girl', 'female', 'con trai', 'nam', 'boy', 'male'
        ],
        responses: {
          'female_tech': '👩‍💻 **Nữ giới trong Tech - Xu hướng tích cực!**\n\n📈 **Thống kê khích lệ:**\n• 40% sinh viên IT tại FPT là nữ\n• Nữ developer có mức lương cạnh tranh\n• Nhiều nữ CEO công nghệ thành công\n\n🌟 **Ưu điểm của nữ giới:**\n• Tỉ mỉ và cẩn thận\n• Giao tiếp và teamwork tốt\n• UI/UX design xuất sắc\n• Project management hiệu quả\n\n💪 **Role models:** Sheryl Sandberg (Meta), Susan Wojcicki (YouTube), Ginni Rometty (IBM)',
          'female_design': '🎨 **Thiết kế - Lĩnh vực nữ giới tỏa sáng!**\n\n✨ **Thế mạnh tự nhiên:**\n• Cảm thẩm mỹ tinh tế\n• Chi tiết và màu sắc\n• Hiểu tâm lý người dùng\n• Creativity không giới hạn\n\n🏆 **Cơ hội nghề nghiệp:**\n• UI/UX Designer (hot nhất)\n• Brand Designer\n• Creative Director\n• Fashion Designer'
        }
      },

      // Major comparison questions
      'major_comparisons': {
        patterns: [
          'so sánh {major1} và {major2}', '{major1} hay {major2}',
          'khác nhau giữa {major1} và {major2}', 'nên chọn {major1} hay {major2}',
          'giống nhau {major1} {major2}'
        ],
        majors: {
          'it': ['công nghệ thông tin', 'it', 'lập trình', 'phần mềm'],
          'design': ['thiết kế', 'đồ họa', 'design'],
          'business': ['kinh doanh', 'marketing', 'quản trị'],
          'engineering': ['kỹ thuật', 'cơ khí', 'điện tử']
        }
      },

      // Salary and career prospects
      'salary_questions': {
        patterns: [
          'lương {major}', 'thu nhập {major}', 'mức lương {major}',
          'kiếm được bao nhiều', 'lương khởi điểm', 'lương tối đa',
          'có giàu không', 'làm giàu được không'
        ],
        responses: {
          'detailed_salary': '💰 **Mức lương chi tiết theo ngành (2024):**\n\n**🖥️ Công nghệ thông tin:**\n• Fresher: 8-15 triệu\n• Junior (1-2 năm): 15-25 triệu\n• Senior (3-5 năm): 25-45 triệu\n• Lead/Manager (5+ năm): 45-80 triệu\n\n**🎨 Thiết kế đồ họa:**\n• Fresher: 6-12 triệu\n• Junior: 12-20 triệu\n• Senior: 20-35 triệu\n• Art Director: 35-60 triệu\n\n**📈 Marketing:**\n• Fresher: 7-13 triệu\n• Executive: 13-22 triệu\n• Manager: 22-40 triệu\n• Director: 40-70 triệu'
        }
      },

      // Admission and enrollment
      'admission_questions': {
        patterns: [
          'điều kiện tuyển sinh', 'tuyển sinh', 'đăng ký', 'xét tuyển',
          'hồ sơ', 'thủ tục', 'deadline', 'hạn nộp', 'khi nào nộp'
        ]
      },

      // Learning difficulty concerns
      'learning_concerns': {
        patterns: [
          'có khó không', 'khó học không', 'dễ hay khó', 'học có nặng không',
          'áp lực không', 'stress không', 'theo kịp không'
        ]
      },

      // Future prospects
      'future_questions': {
        patterns: [
          'tương lai', 'triển vọng', 'xu hướng', 'phát triển', 'cơ hội',
          'có tốt không', 'có nên không', 'có ổn không'
        ]
      },

      // Specific skill concerns
      'skill_concerns': {
        patterns: [
          'không biết {skill}', 'chưa biết {skill}', 'không giỏi {skill}',
          'không có kinh nghiệm {skill}', 'mới bắt đầu {skill}'
        ],
        skills: {
          'programming': ['lập trình', 'code', 'coding', 'program'],
          'drawing': ['vẽ', 'draw', 'drawing', 'sketching'],
          'english': ['tiếng anh', 'english', 'anh văn'],
          'computer': ['máy tính', 'computer', 'tin học']
        },
        responses: {
          'programming': '💻 **Chưa biết lập trình? Không sao cả!**\n\n🌟 **95% sinh viên IT bắt đầu từ con số 0**\n\n🎯 **Lộ trình cho người mới:**\n1. HTML/CSS (2-3 tuần)\n2. JavaScript cơ bản (1-2 tháng)\n3. Framework (React/Vue) (2-3 tháng)\n4. Backend basics (Node.js/Python)\n\n💡 **Tài nguyên học free:**\n• Codecademy, freeCodeCamp\n• YouTube channels (Traversy Media)\n• FPT có lab thực hành 24/7\n\n🚀 **Tip:** Làm project nhỏ mỗi tuần!',
          'drawing': '🎨 **Không biết vẽ? Thiết kế hiện đại khác hoàn toàn!**\n\n✅ **Thực tế:**\n• 80% designer làm việc trên máy tính\n• AI tools hỗ trợ tạo ý tưởng\n• Template và asset library phong phú\n\n🛠️ **Kỹ năng quan trọng hơn:**\n• Cảm thẩm mỹ (có thể rèn luyện)\n• Hiểu xu hướng màu sắc\n• Tư duy user experience\n• Kỹ năng sử dụng Photoshop/Figma\n\n💡 **Bắt đầu:** Học Canva → Photoshop → Illustrator',
          'english': '🌍 **Tiếng Anh yếu? Vẫn có nhiều cơ hội!**\n\n✅ **Ngành ít cần tiếng Anh:**\n• Thiết kế đồ họa (chủ yếu visual)\n• Marketing nội địa\n• Kỹ thuật/Sửa chữa\n• Sales B2B Việt Nam\n\n📈 **Tuy nhiên nên cải thiện:**\n• Lương cao hơn 30-50% khi giỏi Anh\n• Cơ hội remote work quốc tế\n• Học tài liệu mới nhất\n\n💡 **Học Anh hiệu quả:** Duolingo + YouTube + practice với AI chatbot'
        }
      },

      // Location and accessibility concerns
      'location_concerns': {
        patterns: [
          'xa nhà', 'xa trường', 'ở tỉnh', 'nông thôn', 'miền quê',
          'có cơ sở ở {location}', 'học ở đâu', 'gần nhà'
        ],
        responses: [
          '🏫 **FPT Polytechnic có 13+ cơ sở toàn quốc!**\n\n📍 **Các thành phố lớn:**\n• Hà Nội (2 cơ sở)\n• TP.HCM (3 cơ sở)\n• Đà Nẵng, Cần Thơ\n• Hải Phòng, Quy Nhon\n• Tây Nguyên, Tây Nam Bộ\n\n🏠 **Hỗ trợ sinh viên xa nhà:**\n• Ký túc xá hiện đại\n• Hỗ trợ tìm phòng trọ\n• Học bổng xa nhà\n• Cộng đồng sinh viên thân thiện\n\n💡 **Lợi ích học xa nhà:** Trưởng thành, độc lập, networking rộng!'
        ]
      },

      // Family pressure and expectations
      'family_pressure': {
        patterns: [
          'gia đình không đồng ý', 'bố mẹ không cho', 'gia đình muốn học {major}',
          'áp lực gia đình', 'theo ý bố mẹ', 'gia đình ép buộc'
        ],
        responses: [
          '👨‍👩‍👧‍👦 **Xử lý áp lực gia đình thông minh:**\n\n🤝 **Chiến lược thuyết phục:**\n• Chuẩn bị số liệu cụ thể (lương, cơ hội việc làm)\n• Tìm examples thành công trong ngành\n• Đề xuất thời gian thử nghiệm (1 năm)\n• Cam kết học tập nghiêm túc\n\n📊 **Thông tin thuyết phục:**\n• Tỷ lệ việc làm FPT: 98%\n• Lương khởi điểm: 12-15 triệu\n• Đối tác 500+ doanh nghiệp\n• Xu hướng công nghệ 4.0\n\n💡 **Tip:** Mời bố mẹ tham quan trường, gặp tư vấn viên!'
        ]
      },

      // Health and physical concerns
      'health_concerns': {
        patterns: [
          'cận thị', 'mắt kém', 'không khỏe', 'yếu sức khỏe',
          'ngồi lâu có sao không', 'ảnh hưởng sức khỏe'
        ],
        responses: [
          '👓 **Sức khỏe quan trọng nhất!**\n\n✅ **Ngành thân thiện sức khỏe:**\n• Marketing (ít ngồi máy tính)\n• Business Development (di chuyển nhiều)\n• Event Management\n• Sales & Customer Relations\n\n💻 **Nếu chọn IT/Design:**\n• Màn hình chống ánh sáng xanh\n• Nghỉ giải lao 15p/2h\n• Bài tập mắt đơn giản\n• Ergonomic workspace\n\n🏃‍♂️ **Tips:** Yoga, gym, thể thao đều đặn. Nhiều dev giỏi cũng là vận động viên!'
        ]
      },

      // Time management and study schedule
      'time_concerns': {
        patterns: [
          'không có thời gian', 'bận việc nhà', 'phải làm thêm',
          'học part-time', 'học tối', 'học cuối tuần'
        ],
        responses: [
          '⏰ **Linh hoạt thời gian học tập!**\n\n📅 **Lịch học đa dạng:**\n• Sáng: 7h-11h\n• Chiều: 13h-17h\n• Tối: 18h-21h\n• Cuối tuần: Có lớp bổ sung\n\n💼 **Hỗ trợ sinh viên đi làm:**\n• Học online cho một số môn\n• Ghi âm bài giảng\n• Tài liệu số đầy đủ\n• Hỗ trợ học bù\n\n🎯 **Time management tips:** Pomodoro technique, priority matrix, batch learning!'
        ]
      },

      // Technology and equipment concerns
      'equipment_concerns': {
        patterns: [
          'không có laptop', 'máy tính cũ', 'cấu hình yếu',
          'không có thiết bị', 'máy chậm', 'cần gì để học'
        ],
        responses: [
          '💻 **Thiết bị không phải rào cản!**\n\n🏫 **Cơ sở vật chất FPT:**\n• Lab máy tính 24/7\n• Cấu hình cao (i7, 16GB RAM)\n• Phần mềm bản quyền đầy đủ\n• WiFi tốc độ cao\n\n💡 **Gợi ý mua máy:**\n• Laptop cũ i5 (8-12 triệu)\n• Trả góp 0% qua trường\n• Second-hand từ sinh viên cũ\n\n🎯 **Ưu tiên:** Đầu tư kiến thức trước, thiết bị sau!'
        ]
      },

      // Career change and switching fields
      'career_change': {
        patterns: [
          'chuyển ngành', 'đã làm việc', 'đổi nghề', 'career switch',
          'bỏ nghề cũ', 'học lại từ đầu', 'muộn màng'
        ],
        responses: [
          '🔄 **Career Switch - Xu hướng thời đại!**\n\n📈 **Thống kê khích lệ:**\n• 50% người thành công đổi nghề ít nhất 1 lần\n• Tuổi trung bình chuyển nghề: 27-35\n• IT có 40% người chuyển từ ngành khác\n\n✅ **Ưu điểm của career switcher:**\n• Kinh nghiệm đa ngành\n• Soft skills tốt hơn\n• Mục tiêu rõ ràng\n• Network rộng\n\n💡 **Success stories:** Nhiều CEO tech bắt đầu từ marketing, tài chính, giáo dục!'
        ]
      },

      // Academic performance and grades
      'academic_performance': {
        patterns: [
          'điểm kém', 'học yếu', 'điểm thấp', 'không đủ điểm', 'điểm liệt',
          'học lực trung bình', 'điểm trung bình', 'gpa thấp', 'xếp loại yếu'
        ],
        responses: [
          '📚 **Điểm số không quyết định tất cả!**\n\n🌟 **Sự thật khích lệ:**\n• Steve Jobs có GPA 2.65/4.0\n• Richard Branson bỏ học lúc 16 tuổi\n• 40% CEO Fortune 500 không phải sinh viên xuất sắc\n\n💡 **Điều quan trọng hơn điểm số:**\n• Passion & motivation\n• Practical skills\n• Communication & teamwork\n• Problem-solving ability\n\n🎯 **Ngành phù hợp với học lực trung bình:**\n• Creative fields (Design, Content)\n• Sales & Marketing\n• Entrepreneurship\n• Technical skills (coding, digital)'
        ]
      },

      // Learning difficulties and disabilities
      'learning_difficulties': {
        patterns: [
          'khó học', 'chậm hiểu', 'khó tiếp thu', 'học kém', 'không thông minh',
          'adhd', 'tự kỷ', 'dyslexia', 'khó tập trung', 'hay quên'
        ],
        responses: [
          '🧠 **Mỗi não bộ đều độc đáo và tài năng!**\n\n✨ **Những thiên tài có learning differences:**\n• Albert Einstein - Autism spectrum\n• Richard Branson - Dyslexia\n• Temple Grandin - Autism\n• Cher - Dyslexia\n\n🎯 **Ngành phù hợp:**\n• Visual arts & Design\n• Music & Performing arts\n• Hands-on technical work\n• Entrepreneurship\n• Animal care & veterinary\n\n💪 **Chiến lược học tập:**\n• Visual learning methods\n• Break tasks into small steps\n• Use technology aids\n• Focus on strengths, not weaknesses'
        ]
      },

      // Study methods and learning styles
      'study_methods': {
        patterns: [
          'cách học', 'phương pháp học', 'học như thế nào', 'học hiệu quả',
          'không biết học', 'học mãi không nhớ', 'cách ghi nhớ'
        ],
        responses: [
          '📖 **Tìm phương pháp học phù hợp với bạn!**\n\n🧠 **4 kiểu học tập chính:**\n• **Visual** (70%): Sơ đồ, hình ảnh, màu sắc\n• **Auditory** (20%): Nghe giảng, thảo luận\n• **Kinesthetic** (10%): Thực hành, làm việc tay\n• **Reading/Writing**: Ghi chép, đọc sách\n\n🎯 **Techniques hiệu quả:**\n• **Pomodoro**: 25 phút học + 5 phút nghỉ\n• **Spaced repetition**: Ôn lại theo chu kỳ\n• **Active recall**: Tự test kiến thức\n• **Feynman technique**: Giải thích cho người khác\n\n💡 **Pro tips:** Tìm môi trường học phù hợp, tạo habit tracker!'
        ]
      },

      // Personality types and career matching
      'personality_career': {
        patterns: [
          'hướng nội', 'hướng ngoại', 'introvert', 'extrovert', 'nhút nhát',
          'thích một mình', 'thích đông người', 'tính cách', 'mbti'
        ],
        responses: [
          '🎭 **Tính cách định hướng nghề nghiệp!**\n\n🤫 **Hướng nội (Introvert) - 40% dân số:**\n• **Strengths**: Suy nghĩ sâu, tập trung cao, độc lập\n• **Suitable careers**: Developer, Designer, Writer, Researcher, Analyst\n• **Work environment**: Quiet spaces, deep work, small teams\n\n🗣️ **Hướng ngoại (Extrovert) - 60% dân số:**\n• **Strengths**: Giao tiếp tốt, năng lượng cao, team work\n• **Suitable careers**: Sales, Marketing, HR, Teaching, Management\n• **Work environment**: Open spaces, meetings, networking\n\n🌟 **Ambivert (Cả hai):**\n• Most flexible and adaptable\n• Great for leadership roles\n• Can switch between modes as needed'
        ]
      },

      // Industry trends and future jobs
      'future_trends': {
        patterns: [
          'tương lai', 'xu hướng', 'ngành hot', 'công nghệ mới', 'ai thay thế',
          '2030', '2025', 'automation', 'robot', 'ngành sẽ mất'
        ],
        responses: [
          '🚀 **Nghề nghiệp tương lai 2025-2030!**\n\n📈 **Top trending careers:**\n• **AI/ML Engineer** - 40% growth\n• **Data Scientist** - 35% growth\n• **Cybersecurity** - 33% growth\n• **UX/UI Designer** - 30% growth\n• **Digital Marketing** - 25% growth\n• **Healthcare Tech** - 20% growth\n\n⚠️ **Ngành có nguy cơ:**\n• Basic data entry\n• Simple manufacturing\n• Basic customer service\n• Routine accounting\n\n💡 **Skills không thể thay thế:**\n• Creative thinking\n• Emotional intelligence\n• Complex problem solving\n• Human interaction & empathy'
        ]
      },

      // Internships and practical experience
      'internship_experience': {
        patterns: [
          'thực tập', 'internship', 'kinh nghiệm', 'chưa có kinh nghiệm',
          'tìm việc thực tập', 'học và làm', 'part-time'
        ],
        responses: [
          '💼 **Thực tập - Cửa ngõ vào nghề!**\n\n🎯 **Tại sao cần thực tập:**\n• 85% nhà tuyển dụng ưu tiên có kinh nghiệm\n• Networking với professionals\n• Hiểu rõ công việc thực tế\n• Có thể được offer full-time\n\n📍 **Nơi tìm thực tập:**\n• **LinkedIn** - Professional network\n• **Vietnamworks** - Job portal\n• **Company websites** - Direct application\n• **University career center**\n• **Startup events & meetups**\n\n💡 **Tips thành công:**\n• Apply sớm (trước 2-3 tháng)\n• Customize CV cho từng vị trí\n• Prepare portfolio/demo projects\n• Follow up after interview'
        ]
      },

      // Soft skills and personal development
      'soft_skills': {
        patterns: [
          'kỹ năng mềm', 'soft skills', 'giao tiếp', 'thuyết trình', 'làm việc nhóm',
          'leadership', 'quản lý thời gian', 'tự tin', 'presentation'
        ],
        responses: [
          '🌟 **Soft Skills - Chìa khóa thành công!**\n\n🔝 **Top 10 soft skills 2024:**\n1. **Communication** - Giao tiếp hiệu quả\n2. **Problem-solving** - Giải quyết vấn đề\n3. **Adaptability** - Thích ứng thay đổi\n4. **Teamwork** - Làm việc nhóm\n5. **Time management** - Quản lý thời gian\n6. **Leadership** - Khả năng lãnh đạo\n7. **Critical thinking** - Tư duy phản biện\n8. **Emotional intelligence** - Thông minh cảm xúc\n9. **Creativity** - Sáng tạo\n10. **Digital literacy** - Am hiểu công nghệ\n\n💪 **Cách phát triển:**\n• Join clubs & organizations\n• Volunteer work\n• Online courses (Coursera, Udemy)\n• Practice public speaking (Toastmasters)'
        ]
      },

      // Specific major comparisons
      'major_comparison': {
        patterns: [
          'so sánh ngành', 'khác nhau', 'giống nhau', 'nên chọn ngành nào',
          'it vs design', 'marketing vs business', 'which is better'
        ],
        responses: [
          '⚖️ **So sánh ngành học chi tiết!**\n\n💻 **IT vs Design:**\n• **IT**: Logic, problem-solving, high salary (15-50tr)\n• **Design**: Creativity, aesthetics, moderate salary (8-30tr)\n• **Hybrid**: UI/UX Design - Best of both worlds!\n\n📊 **Marketing vs Business:**\n• **Marketing**: Creative campaigns, brand building\n• **Business**: Strategy, operations, management\n• **Overlap**: Both need analytical & creative thinking\n\n🎯 **Cách chọn đúng:**\n1. **Passion test**: Ngành nào bạn có thể làm free?\n2. **Skill assessment**: Strengths tự nhiên?\n3. **Market research**: Job opportunities?\n4. **Lifestyle fit**: Work-life balance mong muốn?'
        ]
      },

      // Remote work and digital nomad
      'remote_work': {
        patterns: [
          'làm remote', 'work from home', 'làm từ xa', 'digital nomad',
          'freelance', 'làm online', 'không cần đến công ty'
        ],
        responses: [
          '🌍 **Remote Work - Tương lai của công việc!**\n\n📈 **Thống kê remote work:**\n• 42% workforce sẽ làm remote by 2025\n• Remote workers earn 22% more on average\n• 95% recommend remote work to others\n\n💻 **Ngành phù hợp remote:**\n• **Tech**: Developer, Designer, Data Analyst\n• **Marketing**: Content, Social Media, SEO\n• **Business**: Consultant, Project Manager\n• **Creative**: Writer, Video Editor, Translator\n\n🛠️ **Skills cần thiết:**\n• Self-discipline & time management\n• Digital communication tools\n• Problem-solving independently\n• Strong internet & tech setup\n\n🎯 **Platform tìm remote jobs:** Upwork, Freelancer, Remote.co, We Work Remotely'
        ]
      },

      // Certification and continuous learning
      'certifications': {
        patterns: [
          'chứng chỉ', 'certificate', 'certification', 'học thêm', 'nâng cao',
          'google certificate', 'microsoft', 'aws', 'adobe'
        ],
        responses: [
          '🏆 **Chứng chỉ - Boost career của bạn!**\n\n🔥 **Hot certifications 2024:**\n\n**Tech:**\n• Google Cloud Professional\n• AWS Solutions Architect\n• Microsoft Azure Fundamentals\n• Cisco CCNA\n\n**Marketing:**\n• Google Ads Certified\n• Facebook Blueprint\n• HubSpot Content Marketing\n• Google Analytics IQ\n\n**Design:**\n• Adobe Certified Expert (ACE)\n• UX Design Certificate (Google)\n• Figma Professional\n\n💡 **Benefits:**\n• Salary increase 15-25%\n• Better job opportunities\n• Industry recognition\n• Stay updated with trends\n\n⏰ **Timeline**: Most certs take 2-6 months to complete'
        ]
      },

      // Work-life balance concerns
      'work_life_balance': {
        patterns: [
          'cân bằng cuộc sống', 'work life balance', 'áp lực công việc', 'burnout',
          'nghỉ ngơi', 'gia đình và công việc', 'stress'
        ],
        responses: [
          '⚖️ **Work-Life Balance - Chìa khóa hạnh phúc!**\n\n🎯 **Ngành có work-life balance tốt:**\n• **Government jobs** - Stable hours\n• **Education** - Summer breaks\n• **Tech (some)** - Flexible schedules\n• **Non-profit** - Mission-driven\n\n⚠️ **Ngành có áp lực cao:**\n• Investment banking\n• Medical (doctor)\n• Law (lawyer)\n• Startup early stages\n\n💡 **Tips duy trì balance:**\n• Set clear boundaries\n• Learn to say "no"\n• Prioritize health & relationships\n• Take regular breaks\n• Find work you\'re passionate about\n\n🌟 **Remember**: Success without fulfillment is the ultimate failure!'
        ]
      },

      // Gender-specific career advice
      'gender_careers': {
        patterns: [
          'phụ nữ trong tech', 'nam giới làm design', 'gender stereotype',
          'nghề của con trai', 'nghề của con gái', 'phân biệt giới tính'
        ],
        responses: [
          '👫 **Career không có giới tính!**\n\n💪 **Women in Tech rising:**\n• 28% of tech workforce (growing)\n• Female-led startups get 2.5x higher revenue\n• Top female tech leaders: Susan Wojcicki, Ginni Rometty\n\n🎨 **Men in Creative fields:**\n• 40% of designers are male\n• Many successful male influencers, stylists\n• Creativity has no gender boundaries\n\n🌟 **Breaking stereotypes:**\n• Follow your passion, not society expectations\n• Skills matter more than gender\n• Diverse teams perform 35% better\n• Your talent defines you, not your gender\n\n💡 **Success stories everywhere:** Prove that any career is possible for anyone!'
        ]
      },

      // Entrepreneurship and starting business
      'entrepreneurship': {
        patterns: [
          'khởi nghiệp', 'startup', 'kinh doanh riêng', 'làm boss', 'tự làm chủ',
          'mở công ty', 'entrepreneur', 'business owner'
        ],
        responses: [
          '🚀 **Entrepreneurship - Con đường tự do!**\n\n📊 **Startup statistics:**\n• 90% startups fail, but 10% become unicorns\n• Average age of successful entrepreneur: 45\n• 72% of entrepreneurs are motivated by independence\n\n💡 **Business ideas for students:**\n• **Tech**: App development, SaaS tools\n• **Service**: Tutoring, content creation\n• **E-commerce**: Dropshipping, handmade products\n• **Consulting**: Social media, design services\n\n🛠️ **Essential skills:**\n• Sales & marketing\n• Financial management\n• Leadership & team building\n• Problem-solving & resilience\n\n🎯 **First steps:**\n1. Validate your idea (talk to customers)\n2. Build MVP (minimum viable product)\n3. Get feedback & iterate\n4. Scale gradually'
        ]
      },

      // Mental health and stress management
      'mental_health': {
        patterns: [
          'stress', 'lo lắng', 'anxiety', 'depression', 'tâm lý', 'áp lực',
          'burnout', 'mệt mỏi', 'không vui', 'buồn', 'suy sụp'
        ],
        responses: [
          '🧠 **Sức khỏe tâm thần là ưu tiên số 1!**\n\n⚠️ **Dấu hiệu cần chú ý:**\n• Mất ngủ thường xuyên\n• Cảm thấy vô vọng, tuyệt vọng\n• Mất hứng thú với mọi thứ\n• Khó tập trung học tập\n\n🌟 **Cách quản lý stress:**\n• **Exercise**: 30 phút/ngày\n• **Meditation**: Apps như Headspace, Calm\n• **Social support**: Nói chuyện với bạn bè, gia đình\n• **Professional help**: Tâm lý học, tư vấn viên\n\n📞 **Hotline hỗ trợ:**\n• Tâm lý trẻ em: 111\n• Đường dây nóng tâm lý: 1900 6149\n\n💡 **Remember**: Seeking help is a sign of strength, not weakness!'
        ]
      },

      // Parental expectations vs personal dreams
      'parental_expectations': {
        patterns: [
          'bố mẹ muốn', 'gia đình ép', 'theo ý bố mẹ', 'mơ ước khác',
          'không theo ý gia đình', 'đam mê khác', 'conflict với gia đình'
        ],
        responses: [
          '👨‍👩‍👧‍👦 **Cân bằng giữa gia đình và ước mơ!**\n\n💝 **Hiểu góc nhìn bố mẹ:**\n• Lo lắng về tương lai con\n• Muốn sự ổn định, an toàn\n• Kinh nghiệm từ thế hệ trước\n• Yêu thương và quan tâm\n\n🎯 **Chiến lược thuyết phục:**\n1. **Research thoroughly**: Chuẩn bị data về ngành mình chọn\n2. **Show passion**: Prove bạn serious về choice này\n3. **Compromise**: Đề xuất "thử nghiệm" trong thời gian nhất định\n4. **Success examples**: Tìm role models thành công\n\n💡 **Pro tip**: Invite bố mẹ tham gia journey của bạn, đừng đối đầu!\n\n🌟 **Remember**: Cuối cùng, đây là cuộc đời của bạn!'
        ]
      },

      // Study abroad and international education
      'study_abroad': {
        patterns: [
          'du học', 'study abroad', 'học ở nước ngoài', 'singapore', 'australia',
          'canada', 'mỹ', 'anh', 'visa', 'scholarship'
        ],
        responses: [
          '🌍 **Du học - Mở rộng tầm nhìn!**\n\n🔥 **Top destinations cho IT/Business:**\n• **Canada**: Friendly immigration, quality education\n• **Australia**: Work opportunities, lifestyle\n• **Singapore**: Asian hub, English-speaking\n• **Germany**: Free tuition, strong economy\n• **Netherlands**: English programs, innovation\n\n💰 **Chi phí ước tính (1 năm):**\n• Canada: $15,000-25,000 CAD\n• Australia: $20,000-35,000 AUD\n• Singapore: $15,000-30,000 SGD\n• Germany: €500-1,500 (public unis)\n\n🏆 **Scholarships:**\n• Government scholarships\n• University merit awards\n• Private foundation grants\n\n📝 **Preparation timeline:** Start 1-2 years ahead!'
        ]
      },

      // Part-time jobs and earning money while studying
      'part_time_work': {
        patterns: [
          'làm thêm', 'part-time', 'kiếm tiền', 'việc làm thêm', 'thu nhập',
          'làm online', 'freelance', 'kiếm tiền học phí'
        ],
        responses: [
          '💼 **Làm thêm thông minh khi học!**\n\n💻 **Online jobs for students:**\n• **Tutoring**: $5-15/hour (Preply, iTalki)\n• **Content writing**: $0.05-0.20/word\n• **Social media**: $200-500/month per client\n• **Data entry**: $3-8/hour\n• **Virtual assistant**: $5-12/hour\n\n🏪 **Offline opportunities:**\n• Coffee shop barista\n• Restaurant server\n• Retail assistant\n• Event staff\n• Delivery driver\n\n⚖️ **Balance tips:**\n• Max 15-20 hours/week during school\n• Choose flexible schedule jobs\n• Prioritize studies first\n• Build skills relevant to your major\n\n💡 **Long-term thinking**: Skills > immediate money!'
        ]
      },

      // Technology and digital skills
      'digital_skills': {
        patterns: [
          'kỹ năng công nghệ', 'digital skills', 'máy tính', 'internet',
          'social media', 'excel', 'powerpoint', 'word'
        ],
        responses: [
          '💻 **Digital Skills - Must-have 2024!**\n\n🔝 **Essential for everyone:**\n• **Microsoft Office**: Word, Excel, PowerPoint\n• **Google Workspace**: Docs, Sheets, Slides\n• **Communication**: Slack, Teams, Zoom\n• **Project management**: Trello, Asana, Notion\n\n🎯 **By career path:**\n**Marketing**: Canva, Google Analytics, Facebook Ads\n**Business**: CRM systems, Data analysis, Presentation\n**IT**: Programming languages, GitHub, Cloud platforms\n**Design**: Adobe Creative Suite, Figma, Sketch\n\n📚 **Free learning resources:**\n• YouTube tutorials\n• Coursera/edX free courses\n• Google Digital Garage\n• Microsoft Learn\n\n⏰ **Timeline**: Basic proficiency in 2-4 weeks!'
        ]
      },

      // Networking and professional relationships
      'networking': {
        patterns: [
          'networking', 'kết nối', 'mối quan hệ', 'professional network',
          'linkedin', 'gặp gỡ', 'mentor', 'connections'
        ],
        responses: [
          '🤝 **Networking - Your career superpower!**\n\n📊 **Power of networking:**\n• 85% of jobs are filled through networking\n• 70% of senior executives credit networking for career success\n• Average person knows 600 people\n\n🌟 **How to network effectively:**\n• **Give first**: Help others before asking\n• **Be genuine**: Authentic relationships last\n• **Follow up**: Stay in touch regularly\n• **Add value**: Share useful information\n\n📱 **Platforms to use:**\n• **LinkedIn**: Professional networking\n• **Facebook groups**: Industry communities\n• **Discord/Slack**: Tech communities\n• **Meetup**: Local events\n\n💡 **For introverts**: Start online, then move to small events!'
        ]
      },

      // Interview preparation and job search
      'interview_prep': {
        patterns: [
          'phỏng vấn', 'interview', 'tìm việc', 'job search', 'cv', 'resume',
          'chuẩn bị phỏng vấn', 'câu hỏi phỏng vấn'
        ],
        responses: [
          '🎯 **Ace your interviews!**\n\n📋 **Common interview questions:**\n• "Tell me about yourself"\n• "Why do you want this job?"\n• "What are your strengths/weaknesses?"\n• "Where do you see yourself in 5 years?"\n• "Why should we hire you?"\n\n🎭 **STAR method for behavioral questions:**\n• **Situation**: Set the context\n• **Task**: Describe what needed to be done\n• **Action**: Explain what you did\n• **Result**: Share the outcome\n\n💼 **CV tips:**\n• Tailor for each job\n• Use action verbs\n• Quantify achievements\n• Keep it 1-2 pages\n• Professional email address\n\n🎪 **Mock interviews**: Practice with friends, record yourself!'
        ]
      },

      // Creative industries and artistic careers
      'creative_careers': {
        patterns: [
          'nghệ thuật', 'sáng tạo', 'creative', 'artist', 'designer', 'musician',
          'writer', 'photographer', 'filmmaker', 'content creator'
        ],
        responses: [
          '🎨 **Creative Careers - Follow your artistic soul!**\n\n🌟 **Booming creative fields:**\n• **Content Creation**: YouTube, TikTok, Instagram\n• **UX/UI Design**: Digital experiences\n• **Game Design**: Entertainment industry\n• **Digital Marketing**: Creative campaigns\n• **Film/Video**: Streaming platforms boom\n\n💰 **Monetization strategies:**\n• **Portfolio building**: Showcase best work\n• **Multiple income streams**: Don\'t rely on one source\n• **Personal branding**: Build your unique style\n• **Client relationships**: Repeat business\n\n🛠️ **Essential tools:**\n• Adobe Creative Cloud\n• Figma/Sketch for design\n• Canva for quick graphics\n• Social media scheduling tools\n\n💡 **Success tip**: Creativity + Business skills = Unstoppable!'
        ]
      },

      // STEM fields and technical careers
      'stem_careers': {
        patterns: [
          'stem', 'khoa học', 'kỹ thuật', 'công nghệ', 'toán học', 'vật lý',
          'hóa học', 'sinh học', 'engineering', 'scientist'
        ],
        responses: [
          '🔬 **STEM - Shaping the future!**\n\n🚀 **Hot STEM careers 2024:**\n• **Data Scientist**: $95,000-130,000/year\n• **AI Engineer**: $100,000-150,000/year\n• **Cybersecurity**: $80,000-120,000/year\n• **Biotech**: $70,000-110,000/year\n• **Renewable Energy**: $60,000-100,000/year\n\n🧠 **Skills employers want:**\n• Problem-solving & analytical thinking\n• Programming (Python, R, SQL)\n• Statistics & data analysis\n• Research methodology\n• Technical communication\n\n🎓 **Education paths:**\n• Traditional 4-year degree\n• Coding bootcamps (3-6 months)\n• Online certifications\n• Self-taught + portfolio\n\n💡 **Women in STEM**: Breaking barriers, endless opportunities!'
        ]
      },

      // Social impact and non-profit careers
      'social_impact': {
        patterns: [
          'tác động xã hội', 'non-profit', 'từ thiện', 'giúp đỡ', 'community',
          'social work', 'volunteer', 'changing the world'
        ],
        responses: [
          '🌍 **Social Impact - Change the world!**\n\n❤️ **Meaningful career paths:**\n• **Non-profit management**: Leading social organizations\n• **Social entrepreneurship**: Business for good\n• **Community development**: Local impact\n• **International aid**: Global humanitarian work\n• **Environmental conservation**: Save the planet\n\n💰 **Financial reality:**\n• Lower salaries but high job satisfaction\n• Grant funding opportunities\n• Corporate social responsibility roles pay well\n• Social enterprises can be profitable\n\n🌟 **Skills needed:**\n• Empathy & emotional intelligence\n• Project management\n• Fundraising & grant writing\n• Communication & advocacy\n• Cultural sensitivity\n\n💡 **Start now**: Volunteer, intern, join causes you care about!'
        ]
      },

      // Graphic Design specific
      'graphic_design': {
        patterns: [
          'thiết kế đồ họa', 'graphic design', 'graphic designer', 'đồ họa',
          'logo design', 'poster design', 'branding', 'visual identity'
        ],
        responses: [
          '🎨 **Graphic Design Career - Nghề thiết kế đồ họa!**\n\n✨ **Lĩnh vực chuyên môn:**\n• **Logo & Branding**: Thiết kế nhận diện thương hiệu\n• **Print Design**: Poster, brochure, catalog\n• **Packaging Design**: Bao bì sản phẩm\n• **Web Graphics**: Banner, infographic\n• **Social Media Graphics**: Content cho mạng xã hội\n\n💰 **Mức thu nhập:**\n• **Fresher**: 6-12 triệu\n• **Junior**: 8-15 triệu\n• **Senior**: 15-25 triệu\n• **Art Director**: 20-40 triệu\n\n🛠️ **Tools cần thiết:**\n• Adobe Photoshop, Illustrator\n• InDesign, After Effects\n• Figma, Canva\n\n💡 **Lời khuyên**: Xây dựng portfolio mạnh và theo kịp trend design!'
        ]
      },

      // Specific suggested questions from ChatPage
      'it_curriculum': {
        patterns: [
          'ngành công nghệ thông tin học những gì', 'it học gì', 'học ngành it',
          'chương trình học it', 'môn học công nghệ thông tin'
        ],
        responses: [
          '💻 **Ngành Công nghệ thông tin - Chương trình học toàn diện!**\n\n📚 **Kiến thức cốt lõi:**\n• **Lập trình**: Java, Python, C#, JavaScript\n• **Cơ sở dữ liệu**: MySQL, PostgreSQL, MongoDB\n• **Phát triển Web**: HTML/CSS, React, Node.js\n• **Mobile App**: Android, iOS, Flutter\n• **Mạng máy tính**: TCP/IP, Security, Cloud\n• **AI/ML cơ bản**: Machine Learning, Data Science\n\n🎯 **Kỹ năng thực hành:**\n• Xây dựng website hoàn chỉnh\n• Phát triển mobile app\n• Quản trị hệ thống\n• DevOps và Cloud Computing\n\n⏰ **Thời gian đào tạo:** 2.5-3 năm\n💡 **Đặc biệt:** 70% thời gian thực hành, 30% lý thuyết!'
        ]
      },

      'design_job_opportunities': {
        patterns: [
          'cơ hội việc làm sau khi tốt nghiệp ngành thiết kế đồ họa',
          'việc làm thiết kế đồ họa', 'ra trường thiết kế làm gì'
        ],
        responses: [
          '🎨 **Cơ hội việc làm Thiết kế đồ họa - Rộng mở và đa dạng!**\n\n🏢 **Vị trí việc làm hot:**\n• **Graphic Designer**: Agency, in-house design team\n• **UI/UX Designer**: Tech companies, startups\n• **Brand Designer**: Marketing agencies\n• **Social Media Designer**: Digital marketing\n• **Freelance Designer**: Làm việc tự do\n\n💼 **Ngành tuyển dụng nhiều:**\n• Công ty quảng cáo & marketing\n• Công ty công nghệ (UI/UX)\n• Nhà xuất bản, báo chí\n• E-commerce & retail\n• Startup và SMEs\n\n📈 **Triển vọng nghề nghiệp:**\n• **Junior → Senior**: 2-3 năm\n• **Art Director**: 5-7 năm kinh nghiệm\n• **Creative Director**: 8+ năm\n\n🌟 **Tỷ lệ có việc làm:** 95% trong vòng 6 tháng!'
        ]
      },

      'fpt_admission': {
        patterns: [
          'điều kiện tuyển sinh fpt polytechnic như thế nào', 'điều kiện tuyển sinh fpt polytechnic',
          'tuyển sinh fpt poly', 'điều kiện vào fpt', 'xét tuyển fpt polytechnic',
          'điều kiện tuyển sinh fpt', 'fpt polytechnic tuyển sinh', 'như thế nào'
        ],
        responses: [
          '📚 **Điều kiện tuyển sinh FPT Polytechnic 2024!**\n\n🎯 **Phương thức xét tuyển:**\n• **Xét học bạ THPT**: Điểm trung bình 3 năm\n• **Xét điểm thi tốt nghiệp**: Tổ hợp A00, A01, D01\n• **Xét tuyển thẳng**: Học sinh giỏi, có chứng chỉ\n\n📊 **Điểm chuẩn tham khảo 2023:**\n• **Công nghệ thông tin**: 18-22 điểm\n• **Thiết kế đồ họa**: 16-20 điểm\n• **Marketing**: 15-19 điểm\n• **Quản trị kinh doanh**: 15-18 điểm\n\n📝 **Hồ sơ cần thiết:**\n• Bằng tốt nghiệp THPT (bản sao)\n• Học bạ THPT (bản sao)\n• Giấy khai sinh\n• 4 ảnh 3x4\n\n🎁 **Ưu đãi đặc biệt:** Học bổng 50-100% học phí!'
        ]
      },

      'marketing_vs_business': {
        patterns: [
          'so sánh ngành marketing và quản trị kinh doanh',
          'marketing vs business', 'khác biệt marketing và quản trị'
        ],
        responses: [
          '📊 **Marketing vs Quản trị Kinh doanh - So sánh chi tiết!**\n\n📈 **MARKETING:**\n• **Focus**: Quảng cáo, brand building, customer acquisition\n• **Skills**: Creativity, content creation, data analysis\n• **Jobs**: Marketing Executive, Digital Marketer, Brand Manager\n• **Salary**: 8-30 triệu (tùy kinh nghiệm)\n• **Tính cách phù hợp**: Sáng tạo, năng động, thích xu hướng\n\n💼 **QUẢN TRỊ KINH DOANH:**\n• **Focus**: Vận hành, quản lý, strategy, operations\n• **Skills**: Leadership, planning, financial management\n• **Jobs**: Business Analyst, Project Manager, Operations Manager\n• **Salary**: 10-35 triệu (tùy vị trí)\n• **Tính cách phù hợp**: Logic, có tầm nhìn, thích quản lý\n\n🎯 **Điểm chung:** Cả hai đều cần hiểu biết về thị trường và khách hàng\n\n💡 **Lời khuyên:** Marketing = Creative + Data, Business = Strategy + Management'
        ]
      },

      'math_suitable_majors': {
        patterns: [
          'ngành nào phù hợp với người thích toán học',
          'giỏi toán nên học ngành gì', 'toán học ứng dụng'
        ],
        responses: [
          '🧮 **Ngành học dành cho tín đồ Toán học!**\n\n🎯 **Top ngành "ăn toán" nhất:**\n• **Data Science & Analytics**: Thống kê, machine learning\n• **Fintech & Banking**: Phân tích tài chính, risk management\n• **Software Engineering**: Algorithms, problem solving\n• **Game Development**: Physics engine, 3D mathematics\n• **Cybersecurity**: Cryptography, security algorithms\n\n💻 **Tại FPT Polytechnic:**\n• **Công nghệ thông tin**: Algorithm design, data structures\n• **Thiết kế đồ họa**: Geometry, color theory, proportions\n\n📈 **Triển vọng nghề nghiệp:**\n• **Data Scientist**: 20-50 triệu\n• **Quantitative Analyst**: 25-60 triệu\n• **Software Engineer**: 15-45 triệu\n• **Game Developer**: 12-35 triệu\n\n💡 **Lời khuyên**: Kết hợp toán học với công nghệ = Combo vô địch!'
        ]
      }
    };
  }

  // Enhanced pattern matching with template system
  private getComprehensivePatterns(): {[key: string]: any} {
    return {
      // High priority suggested questions
      'fpt_admission_question': {
        patterns: ['điều kiện tuyển sinh fpt polytechnic như thế nào'],
        keywords: ['điều kiện', 'tuyển sinh', 'fpt', 'polytechnic', 'như thế nào'],
        exactPhrases: ['điều kiện tuyển sinh fpt polytechnic như thế nào'],
        priority: 10,
        responses: [
          '📚 **Điều kiện tuyển sinh FPT Polytechnic 2024!**\n\n🎯 **Phương thức xét tuyển:**\n• **Xét học bạ THPT**: Điểm trung bình 3 năm\n• **Xét điểm thi tốt nghiệp**: Tổ hợp A00, A01, D01\n• **Xét tuyển thẳng**: Học sinh giỏi, có chứng chỉ\n\n📊 **Điểm chuẩn tham khảo 2023:**\n• **Công nghệ thông tin**: 18-22 điểm\n• **Thiết kế đồ họa**: 16-20 điểm\n• **Marketing**: 15-19 điểm\n• **Quản trị kinh doanh**: 15-18 điểm\n\n📝 **Hồ sơ cần thiết:**\n• Bằng tốt nghiệp THPT (bản sao)\n• Học bạ THPT (bản sao)\n• Giấy khai sinh\n• 4 ảnh 3x4\n\n🎁 **Ưu đãi đặc biệt:** Học bổng 50-100% học phí!'
        ]
      },

      // Specific academic concerns with high priority
      'specific_concerns': {
        patterns: [
          {
            keywords: ['dốt toán', 'học dốt toán', 'kém toán', 'yếu toán', 'không giỏi toán', 'toán dở', 'công nghệ thông tin', 'it', 'lập trình'],
            weights: { 'dốt toán': 1.5, 'công nghệ thông tin': 1.3, 'it': 1.3, 'lập trình': 1.3 },
            responses: [
              `🤔 **Học dốt toán có thể học IT không?**

✅ **Tin tốt:** HOÀN TOÀN ĐƯỢC! Nhiều lập trình viên giỏi không xuất thân từ toán học.

📊 **Thực tế về toán trong IT:**
• 70% công việc IT chỉ cần toán cơ bản (cộng, trừ, nhân, chia)
• Logic tư duy quan trọng hơn tính toán phức tạp
• Có công cụ và thư viện hỗ trợ mọi phép tính

🎯 **Các lĩnh vực IT ít cần toán:**
• Frontend Development (HTML, CSS, JavaScript)
• Mobile App Development  
• UI/UX Design
• Software Testing

💡 **Lời khuyên:**
• Tập trung vào logic và tư duy thuật toán
• Học từ cơ bản, từ từ xây dựng nền tảng
• Thực hành nhiều hơn lý thuyết

🚀 Bạn có muốn tôi tư vấn lộ trình học IT phù hợp với người mới bắt đầu không?`,

              `💻 **Toán kém vẫn có thể thành công trong IT!**

🌟 **Câu chuyện thực tế:**
Nhiều CEO công nghệ nổi tiếng như Jack Dorsey (Twitter) không giỏi toán nhưng vẫn thành công!

🧠 **Kỹ năng quan trọng hơn toán:**
• Tư duy logic và giải quyết vấn đề
• Khả năng học hỏi và thích nghi
• Kiên nhẫn và tỉ mỉ trong code
• Giao tiếp và làm việc nhóm

🎨 **Lĩnh vực IT thân thiện với người kém toán:**
• Web Design & Frontend
• Mobile App UI/UX  
• Game Development (phần thiết kế)
• Digital Marketing & SEO

💪 **Bí quyết thành công:**
• Bắt đầu với HTML/CSS đơn giản
• Học JavaScript từ từ, step by step
• Tham gia cộng đồng lập trình viên
• Làm project thực tế thay vì học thuần lý thuyết

Bạn muốn bắt đầu từ đâu? Tôi có thể gợi ý roadmap chi tiết! 🗺️`
            ]
          },
          {
            keywords: ['không biết vẽ', 'không giỏi vẽ', 'vẽ dở', 'chưa biết vẽ', 'thiết kế', 'đồ họa', 'design'],
            weights: { 'không biết vẽ': 1.5, 'thiết kế': 1.3, 'đồ họa': 1.3 },
            responses: [
              `🎨 **Không biết vẽ có học được Thiết kế không?**

✅ **Tin tốt:** CÓ THỂ HỌC ĐƯỢC! Thiết kế hiện đại khác xa với vẽ tay truyền thống.

🖥️ **Thiết kế số hiện tại:**
• 90% làm việc trên máy tính (Photoshop, Illustrator)
• Có template và asset có sẵn
• AI hỗ trợ tạo ý tưởng và nội dung
• Tập trung vào ý tưởng hơn kỹ thuật vẽ

🎯 **Kỹ năng quan trọng hơn vẽ tay:**
• Tư duy sáng tạo và thẩm mỹ
• Hiểu tâm lý khách hàng
• Xu hướng màu sắc, font chữ
• Kỹ năng sử dụng phần mềm

💡 **Lời khuyên:**
• Bắt đầu học Photoshop cơ bản
• Tham khảo thiết kế trên Pinterest, Behance
• Thực hành làm poster, banner đơn giản

🚀 Quan trọng là CẢM THẨM MỸ, không phải tay nghề vẽ! Bạn có thích màu sắc và bố cục đẹp không?`
            ]
          },
          {
            keywords: ['gia đình nghèo', 'không có tiền', 'kinh tế khó khăn', 'học phí cao', 'không đủ tiền', 'nghèo'],
            weights: { 'gia đình nghèo': 1.5, 'không có tiền': 1.4, 'kinh tế khó khăn': 1.4 },
            responses: [
              `💰 **Khó khăn kinh tế có thể học được không?**

✅ **Đừng lo lắng!** FPT Polytechnic có nhiều chính sách hỗ trợ:

🎓 **Học bổng:**
• Học bổng 100% cho học sinh giỏi
• Học bổng 50% cho hoàn cảnh khó khăn
• Học bổng tài năng đặc biệt

💳 **Hỗ trợ tài chính:**
• Trả góp học phí 0% lãi suất
• Vay vốn ưu đãi từ ngân hàng
• Làm part-time tại trường

🏢 **Cơ hội việc làm:**
• Thực tập có lương từ năm 2
• Job fair với mức lương hấp dẫn
• Cam kết việc làm sau tốt nghiệp

💡 **Lời khuyên:** Hãy đăng ký tư vấn để biết các chương trình hỗ trợ cụ thể!

Bạn muốn biết thêm về học bổng nào?`
            ]
          }
        ]
      },

      // Major-specific information
      'major_information': {
        patterns: [
          {
            keywords: ['công nghệ thông tin', 'it', 'lập trình', 'phần mềm', 'developer', 'coder'],
            weights: { 'công nghệ thông tin': 1.3, 'it': 1.3, 'lập trình': 1.2 },
            responses: [
              `🖥️ **Ngành Công nghệ thông tin - Lựa chọn hot nhất hiện nay!**

📚 **Chương trình học:**
• Lập trình Java, Python, C#, JavaScript
• Phát triển Web & Mobile App  
• Database & Cloud Computing
• AI & Machine Learning cơ bản
• DevOps và System Administration

💼 **Cơ hội nghề nghiệp:**
• Fullstack Developer (15-30 triệu)
• Mobile App Developer (12-25 triệu)
• DevOps Engineer (20-40 triệu)
• Data Analyst (15-35 triệu)
• AI Engineer (25-50 triệu)

🔥 **Tại sao chọn IT tại FPT:**
• Đối tác với Google, Microsoft, Amazon
• Thực tập tại các công ty Top
• Tỷ lệ có việc làm 98%
• Mức lương khởi điểm cao nhất

🎯 Bạn có muốn biết thêm về lộ trình học cụ thể không?`,

              `💻 **IT tại FPT Polytechnic - Nơi ươm mầm lập trình viên!**

🌟 **Điểm mạnh chương trình:**
• 70% thực hành, 30% lý thuyết
• Giảng viên từ các công ty lớn
• Lab hiện đại với công nghệ mới nhất
• Project thực tế với doanh nghiệp

🛠️ **Công nghệ được học:**
• Frontend: ReactJS, VueJS, Angular
• Backend: NodeJS, .NET, Java Spring
• Mobile: Flutter, React Native
• Cloud: AWS, Azure, Google Cloud

📈 **Xu hướng nghề nghiệp:**
• Remote work phổ biến (80% công ty)
• Freelance thu nhập cao
• Startup opportunities
• Cơ hội làm việc quốc tế

Bạn đã có kiến thức lập trình nào chưa? Tôi có thể tư vấn lộ trình phù hợp!`
            ]
          },
          {
            keywords: ['thiết kế đồ họa', 'thiết kế', 'đồ họa', 'design', 'graphic', 'ui/ux', 'designer'],
            weights: { 'thiết kế đồ họa': 1.4, 'thiết kế': 1.2, 'design': 1.2 },
            responses: [
              `🎨 **Ngành Thiết kế đồ họa - Sáng tạo không giới hạn!**

✨ **Chương trình học:**
• Graphic Design & Branding
• UI/UX Design cho Web & Mobile
• Motion Graphics & Video
• 3D Modeling & Visualization
• Photography & Digital Art

💰 **Cơ hội nghề nghiệp:**
• Graphic Designer (8-18 triệu)
• UI/UX Designer (12-30 triệu)
• Motion Designer (15-35 triệu)
• Art Director (20-50 triệu)
• Creative Director (30-80 triệu)

🛠️ **Phần mềm được học:**
• Adobe Creative Suite (Photoshop, Illustrator, After Effects)
• Figma, Adobe XD (UI/UX)
• Cinema 4D, Blender (3D)
• Sketch, Principle (Prototyping)

🌟 **Đặc biệt tại FPT:**
• Studio thiết kế chuyên nghiệp
• Collaboration với các brand lớn
• Competition và awards quốc tế
• Internship tại agency hàng đầu

Bạn thích thiết kế lĩnh vực nào nhất? Logo, website, hay app mobile?`,

              `🎭 **Thiết kế đồ họa - Nghệ thuật meets Technology!**

🎯 **Lĩnh vực hot hiện nay:**
• UI/UX Design (nhu cầu cao nhất)
• Social Media Design
• E-commerce Visual
• Game Art & Animation
• AR/VR Design

📱 **Trend 2024:**
• Minimalism & Clean Design
• Dark Mode Interfaces
• 3D Elements in UI
• Micro-interactions
• AI-assisted Design

💡 **Kỹ năng cần có:**
• Cảm thẩm mỹ và color theory
• Typography và layout
• User psychology
• Brand thinking
• Technical skills với design tools

🚀 **Career path:**
Junior Designer → Senior Designer → Art Director → Creative Director

Bạn muốn focus vào design cho web, mobile, hay print media?`
            ]
          },
          {
            keywords: ['marketing', 'quản trị kinh doanh', 'kinh doanh', 'business', 'bán hàng', 'sales'],
            weights: { 'marketing': 1.3, 'quản trị kinh doanh': 1.4, 'kinh doanh': 1.2 },
            responses: [
              `📈 **Marketing & Quản trị kinh doanh - Dẫn đầu thị trường!**

🎯 **Chương trình Marketing:**
• Digital Marketing & Social Media
• Content Marketing & SEO
• E-commerce & Online Business
• Brand Management
• Marketing Analytics

💼 **Chương trình Quản trị kinh doanh:**
• Business Strategy & Planning
• Project Management
• Human Resource Management
• Financial Management
• International Business

💰 **Cơ hội nghề nghiệp:**
• Digital Marketer (8-20 triệu)
• Business Analyst (12-25 triệu)
• Project Manager (15-35 triệu)
• Marketing Manager (18-40 triệu)
• Business Development (20-50 triệu)

🔥 **Xu hướng hot:**
• Influencer Marketing
• TikTok & Social Commerce
• AI in Marketing
• Sustainable Business
• Remote Team Management

Bạn muốn focus vào marketing sáng tạo hay quản lý chiến lược?`
            ]
          }
        ]
      },

      // Career guidance and comparison
      'career_guidance': {
        patterns: [
          {
            keywords: ['so sánh', 'khác nhau', 'giống nhau', 'lựa chọn', 'nên chọn', 'ngành nào'],
            responses: [
              `🤔 **So sánh các ngành học tại FPT Polytechnic:**

**💻 Công nghệ thông tin:**
• Ưu điểm: Lương cao, remote work, cơ hội quốc tế
• Phù hợp: Người thích logic, giải quyết vấn đề
• Thu nhập: 12-50+ triệu

**🎨 Thiết kế đồ họa:**
• Ưu điểm: Sáng tạo, flexible, freelance dễ
• Phù hợp: Người có thẩm mỹ, yêu nghệ thuật  
• Thu nhập: 8-40+ triệu

**📈 Marketing/Kinh doanh:**
• Ưu điểm: Networking, leadership, đa dạng cơ hội
• Phù hợp: Người giỏi giao tiếp, năng động
• Thu nhập: 8-50+ triệu

**🔧 Kỹ thuật (Điện tử, Cơ khí):**
• Ưu điểm: Ổn định, thực tế, cần thiết
• Phù hợp: Người thích làm việc với tay
• Thu nhập: 8-30+ triệu

Bạn muốn biết chi tiết về ngành nào?`
            ]
          },
          {
            keywords: ['lương', 'thu nhập', 'mức lương', 'kiếm được bao nhiều', 'tiền'],
            responses: [
              `💰 **Mức lương các ngành tại FPT Polytechnic (2024):**

**🥇 Top lương cao:**
• AI/Machine Learning: 25-80 triệu
• DevOps Engineer: 20-60 triệu
• Senior Developer: 25-50 triệu
• Creative Director: 30-80 triệu

**💼 Mức lương trung bình:**
• IT Freshers: 8-15 triệu
• Designer: 8-25 triệu
• Marketing: 8-20 triệu
• Business Analyst: 12-30 triệu

**📈 Yếu tố ảnh hưởng lương:**
• Kỹ năng chuyên môn (quan trọng nhất)
• Kinh nghiệm thực tế
• Công ty (startup vs corporate)
• Vị trí địa lý (HCM > HN > tỉnh)
• Ngoại ngữ và soft skills

**💡 Tips tăng lương:**
• Build portfolio mạnh
• Học công nghệ mới
• Networking và personal branding
• Tham gia open source projects

Bạn quan tâm mức lương ngành nào cụ thể?`
            ]
          }
        ]
      },

      // Academic and admission questions
      'academic_support': {
        patterns: [
          {
            keywords: ['điều kiện tuyển sinh', 'tuyển sinh', 'đăng ký', 'xét tuyển', 'hồ sơ'],
            responses: [
              `📋 **Điều kiện tuyển sinh FPT Polytechnic 2024:**

**📚 Yêu cầu cơ bản:**
• Tốt nghiệp THPT hoặc tương đương
• Không yêu cầu điểm chuẩn
• Xét tuyển theo hồ sơ + phỏng vấn

**📝 Hồ sơ cần có:**
• Bằng tốt nghiệp THPT (bản chính)
• Học bạ THPT (bản chính)
• CMND/CCCD (photo)
• 4 ảnh 3x4
• Giấy khám sức khỏe

**🎯 Phương thức xét tuyển:**
• Xét học bạ THPT (70%)
• Phỏng vấn định hướng (30%)
• Ưu tiên thí sinh có chứng chỉ IT, Design

**📅 Lịch tuyển sinh:**
• Đợt 1: Tháng 3-5
• Đợt 2: Tháng 6-8  
• Đợt 3: Tháng 8-9

**💰 Học phí 2024:**
• 25-30 triệu/năm (tùy ngành)
• Có thể trả góp 0% lãi suất

Bạn muốn đăng ký ngành nào? Tôi có thể hướng dẫn chi tiết!`
            ]
          },
          {
            keywords: ['học bổng', 'hỗ trợ tài chính', 'miễn giảm', 'học phí'],
            responses: [
              `🎓 **Chương trình học bổng FPT Polytechnic:**

**🏆 Học bổng xuất sắc:**
• 100% học phí: GPA ≥ 3.6 + hoạt động xuất sắc
• 50% học phí: GPA ≥ 3.2 + tích cực tham gia
• 25% học phí: GPA ≥ 2.8 + có thành tích

**💪 Học bổng hoàn cảnh:**
• 50-100% học phí cho gia đình khó khăn
• Cần giấy xác nhận hoàn cảnh từ địa phương
• Kết hợp với học bổng học tập

**🌟 Học bổng tài năng:**
• Có chứng chỉ IT quốc tế: 30% học phí
• Giải thưởng thiết kế: 25% học phí
• Olympic tin học: 50% học phí

**💳 Hỗ trợ khác:**
• Vay vốn sinh viên 0% lãi suất
• Part-time job tại trường
• Thực tập có lương từ năm 2

**📞 Liên hệ tư vấn:**
• Hotline: 1900-6969
• Website: fpt.edu.vn
• Fanpage: FPT Polytechnic

Bạn thuộc trường hợp nào? Tôi có thể tư vấn cụ thể!`
            ]
          }
        ]
      },

      // General questions and encouragement
      'general_questions': {
        patterns: [
          {
            keywords: ['có nên', 'có nên học', 'có tốt không', 'có được không', 'có khó không'],
            responses: [
              `🤔 **Đánh giá và lời khuyên:**

**✅ Nên học tại FPT Polytechnic nếu bạn:**
• Thích học thực hành hơn lý thuyết
• Muốn có việc làm ngay sau tốt nghiệp
• Quan tâm đến công nghệ và xu hướng mới
• Thích môi trường năng động, sáng tạo

**⚠️ Cần cân nhắc nếu bạn:**
• Thích học thuần lý thuyết
• Muốn làm nghiên cứu khoa học
• Không thích làm việc nhóm
• Không theo kịp công nghệ mới

**💡 Lời khuyên:**
• Tham quan trường để cảm nhận môi trường
• Nói chuyện với sinh viên đang học
• Tham gia các workshop/event của trường
• Xem portfolio sinh viên tốt nghiệp

**🎯 Điều quan trọng nhất:**
Passion và determination quan trọng hơn background!

Bạn có câu hỏi cụ thể nào về ngành học không?`
            ]
          },
          {
            keywords: ['tương lai', 'xu hướng', 'triển vọng', 'phát triển', 'cơ hội'],
            responses: [
              `🚀 **Xu hướng và triển vọng nghề nghiệp tương lai:**

**🔥 Top xu hướng 2024-2030:**
• AI & Machine Learning (tăng trưởng 500%)
• Cybersecurity (thiếu hụt 3.5 triệu người)
• Cloud Computing (tăng 15%/năm)
• UI/UX Design (nhu cầu tăng 300%)
• Digital Marketing (chuyển đổi số)

**🌍 Cơ hội quốc tế:**
• Remote work cho công ty nước ngoài
• Outsourcing projects từ US, EU
• Startup ecosystem phát triển mạnh
• Visa công nghệ dễ dàng hơn

**💰 Mức lương dự kiến:**
• 2025: Tăng 20-30% so với hiện tại
• Senior roles: 50-100 triệu/tháng
• Leadership positions: 100-200 triệu/tháng

**📈 Lĩnh vực tăng trưởng:**
• Healthcare Technology
• Fintech & Blockchain
• Green Technology
• EdTech & E-learning

Bạn muốn định hướng theo xu hướng nào?`
            ]
          }
        ]
      },

      // Greetings and basic interactions
      'greetings': {
        patterns: [
          {
            keywords: ['xin chào', 'chào', 'hello', 'hi', 'alo', 'alô', 'hey', 'good morning', 'good afternoon', 'good evening'],
            responses: [
              `Chào bạn! 👋 Tôi là AI tư vấn tuyển sinh FPT Polytechnic. 

🎓 **Tôi có thể giúp bạn:**
• Tìm hiểu các ngành học hot
• So sánh cơ hội nghề nghiệp  
• Tư vấn lộ trình học tập
• Thông tin tuyển sinh & học bổng
• Giải đáp mọi thắc mắc về FPT

💡 **Gợi ý câu hỏi:**
• "Ngành IT học những gì?"
• "Mức lương thiết kế đồ họa?"
• "Điều kiện tuyển sinh như thế nào?"
• "Tôi dốt toán có học được IT không?"

Bạn quan tâm ngành học nào vậy? 🤔`,

              `Xin chào! 🎉 Rất vui được hỗ trợ bạn tìm hiểu về FPT Polytechnic!

🌟 **FPT Polytechnic - Top 1 về:**
• Tỷ lệ có việc làm (98%)
• Mức lương khởi điểm cao
• Đối tác doanh nghiệp (500+ công ty)
• Cơ sở vật chất hiện đại

🎯 **Các ngành đào tạo:**
• 💻 Công nghệ thông tin
• 🎨 Thiết kế đồ họa  
• 📈 Marketing & Kinh doanh
• ⚙️ Kỹ thuật & Công nghệ

Hãy cho tôi biết bạn muốn tìm hiểu về điều gì nhé! ✨`,

              `Hi bạn! 🚀 Chào mừng đến với AI tư vấn FPT Polytechnic!

📊 **Thống kê ấn tượng:**
• 98% sinh viên có việc làm sau tốt nghiệp
• Mức lương trung bình 12-15 triệu (fresher)
• 500+ doanh nghiệp đối tác
• 95% sinh viên hài lòng với chương trình học

🎪 **Đặc biệt tại FPT:**
• Học thực hành 70%, lý thuyết 30%
• Project thực tế với doanh nghiệp
• Thực tập có lương từ năm 2
• Cơ hội làm việc quốc tế

Bạn đang băn khoăn về vấn đề gì? Tôi sẵn sàng tư vấn! 💪`
            ]
          }
        ]
      }
    };
  }
}
