import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export interface ParsedTask {
  name: string;
  assignee: string;

  dueDate: string;
  priority: "P1" | "P2" | "P3" | "P4";
  description?: string;
}

export async function parseNaturalLanguageTask(input: string): Promise<ParsedTask> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-001" });
    
    const prompt = `Parse the following natural language task input and extract structured information. Return ONLY a valid JSON object with the following fields:
- name: The main task description/action
- assignee: The person assigned to the task (if not specified, use "Unassigned")
- dueDate: The due date and time in ISO 8601 format (if relative like "tomorrow" or "next week", calculate the actual date)
- priority: One of P1 (critical), P2 (high), P3 (medium), P4 (low). Default to P3 if not specified.
- description: Additional context or details (optional)

Current date and time: ${new Date().toISOString()}

Task input: "${input}"

Return only a valid JSON object, no other text or explanation.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    
    // Remove any markdown code blocks if present
    const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
    
    const parsedResult = JSON.parse(cleanedText);
    
    // Validate and set defaults
    return {
      name: parsedResult.name || "Unnamed task",
      assignee: parsedResult.assignee || "Unassigned",
      dueDate: parsedResult.dueDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      priority: ["P1", "P2", "P3", "P4"].includes(parsedResult.priority) ? parsedResult.priority : "P3",
      description: parsedResult.description || "",
    };
  } catch (error) {
    console.error("Error parsing task with Gemini:", error);
    throw new Error("Failed to parse natural language task. Please try rephrasing your input.");
  }
}
