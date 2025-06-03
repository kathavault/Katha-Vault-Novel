
"use client";

import { useState } from 'react';
import { UserProfileHeader } from '@/components/profile/user-profile-header';
import { UserStats } from '@/components/profile/user-stats';
import { ReadingProgressItem } from '@/components/profile/reading-progress-item';
import { UserPostItem } from '@/components/profile/user-post-item';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpenText, Edit2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

// Placeholder data - this would come from your backend/auth
const initialUserProfile = {
  name: 'Katha Explorer',
  username: '@katha_explorer',
  avatarUrl: 'https://placehold.co/128x128.png',
  bio: 'Avid reader and aspiring writer. Exploring worlds one story at a time.',
  postsCount: 12,
  followersCount: 156,
  followingCount: 78,
};

const readingProgress = [
  { id: 'story1', title: 'The Last Nebula', progress: 75, coverImageUrl: 'https://placehold.co/600x400.png', aiHint: 'nebula space' },
  { id: 'story2', title: 'Echoes in the Silence', progress: 30, coverImageUrl: 'https://placehold.co/600x400.png', aiHint: 'snowy village' },
];

const userPosts = [
  { id: 'post1', text: 'Just finished "The Midnight Library" - what an amazing concept! Highly recommend it. #bookrecommendation', timestamp: '2h ago', likes: 15, comments: 3 },
  { id: 'post2', text: 'Struggling with writer\'s block today. Any tips for getting the creative juices flowing? #writingcommunity', timestamp: '1d ago', likes: 8, comments: 5 },
];

export default function ProfilePage() {
  const { toast } = useToast();
  const [userProfile, setUserProfile] = useState(initialUserProfile);

  const handleAvatarChange = (newAvatarUrl: string) => {
    setUserProfile(prevProfile => ({ ...prevProfile, avatarUrl: newAvatarUrl }));
    toast({
      title: "Profile Picture Updated",
      description: "Your new avatar is now displayed. This is a local change.",
    });
  };

  return (
    <div className="space-y-8">
      <UserProfileHeader
        name={userProfile.name}
        username={userProfile.username}
        avatarUrl={userProfile.avatarUrl}
        bio={userProfile.bio}
        onAvatarChange={handleAvatarChange}
      />
      <UserStats
        postsCount={userProfile.postsCount}
        followersCount={userProfile.followersCount}
        followingCount={userProfile.followingCount}
      />

      <Tabs defaultValue="reading-progress" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="reading-progress">
            <BookOpenText className="mr-2 h-4 w-4" /> Reading Progress
          </TabsTrigger>
          <TabsTrigger value="my-posts">
            <Edit2 className="mr-2 h-4 w-4" /> My Posts
          </TabsTrigger>
        </TabsList>
        <TabsContent value="reading-progress" className="mt-6">
          <div className="space-y-6">
            <h2 className="text-2xl font-headline text-primary">Currently Reading</h2>
            {readingProgress.length > 0 ? (
              readingProgress.map(item => <ReadingProgressItem key={item.id} {...item} />)
            ) : (
              <p className="text-muted-foreground font-body">No stories in progress. Start reading to track them here!</p>
            )}
          </div>
        </TabsContent>
        <TabsContent value="my-posts" className="mt-6">
          <div className="space-y-6">
            <h2 className="text-2xl font-headline text-primary">My Posts</h2>
            {userPosts.length > 0 ? (
              userPosts.map(post => <UserPostItem key={post.id} {...post} />)
            ) : (
              <p className="text-muted-foreground font-body">You haven't made any posts yet.</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
