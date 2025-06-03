
"use client";

import { useState } from 'react';
import { FeedItemCard, type FeedItemComment } from '@/components/forum-post-card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, TrendingUp, MessageSquareText, Send, Edit } from 'lucide-react'; // Added Send for post button, Edit for title
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link'; // Added Link for Create Post button on mobile

// Enhanced sample comments data structure
const sampleCommentsLevel2: FeedItemComment[] = [
  {
    id: 'reply-1-1-1',
    authorName: 'DeepThinker',
    authorInitials: 'DT',
    authorAvatarUrl: 'https://placehold.co/32x32.png?text=DT',
    text: 'Indeed, a very nuanced point!',
    timestamp: '5m ago',
    commentLikes: 1,
    isCommentLikedByUser: false,
    replies: [],
  },
];

const sampleCommentsLevel1: FeedItemComment[] = [
  {
    id: 'reply-1-1',
    authorName: 'OriginalPoster',
    authorInitials: 'OP',
    authorAvatarUrl: 'https://placehold.co/32x32.png?text=OP',
    text: 'Thanks for the feedback! Much appreciated.',
    timestamp: '15m ago',
    commentLikes: 2,
    isCommentLikedByUser: false,
    replies: sampleCommentsLevel2, // Nested reply
  },
    {
    id: 'reply-1-2',
    authorName: 'SupportiveSam',
    authorInitials: 'SS',
    authorAvatarUrl: 'https://placehold.co/32x32.png?text=SS',
    text: 'Great discussion, everyone!',
    timestamp: '10m ago',
    commentLikes: 1,
    isCommentLikedByUser: true,
    replies: [],
  },
];

const sampleCommentsTopLevel: FeedItemComment[] = [
  {
    id: 'comment-1',
    authorName: 'ReaderReply',
    authorInitials: 'RR',
    authorAvatarUrl: 'https://placehold.co/32x32.png?text=RR',
    text: 'This is a great point! I totally agree with the assessment. The way the author handled the character development was masterful.',
    timestamp: '20m ago',
    commentLikes: 5,
    isCommentLikedByUser: false,
    replies: sampleCommentsLevel1,
  },
  {
    id: 'comment-2',
    authorName: 'CriticalThinker',
    authorInitials: 'CT',
    authorAvatarUrl: 'https://placehold.co/32x32.png?text=CT',
    text: 'I have a slightly different perspective on this. What about considering the antagonist\'s motivations more deeply?',
    timestamp: '18m ago',
    commentLikes: 3,
    isCommentLikedByUser: true,
    replies: [],
  },
  {
    id: 'comment-3',
    authorName: 'AnotherUser',
    authorInitials: 'AU',
    authorAvatarUrl: 'https://placehold.co/32x32.png?text=AU',
    text: 'Just wanted to say hi! Love this platform.',
    timestamp: '5m ago',
    commentLikes: 0,
    isCommentLikedByUser: false,
    replies: [],
  }
];

const initialTrendingPosts = [
  { id: 'trend-1', postType: 'social' as const, mainText: 'Just achieved a new milestone in "The Last Nebula" game! Level 50, here I come! 🚀 #Gaming #SciFiAdventure', authorName: 'GamerXtreme', authorInitials: 'GX', timestamp: '1 hour ago', likesCount: 1255, authorAvatarUrl: 'https://placehold.co/40x40.png?text=GX', imageUrl: 'https://placehold.co/600x338.png', aiHint: 'gaming achievement', comments: sampleCommentsTopLevel.slice(0,1) },
  { id: 'trend-2', postType: 'forum' as const, title: 'Deep Dive: Thematic Parallels in Modern Fantasy', authorName: 'ProfessorLore', authorInitials: 'PL', timestamp: '3 hours ago', mainText: 'Exploring the recurring themes of sacrifice and redemption in popular fantasy series. What are your thoughts? Join the discussion!', likesCount: 972, viewsCount: 5500, authorAvatarUrl: 'https://placehold.co/40x40.png?text=PL', comments: sampleCommentsTopLevel },
  { id: 'trend-3', postType: 'social' as const, mainText: 'My latest short story "The Clockwork Nightingale" is now published on Katha Vault! Check it out and let me know what you think! 🐦⚙️ #NewStory #Steampunk', authorName: 'AuthorAnne', authorInitials: 'AA', timestamp: '6 hours ago', likesCount: 850, authorAvatarUrl: 'https://placehold.co/40x40.png?text=AA', comments: [] },
];

