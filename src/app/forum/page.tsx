
"use client";

import { FeedItemCard } from '@/components/forum-post-card'; // Path remains, but component is renamed
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, PlusCircle, TrendingUp, MessageSquareText } from 'lucide-react';
import Link from 'next/link';

const placeholderTrendingPosts = [
  { id: 'trend-1', postType: 'social' as const, mainText: 'Just saw the most amazing sunset! 🌅 Nature is truly breathtaking. #blessed #sunsetlovers', authorName: 'NatureFan', authorInitials: 'NF', timestamp: '2 hours ago', repliesOrCommentsCount: 12, likesCount: 155, authorAvatarUrl: 'https://placehold.co/40x40.png', imageUrl: 'https://placehold.co/600x338.png', aiHint: 'sunset landscape' },
  { id: 'trend-2', postType: 'social' as const, mainText: 'Anyone else excited for the new "Galaxy Warriors" movie? The trailer looks epic! 🚀 #GalaxyWarriors #SciFi', authorName: 'MovieBuff23', authorInitials: 'MB', timestamp: '5 hours ago', repliesOrCommentsCount: 45, likesCount: 289, authorAvatarUrl: 'https://placehold.co/40x40.png' },
];

const placeholderSocialFeedPosts = [
  { id: 'social-1', postType: 'forum' as const, title: 'Welcome to Katha Vault! Introduce Yourself!', authorName: 'Admin', authorInitials: 'AD', timestamp: '2 days ago', mainText: 'Hello writers and readers! We\'re thrilled to have you here. Tell us a bit about yourself and what kind of stories you love.', repliesOrCommentsCount: 15, likesCount: 32, viewsCount: 120, authorAvatarUrl: 'https://placehold.co/40x40.png' },
  { id: 'social-2', postType: 'social' as const, mainText: 'Working on a new chapter for my fantasy novel. The magic system is tricky but fun to develop! 📚✨ #amwriting #fantasywriter', authorName: 'Elara Moonwhisper', authorInitials: 'EM', timestamp: '1 day ago', mainText: 'What are some of your favorite opening lines from fantasy novels or stories? Let\'s share some inspiration!', repliesOrCommentsCount: 22, likesCount: 45, authorAvatarUrl: 'https://placehold.co/40x40.png' },
  { id: 'social-3', postType: 'forum' as const, title: 'Seeking Feedback on Sci-Fi Short Story Draft', authorName: 'Jax Orion', authorInitials: 'JO', timestamp: '15 hours ago', mainText: 'I\'ve just finished a draft of my new sci-fi short story, "Cryosleep Dreamer". Would love to get some constructive criticism before I finalize it.', repliesOrCommentsCount: 8, likesCount: 18, viewsCount: 95, authorAvatarUrl: 'https://placehold.co/40x40.png' },
];

export default function FeedPage() { // Renamed from ForumPage
  return (
    <div className="space-y-8">
      <header className="text-center space-y-2">
        <MessageSquareText className="mx-auto h-16 w-16 text-primary" />
        <h1 className="text-5xl font-headline tracking-tight text-primary">Community Feed</h1>
        <p className="text-xl text-foreground font-body font-semibold">
          Discover what's happening, share your thoughts, and connect.
        </p>
      </header>

      <div className="flex justify-end mb-6">
        <Button size="lg" asChild>
          <Link href="/posts/new">
            <PlusCircle className="mr-2 h-5 w-5" />
            Create Post
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="social-feed" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="social-feed">
            <Users className="mr-2 h-4 w-4" /> Social Feed
          </TabsTrigger>
          <TabsTrigger value="trending-posts">
            <TrendingUp className="mr-2 h-4 w-4" /> Trending Posts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="social-feed">
          <div className="space-y-6">
            {placeholderSocialFeedPosts.map(post => (
              <FeedItemCard key={post.id} {...post} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trending-posts">
          <div className="space-y-6">
            {placeholderTrendingPosts.map(post => (
              <FeedItemCard key={post.id} {...post} />
            ))}
            {placeholderTrendingPosts.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No trending posts right now. Check back later!</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
