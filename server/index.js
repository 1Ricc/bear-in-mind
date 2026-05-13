import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './db/database.js';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import teamRoutes from './routes/team.js';
import teamsRoutes from './routes/teams.js';
import activitiesRoutes from './routes/activities.js';
import chatRoutes from './routes/chat.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Request logging middleware
app.use((req, res, next) => {
	const date = new Date();
	console.log(
		`${date.getHours()}:${date.getMinutes()} ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}\t\t${req.ip}\t${req.method}\t${req.url}`
	);
	next();
});

// Health check endpoint
app.get('/health', (req, res) => {
	res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/user', teamRoutes); // Team routes are under /api/user/me/team
app.use('/api/teams', teamsRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/chat', chatRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
	console.error('Error:', err);
	res.status(err.status || 500).json({
		error: err.message || 'Internal server error',
	});
});

// 404 handler
app.use((req, res) => {
	res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
	console.log(`ESG Gamification API Server running on port ${PORT}`);
	console.log(`Health check: http://localhost:${PORT}/health`);
	console.log(`Auth signin: http://localhost:${PORT}/api/auth/signin`);
});

// Graceful shutdown
process.on('SIGINT', () => {
	console.log('\nShutting down server...');
	db.close();
	process.exit(0);
});

process.on('SIGTERM', () => {
	console.log('\nShutting down server...');
	db.close();
	process.exit(0);
});
