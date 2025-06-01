import { Router } from 'express';
import tasksRouter from './tasks';
import transcriptParserRouter from './transcript-parser';

const router = Router();

// Debug middleware for this router
router.use((req, res, next) => {
  console.log('Routes/index.ts - Request:', {
    method: req.method,
    path: req.path,
    baseUrl: req.baseUrl,
    originalUrl: req.originalUrl
  });
  next();
});

// Mount routes without /api prefix since it's already handled in index.ts
router.use('/tasks', tasksRouter);

router.use('/tasks/parse-transcript', transcriptParserRouter);

export default router; 