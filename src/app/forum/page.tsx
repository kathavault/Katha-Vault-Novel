
"use client";

import { useState, useEffect, type FormEvent } from 'react';
import { FeedItemCard, type FeedItemComment, type FeedItemCardProps } from '@/components/forum-post-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Users, TrendingUp, MessageSquareText, Send, Edit, Globe, Lock, UserCheck } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

// Enhanced sample comments data structure (example)
const sampleCommentsLevel2: FeedItemComment[] = [
  { id: 'reply-1-1-1', authorName: 'DeepThinker', authorInitials: 'DT', text: 'Indeed, a very nuanced point!', timestamp: '5m ago', commentLikes: 1, isCommentLikedByUser: false, replies: [] },
];
const sampleCommentsLevel1: FeedItemComment[] = [
  { id: 'reply-1-1', authorName: 'OriginalPoster', authorInitials: 'OP', text: 'Thanks for the feedback!', timestamp: '15m ago', commentLikes: 2, isCommentLikedByUser: false, replies: sampleCommentsLevel2 },
  { id: 'reply-1-2', authorName: 'SupportiveSam', authorInitials: 'SS', text: 'Great discussion!', timestamp: '10m ago', commentLikes: 1, isCommentLikedByUser: true, replies: [] },
];
const sampleCommentsTopLevel: FeedItemComment[] = [
  { id: 'comment-1', authorName: 'ReaderReply', authorInitials: 'RR', text: 'This is a great point!', timestamp: '20m ago', commentLikes: 5, isCommentLikedByUser: false, replies: sampleCommentsLevel1, authorAvatarUrl: 'https://placehold.co/40x40.png?text=RR' },
  { id: 'comment-2', authorName: 'CriticalThinker', authorInitials: 'CT', text: 'I have a different perspective.', timestamp: '18m ago', commentLikes: 3, isCommentLikedByUser: true, replies: [], authorAvatarUrl: 'https://placehold.co/40x40.png?text=CT' },
];

const initialTrendingPosts: FeedItemCardProps[] = [
  { id: 'trend-1', postType: 'social', mainText: 'Just achieved a new milestone in "The Last Nebula" game! Level 50, here I come! 🚀 #Gaming #SciFiAdventure', authorName: 'GamerXtreme', authorInitials: 'GX', timestamp: '1 hour ago', likesCount: 1255, authorAvatarUrl: 'https://placehold.co/40x40.png?text=GX', imageUrl: 'https://placehold.co/600x338.png', aiHint: 'gaming achievement', comments: sampleCommentsTopLevel.slice(0,1), includeDiscussionGroup: true, discussionGroupName: "Last Nebula Leveling", privacy: 'public' },
  { id: 'trend-2', postType: 'forum', title: 'Deep Dive: Thematic Parallels in Modern Fantasy', authorName: 'ProfessorLore', authorInitials: 'PL', timestamp: '3 hours ago', mainText: 'Exploring the recurring themes of sacrifice and redemption in popular fantasy series. What are your thoughts? Join the discussion!', likesCount: 972, viewsCount: 5500, authorAvatarUrl: 'https://placehold.co/40x40.png?text=PL', comments: sampleCommentsTopLevel, includeDiscussionGroup: false, privacy: 'public' },
];

const initialSocialFeedPosts: FeedItemCardProps[] = [
  { id: 'social-1', postType: 'forum', title: 'Welcome to Katha Vault! Introduce Yourself!', authorName: 'KathaAdmin', authorInitials: 'KA', timestamp: '2 days ago', mainText: 'Hello writers and readers! We\'re thrilled to have you here. Tell us a bit about yourself and what kind of stories you love.', likesCount: 32, viewsCount: 120, authorAvatarUrl: 'https://placehold.co/40x40.png?text=KA', comments: sampleCommentsTopLevel.slice(0,2), includeDiscussionGroup: true, discussionGroupName: "Introductions", privacy: 'public' },
  { id: 'social-2', postType: 'social', mainText: 'Working on a new chapter for my fantasy novel. The magic system is tricky but fun to develop! 📚✨ #amwriting #fantasywriter (Heard @Marcus Writes is doing the same!)', authorName: 'Elara Moonwhisper', authorInitials: 'EM', timestamp: '1 day ago', likesCount: 45, authorAvatarUrl: 'https://placehold.co/40x40.png?text=EM', comments: sampleCommentsTopLevel.slice(1,3), includeDiscussionGroup: false, privacy: 'public' },
];

