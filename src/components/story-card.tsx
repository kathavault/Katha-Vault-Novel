
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Eye, BookOpen, Star } from 'lucide-react';

interface StoryCardProps {
  id: string;
  title: string;
  author: string;
  genres: string[];
  snippet: string;
  coverImageUrl?: string;
  aiHint?: string;
  views?: number;
  chapters?: number;
  rating?: number;
  isTrending?: boolean;
}

export function StoryCard({
  id,
  title,
  author,
  genres,
  snippet,
  coverImageUrl,
  aiHint = "book story",
  views,
  chapters,
  rating,
  isTrending
}: StoryCardProps) {
  const placeholderUrl = `https://placehold.co/480x680.png?text=${encodeURIComponent(title.substring(0,10))}`; // 12:17 ratio
  return (
    <Card className="relative flex flex-col overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl bg-card border-border h-full">
      {isTrending && (
        <Badge
          variant="default"
          className="absolute top-3 right-3 text-xs px-2 py-1 z-10"
          style={{ backgroundColor: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
        >
          TRENDING
        </Badge>
      )}
      <CardHeader className="p-4">

          <Link href={`/story/${id}`} passHref className="block">
            {/* Changed: Removed h-48, added aspect-[12/17] */}
            <div className="relative w-full aspect-[12/17] mb-4 rounded-lg overflow-hidden cursor-pointer">
              <Image
                src={coverImageUrl || placeholderUrl}
                alt={title}
                layout="fill"
                objectFit="cover"
                data-ai-hint={aiHint}
                className="rounded-lg"
                sizes="(max-width: 640px) 90vw, (max-width: 768px) 45vw, (max-width: 1024px) 30vw, 25vw" // Adjusted sizes for potentially taller cards
              />
            </div>
          </Link>

        <Link href={`/story/${id}`} className="hover:text-primary transition-colors">
          <CardTitle className="font-headline text-xl md:text-2xl text-primary-foreground hover:text-primary line-clamp-2">{title}</CardTitle>
        </Link>
        <CardDescription className="font-body text-sm text-muted-foreground">
          By {author}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow p-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          {genres.map((genre, index) => (
            <Badge key={index} variant="secondary" className="text-xs">{genre}</Badge>
          ))}
        </div>
        <p className="font-body text-sm text-foreground/80 line-clamp-3 flex-grow">{snippet}</p>

        {(rating !== undefined || views !== undefined) && (
          <div className="flex items-center space-x-1 text-xs text-muted-foreground pt-2">
            {rating !== undefined && rating > 0 && (
              <span className="flex items-center">
                <Star className="h-4 w-4 mr-1 text-yellow-500 fill-yellow-400" />
                {rating.toFixed(1)}
              </span>
            )}
            {rating !== undefined && rating > 0 && views !== undefined && views > 0 && (
              <span className="px-1 opacity-60">•</span>
            )}
            {views !== undefined && views > 0 && (
              <span className="flex items-center">
                <Eye className="h-4 w-4 mr-1 text-primary/80" />
                {(views / 1000).toFixed(1)}K
              </span>
            )}
          </div>
        )}
        {chapters !== undefined && (
          <div className="text-xs text-muted-foreground pt-1">
            <span className="flex items-center">
              <BookOpen className="h-4 w-4 mr-1 text-primary/80" /> {chapters} {chapters === 1 ? 'chapter' : 'chapters'}
            </span>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 mt-auto">
        <Button asChild variant="link" className="text-primary hover:text-primary/80 p-0 text-sm">
          <Link href={`/story/${id}`} className="flex items-center">
            Read Story <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
