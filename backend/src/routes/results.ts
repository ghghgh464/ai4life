import { Router, Request, Response } from 'express';
import { db } from '../models/database';

const router = Router();

// Get consultation result by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const resultId = req.params.id;

    const result: any = await db.get(`
      SELECT 
        cr.*,
        s.name as user_name,
        s.age,
        s.current_grade,
        s.interests,
        s.skills,
        s.academic_scores,
        s.career_goals,
        s.learning_style,
        s.work_environment_preference
      FROM consultation_results cr
      JOIN surveys s ON s.id = cr.survey_id
      WHERE cr.id = ?
    `, [resultId]);

    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Consultation result not found'
      });
    }

    // Get detailed major information
    const recommendedMajors = JSON.parse(result.recommended_majors);
    const majorIds = recommendedMajors.map((m: any) => m.majorId).filter((id: number) => id > 0);
    
    let majorsDetails: any[] = [];
    if (majorIds.length > 0) {
      const placeholders = majorIds.map(() => '?').join(',');
      majorsDetails = await db.all(`
        SELECT * FROM majors WHERE id IN (${placeholders})
      `, majorIds);
    }

    // Combine recommendation with major details
    const enrichedMajors = recommendedMajors.map((rec: any) => {
      const majorDetail = majorsDetails.find((m: any) => m.id === rec.majorId);
      return {
        ...rec,
        major: majorDetail ? {
          id: majorDetail.id,
          name: majorDetail.name,
          code: majorDetail.code,
          description: majorDetail.description,
          careerProspects: majorDetail.career_prospects,
          requiredSkills: majorDetail.required_skills,
          subjects: JSON.parse(majorDetail.subjects || '[]')
        } : null
      };
    });

    // Format response
    const response = {
      id: result.id,
      surveyId: result.survey_id,
      recommendedMajors: enrichedMajors,
      analysisSummary: result.analysis_summary,
      strengths: JSON.parse(result.strengths),
      recommendations: JSON.parse(result.recommendations),
      confidenceScore: result.confidence_score,
      createdAt: result.created_at,
      user: {
        name: result.user_name,
        age: result.age,
        currentGrade: result.current_grade,
        interests: JSON.parse(result.interests),
        skills: JSON.parse(result.skills),
        academicScores: JSON.parse(result.academic_scores),
        careerGoals: result.career_goals,
        learningStyle: result.learning_style,
        workEnvironmentPreference: result.work_environment_preference
      }
    };

    res.json({
      success: true,
      data: response
    });

  } catch (error: any) {
    console.error('❌ Get result error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Generate QR code for result sharing
router.get('/:id/qr', async (req: Request, res: Response) => {
  try {
    const resultId = req.params.id;

    // Check if result exists
    const result: any = await db.get(`
      SELECT id FROM consultation_results WHERE id = ?
    `, [resultId]);

    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Result not found'
      });
    }

    // Generate QR code data (URL to result page)
    const resultUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/results/${resultId}`;
    
    // Create a simple QR code using Google Charts API
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(resultUrl)}`;

    res.json({
      success: true,
      data: {
        qrCode: qrCodeUrl,
        url: resultUrl,
        resultId: resultId
      }
    });

  } catch (error: any) {
    console.error('❌ QR generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Export result as PDF
router.get('/:id/pdf', async (req: Request, res: Response) => {
  try {
    const resultId = req.params.id;

    // Get result data (reuse the logic from GET /:id)
    const result: any = await db.get(`
      SELECT 
        cr.*,
        s.name as user_name,
        s.age,
        s.current_grade
      FROM consultation_results cr
      JOIN surveys s ON s.id = cr.survey_id
      WHERE cr.id = ?
    `, [resultId]);

    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Result not found'
      });
    }

    // In a real implementation, you would generate a PDF here
    // For now, we'll return a simple text response
    const pdfContent = `
AI4Life - Báo cáo tư vấn ngành học

Học sinh: ${result.user_name}
Tuổi: ${result.age}
Lớp: ${result.current_grade}

Phân tích: ${result.analysis_summary}

Điểm mạnh: ${JSON.parse(result.strengths).join(', ')}

Khuyến nghị: ${JSON.parse(result.recommendations).join(', ')}

Ngày tạo: ${result.created_at}
    `;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="ai4life-result-${resultId}.pdf"`);
    
    // In production, you would send actual PDF binary data
    res.send(Buffer.from(pdfContent, 'utf8'));

  } catch (error: any) {
    console.error('❌ PDF export error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get all results (for admin/debugging)
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const results = await db.all(`
      SELECT 
        cr.id,
        cr.created_at,
        cr.confidence_score,
        s.name as user_name,
        s.age
      FROM consultation_results cr
      JOIN surveys s ON s.id = cr.survey_id
      ORDER BY cr.created_at DESC
      LIMIT ? OFFSET ?
    `, [limit, offset]);

    const total: any = await db.get(`
      SELECT COUNT(*) as count FROM consultation_results
    `);

    res.json({
      success: true,
      data: {
        results,
        pagination: {
          page,
          limit,
          total: total.count,
          pages: Math.ceil(total.count / limit)
        }
      }
    });

  } catch (error: any) {
    console.error('❌ Get results error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export = router;
