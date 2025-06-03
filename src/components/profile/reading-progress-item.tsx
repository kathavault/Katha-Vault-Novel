
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';

interface ReadingProgressItemProps {
  id: string;
  title: string;
  progress: number;
  coverImageUrl: string;
  aiHint?: string;
}

export function ReadingProgressItem({ id, title, progress, coverImageUrl, aiHint = "book cover" }: ReadingProgressItemProps) {
  return (
    <Card className="flex flex-col sm:flex-row items-center overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="p-0 w-full sm:w-[100px] flex-shrink-0"> {/* Adjusted width for better ratio */}
        <div className="relative w-full h-auto aspect-[12/17]"> {/* Enforce 12:17 aspect ratio */}
          <Image
            src={coverImageUrl}
            alt={title}
            layout="fill"
            objectFit="cover"
            data-ai-hint={aiHint}
            className="rounded-l-lg sm:rounded-l-lg sm:rounded-r-none"
          />
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-3 flex-grow w-full sm:w-auto">
        <Link href={`/story/${id}`} className="hover:text-primary transition-colors">
          <CardTitle className="font-headline text-lg md:text-xl text-primary-foreground hover:text-primary line-clamp-2">{title}</CardTitle>
        </Link>
        <div>
          <p className="text-sm text-muted-foreground mb-1 font-body">{progress}% completed</p>
          <Progress value={progress} className="h-2" />
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={`/story/${id}`}>
            <BookOpen className="mr-2 h-4 w-4" /> Continue Reading
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
