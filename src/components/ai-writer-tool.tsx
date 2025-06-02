"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Loader2 } from 'lucide-react';

// Import AI flow functions
import { improveStoryDraft, type ImproveStoryDraftInput, type ImproveStoryDraftOutput } from '@/ai/flows/improve-story-draft';
import { generateStoryTitles, type GenerateStoryTitlesInput, type GenerateStoryTitlesOutput } from '@/ai/flows/generate-story-titles';
import { generateStoryIdeas, type GenerateStoryIdeasInput, type GenerateStoryIdeasOutput } from '@/ai/flows/generate-story-ideas';

export function AIWriterTool() {
  const { toast } = useToast();

  // State for Improve Story Draft
  const [draft, setDraft] = useState("");
  const [improvedDraft, setImprovedDraft] = useState("");
  const [isImproving, setIsImproving] = useState(false);

  // State for Generate Story Titles
  const [storyDescription, setStoryDescription] = useState("");
  const [generatedTitles, setGeneratedTitles] = useState<string[]>([]);
  const [isGeneratingTitles, setIsGeneratingTitles] = useState(false);

  // State for Generate Story Ideas
  const [theme, setTheme] = useState("");
  const [genre, setGenre] = useState("");
  const [keywords, setKeywords] = useState("");
  const [generatedIdeas, setGeneratedIdeas] = useState<string[]>([]);
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);

  const handleImproveDraft = async () => {
    if (!draft.trim()) {
      toast({ title: "Input Error", description: "Please enter a story draft.", variant: "destructive" });
      return;
    }
    setIsImproving(true);
    setImprovedDraft("");
    try {
      const input: ImproveStoryDraftInput = { storyDraft: draft };
      const result: ImproveStoryDraftOutput = await improveStoryDraft(input);
      setImprovedDraft(result.improvedStoryDraft);
      toast({ title: "Draft Improved!", description: "AI suggestions applied." });
    } catch (error) {
      console.error("Error improving draft:", error);
      toast({ title: "Error", description: "Could not improve draft. Please try again.", variant: "destructive" });
    } finally {
      setIsImproving(false);
    }
  };

  const handleGenerateTitles = async () => {
    if (!storyDescription.trim()) {
      toast({ title: "Input Error", description: "Please enter a story description.", variant: "destructive" });
      return;
    }
    setIsGeneratingTitles(true);
    setGeneratedTitles([]);
    try {
      const input: GenerateStoryTitlesInput = { storyDescription };
      const result: GenerateStoryTitlesOutput = await generateStoryTitles(input);
      setGeneratedTitles(result.titles);
      toast({ title: "Titles Generated!", description: "Here are some catchy titles." });
    } catch (error) {
      console.error("Error generating titles:", error);
      toast({ title: "Error", description: "Could not generate titles. Please try again.", variant: "destructive" });
    } finally {
      setIsGeneratingTitles(false);
    }
  };

  const handleGenerateIdeas = async () => {
    if (!theme.trim() || !genre.trim() || !keywords.trim()) {
      toast({ title: "Input Error", description: "Please fill in theme, genre, and keywords.", variant: "destructive" });
      return;
    }
    setIsGeneratingIdeas(true);
    setGeneratedIdeas([]);
    try {
      const input: GenerateStoryIdeasInput = { theme, genre, keywords };
      const result: GenerateStoryIdeasOutput = await generateStoryIdeas(input);
      setGeneratedIdeas(result.storyIdeas);
      toast({ title: "Ideas Generated!", description: "Fresh story ideas for you." });
    } catch (error) {
      console.error("Error generating ideas:", error);
      toast({ title: "Error", description: "Could not generate ideas. Please try again.", variant: "destructive" });
    } finally {
      setIsGeneratingIdeas(false);
    }
  };

  return (
    <Tabs defaultValue="improve-draft" className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-6">
        <TabsTrigger value="improve-draft">Improve Draft</TabsTrigger>
        <TabsTrigger value="generate-titles">Generate Titles</TabsTrigger>
        <TabsTrigger value="generate-ideas">Generate Ideas</TabsTrigger>
      </TabsList>

      {/* Improve Draft Tab */}
      <TabsContent value="improve-draft">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl text-primary">Improve Your Story Draft</CardTitle>
            <CardDescription className="font-body">
              Get AI-powered suggestions for grammar, style, and clarity.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Paste your story draft here..."
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="min-h-[200px] font-body"
              disabled={isImproving}
            />
            <Button onClick={handleImproveDraft} disabled={isImproving} className="w-full">
              {isImproving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Improve Draft
            </Button>
            {improvedDraft && (
              <div className="mt-4 p-4 border rounded-md bg-muted">
                <h3 className="font-headline text-lg mb-2 text-primary">Improved Version:</h3>
                <p className="font-body whitespace-pre-wrap">{improvedDraft}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Generate Titles Tab */}
      <TabsContent value="generate-titles">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl text-primary">Generate Catchy Story Titles</CardTitle>
            <CardDescription className="font-body">
              Need a title? Describe your story, and let AI suggest some creative options.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Enter a short description of your story..."
              value={storyDescription}
              onChange={(e) => setStoryDescription(e.target.value)}
              className="min-h-[100px] font-body"
              disabled={isGeneratingTitles}
            />
            <Button onClick={handleGenerateTitles} disabled={isGeneratingTitles} className="w-full">
              {isGeneratingTitles ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Generate Titles
            </Button>
            {generatedTitles.length > 0 && (
              <div className="mt-4 p-4 border rounded-md bg-muted">
                <h3 className="font-headline text-lg mb-2 text-primary">Suggested Titles:</h3>
                <ul className="list-disc list-inside space-y-1 font-body">
                  {generatedTitles.map((title, index) => (
                    <li key={index}>{title}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Generate Ideas Tab */}
      <TabsContent value="generate-ideas">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl text-primary">Spark New Story Ideas</CardTitle>
            <CardDescription className="font-body">
              Tell the AI your preferred theme, genre, and keywords to get story inspiration.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Theme (e.g., love, revenge, adventure)"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              disabled={isGeneratingIdeas}
              className="font-body"
            />
            <Input
              placeholder="Genre (e.g., science fiction, fantasy, thriller)"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              disabled={isGeneratingIdeas}
              className="font-body"
            />
            <Input
              placeholder="Keywords (comma-separated, e.g., magic, dragon, quest)"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              disabled={isGeneratingIdeas}
              className="font-body"
            />
            <Button onClick={handleGenerateIdeas} disabled={isGeneratingIdeas} className="w-full">
             {isGeneratingIdeas ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Generate Ideas
            </Button>
            {generatedIdeas.length > 0 && (
              <div className="mt-4 p-4 border rounded-md bg-muted">
                <h3 className="font-headline text-lg mb-2 text-primary">Story Ideas:</h3>
                <ul className="list-disc list-inside space-y-1 font-body">
                  {generatedIdeas.map((idea, index) => (
                    <li key={index}>{idea}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
