import { Router, Request, Response } from 'express';
import { AIService } from '../services/aiService';
import { db } from '../models/database';
import { v4 as uuidv4 } from 'uuid';

const router = Router();
const aiService = new AIService();

interface ChatRequest extends Request {
  body: {
    message: string;
    sessionId?: string;
  };
}

// Chat with AI
router.post('/chat', async (req: ChatRequest, res: Response) => {
  try {
    const { message, sessionId } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    // Generate or use existing session ID
    const currentSessionId = sessionId || uuidv4();

    // Get chat history for context
    let chatHistory = [];
    if (sessionId) {
      const existingSession: any = await db.get(`
        SELECT messages FROM chat_sessions WHERE session_id = ?
      `, [sessionId]);

      if (existingSession) {
        chatHistory = JSON.parse(existingSession.messages || '[]');
      }
    }

    // Generate AI response
    console.log('🤖 Generating AI chat response...');
    const aiResponse = await aiService.generateChatResponse(message, {
      history: chatHistory.slice(-5) // Last 5 messages for context
    });

    // Create new message objects
    const userMessage = {
      id: uuidv4(),
      role: 'user' as const,
      content: message,
      timestamp: new Date().toISOString()
    };

    const assistantMessage = {
      id: uuidv4(),
      role: 'assistant' as const,
      content: aiResponse,
      timestamp: new Date().toISOString()
    };

    // Update chat history
    const updatedHistory = [...chatHistory, userMessage, assistantMessage];

    // Save or update chat session
    if (sessionId) {
      await db.run(`
        UPDATE chat_sessions 
        SET messages = ?, updated_at = datetime('now')
        WHERE session_id = ?
      `, [JSON.stringify(updatedHistory), sessionId]);
    } else {
      await db.run(`
        INSERT INTO chat_sessions (session_id, messages, created_at, updated_at)
        VALUES (?, ?, datetime('now'), datetime('now'))
      `, [currentSessionId, JSON.stringify(updatedHistory)]);
    }

    res.json({
      success: true,
      data: {
        response: aiResponse,
        sessionId: currentSessionId,
        messageId: assistantMessage.id
      }
    });

  } catch (error: any) {
    console.error('❌ Chat AI error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Chat service unavailable'
    });
  }
});

// Get chat history
router.get('/chat/:sessionId', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;

    const session: any = await db.get(`
      SELECT * FROM chat_sessions WHERE session_id = ?
    `, [sessionId]);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Chat session not found'
      });
    }

    const messages = JSON.parse(session.messages || '[]');

    res.json({
      success: true,
      data: messages
    });

  } catch (error: any) {
    console.error('❌ Get chat history error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Delete chat session
router.delete('/chat/:sessionId', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;

    const result = await db.run(`
      DELETE FROM chat_sessions WHERE session_id = ?
    `, [sessionId]);

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        error: 'Chat session not found'
      });
    }

    res.json({
      success: true,
      message: 'Chat session deleted successfully'
    });

  } catch (error: any) {
    console.error('❌ Delete chat session error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get AI service status
router.get('/status', async (req: Request, res: Response) => {
  try {
    const hasApiKey = !!process.env.OPENAI_API_KEY;
    
    res.json({
      success: true,
      data: {
        aiServiceAvailable: hasApiKey,
        model: hasApiKey ? 'gpt-4' : 'fallback',
        features: {
          careerAnalysis: true,
          chatBot: hasApiKey,
          fallbackMode: !hasApiKey
        }
      }
    });

  } catch (error: any) {
    console.error('❌ AI status error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export = router;
