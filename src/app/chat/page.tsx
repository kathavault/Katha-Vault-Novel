import { MessageCircle } from 'lucide-react';

export default function ChatPage() {
  return (
    <div className="space-y-8 text-center">
      <MessageCircle className="mx-auto h-16 w-16 text-primary" />
      <h1 className="text-5xl font-headline tracking-tight text-primary">Chat / Direct Messages</h1>
      <p className="text-xl text-foreground font-body font-semibold">
        Connect with others. This feature is coming soon!
      </p>
    </div>
  );
}
