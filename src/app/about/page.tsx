
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, BookHeart, Target, PenTool, Library, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAboutUsContent, type AboutPageContent } from '@/lib/mock-data';

export default function AboutPage() {
  const [content, setContent] = useState<AboutPageContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setContent(getAboutUsContent());
    setIsLoading(false);
  }, []);

  if (isLoading || !content) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <header className="text-center py-10 md:py-16 bg-gradient-to-br from-primary/15 via-background to-accent/15 rounded-lg shadow-inner">
        <div className="inline-flex items-center justify-center p-5 bg-primary rounded-full mb-8 shadow-xl">
          <BookHeart className="h-14 w-14 text-primary-foreground" />
        </div>
        <h1 className="text-4xl md:text-5xl font-headline tracking-tight font-bold text-primary mb-5">
          {content.headerTitle}
        </h1>
        <p className="max-w-3xl mx-auto text-lg md:text-xl text-foreground font-body font-semibold mb-4">
          {content.headerSubtitle}
        </p>
        <p className="max-w-2xl mx-auto text-md text-muted-foreground font-body">
          {content.headerParagraph}
        </p>
      </header>

      <Card className="shadow-xl transform hover:scale-[1.01] transition-transform duration-300 border-primary/30">
        <CardHeader className="items-center text-center pt-8">
          <Target className="h-12 w-12 text-primary mb-4" />
          <CardTitle className="text-3xl font-headline text-primary">{content.missionTitle}</CardTitle>
        </CardHeader>
        <CardContent className="pb-8">
          <p className="text-center text-lg text-foreground/90 font-body leading-relaxed max-w-2xl mx-auto">
            {content.missionParagraph}
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-xl transform hover:scale-[1.01] transition-transform duration-300 border-accent/30">
        <CardHeader className="items-center text-center pt-8">
          <Users className="h-12 w-12 text-accent mb-4" />
          <CardTitle className="text-3xl font-headline text-accent">{content.visionariesTitle}</CardTitle>
          <CardDescription className="font-body">{content.visionariesSubtitle}</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-8 pt-6 pb-8">
          <div className="flex flex-col items-center text-center p-6 bg-card-foreground/5 rounded-lg shadow-md border border-border/50">
            <Avatar className="h-32 w-32 mb-5 border-4 border-primary shadow-lg">
              <AvatarImage src="https://placehold.co/200x200.png" alt={content.vikasName} data-ai-hint={content.vikasImageHint} />
              <AvatarFallback>{content.vikasName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <h3 className="text-2xl font-semibold font-headline text-foreground">{content.vikasName}</h3>
            <p className="text-md text-primary font-medium">{content.vikasRole}</p>
            <p className="mt-4 text-sm text-muted-foreground font-body leading-relaxed">
              {content.vikasBio}
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-6 bg-card-foreground/5 rounded-lg shadow-md border border-border/50">
            <Avatar className="h-32 w-32 mb-5 border-4 border-accent shadow-lg">
              <AvatarImage src="https://placehold.co/200x200.png" alt={content.kritikaName} data-ai-hint={content.kritikaImageHint} />
              <AvatarFallback>{content.kritikaName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <h3 className="text-2xl font-semibold font-headline text-foreground">{content.kritikaName}</h3>
            <p className="text-md text-accent font-medium">{content.kritikaRole}</p>
            <p className="mt-4 text-sm text-muted-foreground font-body leading-relaxed">
              {content.kritikaBio}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="text-center shadow-xl transform hover:scale-[1.01] transition-transform duration-300 pt-8 pb-8">
        <CardHeader className="pt-0">
          <CardTitle className="text-2xl font-headline text-primary">{content.journeyTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg text-foreground/90 font-body mb-8">
            {content.journeyParagraph}
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 md:gap-6">
            <Button asChild size="lg" className="px-8 py-3 text-base font-medium">
              <Link href="/create">
                <PenTool className="mr-2 h-5 w-5" /> Become an Author
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="px-8 py-3 text-base font-medium">
              <Link href="/library">
                <Library className="mr-2 h-5 w-5" /> Discover Stories
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
