
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useEffect, useState } from 'react';
import Image from 'next/image';

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

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];


const novelFormSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(2, "Title must be at least 2 characters.").max(100, "Title too long."),
  author: z.string().min(2, "Author name must be at least 2 characters."),
  genres: z.string().min(1, "Please enter at least one genre."),
  snippet: z.string().min(10, "Snippet must be at least 10 characters."),
  coverImageUrl: z.string().optional().or(z.literal('')), // Will store URL or Data URI
  aiHint: z.string().optional(),
  chapters: z.coerce.number().int("Chapters must be a whole number.").min(1, "Must have at least 1 chapter.").optional(),
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
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.coverImageUrl || null);

  const form = useForm<NovelFormValues>({
    resolver: zodResolver(novelFormSchema),
    defaultValues: {
      title: "",
      author: "",
      genres: "",
      snippet: "",
      coverImageUrl: "",
      aiHint: "",
      chapters: 1,
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
      setImagePreview(initialData.coverImageUrl || null);
    } else {
      form.reset({ // Reset for new novel form
        title: "",
        author: "",
        genres: "",
        snippet: "",
        coverImageUrl: "",
        aiHint: "",
        chapters: 1,
      });
      setImagePreview(null);
    }
  }, [initialData, form]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        form.setError("coverImageUrl", { message: "Image too large (max 5MB)." });
        toast({ title: "Image Error", description: "Selected image is too large (max 5MB).", variant: "destructive" });
        setImagePreview(initialData?.coverImageUrl || null); // Reset preview to initial or null
        form.setValue("coverImageUrl", initialData?.coverImageUrl || "");
        return;
      }
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        form.setError("coverImageUrl", { message: "Invalid image type." });
        toast({ title: "Image Error", description: "Invalid image type. Please use JPG, PNG, WEBP, or GIF.", variant: "destructive" });
        setImagePreview(initialData?.coverImageUrl || null);
        form.setValue("coverImageUrl", initialData?.coverImageUrl || "");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setImagePreview(dataUri);
        form.setValue("coverImageUrl", dataUri, { shouldValidate: true });
        form.clearErrors("coverImageUrl"); // Clear error if previously set
      };
      reader.onerror = () => {
        toast({ title: "File Read Error", description: "Could not read the image file.", variant: "destructive"});
        setImagePreview(initialData?.coverImageUrl || null);
        form.setValue("coverImageUrl", initialData?.coverImageUrl || "");
      }
      reader.readAsDataURL(file);
    } else { // No file selected, reset to initial or null
        setImagePreview(initialData?.coverImageUrl || null);
        form.setValue("coverImageUrl", initialData?.coverImageUrl || "");
    }
  };


  function processSubmit(data: NovelFormValues) {
    // If imagePreview is different from data.coverImageUrl, it means a new image was processed
    // but might have been cleared due to error or deselection. Rely on form's data.coverImageUrl.
    const finalCoverImageUrl = data.coverImageUrl || (imagePreview && imagePreview.startsWith('data:') ? imagePreview : (initialData?.coverImageUrl || ""));


    if (finalCoverImageUrl && finalCoverImageUrl.startsWith('data:') && finalCoverImageUrl.length > 1024 * 1024 * 1.5) { // Approx 1.5MB for data URI
       toast({
        title: "Warning: Large Image",
        description: "The uploaded image is large and might impact performance or storage. Consider optimizing it.",
        variant: "default",
        duration: 6000,
      });
    }


    const novelToSubmit: Novel = {
      id: initialData?.id || `novel-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: data.title,
      author: data.author,
      genres: data.genres.split(",").map(g => g.trim()).filter(g => g.length > 0),
      snippet: data.snippet,
      coverImageUrl: finalCoverImageUrl || undefined,
      aiHint: data.aiHint || undefined,
      chapters: data.chapters,
      views: initialData?.views || 0,
      rating: initialData?.rating || 0,
      isTrending: initialData?.isTrending || false, // Recalculated by getNovelsFromStorage
    };
    onSubmitForm(novelToSubmit);
    toast({
      title: initialData ? "Novel Updated!" : "Novel Added!",
      description: `"${novelToSubmit.title}" has been saved.`,
    });
    if (!initialData) { 
        form.reset(); // Reset form only if it was an "add new" operation
        setImagePreview(null);
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
        
        <FormItem>
          <FormLabel>Cover Image</FormLabel>
          <FormControl>
            <Input 
              type="file" 
              accept="image/png, image/jpeg, image/webp, image/gif" 
              onChange={handleImageChange} 
              className="file:text-primary file:font-semibold file:bg-primary/10 hover:file:bg-primary/20"
            />
          </FormControl>
          {/* 
            The FormField for coverImageUrl is now primarily for validation state.
            The actual value is set by handleImageChange.
          */}
          <FormField
            control={form.control}
            name="coverImageUrl"
            render={({ field }) => (
              <>
                {/* Hidden input to satisfy RHF for the field, actual value handled by file input and state */}
                <input type="hidden" {...field} /> 
                <FormMessage />
              </>
            )}
          />
          {imagePreview && (
            <div className="mt-4 relative w-32 h-[calc(32px*17/12)] aspect-[12/17] rounded border border-muted overflow-hidden">
              <Image src={imagePreview} alt="Cover preview" layout="fill" objectFit="cover" />
            </div>
          )}
          <FormDescription>
            Upload a cover image (max 5MB). Best if 12:17 aspect ratio.
            If you previously entered a URL and want to keep it, do not select a new file.
          </FormDescription>
        </FormItem>

        <FormField
          control={form.control}
          name="aiHint"
          render={({ field }) => (
            <FormItem>
              <FormLabel>AI Hint for Image</FormLabel>
              <FormControl><Input placeholder="e.g., space battle, dragon castle" {...field} /></FormControl>
              <FormDescription>Keywords for image generation (if applicable, or describes the uploaded image).</FormDescription>
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
          {onCancel && <Button type="button" variant="outline" onClick={() => {
            onCancel();
            // Reset form and preview when cancelling editing an existing novel or adding a new one
            form.reset(initialData ? {
                title: initialData.title || "",
                author: initialData.author || "",
                genres: initialData.genres?.join(", ") || "",
                snippet: initialData.snippet || "",
                coverImageUrl: initialData.coverImageUrl || "",
                aiHint: initialData.aiHint || "",
                chapters: initialData.chapters ?? 1,
              } : {
                title: "", author: "", genres: "", snippet: "", coverImageUrl: "", aiHint: "", chapters: 1,
              });
            setImagePreview(initialData?.coverImageUrl || null);
          }}>Cancel</Button>}
          <Button type="submit">{submitButtonText}</Button>
        </div>
      </form>
    </Form>
  );
}
