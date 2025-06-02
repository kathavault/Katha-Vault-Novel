
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MessageSquare, ThumbsUp, Eye, Edit2, Send } from 'lucide-react'; // Added Edit2, Send

interface FeedItemCardProps {
  id: string;
  postType: 'forum' | 'social'; // To differentiate styling or content slightly
  title?: string; // Optional, used for forum posts
  mainText: string; // Used for forum excerpt or social post text
  authorName: string;
  authorAvatarUrl?: string;
  authorInitials: string;
  timestamp: string;
  repliesOrCommentsCount: number;
  likesCount: number;
  viewsCount?: number; // Optional, for forum posts
  imageUrl?: string; // Optional for social posts with images
  aiHint?: string;
}

export function FeedItemCard({
  id,
  postType,
  title,
  mainText,
  authorName,
  authorAvatarUrl,
  authorInitials,
  timestamp,
  repliesOrCommentsCount,
  likesCount,
  viewsCount,
  imageUrl,
  aiHint = "feed image"
}: FeedItemCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3 mb-2">
          <Avatar className="h-10 w-10">
            <AvatarImage src={authorAvatarUrl} alt={authorName} data-ai-hint="person avatar" />
            <AvatarFallback>{authorInitials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold text-foreground">{authorName}</p>
            <CardDescription className="font-body text-xs text-muted-foreground">{timestamp}</CardDescription>
          </div>
        </div>
        {postType === 'forum' && title && (
          <Link href={`/forum/${id}`} className="hover:text-primary transition-colors">
            <CardTitle className="font-headline text-xl">{title}</CardTitle>
          </Link>
        )}
      </CardHeader>
      <CardContent className="pt-0 pb-3">
        <p className={`font-body text-foreground/90 ${postType === 'forum' ? 'line-clamp-3' : 'whitespace-pre-wrap'}`}>
          {mainText}
        </p>
        {postType === 'social' && imageUrl && (
          <div className="mt-3 rounded-lg overflow-hidden border border-border">
            <img src={imageUrl} alt="Post image" className="aspect-video w-full object-cover" data-ai-hint={aiHint} />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-muted-foreground text-sm pt-2">
        <div className="flex space-x-4 mb-2 sm:mb-0">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary p-1 h-auto">
            <ThumbsUp className="h-4 w-4 mr-1" /> {likesCount}
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary p-1 h-auto">
            <MessageSquare className="h-4 w-4 mr-1" /> {repliesOrCommentsCount}
          </Button>
          {postType === 'forum' && viewsCount !== undefined && (
            <span className="flex items-center p-1">
              <Eye className="h-4 w-4 mr-1" /> {viewsCount}
            </span>
          )}
        </div>
        {postType === 'forum' ? (
          <Button asChild variant="outline" size="sm">
            <Link href={`/forum/${id}`}>Join Discussion</Link>
          </Button>
        ) : (
           <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary p-1 h-auto">
             <Send className="h-4 w-4 mr-1" /> Share
           </Button>
        )}
      </CardFooter>
    </Card>
  );
}
