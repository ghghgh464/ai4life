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
        confidenceScore: analysis.confidenceScore || 85,
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
      confidenceScore: 80,
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

  // Comprehensive pattern definitions
  private getComprehensivePatterns(): {[key: string]: any} {
    return {
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
