import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type Task } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import EditTaskDialog from "@/components/edit-task-dialog";
import { useToast } from "@/hooks/use-toast";
import { Edit2, Trash2, Briefcase } from "lucide-react";

interface TaskBoardProps {
  tasks: Task[];
  isLoading: boolean;
}

export default function TaskBoard({ tasks, isLoading }: TaskBoardProps) {
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Task> }) => {
      const response = await apiRequest("PATCH", `/api/tasks/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Task Updated",
        description: "Task has been successfully updated",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Task Deleted",
        description: "Task has been successfully deleted",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Delete Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleToggleComplete = (task: Task) => {
    const newStatus = task.status === "completed" ? "pending" : "completed";
    updateTaskMutation.mutate({
      id: task.id,
      updates: { status: newStatus },
    });
  };

  const handleDeleteTask = (id: number) => {
    if (confirm("Are you sure you want to delete this task?")) {
      deleteTaskMutation.mutate(id);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "in_progress": return "bg-orange-100 text-orange-800";
      case "pending": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDueDate = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      day: 'numeric',
      month: 'short',
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-800 mb-2">No tasks yet</h3>
          <p className="text-slate-500 mb-6">Add your first task using natural language above</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        {/* Desktop Table View */}
        <div className="hidden lg:block">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Task</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Assigned To</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Due Date/Time</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Priority</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Status</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr
                    key={task.id}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors group"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          checked={task.status === "completed"}
                          onCheckedChange={() => handleToggleComplete(task)}
                        />
                        <div>
                          <div
                            className={`font-medium text-slate-800 group-hover:text-primary cursor-pointer ${
                              task.status === "completed" ? "line-through opacity-60" : ""
                            }`}
                            onClick={() => setEditingTask(task)}
                          >
                            {task.name}
                          </div>
                          {task.description && (
                            <div className="text-sm text-slate-500">{task.description}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-sm font-medium">
                            {getInitials(task.assignee)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium text-slate-700">{task.assignee}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-slate-700">{formatDueDate(task.dueDate)}</div>
                      <div className="text-xs text-slate-500">
                        {task.status === "completed" ? "Completed" : 
                         new Date(task.dueDate) < new Date() ? "Overdue" : "Upcoming"}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                    </td>
                    <td className="py-4 px-6">
                      <Badge className={getStatusColor(task.status)}>
                        {task.status.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingTask(task)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden p-4 space-y-4">
          {tasks.map((task) => (
            <Card key={task.id} className="border border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={task.status === "completed"}
                      onCheckedChange={() => handleToggleComplete(task)}
                    />
                    <div>
                      <h3
                        className={`font-medium text-slate-800 ${
                          task.status === "completed" ? "line-through opacity-60" : ""
                        }`}
                      >
                        {task.name}
                      </h3>
                      {task.description && (
                        <p className="text-sm text-slate-500 mt-1">{task.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingTask(task)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-slate-500">Assigned to:</span>
                    <div className="flex items-center space-x-2 mt-1">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs font-medium">
                          {getInitials(task.assignee)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-slate-700">{task.assignee}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500">Due:</span>
                    <div className="mt-1 font-medium text-slate-700">{formatDueDate(task.dueDate)}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Priority:</span>
                    <Badge className={`mt-1 ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-slate-500">Status:</span>
                    <Badge className={`mt-1 ${getStatusColor(task.status)}`}>
                      {task.status.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Card>

      {editingTask && (
        <EditTaskDialog
          task={editingTask}
          open={!!editingTask}
          onOpenChange={(open) => !open && setEditingTask(null)}
        />
      )}
    </>
  );
}
