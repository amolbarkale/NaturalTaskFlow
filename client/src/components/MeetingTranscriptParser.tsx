import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertTaskSchema, type InsertTask } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Plus } from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini with Vite environment variable
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

interface ParsedTask {
  name: string;
  assignee: string;
  dueDate: string;
  priority: string;
  status: string;
}

export default function MeetingTranscriptParser() {
  const [transcript, setTranscript] = useState("");
  const [parsedTasks, setParsedTasks] = useState<ParsedTask[]>([]);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const parseTranscriptMutation = useMutation({
    mutationFn: async (transcript: string) => {
      console.log('Processing transcript with Gemini...');
      try {
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

        console.log('Calling Gemini API...');
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        console.log('Gemini response:', text);

        // Clean and parse the response
        const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
        const tasks = JSON.parse(cleanedText);
        
        if (!Array.isArray(tasks)) {
          throw new Error('Response is not an array');
        }

        // Validate and transform tasks
        const validatedTasks = tasks.map(task => {
          if (!task.name || !task.assignee || !task.dueDate) {
            throw new Error('Missing required task fields');
          }
          
          return {
            name: String(task.name),
            assignee: String(task.assignee),
            dueDate: String(task.dueDate),
            priority: ['P1', 'P2', 'P3', 'P4'].includes(task.priority) ? task.priority : 'P3',
            status: "pending"
          };
        });

        console.log('Validated tasks:', validatedTasks);
        return validatedTasks;
      } catch (error) {
        console.error('Error processing transcript:', error);
        throw error;
      }
    },
    onSuccess: (data: ParsedTask[]) => {
      console.log('Successfully parsed tasks:', data);
      setParsedTasks(data);
      toast({
        title: "Transcript Parsed",
        description: `Found ${data.length} tasks in the transcript`,
      });
    },
    onError: (error: Error) => {
      console.error('Mutation error:', error);
      toast({
        title: "Parsing Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async (task: InsertTask) => {
      const response = await apiRequest("POST", "/api/tasks", task);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Task Creation Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleParseTranscript = () => {
    if (transcript.trim()) {
      parseTranscriptMutation.mutate(transcript);
    }
  };

  const handleAddAllTasks = () => {
    parsedTasks.forEach(task => {
      createTaskMutation.mutate({
        name: task.name,
        assignee: task.assignee,
        dueDate: task.dueDate,
        priority: (task.priority === "P1" || task.priority === "P2" || task.priority === "P3" || task.priority === "P4") 
          ? task.priority 
          : "P3",
        status: "pending",
        description: "",
      });
    });
    setTranscript("");
    setParsedTasks([]);
    toast({
      title: "Tasks Added",
      description: `Successfully added ${parsedTasks.length} tasks to your board`,
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "P1": return "bg-red-100 text-red-800";
      case "P2": return "bg-orange-100 text-orange-800";
      case "P3": return "bg-yellow-100 text-yellow-800";
      case "P4": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-800 mb-2">Meeting Minutes Parser</h2>
          <p className="text-sm text-slate-500">
            Paste your meeting transcript to automatically extract tasks, assignees, and deadlines.
          </p>
        </div>

        <div className="space-y-4">
          <Textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            className="min-h-[150px] p-4 resize-none text-base placeholder-slate-400"
            placeholder="Paste your meeting transcript here... Example: 'Aman you take the landing page by 10pm tomorrow...'"
          />
          
          <div className="flex justify-end space-x-3">
            <Button
              onClick={handleParseTranscript}
              disabled={!transcript.trim() || parseTranscriptMutation.isPending}
              variant="outline"
              className="gap-2"
            >
              <Sparkles className="h-4 w-4" />
              {parseTranscriptMutation.isPending ? "Parsing..." : "Extract Taskss"}
            </Button>
            
            {parsedTasks.length > 0 && (
              <Button
                onClick={handleAddAllTasks}
                disabled={createTaskMutation.isPending}
                className="gap-2 bg-primary hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Add {parsedTasks.length} Tasks to Board
              </Button>
            )}
          </div>

          {parsedTasks.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-slate-700 mb-3">Extracted Tasks</h3>
              <div className="space-y-3">
                {parsedTasks.map((task, index) => (
                  <div
                    key={index}
                    className="p-4 bg-slate-50 rounded-lg border border-slate-200"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="font-medium text-slate-800">{task.name}</div>
                        <div className="text-sm text-slate-500">
                          <span className="inline-flex items-center gap-2">
                            <span>👤 {task.assignee}</span>
                            <span>•</span>
                            <span>📅 {task.dueDate}</span>
                          </span>
                        </div>
                      </div>
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {parseTranscriptMutation.isPending && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center text-blue-700">
                <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                <span className="text-sm">AI is analyzing the transcript...</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 