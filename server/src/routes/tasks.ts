import { Router } from 'express';

const router = Router();

// Placeholder GET route for tasks
router.get('/', (req, res) => {
  res.json([]);
});

// Create a new task
router.post('/', async (req, res) => {
  try {
    const task = req.body;
    // TODO: Implement task creation
    res.status(201).json(task);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router; 