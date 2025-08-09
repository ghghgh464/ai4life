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
    const msg = message.toLowerCase();
    
    if (msg.includes('công nghệ thông tin') || msg.includes('it')) {
      return `Ngành Công nghệ thông tin tại FPT Polytechnic đào tạo về:
      
🔹 Lập trình ứng dụng
🔹 Phát triển web và mobile
🔹 Quản trị cơ sở dữ liệu
🔹 Bảo mật thông tin

**Cơ hội nghề nghiệp:**
- Lập trình viên
- System Administrator
- DevOps Engineer
- Data Analyst

Bạn có muốn biết thêm về yêu cầu đầu vào không?`;
    }

    if (msg.includes('thiết kế') || msg.includes('đồ họa')) {
      return `Ngành Thiết kế đồ họa tại FPT Polytechnic:
      
🎨 **Nội dung học:**
- Photoshop, Illustrator
- Typography và Color Theory  
- UI/UX Design
- Multimedia Design

🚀 **Nghề nghiệp:**
- Graphic Designer
- UI/UX Designer
- Art Director
- Brand Designer

Ngành này phù hợp với bạn nào có khả năng sáng tạo và thẩm mỹ tốt!`;
    }

    if (msg.includes('marketing')) {
      return `Marketing tại FPT Polytechnic:
      
📈 **Học những gì:**
- Digital Marketing
- Social Media Marketing
- Content Marketing
- Analytics và Data

💼 **Cơ hội việc làm:**
- Marketing Manager
- Digital Marketer
- Content Creator
- Brand Manager

Ngành này cần kỹ năng giao tiếp và tư duy sáng tạo!`;
    }

    if (msg.includes('kế toán')) {
      return `Ngành Kế toán tại FPT Polytechnic:
      
💰 **Nội dung đào tạo:**
- Kế toán tài chính
- Kế toán quản trị
- Thuế và kiểm toán
- Phần mềm kế toán

📊 **Nghề nghiệp:**
- Kế toán viên
- Kiểm toán viên
- Chuyên viên tài chính
- Tư vấn thuế

Yêu cầu tính chính xác, tỉ mỉ và trung thực cao!`;
    }

    if (msg.includes('tuyển sinh') || msg.includes('điều kiện')) {
      return `📋 **Thông tin tuyển sinh FPT Polytechnic:**
      
✅ **Điều kiện:**
- Tốt nghiệp THPT
- Không cần thi đầu vào
- Xét học bạ hoặc kết quả thi THPT

📅 **Thời gian:**
- Tuyển sinh quanh năm
- Khai giảng: Tháng 3, 6, 9, 12

💰 **Học phí:** Từ 15-20 triệu/năm tùy ngành

Bạn quan tâm ngành nào cụ thể?`;
    }

    // Default response
    return `Xin chào! Tôi là AI tư vấn của FPT Polytechnic. 

Tôi có thể giúp bạn về:
🎓 Các ngành học: IT, Thiết kế, Marketing, Kế toán, Quản trị KD
📋 Thông tin tuyển sinh
💼 Cơ hội nghề nghiệp
📞 Tư vấn định hướng

Bạn muốn tìm hiểu về ngành nào? Hãy hỏi tôi nhé!`;
  }
}
