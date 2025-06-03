
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getNovelsFromStorage, getAllUniqueGenres, getHomeSectionsConfig, saveHomeSectionsConfig, type Novel } from '@/lib/mock-data';
import { LayoutDashboard, ListChecks, Save, Trash2, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function HomePageLayoutSettingsPage() {
  const { toast } = useToast();
  const [allNovels, setAllNovels] = useState<Novel[]>([]);
  const [availableGenres, setAvailableGenres] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const novels = getNovelsFromStorage();
    setAllNovels(novels);
    setAvailableGenres(getAllUniqueGenres(novels));
    setSelectedGenres(getHomeSectionsConfig());
    setIsLoading(false);
  }, []);

  const handleGenreToggle = (genre: string) => {
    setSelectedGenres(prev =>
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  const handleSaveChanges = () => {
    saveHomeSectionsConfig(selectedGenres);
    toast({
      title: "Settings Saved!",
      description: "Home page genre sections have been updated.",
    });
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading settings...</div>;
  }

  return (
    <div className="space-y-8">
      <Button asChild variant="outline" className="mb-6 self-start">
        <Link href="/admin"><ChevronLeft className="mr-2 h-4 w-4" />Back to Admin Panel</Link>
      </Button>
      <header className="text-center space-y-2">
        <LayoutDashboard className="mx-auto h-16 w-16 text-primary" />
        <h1 className="text-4xl font-headline tracking-tight text-primary">Home Page Layout Settings</h1>
        <p className="text-xl text-foreground font-body font-semibold">
          Configure which genre sections appear on the home page.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary flex items-center">
            <ListChecks className="mr-3 h-6 w-6" /> Select Genres for Home Page Sections
          </CardTitle>
          <CardDescription>
            Choose which genres will have dedicated sections on the home page.
            Novels must be 'published' to appear.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {availableGenres.length === 0 ? (
            <p className="text-muted-foreground">No genres found in novels. Add novels with genres first.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {availableGenres.map(genre => (
                <div key={genre} className="flex items-center space-x-2 p-2 border rounded-md hover:bg-muted/50">
                  <Checkbox
                    id={`genre-${genre}`}
                    checked={selectedGenres.includes(genre)}
                    onCheckedChange={() => handleGenreToggle(genre)}
                  />
                  <Label htmlFor={`genre-${genre}`} className="font-medium text-sm cursor-pointer">
                    {genre}
                  </Label>
                </div>
              ))}
            </div>
          )}
           <div className="pt-6 flex justify-end">
            <Button onClick={handleSaveChanges} disabled={availableGenres.length === 0}>
              <Save className="mr-2 h-5 w-5" /> Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle className="font-headline text-lg text-primary">Current Home Page Sections</CardTitle>
            <CardDescription>These genres will be displayed as sections, in the order you select them (ordering not yet implemented, shows alphabetically).</CardDescription>
        </CardHeader>
        <CardContent>
            {selectedGenres.length > 0 ? (
                <ul className="list-disc list-inside space-y-1">
                    {selectedGenres.sort().map(genre => <li key={genre}>{genre}</li>)}
                </ul>
            ) : (
                <p className="text-muted-foreground">No genres selected to display on the home page.</p>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
