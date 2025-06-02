import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Heart, Eye, BookOpen, MessageSquare } from 'lucide-react';

interface StoryCardProps {
  id: string;
  title: string;
  author: string;
  genres: string[]; // Changed from genre: string
  snippet: string;
  coverImageUrl?: string;
  aiHint?: string;
  likes?: number;
  views?: number;
  chapters?: number; // Or use a more generic term like 'parts' or 'comments'
}

export function StoryCard({ 
  id, 
  title, 
  author, 
  genres, 
  snippet, 
  coverImageUrl, 
  aiHint = "book story",
  likes,
  views,
  chapters 
}: StoryCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl bg-card border-border">
      <CardHeader className="p-4">
        {coverImageUrl && (
          <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden">
            <Image 
              src={coverImageUrl} 
              alt={title} 
              layout="fill" 
              objectFit="cover" 
              data-ai-hint={aiHint}
              className="rounded-lg"
            />
          </div>
        )}
        <Link href={`/story/${id}`} className="hover:text-primary transition-colors">
          <CardTitle className="font-headline text-xl md:text-2xl text-primary-foreground hover:text-primary">{title}</CardTitle>
        </Link>
        <CardDescription className="font-body text-sm text-muted-foreground">
          By {author}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow p-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          {genres.map((genre, index) => (
            <Badge key={index} variant="default" className="text-xs">{genre}</Badge>
          ))}
        </div>
        <p className="font-body text-sm text-foreground/80 line-clamp-3">{snippet}</p>
        
        {(likes !== undefined || views !== undefined || chapters !== undefined) && (
          <div className="flex items-center space-x-4 text-xs text-muted-foreground pt-2">
            {likes !== undefined && (
              <span className="flex items-center">
                <Heart className="h-3.5 w-3.5 mr-1 text-primary/80" /> {likes.toLocaleString()}
              </span>
            )}
            {views !== undefined && (
              <span className="flex items-center">
                <Eye className="h-3.5 w-3.5 mr-1 text-primary/80" /> {views.toLocaleString()}
              </span>
            )}
            {chapters !== undefined && (
              <span className="flex items-center">
                <BookOpen className="h-3.5 w-3.5 mr-1 text-primary/80" /> {chapters} chapters
              </span>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4">
        <Button asChild variant="link" className="text-primary hover:text-primary/80 p-0 text-sm">
          <Link href={`/story/${id}`} className="flex items-center">
            Read More <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
