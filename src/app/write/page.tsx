import { AIWriterTool } from '@/components/ai-writer-tool';
import { Bot } from 'lucide-react'; // Using Bot icon for AI

export default function AIWriterPage() {
  return (
    <div className="space-y-8">
      <header className="text-center space-y-2">
        <Bot className="mx-auto h-16 w-16 text-primary" />
        <h1 className="text-5xl font-headline tracking-tight text-primary">AI Writing Assistant</h1>
        <p className="text-xl text-muted-foreground font-body">
          Enhance your stories with intelligent suggestions, grammar checks, and style improvements.
        </p>
      </header>
      
      <AIWriterTool />
    </div>
  );
}
