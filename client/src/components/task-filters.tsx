import { Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface TaskFiltersProps {
  priorityFilter: string;
  setPriorityFilter: (priority: string) => void;
  assigneeFilter: string;
  setAssigneeFilter: (assignee: string) => void;
  assignees: string[];
  taskStats: {
    total: number;
    completed: number;
    pending: number;
  };
}

export default function TaskFilters({
  priorityFilter,
  setPriorityFilter,
  assigneeFilter,
  setAssigneeFilter,
  assignees,
  taskStats,
}: TaskFiltersProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
      <div className="flex items-center space-x-4">
        <h2 className="text-xl font-semibold text-slate-800">Tasks</h2>
        <div className="flex items-center space-x-2">
          <Badge className="bg-primary text-white">{taskStats.total} Total</Badge>
          <Badge className="bg-green-100 text-green-800">{taskStats.completed} Completed</Badge>
          <Badge className="bg-orange-100 text-orange-800">{taskStats.pending} Pending</Badge>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Priorities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="P1">P1 - Critical</SelectItem>
            <SelectItem value="P2">P2 - High</SelectItem>
            <SelectItem value="P3">P3 - Medium</SelectItem>
            <SelectItem value="P4">P4 - Low</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Assignees" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Assignees</SelectItem>
            {assignees.map((assignee) => (
              <SelectItem key={assignee} value={assignee}>
                {assignee}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
