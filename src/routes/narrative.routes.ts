import express from 'express';
import { getNarratives, getLatest } from '@/controllers/narrative.controller';
import { authenticate } from '@/middleware/auth.middleware';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// GET /api/narratives - Get all narratives (Cosmic Log)
router.get('/', getNarratives);

// GET /api/narratives/latest - Get latest narrative
router.get('/latest', getLatest);

export default router;
