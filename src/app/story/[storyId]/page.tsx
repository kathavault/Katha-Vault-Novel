
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getNovelsFromStorage, type Novel } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/hooks/use-toast";
import { Star, Share2, Facebook, Twitter, MessageCircle as WhatsAppIcon, Link2, BookOpen, ChevronLeft } from 'lucide-react'; // Using MessageCircle for WhatsApp

const StoryDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const storyId = typeof params.storyId === 'string' ? params.storyId : '';
  const [novel, setNovel] = useState<Novel | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (storyId) {
      const allNovels = getNovelsFromStorage();
      const foundNovel = allNovels.find(n => n.id === storyId);
      setNovel(foundNovel || null);
    }
    setIsLoading(false);
  }, [storyId]);

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const text = `Check out this story: ${novel?.title}`;
    let shareUrl = "";

    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text + " " + url)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(url)
          .then(() => toast({ title: "Link Copied!", description: "Story link copied to clipboard." }))
          .catch(() => toast({ title: "Copy Failed", description: "Could not copy link.", variant: "destructive" }));
        return; 
    }
    if (shareUrl) {
        window.open(shareUrl, '_blank', 'noopener,noreferrer');
    }
    toast({ title: "Shared!", description: `Story shared on ${platform} (simulated).` });
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen"><p>Loading story...</p></div>;
  }

  if (!novel) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <h1 className="text-4xl font-bold mb-4">Story Not Found</h1>
        <p className="text-muted-foreground mb-6">The story you are looking for does not exist or has been moved.</p>
        <Button onClick={() => router.push('/library')}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Library
        </Button>
      </div>
    );
  }

  const totalChapters = novel.chapters || 1;
  const chapterList = Array.from({ length: totalChapters }, (_, i) => i + 1);

  return (
    <div className="container mx-auto px-2 py-8 space-y-10">
      <Button variant="outline" onClick={() => router.back()} className="mb-6 self-start">
        <ChevronLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <header className="text-center space-y-2">
        <h1 className="text-4xl md:text-5xl font-headline tracking-tight text-primary">{novel.title}</h1>
        <p className="text-lg text-muted-foreground font-body">By {novel.author}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-1 flex flex-col items-center">
          <div className="w-full max-w-xs sm:max-w-sm md:max-w-full shadow-xl rounded-lg overflow-hidden mx-auto">
            <Image
              src={novel.coverImageUrl || `https://placehold.co/700x1020.png?text=${encodeURIComponent(novel.title.substring(0,15))}`}
              alt={novel.title}
              width={700}
              height={1020}
              className="object-cover w-full h-auto"
              data-ai-hint={novel.aiHint || "book cover"}
              priority
            />
          </div>
          <div className="mt-6 w-full max-w-xs sm:max-w-sm md:max-w-full text-center space-y-3">
            {novel.rating !== undefined && novel.rating > 0 && (
              <div className="flex items-center justify-center space-x-1 text-yellow-500">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className={`h-6 w-6 ${i < Math.round(novel.rating!) ? 'fill-current' : 'stroke-current'}`}
                  />
                ))}
                <span className="text-muted-foreground ml-2">({novel.rating.toFixed(1)})</span>
              </div>
            )}
             <div className="flex justify-center space-x-2 pt-2">
                <Button variant="outline" size="icon" onClick={() => handleShare('facebook')} title="Share on Facebook">
                    <Facebook className="h-5 w-5 text-[#1877F2]" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => handleShare('twitter')} title="Share on Twitter">
                    <Twitter className="h-5 w-5 text-[#1DA1F2]" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => handleShare('whatsapp')} title="Share on WhatsApp">
                    <WhatsAppIcon className="h-5 w-5 text-[#25D366]" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => handleShare('copy')} title="Copy Link">
                    <Link2 className="h-5 w-5" />
                </Button>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl text-primary">Story Synopsis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/90 font-body text-base leading-relaxed whitespace-pre-line">{novel.snippet}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {novel.genres.map((genre, index) => (
                  <Badge key={index} variant="secondary">{genre}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl text-primary">Chapters</CardTitle>
              <CardDescription>{totalChapters} {totalChapters === 1 ? 'chapter' : 'chapters'} available.</CardDescription>
            </CardHeader>
            <CardContent>
              {chapterList.length > 0 ? (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 -mr-2">
                  {chapterList.map((chapterNum) => (
                    <Link key={chapterNum} href={`/story/${storyId}/${chapterNum}`} passHref>
                      <div className="flex items-center p-3 bg-muted/50 hover:bg-muted rounded-lg transition-colors cursor-pointer space-x-3">
                        <div className="flex-shrink-0 h-[68px] w-[48px] relative rounded overflow-hidden">
                           <Image
                            src={novel.coverImageUrl || `https://placehold.co/48x68.png?text=C${chapterNum}`}
                            alt={`Chapter ${chapterNum} thumbnail`}
                            width={48}
                            height={68}
                            objectFit="cover"
                            data-ai-hint={novel.aiHint || "book chapter"}
                          />
                        </div>
                        <div className="flex-grow">
                          <h3 className="font-semibold text-foreground">Chapter {chapterNum}</h3>
                          <p className="text-xs text-muted-foreground">Read Chapter {chapterNum}</p>
                        </div>
                        <BookOpen className="h-5 w-5 text-primary flex-shrink-0" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No chapters available for this story yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StoryDetailPage;

