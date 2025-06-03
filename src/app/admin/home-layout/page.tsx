
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getNovelsFromStorage, getAllUniqueGenres, getHomeSectionsConfig, saveHomeSectionsConfig, type Novel, type HomeLayoutConfig } from '@/lib/mock-data';
import { LayoutDashboard, ListChecks, Save, ChevronLeft, PlusCircle, Library } from 'lucide-react';
import Link from 'next/link';

export default function HomePageLayoutSettingsPage() {
  const { toast } = useToast();
  const [allNovels, setAllNovels] = useState<Novel[]>([]);
  const [availableGenres, setAvailableGenres] = useState<string[]>([]);
  const [currentConfig, setCurrentConfig] = useState<HomeLayoutConfig>({ selectedGenres: [], showMoreNovelsSection: true });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const novels = getNovelsFromStorage();
    setAllNovels(novels);
    setAvailableGenres(getAllUniqueGenres(novels));
    setCurrentConfig(getHomeSectionsConfig());
    setIsLoading(false);
  }, []);

  const handleGenreToggle = (genre: string) => {
    setCurrentConfig(prev => ({
      ...prev,
      selectedGenres: prev.selectedGenres.includes(genre)
        ? prev.selectedGenres.filter(g => g !== genre)
        : [...prev.selectedGenres, genre]
    }));
  };

  const handleShowMoreNovelsToggle = (checked: boolean) => {
    setCurrentConfig(prev => ({
      ...prev,
      showMoreNovelsSection: checked
    }));
  };

  const handleSaveChanges = () => {
    saveHomeSectionsConfig(currentConfig);
    toast({
      title: "Settings Saved!",
      description: "Home page layout configuration has been updated.",
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
          Configure which genre sections and features appear on the home page.
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
                    checked={currentConfig.selectedGenres.includes(genre)}
                    onCheckedChange={() => handleGenreToggle(genre)}
                  />
                  <Label htmlFor={`genre-${genre}`} className="font-medium text-sm cursor-pointer">
                    {genre}
                  </Label>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle className="font-headline text-2xl text-primary flex items-center">
                <Library className="mr-3 h-6 w-6" /> 'More Novels' Section
            </CardTitle>
            <CardDescription>
                Toggle the visibility of the "More Novels" section at the bottom of the home page. 
                This section displays a mix of published novels not featured elsewhere.
            </CardDescription>
        </CardHeader>
        <CardContent>
             <div className="flex items-center space-x-2 p-2 border rounded-md hover:bg-muted/50">
                <Checkbox
                    id="showMoreNovels"
                    checked={currentConfig.showMoreNovelsSection}
                    onCheckedChange={(checked) => handleShowMoreNovelsToggle(checked as boolean)}
                />
                <Label htmlFor="showMoreNovels" className="font-medium text-sm cursor-pointer">
                    Show "More Novels" section on Home Page
                </Label>
            </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle className="font-headline text-lg text-primary">Current Home Page Configuration</CardTitle>
            <CardDescription>These settings define what's shown on your home page.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
            <div>
                <h4 className="font-semibold">Selected Genre Sections:</h4>
                {currentConfig.selectedGenres.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1">
                        {currentConfig.selectedGenres.sort().map(genre => <li key={genre}>{genre}</li>)}
                    </ul>
                ) : (
                    <p className="text-muted-foreground">No specific genre sections selected.</p>
                )}
            </div>
            <div>
                <h4 className="font-semibold">"More Novels" Section:</h4>
                 <p className={currentConfig.showMoreNovelsSection ? "text-green-500" : "text-red-500"}>
                    {currentConfig.showMoreNovelsSection ? "Enabled" : "Disabled"}
                </p>
            </div>
        </CardContent>
      </Card>
       <div className="pt-6 flex justify-end">
        <Button onClick={handleSaveChanges} disabled={availableGenres.length === 0 && !currentConfig.selectedGenres.length && !currentConfig.showMoreNovelsSection}>
          <Save className="mr-2 h-5 w-5" /> Save Changes
        </Button>
      </div>
    </div>
  );
}
