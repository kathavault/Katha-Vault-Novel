
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useEffect } from 'react';

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Chapter } from "@/lib/mock-data";

const chapterFormSchema = z.object({
  title: z.string().min(1, "Chapter title cannot be empty.").max(150, "Chapter title is too long."),
  content: z.string().min(10, "Chapter content must be at least 10 characters."),
});

type ChapterFormValues = z.infer<typeof chapterFormSchema>;

interface ChapterFormProps {
  initialData?: Chapter | null;
  onSubmitForm: (data: ChapterFormValues) => void;
  onCancel: () => void;
}

export function ChapterForm({ initialData, onSubmitForm, onCancel }: ChapterFormProps) {
  const form = useForm<ChapterFormValues>({
    resolver: zodResolver(chapterFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      content: initialData?.content || "",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        title: initialData.title,
        content: initialData.content,
      });
    } else {
      form.reset({
        title: "",
        content: "",
      });
    }
  }, [initialData, form]);

  const handleSubmit = (data: ChapterFormValues) => {
    onSubmitForm(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 flex flex-col h-full">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Chapter Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter chapter title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem className="flex-grow flex flex-col">
              <FormLabel>Chapter Content</FormLabel>
              <FormControl className="flex-grow">
                <Textarea
                  placeholder="Write your chapter content here..."
                  {...field}
                  className="min-h-[300px] resize-y h-full" 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-3 pt-4 sticky bottom-0 bg-background pb-1">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {initialData ? 'Save Changes' : 'Add Chapter'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

    