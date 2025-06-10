
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth } from "@/lib/firebase"; // For getting current user for path

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
import { Loader2 } from "lucide-react";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];

// Removed coverImageUrl from Zod schema as it's handled separately now
const novelFormSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters.").max(100, "Title too long."),
  author: z.string().min(2, "Author name must be at least 2 characters."),
  genres: z.string().min(1, "Please enter at least one genre."),
  snippet: z.string().min(10, "Snippet must be at least 10 characters."),
  status: z.enum(["draft", "published"], { required_error: "Please select a status."}),
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
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [homePageConfig, setHomePageConfig] = useState<HomeLayoutConfig>({ selectedGenres: [], showMoreNovelsSection: true });

  const form = useForm<NovelFormValues>({
    resolver: zodResolver(novelFormSchema),
    defaultValues: {
      title: "",
      author: "",
      genres: "",
      snippet: "",
      status: "draft",
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
        aiHint: initialData.aiHint || "",
        homePageFeaturedGenre: initialData.homePageFeaturedGenre === undefined ? null : initialData.homePageFeaturedGenre,
      });
      setImagePreview(initialData.coverImageUrl || null);
      setImageFile(null); // Reset file on initial data change
    } else {
      form.reset({
        title: "", author: "", genres: "", snippet: "", status: "draft", aiHint: "", homePageFeaturedGenre: null,
      });
      setImagePreview(null);
      setImageFile(null);
    }
  }, [initialData, form]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        toast({ title: "Image Error", description: "Selected image is too large (max 5MB).", variant: "destructive" });
        setImageFile(null);
        setImagePreview(initialData?.coverImageUrl || null); // Revert to original or null
        return;
      }
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        toast({ title: "Image Error", description: "Invalid image type. Please use JPG, PNG, WEBP, or GIF.", variant: "destructive" });
        setImageFile(null);
        setImagePreview(initialData?.coverImageUrl || null);
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.onerror = () => toast({ title: "File Read Error", description: "Could not read the image file.", variant: "destructive"});
      reader.readAsDataURL(file);
    } else { // No file selected, or selection cancelled
      setImageFile(null);
      // If there was initial data with an image, revert to it, otherwise null
      setImagePreview(initialData?.coverImageUrl || null); 
    }
  };

  async function processSubmit(data: NovelFormValues) {
    setIsUploadingImage(true);
    let finalCoverImageUrl: string | undefined = undefined;

    if (imageFile) {
      const storage = getStorage();
      const novelIdForPath = initialData?.id || Date.now().toString();
      // Use current user ID in path if available, otherwise a generic folder
      const userId = auth.currentUser ? auth.currentUser.uid : 'unknown_user';
      const filePath = `users/${userId}/novel_covers/${novelIdForPath}/${imageFile.name}`;
      const imageStorageRef = storageRef(storage, filePath);
      try {
        const snapshot = await uploadBytes(imageStorageRef, imageFile);
        finalCoverImageUrl = await getDownloadURL(snapshot.ref);
        toast({ title: "Image Uploaded", description: "Cover image successfully saved to Firebase Storage." });
      } catch (error) {
        console.error("Error uploading image to Firebase Storage:", error);
        toast({ title: "Image Upload Failed", description: "Could not save cover image. Please try again.", variant: "destructive" });
        setIsUploadingImage(false);
        return; 
      }
    } else if (imagePreview && imagePreview === initialData?.coverImageUrl && imagePreview.startsWith('https://firebasestorage.googleapis.com/')) {
      // No new file, and existing preview is the same as initial Firebase URL, so keep it
      finalCoverImageUrl = initialData.coverImageUrl;
    } else if (!imagePreview) {
      // Image was cleared by user
      finalCoverImageUrl = undefined;
    }
    // If imagePreview exists but it's a data URI and no new imageFile, it means it was an old data URI, don't save it.
    // finalCoverImageUrl will remain undefined in this case, effectively clearing it.

    setIsUploadingImage(false);

    const novelDetailsToSubmit = {
      ...data,
      genres: data.genres.split(",").map(g => g.trim()).filter(g => g.length > 0),
      coverImageUrl: finalCoverImageUrl,
      chapters: initialData?.chapters 
    };
    
    onSubmitForm(novelDetailsToSubmit);
    toast({
      title: initialData ? "Novel Details Updated!" : "Novel Added!",
      description: `"${data.title}" details have been saved.`,
    });
    if (!initialData) { 
        form.reset();
        setImagePreview(null);
        setImageFile(null);
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
              <FormControl><Input placeholder="Novel Title" {...field} disabled={isUploadingImage} /></FormControl>
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
              <FormControl><Input placeholder="Author Name" {...field} disabled={isUploadingImage} /></FormControl>
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
              <FormControl><Input placeholder="Sci-Fi, Fantasy, Romance" {...field} disabled={isUploadingImage} /></FormControl>
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
                disabled={isUploadingImage}
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
              <FormControl><Textarea placeholder="A short summary of the novel..." {...field} rows={4} disabled={isUploadingImage} /></FormControl>
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
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isUploadingImage}>
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
              accept={ACCEPTED_IMAGE_TYPES.join(",")} 
              onChange={handleImageChange} 
              className="file:text-primary file:font-semibold file:bg-primary/10 hover:file:bg-primary/20"
              disabled={isUploadingImage}
            />
          </FormControl>
          {/* No FormField for coverImageUrl directly, it's handled outside form state */}
          {imagePreview && (
            <div className="mt-4 relative w-32 h-auto aspect-[12/17] rounded border border-muted overflow-hidden">
              <Image src={imagePreview} alt="Cover preview" layout="fill" objectFit="cover" />
            </div>
          )}
          <FormDescription>
            Upload a cover image (max 5MB). Best if ~12:17 ratio. Uploads to Firebase Storage.
          </FormDescription>
        </FormItem>

        <FormField
          control={form.control}
          name="aiHint"
          render={({ field }) => (
            <FormItem>
              <FormLabel>AI Hint for Image</FormLabel>
              <FormControl><Input placeholder="e.g., space battle, dragon castle" {...field} disabled={isUploadingImage} /></FormControl>
              <FormDescription>Keywords describing the cover image (for accessibility or future AI use).</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <p className="text-sm text-muted-foreground font-body">
          Note: Views and ratings are managed by user interaction or the dedicated chapter management section.
        </p>

        <div className="flex justify-end space-x-3">
          {onCancel && <Button type="button" variant="outline" onClick={onCancel} disabled={isUploadingImage}>Cancel</Button>}
          <Button type="submit" disabled={isUploadingImage || form.formState.isSubmitting}>
            {isUploadingImage && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isUploadingImage ? 'Uploading...' : submitButtonText}
          </Button>
        </div>
      </form>
    </Form>
  );
}
