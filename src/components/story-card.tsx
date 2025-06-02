import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface StoryCardProps {
  id: string;
  title: string;
  author: string;
  genre: string;
  snippet: string;
  coverImageUrl?: string;
  aiHint?: string;
}

export function StoryCard({ id, title, author, genre, snippet, coverImageUrl, aiHint = "book story" }: StoryCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
      <CardHeader>
        {coverImageUrl && (
          <div className="relative w-full h-48 mb-4 rounded-t-lg overflow-hidden">
            <Image 
              src={coverImageUrl} 
              alt={title} 
              layout="fill" 
              objectFit="cover" 
              data-ai-hint={aiHint}
            />
          </div>
        )}
        <CardTitle className="font-headline text-2xl text-primary">{title}</CardTitle>
        <CardDescription className="font-body text-sm text-muted-foreground">
          By {author}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <Badge variant="secondary" className="mb-2">{genre}</Badge>
        <p className="font-body text-foreground/80 line-clamp-3">{snippet}</p>
      </CardContent>
      <CardFooter>
        <Button asChild variant="link" className="text-primary hover:text-primary/80 p-0">
          <Link href={`/story/${id}`} className="flex items-center">
            Read More <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
