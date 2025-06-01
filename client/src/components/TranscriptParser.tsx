import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ParsedTask {
  name: string;
  description?: string;
  assignee: string;
  dueDate: string;
  priority: string;
  status: string;
}

interface TranscriptParserProps {
  onTasksExtracted: (tasks: ParsedTask[]) => void;
}

export function TranscriptParser({ onTasksExtracted }: TranscriptParserProps) {
  const [transcript, setTranscript] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [parsedTasks, setParsedTasks] = useState<ParsedTask[]>([]);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleTranscriptParse = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/tasks/parse-transcript', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript }),
      });

      if (!response.ok) {
        throw new Error('Failed to parse transcript');
      }

      const tasks = await response.json();
      setParsedTasks(tasks);
    } catch (error) {
      console.error('Error parsing transcript:', error);
      toast({
        title: "Error",
        description: "Failed to parse the transcript. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTasks = () => {
    onTasksExtracted(parsedTasks);
    setTranscript('');
    setParsedTasks([]);
    setOpen(false);
    toast({
      title: "Success",
      description: `${parsedTasks.length} tasks have been added to your board.`
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Sparkles className="h-4 w-4" />
          Parse Meeting Minutes
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Meeting Minutes Parser</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Textarea
              placeholder="Paste your meeting transcript here..."
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              className="min-h-[200px] w-full p-4"
            />
            <Button
              onClick={handleTranscriptParse}
              disabled={!transcript.trim() || isLoading}
              className="w-full"
            >
              {isLoading ? 'Parsing...' : 'Extract Tasks'}
            </Button>
          </div>

          {parsedTasks.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium text-sm">Extracted Tasks:</h3>
              <div className="space-y-2">
                {parsedTasks.map((task, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{task.name}</h4>
                        {task.description && (
                          <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-sm text-gray-500">Assigned to:</span>
                          <span className="text-sm font-medium">{task.assignee}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-gray-500">Due:</span>
                          <span className="text-sm font-medium">{task.dueDate}</span>
                        </div>
                      </div>
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
              <Button onClick={handleAddTasks} className="w-full">
                Add {parsedTasks.length} Tasks to Board
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 