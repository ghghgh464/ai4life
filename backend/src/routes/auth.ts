import { Router, Request, Response } from 'express';
import { db } from '../models/database';

const router = Router();

interface AuthRequest extends Request {
  body: {
    name: string;
    email?: string;
    phone?: string;
  };
}

// Simple user registration/login (for demo purposes)
router.post('/register', async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, phone } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Name is required'
      });
    }

    // Check if user already exists (by email if provided)
    let existingUser: any = null;
    if (email) {
      existingUser = await db.get(`
        SELECT * FROM users WHERE email = ?
      `, [email]);
    }

    if (existingUser) {
      return res.json({
        success: true,
        data: {
          id: existingUser.id,
          name: existingUser.name,
          email: existingUser.email,
          phone: existingUser.phone,
          createdAt: existingUser.created_at
        },
        message: 'User already exists'
      });
    }

    // Create new user
    const result = await db.run(`
      INSERT INTO users (name, email, phone, created_at, updated_at)
      VALUES (?, ?, ?, datetime('now'), datetime('now'))
    `, [name.trim(), email || null, phone || null]);

    const newUser: any = await db.get(`
      SELECT * FROM users WHERE id = ?
    `, [result.lastID]);

    res.status(201).json({
      success: true,
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        createdAt: newUser.created_at
      },
      message: 'User created successfully'
    });

  } catch (error: any) {
    console.error('❌ User registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get user by ID
router.get('/user/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;

    const user = await db.get(`
      SELECT id, name, email, phone, created_at 
      FROM users WHERE id = ?
    `, [userId]);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });

  } catch (error: any) {
    console.error('❌ Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Update user profile
router.put('/user/:id', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.params.id;
    const { name, email, phone } = req.body;

    // Check if user exists
    const existingUser: any = await db.get(`
      SELECT * FROM users WHERE id = ?
    `, [userId]);

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Update user
    await db.run(`
      UPDATE users 
      SET name = ?, email = ?, phone = ?, updated_at = datetime('now')
      WHERE id = ?
    `, [
      name || existingUser.name,
      email || existingUser.email,
      phone || existingUser.phone,
      userId
    ]);

    // Get updated user
    const updatedUser = await db.get(`
      SELECT id, name, email, phone, created_at, updated_at 
      FROM users WHERE id = ?
    `, [userId]);

    res.json({
      success: true,
      data: updatedUser,
      message: 'User updated successfully'
    });

  } catch (error: any) {
    console.error('❌ Update user error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get user's surveys and results
router.get('/user/:id/history', async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;

    // Get user's surveys with results
    const surveys = await db.all(`
      SELECT 
        s.id as survey_id,
        s.name,
        s.completed_at,
        cr.id as result_id,
        cr.confidence_score,
        cr.created_at as result_created_at
      FROM surveys s
      LEFT JOIN consultation_results cr ON cr.survey_id = s.id
      WHERE s.user_id = ?
      ORDER BY s.completed_at DESC
    `, [userId]);

    res.json({
      success: true,
      data: surveys
    });

  } catch (error: any) {
    console.error('❌ Get user history error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export = router;
