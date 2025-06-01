import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Task } from "@shared/schema";
import TaskInput from "@/components/task-input";
import TaskBoard from "@/components/task-board";
import TaskFilters from "@/components/task-filters";
import MeetingTranscriptParser from "@/components/MeetingTranscriptParser";
import { Bell, Briefcase } from "lucide-react";

export default function TaskManager() {
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");

  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const filteredTasks = tasks.filter(task => {
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
    const matchesAssignee = assigneeFilter === "all" || task.assignee === assigneeFilter;
    return matchesPriority && matchesAssignee;
  });

  const uniqueAssignees = Array.from(new Set(tasks.map(task => task.assignee))).filter(Boolean);

  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(task => task.status === "completed").length,
    pending: tasks.filter(task => task.status !== "completed").length,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-blue-700 rounded-lg flex items-center justify-center">
                <Briefcase className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-slate-800">TaskFlow AI</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-slate-500 hover:text-slate-700 transition-colors">
                <Bell className="h-5 w-5" />
              </button>
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">JD</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TaskInput />
        
        <MeetingTranscriptParser />
        
        <TaskFilters
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
          assigneeFilter={assigneeFilter}
          setAssigneeFilter={setAssigneeFilter}
          assignees={uniqueAssignees}
          taskStats={taskStats}
        />

        <TaskBoard tasks={filteredTasks} isLoading={isLoading} />
      </div>
    </div>
  );
}
