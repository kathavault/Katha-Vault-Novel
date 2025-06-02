
"use client";

import { FeedItemCard } from '@/components/forum-post-card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, PlusCircle, TrendingUp, MessageSquareText } from 'lucide-react';
import Link from 'next/link';

const placeholderTrendingPosts = [
  { id: 'trend-1', postType: 'social' as const, mainText: 'Just achieved a new milestone in "The Last Nebula" game! Level 50, here I come! 🚀 #Gaming #SciFiAdventure', authorName: 'GamerXtreme', authorInitials: 'GX', timestamp: '1 hour ago', repliesOrCommentsCount: 150, likesCount: 1255, authorAvatarUrl: 'https://placehold.co/40x40.png', imageUrl: 'https://placehold.co/600x338.png', aiHint: 'gaming achievement' },
  { id: 'trend-2', postType: 'forum' as const, title: 'Deep Dive: Thematic Parallels in Modern Fantasy', authorName: 'ProfessorLore', authorInitials: 'PL', timestamp: '3 hours ago', mainText: 'Exploring the recurring themes of sacrifice and redemption in popular fantasy series. What are your thoughts? Join the discussion!', repliesOrCommentsCount: 88, likesCount: 972, viewsCount: 5500, authorAvatarUrl: 'https://placehold.co/40x40.png' },
  { id: 'trend-3', postType: 'social' as const, mainText: 'My latest short story "The Clockwork Nightingale" is now published on Katha Vault! Check it out and let me know what you think! 🐦⚙️ #NewStory #Steampunk', authorName: 'AuthorAnne', authorInitials: 'AA', timestamp: '6 hours ago', repliesOrCommentsCount: 65, likesCount: 850, authorAvatarUrl: 'https://placehold.co/40x40.png' },
];

const placeholderSocialFeedPosts = [
  { id: 'social-1', postType: 'forum' as const, title: 'Welcome to Katha Vault! Introduce Yourself!', authorName: 'KathaAdmin', authorInitials: 'KA', timestamp: '2 days ago', mainText: 'Hello writers and readers! We\'re thrilled to have you here. Tell us a bit about yourself and what kind of stories you love.', repliesOrCommentsCount: 15, likesCount: 32, viewsCount: 120, authorAvatarUrl: 'https://placehold.co/40x40.png' },
  { id: 'social-2', postType: 'social' as const, mainText: 'Working on a new chapter for my fantasy novel. The magic system is tricky but fun to develop! 📚✨ #amwriting #fantasywriter (Heard @Marcus Writes is doing the same!)', authorName: 'Elara Moonwhisper', authorInitials: 'EM', timestamp: '1 day ago', repliesOrCommentsCount: 22, likesCount: 45, authorAvatarUrl: 'https://placehold.co/40x40.png' },
  { id: 'social-3', postType: 'forum' as const, title: 'Seeking Beta Readers for Sci-Fi Novel', authorName: 'Jax Orion', authorInitials: 'JO', timestamp: '15 hours ago', mainText: 'Looking for 3-4 beta readers for my upcoming sci-fi novel "Planetfall". DM me if interested! Genre: Space Opera, Adventure.', repliesOrCommentsCount: 8, likesCount: 18, viewsCount: 95, authorAvatarUrl: 'https://placehold.co/40x40.png' },
  { id: 'social-4', postType: 'social' as const, mainText: 'Just read an amazing short story by @Elara Moonwhisper! Highly recommend "The Sunstone Amulet". #ReadingCommunity', authorName: 'SciFiFanatic', authorInitials: 'SF', timestamp: '5 hours ago', repliesOrCommentsCount: 7, likesCount: 25, authorAvatarUrl: 'https://placehold.co/40x40.png' },
  { id: 'social-5', postType: 'social' as const, mainText: 'Brainstorming session for my next horror story. Thinking something involving an abandoned lighthouse... 👻 #horrorwriting #plotbunnies', authorName: 'SpookyStories', authorInitials: 'SS', timestamp: '30 mins ago', repliesOrCommentsCount: 5, likesCount: 15, authorAvatarUrl: 'https://placehold.co/40x40.png', imageUrl: 'https://placehold.co/600x400.png', aiHint: 'lighthouse night' },
];

export default function FeedPage() {
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
             {placeholderSocialFeedPosts.length === 0 && (
              <p className="text-center text-muted-foreground py-8">The social feed is quiet for now. Create a post or follow others to see updates!</p>
            )}
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
