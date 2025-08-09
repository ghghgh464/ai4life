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
      const majors = await db.all(`
        SELECT id, name, code, description, career_prospects, required_skills, subjects
        FROM majors
      `);

      // Create AI prompt
      const prompt = this.createAnalysisPrompt(surveyData, majors);

      // Call OpenAI API
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Bạn là chuyên gia tư vấn giáo dục và nghề nghiệp tại FPT Polytechnic. Hãy phân tích thông tin học sinh và đưa ra lời khuyên chính xác, chi tiết bằng tiếng Việt."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const aiResponse = completion.choices[0]?.message?.content;
      
      if (!aiResponse) {
        throw new Error('No response from AI');
      }

      // Parse AI response and structure the result
      const analysisResult = this.parseAIResponse(aiResponse, majors);
      
      return {
        ...analysisResult,
        fullResponse: {
          prompt,
          response: aiResponse,
          model: "gpt-4",
          timestamp: new Date().toISOString()
        }
      };

    } catch (error: any) {
      console.error('❌ AI Analysis Error:', error);
      
      // Fallback to rule-based analysis if AI fails
      return this.fallbackAnalysis(surveyData);
    }
  }

  private createAnalysisPrompt(surveyData: SurveyData, majors: any[]): string {
    const majorsList = majors.map(m => 
      `- ${m.name} (${m.code}): ${m.description}`
    ).join('\n');

    return `
Phân tích thông tin học sinh và đưa ra gợi ý ngành học phù hợp tại FPT Polytechnic:

THÔNG TIN HỌC SINH:
- Tên: ${surveyData.name}
- Tuổi: ${surveyData.age}
- Lớp: ${surveyData.currentGrade}
- Sở thích: ${surveyData.interests.join(', ')}
- Kỹ năng: ${surveyData.skills.join(', ')}
- Điểm số các môn: ${JSON.stringify(surveyData.academicScores)}
- Mục tiêu nghề nghiệp: ${surveyData.careerGoals}
- Phong cách học: ${surveyData.learningStyle}
- Môi trường làm việc: ${surveyData.workEnvironmentPreference}

CÁC NGÀNH HỌC TẠI FPT POLYTECHNIC:
${majorsList}

YÊU CẦU PHÂN TÍCH:
1. Đánh giá độ phù hợp của từng ngành (điểm từ 0-100)
2. Chọn 3 ngành phù hợp nhất
3. Phân tích điểm mạnh của học sinh
4. Đưa ra khuyến nghị cụ thể

ĐỊNH DẠNG PHẢN HỒI (JSON):
{
  "recommendedMajors": [
    {
      "majorName": "Tên ngành",
      "majorCode": "Mã ngành", 
      "matchScore": 85,
      "reasons": ["Lý do 1", "Lý do 2", "Lý do 3"]
    }
  ],
  "analysisSummary": "Tóm tắt phân tích tổng quan",
  "strengths": ["Điểm mạnh 1", "Điểm mạnh 2"],
  "recommendations": ["Khuyến nghị 1", "Khuyến nghị 2"],
  "confidenceScore": 0.85
}

Hãy phân tích kỹ lưỡng và đưa ra phản hồi JSON chính xác.
    `;
  }

  private parseAIResponse(aiResponse: string, majors: any[]): Omit<AIAnalysisResult, 'fullResponse'> {
    try {
      // Extract JSON from AI response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Map major names to IDs
      const recommendedMajors = parsed.recommendedMajors.map((rec: any) => {
        const major = majors.find(m => 
          m.name === rec.majorName || m.code === rec.majorCode
        );
        
        return {
          majorId: major?.id || 0,
          majorName: rec.majorName,
          majorCode: rec.majorCode,
          matchScore: rec.matchScore,
          reasons: rec.reasons || []
        };
      });

      return {
        recommendedMajors,
        analysisSummary: parsed.analysisSummary || '',
        strengths: parsed.strengths || [],
        recommendations: parsed.recommendations || [],
        confidenceScore: parsed.confidenceScore || 0.7
      };

    } catch (error) {
      console.error('❌ Failed to parse AI response:', error);
      throw new Error('Failed to parse AI analysis');
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

    // Accounting Score
    let accScore = 45;
    if (surveyData.interests.includes('Kế toán')) accScore += 25;
    if (surveyData.skills.includes('Tính toán')) accScore += 15;
    if (surveyData.academicScores.math >= 7) accScore += 15;
    if (surveyData.careerGoals.toLowerCase().includes('kế toán')) accScore += 10;
    scores['ACC'] = Math.min(accScore, 90);

    // Business Score
    let businessScore = 65;
    if (surveyData.interests.includes('Quản trị kinh doanh')) businessScore += 20;
    if (surveyData.skills.includes('Lãnh đạo')) businessScore += 15;
    if (surveyData.skills.includes('Giao tiếp')) businessScore += 10;
    if (surveyData.careerGoals.toLowerCase().includes('quản lý')) businessScore += 10;
    scores['BA'] = Math.min(businessScore, 88);

    // Electronics Score
    let electronicsScore = 50;
    if (surveyData.interests.includes('Điện tử viễn thông')) electronicsScore += 25;
    if (surveyData.academicScores.physics >= 8) electronicsScore += 15;
    if (surveyData.academicScores.math >= 7) electronicsScore += 10;
    if (surveyData.skills.includes('Tư duy kỹ thuật')) electronicsScore += 15;
    scores['ET'] = Math.min(electronicsScore, 85);

    // Sort by score and take top 3
    const sortedMajors = Object.entries(scores)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);

    const majorNames = {
      'IT': 'Công nghệ thông tin',
      'GD': 'Thiết kế đồ họa', 
      'MKT': 'Marketing',
      'ACC': 'Kế toán',
      'BA': 'Quản trị kinh doanh',
      'ET': 'Điện tử viễn thông'
    };

    const majorIds = {
      'IT': 1, 'GD': 2, 'MKT': 3, 'ACC': 4, 'BA': 5, 'ET': 6
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
      recommendations: [
        'Tìm hiểu thêm về các ngành được gợi ý',
        'Tham gia các hoạt động thực tế để khám phá sở thích',
        'Trao đổi với giáo viên và gia đình về định hướng'
      ],
      confidenceScore: 0.6,
      fullResponse: {
        method: 'fallback-rule-based',
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

    // Check for age concerns
    if (msg.includes('tuổi lớn') || msg.includes('đã già') || msg.includes('quá tuổi') || msg.includes('30 tuổi') || msg.includes('40 tuổi')) {
      return `⏰ **Học ở tuổi lớn có muộn không?**

✅ **KHÔNG BAO GIỜ MUỘN!** Nhiều người thành công bắt đầu muộn:

📊 **Thống kê tích cực:**
• 25% sinh viên FPT Poly trên 25 tuổi
• Nhiều CEO công nghệ học lập trình sau 30
• Kinh nghiệm sống là lợi thế lớn

🎯 **Ưu điểm của người lớn tuổi:**
• Mục tiêu rõ ràng, quyết tâm cao
• Kinh nghiệm cuộc sống phong phú
• Kỹ năng giao tiếp và quản lý tốt
• Tài chính ổn định hơn

💼 **Cơ hội nghề nghiệp:**
• Nhiều công ty đánh giá cao độ trưởng thành
• Có thể làm mentor, team lead
• Khởi nghiệp với kinh nghiệm thực tế

🚀 **Lời khuyên:** Bắt đầu ngay hôm nay, 5 năm sau bạn sẽ cảm ơn quyết định này!

Bạn quan tâm ngành nào để bắt đầu?`;
    }

    // Check for gender concerns
    if ((msg.includes('con gái') || msg.includes('nữ') || msg.includes('phụ nữ')) && 
        (msg.includes('it') || msg.includes('lập trình') || msg.includes('công nghệ'))) {
      return `👩‍💻 **Nữ giới có phù hợp với IT không?**

✅ **HOÀN TOÀN PHÙ HỢP!** IT không phân biệt giới tính:

🌟 **Thực tế tích cực:**
• 40% sinh viên IT tại FPT Poly là nữ
• Nhiều nữ CEO công nghệ thành công
• Nữ giới thường tỉ mỉ, chi tiết hơn

💪 **Ưu điểm của nữ giới trong IT:**
• Kỹ năng giao tiếp và làm việc nhóm tốt
• Tư duy logic và giải quyết vấn đề sáng tạo
• UI/UX Design: nữ giới có lợi thế thẩm mỹ
• Testing: yêu cầu sự tỉ mỉ, chính xác

🎯 **Lĩnh vực IT phù hợp:**
• Frontend Development
• UI/UX Design
• Business Analyst
• Project Management
• Quality Assurance

🚀 **Thông điệp:** Công nghệ cần sự đa dạng, và bạn chính là tương lai!

Bạn quan tâm lĩnh vực nào trong IT?`;
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

    // IT related - with contextual analysis
    if (msg.includes('công nghệ thông tin') || msg.includes('it') || msg.includes('lập trình') || msg.includes('phần mềm')) {
      
      // Check for specific concerns or questions
      if (msg.includes('dốt toán') || msg.includes('kém toán') || msg.includes('yếu toán') || msg.includes('không giỏi toán') || msg.includes('toán kém') || msg.includes('toán dở')) {
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

      if (msg.includes('có khó không') || msg.includes('khó học không') || msg.includes('dễ hay khó')) {
        return `🎓 **IT có khó học không?**

⚖️ **Thật lòng mà nói:** IT vừa dễ vừa khó, tùy cách tiếp cận!

✅ **Phần DỄ:**
• Tài liệu học miễn phí vô số trên internet
• Cộng đồng hỗ trợ nhiệt tình
• Có thể tự học và thực hành ngay
• Kết quả thấy được ngay lập tức

⚠️ **Phần KHÓ:**
• Cần kiên trì, không bỏ cuộc giữa chừng
• Phải cập nhật công nghệ liên tục
• Debug lỗi đôi khi mất nhiều thời gian
• Cần tư duy logic và giải quyết vấn đề

🎯 **Bí quyết thành công:**
• Học đều đặn mỗi ngày 1-2 tiếng
• Làm project thực tế, không chỉ học lý thuyết
• Tham gia cộng đồng, hỏi khi cần

💪 Quan trọng nhất là ĐỪNG SỢ và bắt đầu thôi! Bạn có quyết tâm không?`;
      }

      if (msg.includes('không có nền tảng') || msg.includes('chưa biết gì') || msg.includes('mới bắt đầu') || msg.includes('zero kinh nghiệm')) {
        return `🌱 **Chưa có nền tảng IT? Không sao cả!**

🎉 **Tin vui:** 90% sinh viên FPT Polytechnic bắt đầu từ con số 0!

📋 **Lộ trình cho người mới:**

**Tháng 1-2:** Làm quen cơ bản
• Học HTML/CSS (tạo website đơn giản)
• Hiểu cách máy tính hoạt động
• Làm quen với thuật ngữ IT

**Tháng 3-6:** Nền tảng lập trình
• JavaScript cơ bản
• Logic và thuật toán đơn giản
• Làm các project mini

**Tháng 7-12:** Chuyên sâu
• Chọn 1 hướng: Web, Mobile, hoặc Desktop
• Học framework và thư viện
• Project lớn hơn

🎯 **Tại FPT Polytechnic:**
• Giảng viên dạy từ A-Z
• Có lab thực hành đầy đủ
• Bạn học cùng nhiều người cùng trình độ

💡 Bạn muốn bắt đầu từ hướng nào: Web, Mobile App hay Game?`;
      }

      // Default IT responses for general questions
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

    // Design related - with contextual analysis
    if (msg.includes('thiết kế') || msg.includes('đồ họa') || msg.includes('design') || msg.includes('ui/ux')) {
      
      // Check for specific concerns
      if (msg.includes('không biết vẽ') || msg.includes('không giỏi vẽ') || msg.includes('vẽ dở') || msg.includes('chưa biết vẽ')) {
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

      if (msg.includes('cần máy tính mạnh') || msg.includes('cấu hình cao') || msg.includes('máy yếu')) {
        return `💻 **Học Thiết kế cần máy tính mạnh không?**

⚖️ **Thực tế:** Tùy loại thiết kế bạn làm!

✅ **Máy tính bình thường (8GB RAM) làm được:**
• Thiết kế poster, brochure
• Logo và branding cơ bản
• Web design (UI mockup)
• Social media content

⚠️ **Cần máy mạnh hơn (16GB+ RAM):**
• Video editing, motion graphics
• 3D modeling và rendering
• Xử lý ảnh RAW chuyên nghiệp
• Game design với Unity/Unreal

🎯 **Tại FPT Polytechnic:**
• Lab máy cấu hình cao để thực hành
• Phần mềm bản quyền đầy đủ
• Bạn có thể học trước khi quyết định mua máy

💡 **Gợi ý:** Bắt đầu với máy hiện tại, nâng cấp dần khi cần thiết!

Bạn đang có loại máy gì? Tôi có thể tư vấn cụ thể hơn!`;
      }

      // Default design responses
      const designResponses = [
        `🎨 **Thiết kế đồ họa - Thỏa sức sáng tạo!**

✨ **Nội dung học:**
• Adobe Creative Suite (Ps, Ai, Id)
• Branding & Visual Identity
• Web/App UI Design
• Motion Graphics & Video

🎯 **Nghề nghiệp hấp dẫn:**
• UI/UX Designer (12-30 triệu)
• Graphic Designer (8-20 triệu)  
• Brand Designer (15-35 triệu)
• Art Director (20-50 triệu)

💡 Bạn đã thử thiết kế gì chưa? Logo, poster hay website?`,

        `🎪 **Thiết kế đồ họa - Biến ý tưởng thành hiện thực!**

🌟 **Điểm mạnh của ngành:**
• Được làm việc với thương hiệu lớn
• Môi trường sáng tạo, năng động
• Freelance thu nhập cao
• Cơ hội du học, làm việc quốc tế

📱 **Xu hướng hot:** UI/UX Design, Digital Art, NFT Design

Bạn có khiếu nghệ thuật hay thích sáng tạo không?`
      ];
      return designResponses[Math.floor(Math.random() * designResponses.length)];
    }

    // Marketing related  
    if (msg.includes('marketing') || msg.includes('truyền thông') || msg.includes('quảng cáo')) {
      const marketingResponses = [
        `📢 **Marketing - Nghệ thuật bán hàng thời đại số!**

🚀 **Học gì:**
• Digital Marketing & SEO/SEM
• Social Media Marketing  
• Content Marketing & Copywriting
• Data Analytics & CRM

💰 **Thu nhập hấp dẫn:**
• Marketing Executive (8-15 triệu)
• Digital Marketer (12-25 triệu)
• Marketing Manager (20-40 triệu)
• Growth Hacker (25-50 triệu)

📈 Bạn có kinh nghiệm bán hàng hoặc viết content không?`,

        `🎯 **Marketing - Kết nối thương hiệu với khách hàng!**

🔥 **Tại sao chọn Marketing:**
• Ngành phát triển mạnh mẽ
• Cơ hội networking rộng
• Làm việc với nhiều lĩnh vực
• Phát triển kỹ năng toàn diện

📱 **Xu hướng:** TikTok Marketing, Influencer Marketing, AI Marketing

Bạn có thích giao tiếp và thuyết phục không?`
      ];
      return marketingResponses[Math.floor(Math.random() * marketingResponses.length)];
    }

    // Accounting related
    if (msg.includes('kế toán') || msg.includes('tài chính') || msg.includes('accounting')) {
      return `💰 **Kế toán - Ngành ổn định, cần thiết mọi doanh nghiệp!**

📊 **Nội dung học:**
• Kế toán tài chính & quản trị
• Thuế & Kiểm toán
• Phần mềm: MISA, SAP, Excel nâng cao
• Phân tích tài chính

🏢 **Cơ hội việc làm:**
• Kế toán viên (7-15 triệu)
• Kiểm toán viên (12-25 triệu)
• Chuyên viên tài chính (15-30 triệu)
• CFO (30-100 triệu)

📈 Bạn có tính cẩn thận và thích làm việc với số liệu không?`;
    }

    // Business Administration
    if (msg.includes('quản trị') || msg.includes('kinh doanh') || msg.includes('business')) {
      return `👔 **Quản trị Kinh doanh - Lãnh đạo tương lai!**

🎯 **Kỹ năng phát triển:**
• Quản lý nhân sự & dự án
• Chiến lược kinh doanh
• Tài chính doanh nghiệp  
• Leadership & Communication

🚀 **Vị trí mục tiêu:**
• Team Leader (15-25 triệu)
• Project Manager (20-35 triệu)
• Business Analyst (18-40 triệu)
• CEO/Founder (không giới hạn)

💡 Bạn có ước mơ khởi nghiệp hoặc lãnh đạo team không?`;
    }

    // Admission questions
    if (msg.includes('tuyển sinh') || msg.includes('điều kiện') || msg.includes('đăng ký') || msg.includes('học phí')) {
      return `📋 **Tuyển sinh FPT Polytechnic 2024:**

✅ **Điều kiện dễ dàng:**
• Tốt nghiệp THPT (hoặc tương đương)
• Không cần thi đầu vào
• Xét tuyển học bạ hoặc điểm thi THPT

📅 **Lịch khai giảng linh hoạt:**
• Tháng 3, 6, 9, 12 hàng năm
• Đăng ký trực tuyến 24/7

💰 **Học phí hợp lý:** 15-22 triệu/năm
🎓 **Thời gian:** 2.5-3 năm

🎁 **Ưu đãi:** Học bổng lên đến 100% học phí cho sinh viên xuất sắc!

Bạn muốn đăng ký tư vấn trực tiếp không?`;
    }

    // Career opportunities
    if (msg.includes('việc làm') || msg.includes('nghề nghiệp') || msg.includes('tương lai') || msg.includes('lương')) {
      return `💼 **Cơ hội nghề nghiệp sau tốt nghiệp FPT Polytechnic:**

🏆 **Cam kết việc làm:**
• 85% sinh viên có việc làm sau 6 tháng
• Mức lương trung bình 8-15 triệu (fresh)
• Hơn 500 doanh nghiệp đối tác tuyển dụng

🌟 **Doanh nghiệp tiêu biểu:**
FPT Software, Viettel, VNPT, Samsung, LG...

🚀 **Hỗ trợ nghề nghiệp:**
• Job Fair thường xuyên
• Kết nối alumni network
• Coaching CV & phỏng vấn
• Thực tập có lương tại doanh nghiệp

Bạn quan tâm ngành nào để tôi tư vấn cụ thể hơn?`;
    }

    // Specific questions about skills, interests
    if (msg.includes('phù hợp') || msg.includes('nên học') || msg.includes('chọn ngành')) {
      return `🤔 **Làm sao chọn ngành phù hợp?**

📝 **Hãy tự hỏi mình:**
• Bạn thích làm việc với máy tính? → IT
• Bạn có khiếu thẩm mỹ, sáng tạo? → Thiết kế  
• Bạn giỏi giao tiếp, thuyết phục? → Marketing
• Bạn tỉ mỉ, thích số liệu? → Kế toán
• Bạn có tầm nhìn, thích lãnh đạo? → Quản trị KD

🎯 **Gợi ý:** Hãy làm bài test khảo sát trên website của chúng tôi để được tư vấn chính xác nhất!

Bạn muốn tôi hỏi thêm về sở thích để tư vấn cụ thể không?`;
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
