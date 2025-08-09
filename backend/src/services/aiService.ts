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
    
    // Check for math concerns with IT interest (more flexible patterns)
    const mathConcerns = ['dốt toán', 'học dốt toán', 'kém toán', 'yếu toán', 'không giỏi toán', 'toán kém', 'toán dở', 'toán không tốt', 'không khá toán'];
    const itInterests = ['công nghệ thông tin', 'it', 'lập trình', 'phần mềm', 'máy tính', 'developer', 'coder', 'programmer'];
    
    const hasMathConcern = mathConcerns.some(concern => msg.includes(concern));
    const hasItInterest = itInterests.some(interest => msg.includes(interest));
    
    if (hasMathConcern && hasItInterest) {
      return `🤔 **Học dốt toán có thể học IT không?**

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

🚀 Bạn có muốn tôi tư vấn lộ trình học IT phù hợp với người mới bắt đầu không?`;
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
}
