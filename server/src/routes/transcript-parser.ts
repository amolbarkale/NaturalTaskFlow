import { Router } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

router.use((req, res, next) => {
  console.log('Transcript Parser Route Hit:', {
    method: req.method,
    path: req.path,
    body: req.body,
    headers: req.headers
  });
  next();
});

router.post('/', async (req, res) => {
  console.log('POST /api/tasks/parse-transcript - Start');
  try {
    const { transcript } = req.body;
    console.log('Received transcript:', transcript);
    
    if (!transcript) {
      console.log('Error: No transcript provided');
      return res.status(400).json({ error: 'Transcript is required' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-001' });

    const prompt = `You are a task extraction system. Extract tasks from the following meeting transcript.
    
    Rules:
    1. Return ONLY a JSON array, nothing else
    2. Each task must have exactly these fields: name, assignee, dueDate, priority
    3. Priority must be one of: P1, P2, P3, P4 (default to P3)
    4. Do not include any explanations or additional text
    
    Example Input:
    "Aman you take the landing page by 10pm tomorrow. Rajeev you take care of client follow-up by Wednesday."
    
    Example Output:
    [{"name":"Take the landing page","assignee":"Aman","dueDate":"10:00 PM, Tomorrow","priority":"P3"},{"name":"Client follow-up","assignee":"Rajeev","dueDate":"Wednesday","priority":"P3"}]
    
    Now parse this transcript (remember, respond with ONLY the JSON array):
    ${transcript}`;

    const result = await model.generateContent(prompt);

    let text;
    try {
      text = result.response.text();
      console.log('Parsed text from Gemini:', text);
    } catch (error: any) {
      console.error('Error reading Gemini response:', error);
      return res.status(500).json({ 
        error: 'Failed to read the AI response',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }

    // Clean and parse the response
    try {
      console.log('Cleaning and parsing response...');
      // Remove any potential markdown code block markers and trim whitespace
      const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
      console.log('Cleaned text:', cleanedText);
      
      const tasks = JSON.parse(cleanedText);
      console.log('Parsed JSON:', tasks);
      
      if (!Array.isArray(tasks)) {
        throw new Error('Response is not an array');
      }

      // Validate and sanitize each task
      const validatedTasks = tasks.map(task => {
        if (!task.name || !task.assignee || !task.dueDate) {
          throw new Error('Missing required task fields');
        }
        
        return {
          name: String(task.name),
          assignee: String(task.assignee),
          dueDate: String(task.dueDate),
          priority: ['P1', 'P2', 'P3', 'P4'].includes(task.priority) ? task.priority : 'P3'
        };
      });

      console.log('Validated tasks:', validatedTasks);
      return res.json(validatedTasks);
    } catch (parseError: any) {
      console.error('Parse error:', parseError);
      console.error('Raw text:', text);
      return res.status(500).json({ 
        error: 'Failed to parse the AI response. Please try again.',
        details: process.env.NODE_ENV === 'development' ? parseError.message : undefined
      });
    }
  } catch (error: any) {
    console.error('API error:', error);
    return res.status(500).json({ 
      error: 'An error occurred while processing your request.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router; 