const CURRENT_USER_NAME = "Katha Explorer";
const CURRENT_USER_INITIALS = "KE";
const CURRENT_USER_AVATAR_URL = "https://placehold.co/40x40.png?text=KE";
const USER_POSTS_STORAGE_KEY = 'currentUserKathaVaultPosts';
const SOCIAL_FEED_POSTS_STORAGE_KEY = 'kathaVaultSocialFeedPosts';

export default function FeedPage() {
  const { toast } = useToast();
  const [newPostContent, setNewPostContent] = useState("");
  const [includeDiscussion, setIncludeDiscussion] = useState(false);
  const [discussionGroupName, setDiscussionGroupName] = useState("");
  const [postPrivacy, setPostPrivacy] = useState<'public' | 'private' | 'custom'>('public');
  
  const [socialFeedPosts, setSocialFeedPosts] = useState<FeedItemCardProps[]>([]);
  const [trendingPosts, setTrendingPosts] = useState<FeedItemCardProps[]>(initialTrendingPosts); 
  const [isLoadingFeed, setIsLoadingFeed] = useState(true);

  useEffect(() => {
    setIsLoadingFeed(true);
    try {
      const storedSocialFeedPostsRaw = localStorage.getItem(SOCIAL_FEED_POSTS_STORAGE_KEY);
      if (storedSocialFeedPostsRaw) {
        const parsedPosts: FeedItemCardProps[] = JSON.parse(storedSocialFeedPostsRaw);
        setSocialFeedPosts(parsedPosts);
      } else {
        setSocialFeedPosts(initialSocialFeedPosts); 
        localStorage.setItem(SOCIAL_FEED_POSTS_STORAGE_KEY, JSON.stringify(initialSocialFeedPosts));
      }
    } catch (error) {
      console.error("Error loading social feed posts from localStorage:", error);
      setSocialFeedPosts(initialSocialFeedPosts); // Fallback to initial if error
    }
    setIsLoadingFeed(false);
  }, []);

  useEffect(() => {
    if (!isLoadingFeed && socialFeedPosts.length >= 0) { 
      try {
        localStorage.setItem(SOCIAL_FEED_POSTS_STORAGE_KEY, JSON.stringify(socialFeedPosts));
      } catch (error) {
        console.error("Error saving social feed posts to localStorage:", error);
      }
    }
  }, [socialFeedPosts, isLoadingFeed]);

  const handleCreatePost = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newPostContent.trim()) {
      toast({ title: "Empty Post", description: "You can't submit an empty post.", variant: "destructive" });
      return;
    }
    if (includeDiscussion && !discussionGroupName.trim()) {
      toast({ title: "Missing Group Name", description: "Please provide a name for your discussion group.", variant: "destructive" });
      return;
    }

    const newPost: FeedItemCardProps = {
      id: `social-${Date.now()}`,
      postType: 'social',
      mainText: newPostContent,
      authorName: CURRENT_USER_NAME,
      authorInitials: CURRENT_USER_INITIALS, 
      authorAvatarUrl: CURRENT_USER_AVATAR_URL, 
      timestamp: 'Just now',
      likesCount: 0,
      comments: [],
      includeDiscussionGroup: includeDiscussion,
      discussionGroupName: includeDiscussion ? (discussionGroupName.trim() || `Discussion for: ${newPostContent.substring(0,30)}...`) : undefined,
      privacy: postPrivacy,
    };

    const updatedSocialFeed = [newPost, ...socialFeedPosts];
    setSocialFeedPosts(updatedSocialFeed);

    if (newPost.authorName === CURRENT_USER_NAME) {
      try {
        const existingUserPostsRaw = localStorage.getItem(USER_POSTS_STORAGE_KEY);
        const existingUserPosts: FeedItemCardProps[] = existingUserPostsRaw ? JSON.parse(existingUserPostsRaw) : [];
        localStorage.setItem(USER_POSTS_STORAGE_KEY, JSON.stringify([newPost, ...existingUserPosts]));
      } catch (error) {
        console.error("Error saving post to user's posts localStorage:", error);
        toast({ title: "Storage Error", description: "Could not save your post for your profile page.", variant: "destructive" });
      }
    }

    setNewPostContent("");
    setIncludeDiscussion(false);
    setDiscussionGroupName("");
    setPostPrivacy('public'); // Reset privacy to default
    toast({ title: "Post Submitted!", description: "Your thoughts have been shared." });
  };

  const handleDeletePost = (postId: string) => {
    const updatedFeed = socialFeedPosts.filter(post => post.id !== postId);
    setSocialFeedPosts(updatedFeed);
    
    try {
      const existingUserPostsRaw = localStorage.getItem(USER_POSTS_STORAGE_KEY);
      if (existingUserPostsRaw) {
        const existingUserPosts: FeedItemCardProps[] = JSON.parse(existingUserPostsRaw);
        const updatedUserPosts = existingUserPosts.filter(post => post.id !== postId);
        localStorage.setItem(USER_POSTS_STORAGE_KEY, JSON.stringify(updatedUserPosts));
      }
    } catch (error) {
      console.error("Error removing post from user's posts localStorage:", error);
    }
    toast({ title: "Post Deleted", description: "The post has been removed from the feed." });
  };

  const handleUpdatePostComments = (postId: string, updatedComments: FeedItemComment[]) => {
    const updatedFeed = socialFeedPosts.map(post => 
      post.id === postId ? { ...post, comments: updatedComments } : post
    );
    setSocialFeedPosts(updatedFeed);

     try {
      const existingUserPostsRaw = localStorage.getItem(USER_POSTS_STORAGE_KEY);
      if (existingUserPostsRaw) {
        const existingUserPosts: FeedItemCardProps[] = JSON.parse(existingUserPostsRaw);
        const updatedUserPosts = existingUserPosts.map(post =>
          post.id === postId ? { ...post, comments: updatedComments } : post
        );
        localStorage.setItem(USER_POSTS_STORAGE_KEY, JSON.stringify(updatedUserPosts));
      }
    } catch (error) {
      console.error("Error updating comments in user's posts localStorage:", error);
    }
  };

  const filteredSocialFeedPosts = socialFeedPosts.filter(post => {
    if (post.privacy === 'public') return true;
    if (post.privacy === 'private' || post.privacy === 'custom') { // Custom behaves like private for this sim
      return post.authorName === CURRENT_USER_NAME;
    }
    return true; // Should not happen with defined privacy types
  });


  return (
    <div className="space-y-8">
      <header className="text-center space-y-2">
        <MessageSquareText className="mx-auto h-16 w-16 text-primary" />
        <h1 className="text-5xl font-headline tracking-tight text-primary">Community Feed</h1>
        <p className="text-xl text-foreground font-body font-semibold">
          Discover what's happening, share your thoughts, and connect.
        </p>
      </header>
      
      <Tabs defaultValue="social-feed" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="social-feed">
            <Users className="mr-2 h-4 w-4" /> Social Feed
          </TabsTrigger>
          <TabsTrigger value="trending-posts">
            <TrendingUp className="mr-2 h-4 w-4" /> Trending Posts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="social-feed" className="space-y-6">
          <Card className="w-full shadow-xl">
            <CardHeader>
              <CardTitle className="font-headline text-2xl text-primary flex items-center">
                <Edit className="mr-3 h-6 w-6" /> Create Post
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreatePost} className="space-y-4">
                <Textarea
                  placeholder={`What's on your mind, ${CURRENT_USER_NAME}?`}
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  className="min-h-[100px] font-body text-base"
                  rows={4}
                />
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeDiscussion"
                      checked={includeDiscussion}
                      onCheckedChange={(checkedState) => {
                        const newChecked = checkedState === true;
                        setIncludeDiscussion(newChecked);
                        if (!newChecked) {
                          setDiscussionGroupName(""); 
                        }
                      }}
                    />
                    <Label htmlFor="includeDiscussion" className="font-body text-sm text-muted-foreground">
                      Include 'Join Discussion' Group?
                    </Label>
                  </div>
                  <div className={`pl-6 space-y-1 ${includeDiscussion ? 'block' : 'hidden'}`}>
                     <Label htmlFor="discussionGroupName" className="font-body text-sm">
                      Discussion Group Name (Optional)
                    </Label>
                    <Input
                      id="discussionGroupName"
                      placeholder="E.g., Book Club Chat, Chapter 5 Theories"
                      value={discussionGroupName}
                      onChange={(e) => setDiscussionGroupName(e.target.value)}
                      className="font-body text-sm"
                      disabled={!includeDiscussion}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="font-body text-sm font-medium">Post Privacy</Label>
                  <RadioGroup
                    value={postPrivacy}
                    onValueChange={(value: 'public' | 'private' | 'custom') => setPostPrivacy(value)}
                    className="flex flex-col sm:flex-row gap-2 sm:gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="public" id="privacy-public" />
                      <Label htmlFor="privacy-public" className="font-body text-sm flex items-center"><Globe className="mr-1.5 h-4 w-4 text-blue-500"/>Public</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="private" id="privacy-private" />
                      <Label htmlFor="privacy-private" className="font-body text-sm flex items-center"><Lock className="mr-1.5 h-4 w-4 text-orange-500"/>Private</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="custom" id="privacy-custom" />
                      <Label htmlFor="privacy-custom" className="font-body text-sm flex items-center"><UserCheck className="mr-1.5 h-4 w-4 text-green-500"/>Custom</Label>
                    </div>
                  </RadioGroup>
                  <p className="text-xs text-muted-foreground font-body pl-1">
                    {postPrivacy === 'public' && 'Visible to everyone.'}
                    {postPrivacy === 'private' && 'Visible to you. (Simulation: In a real app, this would be followers/following).'}
                    {postPrivacy === 'custom' && 'Visible to you. (Simulation: In a real app, you could select specific users).'}
                  </p>
                </div>


                <div className="flex justify-end">
                  <Button type="submit" size="lg">
                    <Send className="mr-2 h-5 w-5" /> Post
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {isLoadingFeed ? (
            <p className="text-center text-muted-foreground py-8">Loading feed...</p>
          ) : filteredSocialFeedPosts.length > 0 ? (
             filteredSocialFeedPosts.map(post => (
              <FeedItemCard 
                key={post.id} 
                {...post} 
                onDeletePost={handleDeletePost}
                onUpdateComments={handleUpdatePostComments}
                isFullView={true}
                currentUserName={CURRENT_USER_NAME}
              />
            ))
          ) : ( 
            <p className="text-center text-muted-foreground py-8">The social feed is quiet for now. Create a post or follow others to see updates!</p>
          )}
        </TabsContent>

        <TabsContent value="trending-posts">
          <div className="space-y-6">
            {trendingPosts.map(post => (
              <FeedItemCard 
                key={post.id} 
                {...post} 
                isFullView={true}
                onDeletePost={() => toast({ title: "Action Denied", description: "Trending posts cannot be deleted from this view."})}
                onUpdateComments={(postId, comments) => {
                  setTrendingPosts(prev => prev.map(p => p.id === postId ? {...p, comments} : p));
                }}
                currentUserName={CURRENT_USER_NAME}
              />
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

    