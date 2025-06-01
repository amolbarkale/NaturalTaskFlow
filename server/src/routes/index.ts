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

console.log('Setting up routes...');

// Mount routes without /api prefix since it's already handled in index.ts
router.use('/tasks', tasksRouter);
console.log('Mounted tasks router at /tasks');

router.use('/tasks/parse-transcript', transcriptParserRouter);
console.log('Mounted transcript parser at /tasks/parse-transcript');

export default router; 