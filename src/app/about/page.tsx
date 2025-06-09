
"use client";

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, BookHeart, Target } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="space-y-12">
      <header className="text-center py-8 md:py-12 bg-gradient-to-r from-primary/10 via-background to-primary/10 rounded-lg shadow-inner">
        <div className="inline-flex items-center justify-center p-4 bg-primary rounded-full mb-6 shadow-lg">
          <BookHeart className="h-12 w-12 text-primary-foreground" />
        </div>
        <h1 className="text-4xl md:text-5xl font-headline tracking-tight font-bold text-primary mb-4">
          About Katha Vault
        </h1>
        <p className="max-w-3xl mx-auto text-lg md:text-xl text-foreground font-body font-semibold">
          Unveiling the Stories Within, Together.
        </p>
      </header>

      <Card className="shadow-lg transform hover:scale-[1.01] transition-transform duration-300">
        <CardHeader className="items-center text-center">
          <Target className="h-12 w-12 text-primary mb-3" />
          <CardTitle className="text-3xl font-headline text-primary">Our Mission</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-lg text-foreground/90 font-body leading-relaxed max-w-2xl mx-auto">
            At Katha Vault, we believe everyone has a story to tell, and every reader deserves to discover new worlds. 
            Our mission is to empower writers to share their voices and connect readers with a diverse universe of original narratives. 
            We're building a vibrant community where creativity flourishes, imagination knows no bounds, and the magic of storytelling 
            brings us all closer.
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-lg transform hover:scale-[1.01] transition-transform duration-300">
        <CardHeader className="items-center text-center">
          <Users className="h-12 w-12 text-primary mb-3" />
          <CardTitle className="text-3xl font-headline text-primary">Meet Our Visionaries</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-8 pt-4">
          <div className="flex flex-col items-center text-center p-6 bg-card-foreground/5 rounded-lg shadow-sm">
            <Avatar className="h-32 w-32 mb-4 border-4 border-primary shadow-md">
              <AvatarImage src="https://placehold.co/200x200.png" alt="Vikas Kumar" data-ai-hint="male portrait professional" />
              <AvatarFallback>VK</AvatarFallback>
            </Avatar>
            <h3 className="text-2xl font-semibold font-headline text-foreground">Vikas Kumar</h3>
            <p className="text-md text-primary font-medium">Founder & Owner</p>
            <p className="mt-3 text-sm text-muted-foreground font-body leading-relaxed">
              Vikas envisioned Katha Vault as a sanctuary for storytellers and readers alike. With a passion for technology and a deep appreciation for the art of narrative, he laid the foundation for a platform where creativity can thrive and connect people across the globe.
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-6 bg-card-foreground/5 rounded-lg shadow-sm">
            <Avatar className="h-32 w-32 mb-4 border-4 border-primary shadow-md">
              <AvatarImage src="https://placehold.co/200x200.png" alt="Kritika" data-ai-hint="female portrait professional" />
              <AvatarFallback>K</AvatarFallback>
            </Avatar>
            <h3 className="text-2xl font-semibold font-headline text-foreground">Kritika</h3>
            <p className="text-md text-primary font-medium">CEO</p>
            <p className="mt-3 text-sm text-muted-foreground font-body leading-relaxed">
              Kritika leads Katha Vault with a strategic vision and a commitment to fostering a supportive and engaging community. Her dedication to empowering authors and delighting readers drives the platform's continuous evolution and success.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="text-center shadow-lg transform hover:scale-[1.01] transition-transform duration-300">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-primary">Join Our Journey</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg text-foreground/90 font-body mb-6">
            Whether you're here to write, read, or simply connect, we're excited to have you as part of the Katha Vault family. 
            Let's build a world of stories together!
          </p>
          <div className="flex justify-center gap-4">
            <a href="/signup" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
              Become an Author
            </a>
            <a href="/library" className="inline-flex items-center justify-center px-6 py-3 border border-primary text-base font-medium rounded-md text-primary bg-transparent hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
              Discover Stories
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
