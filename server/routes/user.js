import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { Client } from '@microsoft/microsoft-graph-client';
import db from '../db/database.js';
import path from 'path';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * GET /api/user/me
 * Get current user's profile from local database
 */
router.get('/me', (req, res) => {
  try {
    const employee = db
      .prepare(`
        SELECT
          e.employee_id,
          e.first_name,
          e.last_name,
          e.email,
          e.team_id,
          e.department_id,
          e.role,
          e.points_total,
          -- Добавляем расчет персонального вклада в CO2
          COALESCE(SUM(ea.co2_saved_kg), 0) as total_co2_saved_kg
        FROM employees e
        LEFT JOIN employee_activities ea ON e.employee_id = ea.employee_id AND ea.status = 'approved'
        WHERE e.employee_id = ?
        GROUP BY e.employee_id
      `)
      .get(req.user.employee_id);

    if (!employee) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(employee);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

/**
 * GET /api/user/me/photo
 * Get user's profile photo from Microsoft Graph
 * Note: This requires storing the access token or refreshing it
 * For now, this is a placeholder that would need token refresh logic
 */
router.get('/me/photo', async (req, res) => {
  try {
    res.sendFile(path.resolve(__dirname, '../db/icon.png'));
    
    const client = Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      },
    });
    const photo = await client.api('/me/photo/$value').get();
    res.set('Content-Type', 'image/jpeg');
    res.send(photo);
  } catch (error) {
    console.error('Error fetching user photo:', error);
    res.status(500).json({ error: 'Failed to fetch user photo' });
  }
});

export default router;

