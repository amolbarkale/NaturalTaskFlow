import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTaskSchema, type InsertTask } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { ParsedTask } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Sparkles, Eye } from "lucide-react";

export default function TaskInput() {
  const [input, setInput] = useState("");
  const [parsedTask, setParsedTask] = useState<ParsedTask | null>(null);
  const [isParsingPreview, setIsParsingPreview] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<InsertTask>({
    resolver: zodResolver(insertTaskSchema),
    defaultValues: {
      name: "",
      assignee: "",
      dueDate: "",
      priority: "P3",
      status: "pending",
      description: "",
    },
  });

  const parseTaskMutation = useMutation({
    mutationFn: async (input: string) => {
      const response = await apiRequest("POST", "/api/tasks/parse", { input });
      return response.json();
    },
    onSuccess: (data: ParsedTask) => {
      setParsedTask(data);
      form.reset({
        name: data.name,
        assignee: data.assignee,
        dueDate: data.dueDate,
        priority: data.priority,
        status: "pending",
        description: data.description || "",
      });
    },
    onError: (error: Error) => {
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
      setInput("");
      setParsedTask(null);
      form.reset();
      toast({
        title: "Task Created Successfully",
        description: "Your task has been parsed and added to the board",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Creation Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (value: string) => {
    setInput(value);
    if (value.length > 10 && !parseTaskMutation.isPending) {
      const timeoutId = setTimeout(() => {
        setIsParsingPreview(true);
        parseTaskMutation.mutate(value);
      }, 1000);
      
      return () => clearTimeout(timeoutId);
    } else {
      setParsedTask(null);
      setIsParsingPreview(false);
    }
  };

  const handleCreateTask = () => {
    if (parsedTask) {
      const taskData = form.getValues();
      createTaskMutation.mutate(taskData);
    }
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
          <h2 className="text-lg font-semibold text-slate-800 mb-2">Add New Task</h2>
          <p className="text-sm text-slate-500">
            Type your task in natural language. For example: "Call client John tomorrow 3pm" or "Review proposal Sarah by Friday P1"
          </p>
        </div>
        
        <div className="relative">
          <Textarea
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            className="min-h-[100px] p-4 resize-none text-base placeholder-slate-400"
            placeholder="Enter your task in natural language..."
          />
          <div className="absolute bottom-4 right-4 flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <Sparkles className="h-3 w-3" />
              <span>AI Parsing</span>
            </div>
            <Button
              onClick={handleCreateTask}
              disabled={!parsedTask || createTaskMutation.isPending}
              className="bg-primary hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
        </div>

        {/* Parse Preview */}
        {parsedTask && (
          <div className="mt-4 p-4 bg-slate-50 rounded-lg border-l-4 border-primary">
            <h3 className="text-sm font-medium text-slate-700 mb-2 flex items-center">
              <Eye className="h-4 w-4 mr-2" />
              Parsed Task Preview
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-slate-500">Task:</span>
                <span className="ml-2 font-medium text-slate-800">{parsedTask.name}</span>
              </div>
              <div>
                <span className="text-slate-500">Assignee:</span>
                <span className="ml-2 font-medium text-slate-800">{parsedTask.assignee}</span>
              </div>
              <div>
                <span className="text-slate-500">Due:</span>
                <span className="ml-2 font-medium text-slate-800">
                  {new Date(parsedTask.dueDate).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Priority:</span>
                <Badge className={`ml-2 ${getPriorityColor(parsedTask.priority)}`}>
                  {parsedTask.priority}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {parseTaskMutation.isPending && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
            <div className="flex items-center text-blue-700">
              <Sparkles className="h-4 w-4 mr-2 animate-spin" />
              <span className="text-sm">AI is parsing your task...</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
