import { Router, Request, Response } from 'express';
import { db } from '../models/database';
import { AIService } from '../services/aiService';

const router = Router();
const aiService = new AIService();

interface SurveyRequest extends Request {
  body: {
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
  };
}

// Submit survey and get AI consultation
router.post('/submit', async (req: SurveyRequest, res: Response) => {
  try {
    const surveyData = req.body;

    // Validate required fields
    if (!surveyData.name || !surveyData.age) {
      return res.status(400).json({
        success: false,
        error: 'Name and age are required'
      });
    }

    // Save survey to database
    const surveyResult = await db.run(`
      INSERT INTO surveys (
        name, age, current_grade, interests, skills, 
        academic_scores, career_goals, learning_style, 
        work_environment_preference, completed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `, [
      surveyData.name,
      surveyData.age,
      surveyData.currentGrade,
      JSON.stringify(surveyData.interests),
      JSON.stringify(surveyData.skills),
      JSON.stringify(surveyData.academicScores),
      surveyData.careerGoals,
      surveyData.learningStyle,
      surveyData.workEnvironmentPreference
    ]);

    const surveyId = surveyResult.lastID;

    // Get AI analysis
    console.log('🤖 Processing AI analysis for survey:', surveyId);
    const aiAnalysis = await aiService.analyzeCareerFit(surveyData);

    // Save consultation result
    const consultationResult = await db.run(`
      INSERT INTO consultation_results (
        survey_id, recommended_majors, analysis_summary,
        strengths, recommendations, ai_response, 
        confidence_score, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `, [
      surveyId,
      JSON.stringify(aiAnalysis.recommendedMajors),
      aiAnalysis.analysisSummary,
      JSON.stringify(aiAnalysis.strengths),
      JSON.stringify(aiAnalysis.recommendations),
      JSON.stringify(aiAnalysis.fullResponse),
      aiAnalysis.confidenceScore
    ]);

    // Fetch the complete result
    const result: any = await db.get(`
      SELECT 
        cr.*,
        s.name as user_name,
        s.age,
        s.current_grade
      FROM consultation_results cr
      JOIN surveys s ON s.id = cr.survey_id
      WHERE cr.id = ?
    `, [consultationResult.lastID]);

    if (!result) {
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve consultation result'
      });
    }

    // Format response
    const response = {
      id: result.id,
      surveyId: result.survey_id,
      recommendedMajors: JSON.parse(result.recommended_majors),
      analysisSummary: result.analysis_summary,
      strengths: JSON.parse(result.strengths),
      recommendations: JSON.parse(result.recommendations),
      confidenceScore: result.confidence_score,
      createdAt: result.created_at,
      userName: result.user_name,
      userAge: result.age,
      userGrade: result.current_grade
    };

    console.log('✅ Survey processed successfully:', surveyId);

    res.json({
      success: true,
      data: response,
      message: 'Survey submitted and analyzed successfully'
    });

  } catch (error: any) {
    console.error('❌ Survey submission error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Survey processing failed'
    });
  }
});

// Get survey by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const surveyId = req.params.id;

    const survey: any = await db.get(`
      SELECT * FROM surveys WHERE id = ?
    `, [surveyId]);

    if (!survey) {
      return res.status(404).json({
        success: false,
        error: 'Survey not found'
      });
    }

    // Parse JSON fields
    const response = {
      ...survey,
      interests: JSON.parse(survey.interests),
      skills: JSON.parse(survey.skills),
      academicScores: JSON.parse(survey.academic_scores)
    };

    res.json({
      success: true,
      data: response
    });

  } catch (error: any) {
    console.error('❌ Get survey error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export = router;
