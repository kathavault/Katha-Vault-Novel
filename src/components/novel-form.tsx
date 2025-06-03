
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { Novel, HomeLayoutConfig } from "@/lib/mock-data";
import { getHomeSectionsConfig } from "@/lib/mock-data";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];

const novelFormSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters.").max(100, "Title too long."),
  author: z.string().min(2, "Author name must be at least 2 characters."),
  genres: z.string().min(1, "Please enter at least one genre."),
  snippet: z.string().min(10, "Snippet must be at least 10 characters."),
  status: z.enum(["draft", "published"], { required_error: "Please select a status."}),
  coverImageUrl: z.string().optional().or(z.literal('')),
  aiHint: z.string().optional(),
  homePageFeaturedGenre: z.string().nullable().optional(),
});

type NovelFormValues = z.infer<typeof novelFormSchema>;

interface NovelFormProps {
  initialData?: Novel | null;
  onSubmitForm: (data: Omit<Novel, 'chapters' | 'id' | 'views' | 'rating' | 'isTrending'> & { chapters?: Novel['chapters'] }) => void;
  submitButtonText?: string;
  onCancel?: () => void;
}

export function NovelForm({ initialData, onSubmitForm, submitButtonText = "Submit Novel", onCancel }: NovelFormProps) {
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.coverImageUrl || null);
  const [homePageConfig, setHomePageConfig] = useState<HomeLayoutConfig>({ selectedGenres: [], showMoreNovelsSection: true });

  const form = useForm<NovelFormValues>({
    resolver: zodResolver(novelFormSchema),
    defaultValues: {
      title: "",
      author: "",
      genres: "",
      snippet: "",
      status: "draft",
      coverImageUrl: "",
      aiHint: "",
      homePageFeaturedGenre: null,
    },
  });

  useEffect(() => {
    setHomePageConfig(getHomeSectionsConfig());

    if (initialData) {
      form.reset({
        title: initialData.title || "",
        author: initialData.author || "",
        genres: initialData.genres?.join(", ") || "",
        snippet: initialData.snippet || "",
        status: initialData.status || "draft",
        coverImageUrl: initialData.coverImageUrl || "",
        aiHint: initialData.aiHint || "",
        homePageFeaturedGenre: initialData.homePageFeaturedGenre === undefined ? null : initialData.homePageFeaturedGenre,
      });
      setImagePreview(initialData.coverImageUrl || null);
    } else {
      form.reset({
        title: "",
        author: "",
        genres: "",
        snippet: "",
        status: "draft",
        coverImageUrl: "",
        aiHint: "",
        homePageFeaturedGenre: null,
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
        setImagePreview(initialData?.coverImageUrl || null);
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
        form.clearErrors("coverImageUrl");
      };
      reader.onerror = () => {
        toast({ title: "File Read Error", description: "Could not read the image file.", variant: "destructive"});
        setImagePreview(initialData?.coverImageUrl || null);
        form.setValue("coverImageUrl", initialData?.coverImageUrl || "");
      }
      reader.readAsDataURL(file);
    } else {
        setImagePreview(initialData?.coverImageUrl || null);
        form.setValue("coverImageUrl", initialData?.coverImageUrl || "");
    }
  };

  function processSubmit(data: NovelFormValues) {
    const finalCoverImageUrl = data.coverImageUrl || (imagePreview && imagePreview.startsWith('data:') ? imagePreview : (initialData?.coverImageUrl || ""));

    if (finalCoverImageUrl && finalCoverImageUrl.startsWith('data:') && finalCoverImageUrl.length > 1024 * 1024 * 1.5) { // Approx 1.5MB check for data URI
       toast({
        title: "Warning: Large Image",
        description: "The uploaded image is large and might impact performance or storage. Consider optimizing it.",
        variant: "default",
        duration: 6000,
      });
    }

    const novelDetailsToSubmit = {
      title: data.title,
      author: data.author,
      genres: data.genres.split(",").map(g => g.trim()).filter(g => g.length > 0),
      snippet: data.snippet,
      status: data.status,
      coverImageUrl: finalCoverImageUrl || undefined,
      aiHint: data.aiHint || undefined,
      homePageFeaturedGenre: data.homePageFeaturedGenre || null,
      chapters: initialData?.chapters 
    };
    
    onSubmitForm(novelDetailsToSubmit);
    toast({
      title: initialData ? "Novel Details Updated!" : "Novel Added!",
      description: `"${data.title}" details have been saved. Manage chapters separately.`,
    });
    if (!initialData) { 
        form.reset();
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
              <FormLabel>General Genres</FormLabel>
              <FormControl><Input placeholder="Sci-Fi, Fantasy, Romance" {...field} /></FormControl>
              <FormDescription>Comma-separated list of genres for general classification and library filtering.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="homePageFeaturedGenre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Feature in Home Page Section</FormLabel>
              <Select 
                onValueChange={(value) => field.onChange(value === "null" ? null : value)} 
                value={field.value === null ? "null" : field.value || undefined}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a home page section to feature in..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="null">None</SelectItem>
                  {homePageConfig.selectedGenres.map(genre => (
                    <SelectItem key={genre} value={genre}>
                      {genre} Section
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Choose if this novel should be specifically featured in one of the admin-configured Home Page sections.
                This is separate from its general genres.
              </FormDescription>
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
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select novel status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                "Draft" novels are not visible to public users. "Published" novels are live.
              </FormDescription>
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
          <FormField
            control={form.control}
            name="coverImageUrl" 
            render={({ field }) => (
              <>
                <input type="hidden" {...field} /> 
                <FormMessage />
              </>
            )}
          />
          {imagePreview && (
            <div className="mt-4 relative w-32 h-auto aspect-[12/17] rounded border border-muted overflow-hidden">
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
        
        <p className="text-sm text-muted-foreground font-body">
          Note: Views and ratings are managed by user interaction or the dedicated chapter management section.
        </p>

        <div className="flex justify-end space-x-3">
          {onCancel && <Button type="button" variant="outline" onClick={() => {
            onCancel();
            form.reset(initialData ? {
                title: initialData.title || "",
                author: initialData.author || "",
                genres: initialData.genres?.join(", ") || "",
                snippet: initialData.snippet || "",
                status: initialData.status || "draft",
                coverImageUrl: initialData.coverImageUrl || "",
                aiHint: initialData.aiHint || "",
                homePageFeaturedGenre: initialData.homePageFeaturedGenre === undefined ? null : initialData.homePageFeaturedGenre,
              } : {
                title: "", author: "", genres: "", snippet: "", status: "draft", coverImageUrl: "", aiHint: "", homePageFeaturedGenre: null,
              });
            setImagePreview(initialData?.coverImageUrl || null);
          }}>Cancel</Button>}
          <Button type="submit">{submitButtonText}</Button>
        </div>
      </form>
    </Form>
  );
}

    
```