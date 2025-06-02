import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MessageSquare, ThumbsUp, Eye } from 'lucide-react';

interface ForumPostCardProps {
  id: string;
  title: string;
  authorName: string;
  authorAvatarUrl?: string;
  authorInitials: string;
  timestamp: string;
  excerpt: string;
  repliesCount: number;
  likesCount: number;
  viewsCount: number;
}

export function ForumPostCard({
  id,
  title,
  authorName,
  authorAvatarUrl,
  authorInitials,
  timestamp,
  excerpt,
  repliesCount,
  likesCount,
  viewsCount,
}: ForumPostCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <Link href={`/forum/${id}`} className="hover:text-primary transition-colors">
          <CardTitle className="font-headline text-2xl">{title}</CardTitle>
        </Link>
        <div className="flex items-center space-x-2 mt-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={authorAvatarUrl} alt={authorName} data-ai-hint="person avatar" />
            <AvatarFallback>{authorInitials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-foreground">{authorName}</p>
            <CardDescription className="font-body text-xs text-muted-foreground">{timestamp}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="font-body text-foreground/80 line-clamp-3">{excerpt}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center text-muted-foreground text-sm">
        <div className="flex space-x-4">
          <span className="flex items-center">
            <MessageSquare className="h-4 w-4 mr-1" /> {repliesCount}
          </span>
          <span className="flex items-center">
            <ThumbsUp className="h-4 w-4 mr-1" /> {likesCount}
          </span>
          <span className="flex items-center">
            <Eye className="h-4 w-4 mr-1" /> {viewsCount}
          </span>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={`/forum/${id}`}>Join Discussion</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
