
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getNovelsFromStorage, type Novel } from '@/lib/mock-data';
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
  const currentChapterNumber = parseInt(chapterNumParam, 10);

  const [novel, setNovel] = useState<Novel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [chapterComments, setChapterComments] = useState<string[]>([]); // Simulated comments

  useEffect(() => {
    if (storyId) {
      const allNovels = getNovelsFromStorage();
      const foundNovel = allNovels.find(n => n.id === storyId);
      setNovel(foundNovel || null);
    }
    setIsLoading(false);
  }, [storyId]);

  useEffect(() => {
    // Simulate fetching comments for the current chapter
    if (novel && !isNaN(currentChapterNumber)) {
        // In a real app, you'd fetch comments for storyId and currentChapterNumber
        setChapterComments([
            `This is a insightful comment on Chapter ${currentChapterNumber}!`,
            `I really enjoyed reading Chapter ${currentChapterNumber}. What happens next?`,
        ]);
    }
  }, [novel, currentChapterNumber]);


  const handlePostComment = () => {
    if (!commentText.trim()) {
      toast({ title: "Empty Comment", description: "Cannot post an empty comment.", variant: "destructive" });
      return;
    }
    // Simulate posting comment
    setChapterComments(prev => [...prev, commentText]);
    setCommentText("");
    toast({ title: "Comment Posted!", description: "Your comment has been added (simulated)." });
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen"><p>Loading chapter...</p></div>;
  }

  if (!novel || isNaN(currentChapterNumber) || currentChapterNumber < 1 || currentChapterNumber > (novel.chapters || 0)) {
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

  const totalChapters = novel.chapters || 1;

  const placeholderChapterContent = `
    This is placeholder content for Chapter ${currentChapterNumber} of "${novel.title}".

    In a real application, this section would be filled with the actual text of the chapter.
    Imagine an engaging narrative unfolding here, with rich descriptions, dialogues, and plot developments
    that keep the reader hooked.

    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
    Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
    Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

    Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam,
    eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
    Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
    Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.

    The story continues, drawing the reader deeper into its world...
  `;

  return (
    <div className="container mx-auto px-2 py-8 space-y-8">
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={() => router.push(`/story/${storyId}`)}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Story Details
        </Button>
        <h1 className="text-3xl md:text-4xl font-headline text-primary text-center">
          {novel.title} - Chapter {currentChapterNumber}
        </h1>
        <div className="w-[150px]"> {/* Spacer */} </div>
      </div>
      

      <Card className="shadow-lg">
        <CardContent className="p-6 md:p-8">
          <article className="prose prose-lg dark:prose-invert max-w-none font-body text-foreground/90 leading-relaxed whitespace-pre-line">
            {placeholderChapterContent}
          </article>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center mt-8">
        {currentChapterNumber > 1 ? (
          <Button asChild variant="outline">
            <Link href={`/story/${storyId}/${currentChapterNumber - 1}`}>
              <ChevronLeft className="mr-2 h-4 w-4" /> Previous Chapter
            </Link>
          </Button>
        ) : <div />} 
        {currentChapterNumber < totalChapters ? (
          <Button asChild>
            <Link href={`/story/${storyId}/${currentChapterNumber + 1}`}>
              Next Chapter <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        ) : <div />}
      </div>

      <Card className="mt-10">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary flex items-center">
            <MessageSquare className="mr-3 h-6 w-6"/> Chapter Comments
          </CardTitle>
          <CardDescription>Share your thoughts on Chapter {currentChapterNumber}.</CardDescription>
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
              placeholder={`Write your comment for Chapter ${currentChapterNumber}...`}
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
