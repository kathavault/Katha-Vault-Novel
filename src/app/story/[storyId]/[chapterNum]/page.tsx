
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getNovelsFromStorage, type Novel, type Chapter } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

const ChapterReadingPage = () => {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const storyId = typeof params.storyId === 'string' ? params.storyId : '';
  const chapterNumParam = typeof params.chapterNum === 'string' ? params.chapterNum : '';
  const currentChapterIndex = parseInt(chapterNumParam, 10) - 1; // 0-indexed

  const [novel, setNovel] = useState<Novel | null>(null);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [chapterComments, setChapterComments] = useState<string[]>([]);

  useEffect(() => {
    if (storyId) {
      const allNovels = getNovelsFromStorage();
      const foundNovel = allNovels.find(n => n.id === storyId);
      setNovel(foundNovel || null);
      if (foundNovel && !isNaN(currentChapterIndex) && currentChapterIndex >= 0 && currentChapterIndex < foundNovel.chapters.length) {
        setCurrentChapter(foundNovel.chapters[currentChapterIndex]);
        // Simulate fetching comments for the current chapter
        setChapterComments([
            `Insightful comment on ${foundNovel.chapters[currentChapterIndex].title}!`,
            `I really enjoyed reading ${foundNovel.chapters[currentChapterIndex].title}. What happens next?`,
        ]);
      } else {
        setCurrentChapter(null);
      }
    }
    setIsLoading(false);
  }, [storyId, currentChapterIndex]);

  const handlePostComment = () => {
    if (!commentText.trim()) {
      toast({ title: "Empty Comment", description: "Cannot post an empty comment.", variant: "destructive" });
      return;
    }
    setChapterComments(prev => [...prev, commentText]);
    setCommentText("");
    toast({ title: "Comment Posted!", description: "Your comment has been added (simulated)." });
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen"><p>Loading chapter...</p></div>;
  }

  if (!novel || !currentChapter) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <h1 className="text-4xl font-bold mb-4">Chapter Not Found</h1>
        <p className="text-muted-foreground mb-6">This chapter does not exist or is unavailable.</p>
        <Button onClick={() => router.push(storyId ? `/story/${storyId}` : '/library')}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Story Details
        </Button>
      </div>
    );
  }

  const totalChapters = novel.chapters.length;
  const currentChapterNumberForDisplay = currentChapterIndex + 1;

  return (
    <div className="container mx-auto px-2 py-8 space-y-8">
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={() => router.push(`/story/${storyId}`)}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Story Details
        </Button>
        <h1 className="text-3xl md:text-4xl font-headline text-primary text-center truncate max-w-xl">
          {novel.title} - {currentChapter.title || `Chapter ${currentChapterNumberForDisplay}`}
        </h1>
        <div className="w-[180px] sm:w-[200px] flex-shrink-0"> {/* Spacer, adjusted for longer button text */} </div>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle className="font-body text-2xl text-foreground">{currentChapter.title || `Chapter ${currentChapterNumberForDisplay}`}</CardTitle>
        </CardHeader>
        <CardContent className="p-6 md:p-8">
          <article className="prose prose-lg dark:prose-invert max-w-none font-body text-foreground/90 leading-relaxed whitespace-pre-line">
            {currentChapter.content || "No content available for this chapter."}
          </article>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center mt-8">
        {currentChapterIndex > 0 ? (
          <Button asChild variant="outline">
            <Link href={`/story/${storyId}/${currentChapterIndex}`}> {/* Link to index+1 which is chapterNum */}
              <ChevronLeft className="mr-2 h-4 w-4" /> Previous Chapter
            </Link>
          </Button>
        ) : <div className="w-[150px]" />}  {/* Spacer to balance Next button */}
        {currentChapterIndex < totalChapters - 1 ? (
          <Button asChild>
            <Link href={`/story/${storyId}/${currentChapterIndex + 2}`}> {/* Link to index+1 which is chapterNum */}
              Next Chapter <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        ) : <div className="w-[150px]" />} {/* Spacer to balance Prev button */}
      </div>

      <Card className="mt-10">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary flex items-center">
            <MessageSquare className="mr-3 h-6 w-6"/> Chapter Comments
          </CardTitle>
          <CardDescription>Share your thoughts on {currentChapter.title || `Chapter ${currentChapterNumberForDisplay}`}.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {chapterComments.map((comment, index) => (
              <div key={index} className="p-3 bg-muted/50 rounded-md text-sm">
                <p className="font-semibold text-xs text-muted-foreground mb-0.5">User {index + 1} says:</p>
                {comment}
              </div>
            ))}
            {chapterComments.length === 0 && <p className="text-sm text-muted-foreground">No comments yet for this chapter.</p>}
          </div>
          <div className="space-y-2">
            <Textarea
              placeholder={`Write your comment for ${currentChapter.title || `Chapter ${currentChapterNumberForDisplay}`}...`}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              rows={3}
              className="font-body"
            />
            <Button onClick={handlePostComment}>Post Comment</Button>
          </div>
        </CardContent>
      </Card>

    </div>
  );
};

export default ChapterReadingPage;

    