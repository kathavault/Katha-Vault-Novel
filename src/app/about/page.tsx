
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, BookHeart, Target, PenTool, Library } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AboutPage() {
  return (
    <div className="space-y-12">
      <header className="text-center py-10 md:py-16 bg-gradient-to-br from-primary/15 via-background to-accent/15 rounded-lg shadow-inner">
        <div className="inline-flex items-center justify-center p-5 bg-primary rounded-full mb-8 shadow-xl">
          <BookHeart className="h-14 w-14 text-primary-foreground" />
        </div>
        <h1 className="text-4xl md:text-5xl font-headline tracking-tight font-bold text-primary mb-5">
          Welcome to Katha Vault
        </h1>
        <p className="max-w-3xl mx-auto text-lg md:text-xl text-foreground font-body font-semibold mb-4">
          Where every story finds its voice, and every reader discovers a new world.
        </p>
        <p className="max-w-2xl mx-auto text-md text-muted-foreground font-body">
          Katha Vault is a vibrant sanctuary dedicated to the art of storytelling. We are a platform built for authors to weave their original tales, from sweeping novels to captivating short stories, and for readers to immerse themselves in an ever-expanding universe of narratives. Our core belief is in the boundless power of stories to connect, inspire, and transform.
        </p>
      </header>

      <Card className="shadow-xl transform hover:scale-[1.01] transition-transform duration-300 border-primary/30">
        <CardHeader className="items-center text-center pt-8">
          <Target className="h-12 w-12 text-primary mb-4" />
          <CardTitle className="text-3xl font-headline text-primary">Our Mission</CardTitle>
        </CardHeader>
        <CardContent className="pb-8">
          <p className="text-center text-lg text-foreground/90 font-body leading-relaxed max-w-2xl mx-auto">
            At Katha Vault, we are driven by a singular, passionate mission: to cultivate a nurturing and dynamic space where writers can confidently share their original novels and narratives with a global audience. We strive to connect readers with a diverse tapestry of voices and genres, fostering a community where imagination thrives, creativity is celebrated, and the magic of storytelling unites us all in shared wonder.
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-xl transform hover:scale-[1.01] transition-transform duration-300 border-accent/30">
        <CardHeader className="items-center text-center pt-8">
          <Users className="h-12 w-12 text-accent mb-4" />
          <CardTitle className="text-3xl font-headline text-accent">Meet Our Visionaries</CardTitle>
          <CardDescription className="font-body">The driving force behind Katha Vault's narrative dream.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-8 pt-6 pb-8">
          <div className="flex flex-col items-center text-center p-6 bg-card-foreground/5 rounded-lg shadow-md border border-border/50">
            <Avatar className="h-32 w-32 mb-5 border-4 border-primary shadow-lg">
              <AvatarImage src="https://placehold.co/200x200.png" alt="Vikas Kumar" data-ai-hint="male portrait professional" />
              <AvatarFallback>VK</AvatarFallback>
            </Avatar>
            <h3 className="text-2xl font-semibold font-headline text-foreground">Vikas Kumar</h3>
            <p className="text-md text-primary font-medium">Founder & Owner</p>
            <p className="mt-4 text-sm text-muted-foreground font-body leading-relaxed">
              Vikas is the architect of Katha Vault, driven by a profound love for stories and a vision to create a haven for storytellers and readers. With his passion for technology and a deep respect for the narrative arts, he laid the groundwork for a platform where every story, big or small, can find its stage and connect hearts across the globe.
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-6 bg-card-foreground/5 rounded-lg shadow-md border border-border/50">
            <Avatar className="h-32 w-32 mb-5 border-4 border-accent shadow-lg">
              <AvatarImage src="https://placehold.co/200x200.png" alt="Kritika" data-ai-hint="female portrait professional" />
              <AvatarFallback>K</AvatarFallback>
            </Avatar>
            <h3 className="text-2xl font-semibold font-headline text-foreground">Kritika</h3>
            <p className="text-md text-accent font-medium">Founder, Owner & CEO</p>
            <p className="mt-4 text-sm text-muted-foreground font-body leading-relaxed">
              Kritika leads Katha Vault with strategic insight and an unwavering commitment to nurturing a vibrant and supportive community. Her dedication to empowering authors in sharing their unique novels and delighting readers with endless discovery fuels the platform's continuous growth and its mission to celebrate the storyteller in everyone.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="text-center shadow-xl transform hover:scale-[1.01] transition-transform duration-300 pt-8 pb-8">
        <CardHeader className="pt-0">
          <CardTitle className="text-2xl font-headline text-primary">Embark on Your Storytelling Journey</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg text-foreground/90 font-body mb-8">
            Whether you're here to pen your next bestseller, discover your new favorite novel, or simply connect with fellow story enthusiasts, we're thrilled to welcome you to the Katha Vault family.
            Let's build a universe of unforgettable stories, together!
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
