"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const storyFormSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }).max(100, {
    message: "Title must not be longer than 100 characters.",
  }),
  genre: z.string({
    required_error: "Please select a genre.",
  }),
  content: z.string().min(100, {
    message: "Story content must be at least 100 characters.",
  }),
  author: z.string().min(2, {
    message: "Author name must be at least 2 characters."
  }).optional(), // Assuming author might be pre-filled or from user profile
});

type StoryFormValues = z.infer<typeof storyFormSchema>;

// Dummy genres for selection
const genres = ["Sci-Fi", "Fantasy", "Mystery", "Romance", "Thriller", "Historical", "Adventure", "Horror", "Contemporary"];

export function StoryForm() {
  const { toast } = useToast();
  const form = useForm<StoryFormValues>({
    resolver: zodResolver(storyFormSchema),
    defaultValues: {
      title: "",
      content: "",
    },
    mode: "onChange",
  });

  function onSubmit(data: StoryFormValues) {
    // In a real app, you'd submit this data to your backend
    console.log(data);
    toast({
      title: "Story Submitted!",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-background p-4">
          <code className="text-foreground">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
    form.reset();
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-2xl">
      <CardHeader>
        <CardTitle className="text-3xl font-headline text-center text-primary">Compose Your Masterpiece</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">Title</FormLabel>
                  <FormControl>
                    <Input placeholder="The Name of Your Epic" {...field} className="text-base" />
                  </FormControl>
                  <FormDescription className="font-body">
                    Choose a captivating title for your story.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="genre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">Genre</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="text-base">
                        <SelectValue placeholder="Select a genre" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {genres.map(genre => (
                        <SelectItem key={genre} value={genre} className="font-body">
                          {genre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription className="font-body">
                    What kind of story are you telling?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">Story Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Once upon a time..."
                      className="resize-y min-h-[300px] text-base font-body"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="font-body">
                    Unleash your imagination. Minimum 100 characters.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end">
              <Button type="submit" size="lg" className="text-lg px-8 py-6">Publish Story</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
