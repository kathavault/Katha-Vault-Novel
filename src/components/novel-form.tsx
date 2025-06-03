
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
  chapters: z.coerce.number().int("Chapters must be a whole number.").min(1, "Must have at least 1 chapter.").optional(),
  // views, rating, isTrending are no longer directly editable by admin
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
      chapters: initialData?.chapters || 1,
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        title: initialData.title || "",
        author: initialData.author || "",
        genres: initialData.genres?.join(", ") || "",
        snippet: initialData.snippet || "",
        coverImageUrl: initialData.coverImageUrl || "",
        aiHint: initialData.aiHint || "",
        chapters: initialData.chapters ?? 1,
      });
    } else {
      form.reset({
        title: "",
        author: "",
        genres: "",
        snippet: "",
        coverImageUrl: "",
        aiHint: "",
        chapters: 1,
      });
    }
  }, [initialData, form]);

  function processSubmit(data: NovelFormValues) {
    const novelToSubmit: Novel = {
      id: initialData?.id || `novel-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: data.title,
      author: data.author,
      genres: data.genres.split(",").map(g => g.trim()).filter(g => g.length > 0),
      snippet: data.snippet,
      coverImageUrl: data.coverImageUrl || undefined,
      aiHint: data.aiHint || undefined,
      chapters: data.chapters,
      views: initialData?.views || 0, // Preserve existing views or default to 0 for new
      rating: initialData?.rating || 0, // Preserve existing rating or default to 0 for new
      isTrending: initialData?.isTrending || false, // This will be dynamically recalculated by getNovelsFromStorage
    };
    onSubmitForm(novelToSubmit);
    toast({
      title: initialData ? "Novel Updated!" : "Novel Added!",
      description: `"${novelToSubmit.title}" has been saved.`,
    });
    if (!initialData) { 
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
        <div className="flex justify-end space-x-3">
          {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>}
          <Button type="submit">{submitButtonText}</Button>
        </div>
      </form>
    </Form>
  );
}