const initialSocialFeedPosts = [
  { id: 'social-1', postType: 'forum' as const, title: 'Welcome to Katha Vault! Introduce Yourself!', authorName: 'KathaAdmin', authorInitials: 'KA', timestamp: '2 days ago', mainText: 'Hello writers and readers! We\'re thrilled to have you here. Tell us a bit about yourself and what kind of stories you love.', likesCount: 32, viewsCount: 120, authorAvatarUrl: 'https://placehold.co/40x40.png?text=KA', comments: sampleCommentsTopLevel.slice(0,2) },
  { id: 'social-2', postType: 'social' as const, mainText: 'Working on a new chapter for my fantasy novel. The magic system is tricky but fun to develop! 📚✨ #amwriting #fantasywriter (Heard @Marcus Writes is doing the same!)', authorName: 'Elara Moonwhisper', authorInitials: 'EM', timestamp: '1 day ago', likesCount: 45, authorAvatarUrl: 'https://placehold.co/40x40.png?text=EM', comments: sampleCommentsTopLevel.slice(1,3) },
  { id: 'social-3', postType: 'forum' as const, title: 'Seeking Beta Readers for Sci-Fi Novel', authorName: 'Jax Orion', authorInitials: 'JO', timestamp: '15 hours ago', mainText: 'Looking for 3-4 beta readers for my upcoming sci-fi novel "Planetfall". DM me if interested! Genre: Space Opera, Adventure.', likesCount: 18, viewsCount: 95, authorAvatarUrl: 'https://placehold.co/40x40.png?text=JO', comments: [] },
  { id: 'social-4', postType: 'social' as const, mainText: 'Just read an amazing short story by @Elara Moonwhisper! Highly recommend "The Sunstone Amulet". #ReadingCommunity', authorName: 'SciFiFanatic', authorInitials: 'SF', timestamp: '5 hours ago', likesCount: 25, authorAvatarUrl: 'https://placehold.co/40x40.png?text=SF', comments: [sampleCommentsTopLevel[0]] },
  { id: 'social-5', postType: 'social' as const, mainText: 'Brainstorming session for my next horror story. Thinking something involving an abandoned lighthouse... 👻 #horrorwriting #plotbunnies', authorName: 'SpookyStories', authorInitials: 'SS', timestamp: '30 mins ago', likesCount: 15, authorAvatarUrl: 'https://placehold.co/40x40.png?text=SS', imageUrl: 'https://placehold.co/600x400.png', aiHint: 'lighthouse night', comments: [sampleCommentsTopLevel[2]] },
];

export default function FeedPage() {
  const { toast } = useToast();
  const [newPostContent, setNewPostContent] = useState("");
  const [socialFeedPosts, setSocialFeedPosts] = useState(initialSocialFeedPosts);
  const [trendingPosts] = useState(initialTrendingPosts); // Assuming trending posts are not modified by client

  const handleCreatePost = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newPostContent.trim()) {
      toast({
        title: "Empty Post",
        description: "You can't submit an empty post.",
        variant: "destructive",
      });
      return;
    }

    const newPost = {
      id: `social-${Date.now()}`,
      postType: 'social' as const,
      mainText: newPostContent,
      authorName: 'Current User', // Placeholder
      authorInitials: 'CU', // Placeholder
      authorAvatarUrl: 'https://placehold.co/40x40.png?text=CU', // Placeholder
      timestamp: 'Just now',
      likesCount: 0,
      comments: [],
      // imageUrl and aiHint can be added if image uploads are supported later
    };

    setSocialFeedPosts(prevPosts => [newPost, ...prevPosts]);
    setNewPostContent("");
    toast({
      title: "Post Submitted!",
      description: "Your thoughts have been shared.",
    });
  };

  return (
    <div className="space-y-8">
      <header className="text-center space-y-2">
        <MessageSquareText className="mx-auto h-16 w-16 text-primary" />
        <h1 className="text-5xl font-headline tracking-tight text-primary">Community Feed</h1>
        <p className="text-xl text-foreground font-body font-semibold">
          Discover what's happening, share your thoughts, and connect.
        </p>
      </header>

      {/* Create Post Section */}
      <Card className="w-full shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary flex items-center">
            <Edit className="mr-3 h-6 w-6" /> Create Post
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreatePost} className="space-y-4">
            <Textarea
              placeholder="What's on your mind, Katha Explorer?"
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              className="min-h-[100px] font-body text-base"
              rows={4}
            />
            <div className="flex justify-end">
              <Button type="submit" size="lg">
                <Send className="mr-2 h-5 w-5" /> Post
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      {/* Fallback Create Post Button for smaller screens, links to /posts/new (optional, can be removed if the above form is sufficient) */}
      <div className="flex justify-end mb-6 lg:hidden">
        <Button size="lg" asChild>
          <Link href="/posts/new">
            <Edit className="mr-2 h-5 w-5" />
            Create Post (Legacy)
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
            {socialFeedPosts.map(post => (
              <FeedItemCard key={post.id} {...post} />
            ))}
             {socialFeedPosts.length === 0 && (
              <p className="text-center text-muted-foreground py-8">The social feed is quiet for now. Create a post or follow others to see updates!</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="trending-posts">
          <div className="space-y-6">
            {trendingPosts.map(post => (
              <FeedItemCard key={post.id} {...post} />
            ))}
            {trendingPosts.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No trending posts right now. Check back later!</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
