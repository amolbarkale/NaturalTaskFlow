import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface ParsedTask {
  name: string;
  assignee: string;
  dueDate: string;
  priority: "P1" | "P2" | "P3" | "P4";
  description?: string;
}

export async function parseNaturalLanguageTask(input: string): Promise<ParsedTask> {
  try {
    const prompt = `Parse the following natural language task input and extract structured information. Return a JSON object with the following fields:
- name: The main task description/action
- assignee: The person assigned to the task (if not specified, use "Unassigned")
- dueDate: The due date and time in ISO 8601 format (if relative like "tomorrow" or "next week", calculate the actual date)
- priority: One of P1 (critical), P2 (high), P3 (medium), P4 (low). Default to P3 if not specified.
- description: Additional context or details (optional)

Current date and time: ${new Date().toISOString()}

Task input: "${input}"

Return only a valid JSON object.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a task parsing expert. Extract structured task information from natural language input and respond with valid JSON only."
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    // Validate and set defaults
    return {
      name: result.name || "Unnamed task",
      assignee: result.assignee || "Unassigned",
      dueDate: result.dueDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      priority: ["P1", "P2", "P3", "P4"].includes(result.priority) ? result.priority : "P3",
      description: result.description || "",
    };
  } catch (error) {
    console.error("Error parsing task with OpenAI:", error);
    throw new Error("Failed to parse natural language task. Please try rephrasing your input.");
  }
}
