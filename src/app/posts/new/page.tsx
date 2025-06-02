
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FilePenLine, Send, Users, TrendingUp } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export default function CreatePostPage() {
  const [postContent, setPostContent] = useState("");
  const { toast } = useToast();

  const handlePostSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!postContent.trim()) {
      toast({
        title: "Empty Post",
        description: "You can't submit an empty post.",
        variant: "destructive",
      });
      return;
    }
    // Placeholder for actual post submission logic
    console.log("Post submitted:", postContent);
    toast({
      title: "Post Submitted!",
      description: "Your thoughts have been shared (for now, just in the console!).",
    });
    setPostContent(""); // Clear the textarea after submission
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row gap-4 justify-center sm:justify-start mb-6">
        <Button asChild variant="outline">
          <Link href="/forum">
            <Users className="mr-2 h-4 w-4" />
            View Social Feed
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/forum">
            <TrendingUp className="mr-2 h-4 w-4" />
            View Trending Posts
          </Link>
        </Button>
      </div>

      <header className="text-center space-y-2">
        <FilePenLine className="mx-auto h-16 w-16 text-primary" />
        <h1 className="text-5xl font-headline tracking-tight text-primary">Create New Post</h1>
        <p className="text-xl text-foreground font-body font-semibold">
          Share your thoughts, stories, or updates with the community.
        </p>
      </header>

      <Card className="w-full max-w-xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary">Compose Your Post</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePostSubmit} className="space-y-6">
            <div>
              <Textarea
                placeholder="What's on your mind? Write something inspiring, funny, or thought-provoking..."
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                className="min-h-[150px] font-body text-base"
                rows={6}
              />
              <p className="text-xs text-muted-foreground mt-2 font-body">
                Your post can be a short update, a question, or the start of a new discussion.
              </p>
            </div>
            <div className="flex justify-end">
              <Button type="submit" size="lg" className="text-lg px-6 py-3">
                <Send className="mr-2 h-5 w-5" /> Post
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
