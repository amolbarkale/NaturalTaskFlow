export interface ParsedTask {
  name: string;
  assignee: string;
  dueDate: string;
  priority: "P1" | "P2" | "P3" | "P4";
  description?: string;
}
