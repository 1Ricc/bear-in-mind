import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { authenticateToken } from '../middleware/auth.js';
import { createRateLimiter } from '../lib/rateLimiter.js';
import { getUserContext } from '../lib/userContext.js';

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const rateLimiter = createRateLimiter(); // 20 messages/day per user

const MAX_INPUT_LENGTH = 500;
const MAX_HISTORY = 6;

router.use(authenticateToken);

router.post('/', async (req, res) => {
  const { employee_id } = req.user;

  const { allowed, remaining } = rateLimiter.consumeMessage(employee_id);
  if (!allowed) {
    return res.status(429).json({ error: 'Daily message limit reached. Try again tomorrow.' });
  }

  const { message, history = [] } = req.body;

  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'message is required' });
  }

  const truncatedMessage = message.slice(0, MAX_INPUT_LENGTH);
  const trimmedHistory = history.slice(-MAX_HISTORY);

  const context = getUserContext(employee_id);
  if (!context) {
    return res.status(404).json({ error: 'User not found' });
  }

  const recentText = context.recentActivities.length > 0
    ? context.recentActivities.join(', ')
    : 'none yet';

  const rankText = context.teamRank
    ? `ranked ${context.teamRank} of ${context.teamCount}`
    : 'not assigned to a team';

  const systemPrompt = `You are an ESG coach helping ${context.firstName} improve their environmental impact.

Their current stats:
- Total CO₂ saved: ${context.totalCo2SavedKg} kg
- Total points: ${context.pointsTotal}
- Team: ${context.teamName} (${rankText})
- Recent activities: ${recentText}

Keep replies to 2-3 sentences. Be specific, encouraging, and practical.
Do not make up activities that don't exist in the app.`;

  try {
    const geminiHistory = trimmedHistory.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: systemPrompt,
      generationConfig: { maxOutputTokens: 300 },
    });

    const chat = model.startChat({ history: geminiHistory });
    const result = await chat.sendMessage(truncatedMessage);
    const reply = result.response.text();

    return res.json({ reply, remainingMessages: remaining });
  } catch (err) {
    console.error('Gemini API error:', err);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

export default router;
