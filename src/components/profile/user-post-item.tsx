
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, MoreHorizontal } from 'lucide-react';

interface UserPostItemProps {
  id: string;
  text: string;
  timestamp: string;
  likes: number;
  comments: number;
}

export function UserPostItem({ text, timestamp, likes, comments }: UserPostItemProps) {
  return (
    <Card className="bg-card/50 hover:shadow-md transition-shadow">
      <CardContent className="p-4 space-y-2">
        <p className="font-body text-foreground/90 whitespace-pre-line">{text}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center text-xs text-muted-foreground p-4 pt-0">
        <span>{timestamp}</span>
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary p-1 h-auto">
            <Heart className="h-4 w-4 mr-1" /> {likes}
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary p-1 h-auto">
            <MessageCircle className="h-4 w-4 mr-1" /> {comments}
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary h-7 w-7">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
