
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useEffect } from 'react';

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { Novel } from "@/lib/mock-data";

const novelFormSchema = z.object({
  id: z.string().optional(), // Optional for new novels, present for editing
  title: z.string().min(2, "Title must be at least 2 characters.").max(100, "Title too long."),
  author: z.string().min(2, "Author name must be at least 2 characters."),
  genres: z.string().min(1, "Please enter at least one genre."), // Comma-separated string
  snippet: z.string().min(10, "Snippet must be at least 10 characters."),
  coverImageUrl: z.string().url("Must be a valid URL.").optional().or(z.literal('')),
  aiHint: z.string().optional(),
  views: z.coerce.number().min(0, "Views must be non-negative.").optional(),
  chapters: z.coerce.number().int("Chapters must be a whole number.").min(1, "Must have at least 1 chapter.").optional(),
  rating: z.coerce.number().min(0, "Rating must be between 0 and 5.").max(5, "Rating must be between 0 and 5.").optional(),
  isTrending: z.boolean().optional(),
});

type NovelFormValues = z.infer<typeof novelFormSchema>;

interface NovelFormProps {
  initialData?: Novel | null;
  onSubmitForm: (data: Novel) => void;
  submitButtonText?: string;
  onCancel?: () => void;
}

export function NovelForm({ initialData, onSubmitForm, submitButtonText = "Submit Novel", onCancel }: NovelFormProps) {
  const { toast } = useToast();
  const form = useForm<NovelFormValues>({
    resolver: zodResolver(novelFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      author: initialData?.author || "",
      genres: initialData?.genres?.join(", ") || "",
      snippet: initialData?.snippet || "",
      coverImageUrl: initialData?.coverImageUrl || "",
      aiHint: initialData?.aiHint || "",
      views: initialData?.views || 0,
      chapters: initialData?.chapters || 1,
      rating: initialData?.rating || 0,
      isTrending: initialData?.isTrending || false,
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        ...initialData,
        genres: initialData.genres?.join(", ") || "",
        views: initialData.views ?? 0,
        chapters: initialData.chapters ?? 1,
        rating: initialData.rating ?? 0,
        isTrending: initialData.isTrending ?? false,
      });
    } else {
      form.reset({
        title: "",
        author: "",
        genres: "",
        snippet: "",
        coverImageUrl: "",
        aiHint: "",
        views: 0,
        chapters: 1,
        rating: 0,
        isTrending: false,
      });
    }
  }, [initialData, form]);

  function processSubmit(data: NovelFormValues) {
    const novelToSubmit: Novel = {
      id: initialData?.id || `novel-${Date.now()}`, // Generate new ID if not editing
      title: data.title,
      author: data.author,
      genres: data.genres.split(",").map(g => g.trim()).filter(g => g.length > 0),
      snippet: data.snippet,
      coverImageUrl: data.coverImageUrl || undefined, // Ensure empty string becomes undefined
      aiHint: data.aiHint || undefined,
      views: data.views,
      chapters: data.chapters,
      rating: data.rating,
      isTrending: data.isTrending,
    };
    onSubmitForm(novelToSubmit);
    toast({
      title: initialData ? "Novel Updated!" : "Novel Added!",
      description: `"${novelToSubmit.title}" has been saved.`,
    });
    if (!initialData) { // Reset form only if it was an "add" operation
        form.reset();
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(processSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl><Input placeholder="Novel Title" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="author"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Author</FormLabel>
              <FormControl><Input placeholder="Author Name" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="genres"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Genres</FormLabel>
              <FormControl><Input placeholder="Sci-Fi, Fantasy, Romance" {...field} /></FormControl>
              <FormDescription>Comma-separated list of genres.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="snippet"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Snippet</FormLabel>
              <FormControl><Textarea placeholder="A short summary of the novel..." {...field} rows={4} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="coverImageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cover Image URL</FormLabel>
              <FormControl><Input placeholder="https://example.com/cover.png" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="aiHint"
          render={({ field }) => (
            <FormItem>
              <FormLabel>AI Hint for Image</FormLabel>
              <FormControl><Input placeholder="e.g., space battle, dragon castle" {...field} /></FormControl>
              <FormDescription>Keywords for image generation (if applicable).</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
            control={form.control}
            name="views"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Views</FormLabel>
                <FormControl><Input type="number" placeholder="0" {...field} /></FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="chapters"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Chapters</FormLabel>
                <FormControl><Input type="number" placeholder="1" {...field} /></FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="rating"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Rating (0-5)</FormLabel>
                <FormControl><Input type="number" step="0.1" placeholder="0.0" {...field} /></FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
         <FormField
          control={form.control}
          name="isTrending"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Mark as Trending?</FormLabel>
                <FormDescription>
                  If checked, this novel might be highlighted on the homepage.
                </FormDescription>
              </div>
              <FormControl>
                <Input type="checkbox" checked={field.value} onChange={field.onChange} className="h-5 w-5"/>
              </FormControl>
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-3">
          {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>}
          <Button type="submit">{submitButtonText}</Button>
        </div>
      </form>
    </Form>
  );
}
