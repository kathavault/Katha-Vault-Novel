
"use client";

import { useState, useEffect, type FormEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getAboutUsContent, saveAboutUsContent, type AboutPageContent } from '@/lib/mock-data';
import { Save, ChevronLeft, Info, Loader2 } from 'lucide-react';
import Link from 'next/link';

const defaultContent: AboutPageContent = {
  headerTitle: "Welcome to Katha Vault",
  headerSubtitle: "Where every story finds its voice, and every reader discovers a new world.",
  headerParagraph: "Katha Vault is a vibrant sanctuary dedicated to the art of storytelling. We are a platform built for authors to weave their original tales, from sweeping novels to captivating short stories, and for readers to immerse themselves in an ever-expanding universe of narratives. Our core belief is in the boundless power of stories to connect, inspire, and transform.",
  missionTitle: "Our Mission",
  missionParagraph: "At Katha Vault, we are driven by a singular, passionate mission: to cultivate a nurturing and dynamic space where writers can confidently share their original novels and narratives with a global audience. We strive to connect readers with a diverse tapestry of voices and genres, fostering a community where imagination thrives, creativity is celebrated, and the magic of storytelling unites us all in shared wonder.",
  visionariesTitle: "Meet Our Visionaries",
  visionariesSubtitle: "The driving force behind Katha Vault's narrative dream.",
  vikasName: "Vikas Kumar",
  vikasRole: "Founder & Owner",
  vikasBio: "Vikas is the architect of Katha Vault, driven by a profound love for stories and a vision to create a haven for storytellers and readers. With his passion for technology and a deep respect for the narrative arts, he laid the groundwork for a platform where every story, big or small, can find its stage and connect hearts across the globe.",
  vikasImageHint: "male portrait professional",
  kritikaName: "Kritika",
  kritikaRole: "Founder, Owner & CEO",
  kritikaBio: "Kritika leads Katha Vault with strategic insight and an unwavering commitment to nurturing a vibrant and supportive community. Her dedication to empowering authors in sharing their unique novels and delighting readers with endless discovery fuels the platform's continuous growth and its mission to celebrate the storyteller in everyone.",
  kritikaImageHint: "female portrait professional",
  journeyTitle: "Embark on Your Storytelling Journey",
  journeyParagraph: "Whether you're here to pen your next bestseller, discover your new favorite novel, or simply connect with fellow story enthusiasts, we're thrilled to welcome you to the Katha Vault family. Let's build a universe of unforgettable stories, together!"
};

export default function AboutUsEditorPage() {
  const { toast } = useToast();
  const [content, setContent] = useState<AboutPageContent>(defaultContent);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setContent(getAboutUsContent());
    setIsLoading(false);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContent(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    saveAboutUsContent(content);
    toast({
      title: "Content Saved!",
      description: "The 'About Us' page content has been updated.",
    });
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary"/> Loading editor...</div>;
  }

  return (
    <div className="space-y-8">
      <Button asChild variant="outline" className="mb-6 self-start">
        <Link href="/admin"><ChevronLeft className="mr-2 h-4 w-4" />Back to Admin Panel</Link>
      </Button>
      <header className="text-center space-y-2">
        <Info className="mx-auto h-16 w-16 text-primary" />
        <h1 className="text-4xl font-headline tracking-tight text-primary">Edit "About Us" Page</h1>
        <p className="text-xl text-foreground font-body font-semibold">
          Modify the content displayed on your public "About Us" page.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="font-headline text-2xl text-primary">Header Section</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label htmlFor="headerTitle">Title</Label><Input id="headerTitle" name="headerTitle" value={content.headerTitle} onChange={handleChange} /></div>
            <div><Label htmlFor="headerSubtitle">Subtitle</Label><Textarea id="headerSubtitle" name="headerSubtitle" value={content.headerSubtitle} onChange={handleChange} rows={2}/></div>
            <div><Label htmlFor="headerParagraph">Main Paragraph</Label><Textarea id="headerParagraph" name="headerParagraph" value={content.headerParagraph} onChange={handleChange} rows={3}/></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="font-headline text-2xl text-primary">Mission Section</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label htmlFor="missionTitle">Mission Title</Label><Input id="missionTitle" name="missionTitle" value={content.missionTitle} onChange={handleChange} /></div>
            <div><Label htmlFor="missionParagraph">Mission Paragraph</Label><Textarea id="missionParagraph" name="missionParagraph" value={content.missionParagraph} onChange={handleChange} rows={4}/></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="font-headline text-2xl text-primary">Visionaries Section</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label htmlFor="visionariesTitle">Section Title</Label><Input id="visionariesTitle" name="visionariesTitle" value={content.visionariesTitle} onChange={handleChange} /></div>
            <div><Label htmlFor="visionariesSubtitle">Section Subtitle</Label><Input id="visionariesSubtitle" name="visionariesSubtitle" value={content.visionariesSubtitle} onChange={handleChange} /></div>
            
            <h3 className="font-semibold text-lg pt-2">Vikas Kumar</h3>
            <div><Label htmlFor="vikasName">Display Name</Label><Input id="vikasName" name="vikasName" value={content.vikasName} onChange={handleChange} /></div>
            <div><Label htmlFor="vikasRole">Role</Label><Input id="vikasRole" name="vikasRole" value={content.vikasRole} onChange={handleChange} /></div>
            <div><Label htmlFor="vikasBio">Bio</Label><Textarea id="vikasBio" name="vikasBio" value={content.vikasBio} onChange={handleChange} rows={3}/></div>
            <div><Label htmlFor="vikasImageHint">Image AI Hint (for placeholder)</Label><Input id="vikasImageHint" name="vikasImageHint" value={content.vikasImageHint} onChange={handleChange} /></div>

            <h3 className="font-semibold text-lg pt-2">Kritika</h3>
            <div><Label htmlFor="kritikaName">Display Name</Label><Input id="kritikaName" name="kritikaName" value={content.kritikaName} onChange={handleChange} /></div>
            <div><Label htmlFor="kritikaRole">Role</Label><Input id="kritikaRole" name="kritikaRole" value={content.kritikaRole} onChange={handleChange} /></div>
            <div><Label htmlFor="kritikaBio">Bio</Label><Textarea id="kritikaBio" name="kritikaBio" value={content.kritikaBio} onChange={handleChange} rows={3}/></div>
            <div><Label htmlFor="kritikaImageHint">Image AI Hint (for placeholder)</Label><Input id="kritikaImageHint" name="kritikaImageHint" value={content.kritikaImageHint} onChange={handleChange} /></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="font-headline text-2xl text-primary">Journey Section</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label htmlFor="journeyTitle">Section Title</Label><Input id="journeyTitle" name="journeyTitle" value={content.journeyTitle} onChange={handleChange} /></div>
            <div><Label htmlFor="journeyParagraph">Section Paragraph</Label><Textarea id="journeyParagraph" name="journeyParagraph" value={content.journeyParagraph} onChange={handleChange} rows={3}/></div>
            <CardDescription>Buttons in this section ("Become an Author", "Discover Stories") are static and not editable here.</CardDescription>
          </CardContent>
        </Card>

        <div className="pt-6 flex justify-end">
          <Button type="submit">
            <Save className="mr-2 h-5 w-5" /> Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
