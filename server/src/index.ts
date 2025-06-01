import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';

const app = express();
const port = process.env.PORT || 5000;
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Validate API key
if (!process.env.GEMINI_API_KEY) {
  console.warn('WARNING: GEMINI_API_KEY not set in environment');
}

// Configure CORS to accept requests from the client
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5000'], // Add your client URL
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Accept']
}));

app.use(express.json());

// Simple request logging
app.use((req, res, next) => {
  console.log('Request received:', {
    method: req.method,
    path: req.path,
    body: req.body,
    headers: req.headers
  });
  next();
});

// Direct transcript parsing endpoint
app.post('/api/tasks/parse-transcript', async (req, res) => {
  try {
    const { transcript } = req.body;

    if (!transcript) {
      return res.status(400).json({ error: 'Transcript is required' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-001' });

    const prompt = `Extract tasks from this meeting transcript. Return ONLY a JSON array with tasks.
    Each task must have: name, assignee, dueDate, priority (P1/P2/P3/P4).
    Example: [{"name":"Landing page","assignee":"John","dueDate":"Tomorrow 5pm","priority":"P3"}]
    Transcript: ${transcript}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Clean and parse the response
    const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
    const tasks = JSON.parse(cleanedText);
    
    if (!Array.isArray(tasks)) {
      throw new Error('Response is not an array');
    }

    res.json(tasks);
  } catch (error: any) {
    console.error('Error processing transcript:', error);
    res.status(500).json({ 
      error: 'Failed to process transcript',
      details: error.message 
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log('CORS enabled for:', ['http://localhost:5173', 'http://localhost:5000']);
}); 