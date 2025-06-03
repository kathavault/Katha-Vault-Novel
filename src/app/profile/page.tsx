
"use client";

import { useState, useEffect } from 'react';
import { UserProfileHeader } from '@/components/profile/user-profile-header';
import { UserStats } from '@/components/profile/user-stats';
import { ReadingProgressItem } from '@/components/profile/reading-progress-item';
import { FeedItemCard, type FeedItemCardProps } from '@/components/forum-post-card'; 
import { UserListModal, type ModalUser } from '@/components/profile/user-list-modal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpenText, Edit2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const initialUserProfile = {
  name: 'Katha Explorer',
  username: 'katha_explorer',
  avatarUrl: 'https://placehold.co/128x128.png',
  bio: 'Avid reader and aspiring writer. Exploring worlds one story at a time.',
  email: 'katha.explorer@example.com',
  emailVisible: true,
  gender: 'Prefer not to say',
  postsCount: 0, 
  followersCount: 3,
  followingCount: 2,
};

const readingProgress = [
  { id: 'story1', title: 'The Last Nebula', progress: 75, coverImageUrl: 'https://placehold.co/600x400.png', aiHint: 'nebula space' },
  { id: 'story2', title: 'Echoes in the Silence', progress: 30, coverImageUrl: 'https://placehold.co/600x400.png', aiHint: 'snowy village' },
];

const initialFollowers: ModalUser[] = [
  { id: 'follower1', name: 'Elara Reads', username: 'elara_reads', avatarUrl: 'https://placehold.co/40x40.png', avatarFallback: 'ER', dataAiHint: 'person reading' },
  { id: 'follower2', name: 'Marcus Writes', username: 'marcus_writes', avatarUrl: 'https://placehold.co/40x40.png', avatarFallback: 'MW', dataAiHint: 'person writing' },
  { id: 'follower3', name: 'SciFi Guru', username: 'scifi_guru', avatarUrl: 'https://placehold.co/40x40.png', avatarFallback: 'SG', dataAiHint: 'person space' },
];

const initialFollowing: ModalUser[] = [
  { id: 'following1', name: 'Fantasy Fan', username: 'fantasy_fan', avatarUrl: 'https://placehold.co/40x40.png', avatarFallback: 'FF', dataAiHint: 'person fantasy' },
  { id: 'following2', name: 'Mystery Lover', username: 'mystery_lover', avatarUrl: 'https://placehold.co/40x40.png', avatarFallback: 'ML', dataAiHint: 'person detective' },
];

const CURRENT_USER_POSTS_STORAGE_KEY = 'currentUserKathaVaultPosts';

export type UserProfileData = typeof initialUserProfile;
export type EditableUserProfileData = Pick<UserProfileData, 'name' | 'username' | 'bio' | 'email' | 'emailVisible' | 'gender'>;

export default function ProfilePage() {
  const { toast } = useToast();
  const [userProfile, setUserProfile] = useState<UserProfileData>(initialUserProfile);
  const [myProfilePosts, setMyProfilePosts] = useState<FeedItemCardProps[]>([]);
  
  const [followers, setFollowers] = useState<ModalUser[]>(initialFollowers);
  const [following, setFollowing] = useState<ModalUser[]>(initialFollowing);

  const [modalOpenFor, setModalOpenFor] = useState<'followers' | 'following' | null>(null);
  const [modalUsers, setModalUsers] = useState<ModalUser[]>([]);
  const [modalTitle, setModalTitle] = useState("");
  const [modalActionButtonLabel, setModalActionButtonLabel] = useState("");

  useEffect(() => {
    try {
      const storedPostsRaw = localStorage.getItem(CURRENT_USER_POSTS_STORAGE_KEY);
      if (storedPostsRaw) {
        const storedPosts: FeedItemCardProps[] = JSON.parse(storedPostsRaw);
        setMyProfilePosts(storedPosts);
        setUserProfile(prev => ({ ...prev, postsCount: storedPosts.length }));
      } else {
        setUserProfile(prev => ({ ...prev, postsCount: 0 }));
      }
    } catch (error) {
      console.error("Error loading posts from localStorage:", error);
      toast({
        title: "Load Error",
        description: "Could not load your posts for the profile page.",
        variant: "destructive",
      });
       setUserProfile(prev => ({ ...prev, postsCount: 0 }));
    }
  }, [toast]);


  useEffect(() => {
    setUserProfile(prev => ({
      ...prev,
      followersCount: followers.length,
      followingCount: following.length,
    }));
  }, [followers, following]);

  const handleAvatarChange = (newAvatarUrl: string) => {
    setUserProfile(prevProfile => ({ ...prevProfile, avatarUrl: newAvatarUrl }));
  };

  const handleProfileSave = (updatedProfile: EditableUserProfileData) => {
    setUserProfile(prevProfile => ({
      ...prevProfile,
      ...updatedProfile,
    }));
    toast({
      title: "Profile Updated",
      description: "Your profile details have been updated (local changes).",
    });
  };

  const openUserListModal = (type: 'followers' | 'following') => {
    if (type === 'followers') {
      setModalUsers(followers);
      setModalTitle("Followers");
      setModalActionButtonLabel("Remove");
    } else {
      setModalUsers(following);
      setModalTitle("Following");
      setModalActionButtonLabel("Unfollow");
    }
    setModalOpenFor(type);
  };

  const handleModalActionClick = (userId: string) => {
    if (modalOpenFor === 'followers') {
      setFollowers(prev => prev.filter(user => user.id !== userId));
      toast({ title: "Follower Removed", description: "This change is local to your session."});
    } else if (modalOpenFor === 'following') {
      setFollowing(prev => prev.filter(user => user.id !== userId));
      toast({ title: "User Unfollowed", description: "This change is local to your session."});
    }
  };

  return (
    <div className="space-y-8">
      <UserProfileHeader
        name={userProfile.name}
        username={userProfile.username}
        avatarUrl={userProfile.avatarUrl}
        bio={userProfile.bio}
        email={userProfile.email}
        emailVisible={userProfile.emailVisible}
        gender={userProfile.gender}
        onAvatarChange={handleAvatarChange}
        onProfileSave={handleProfileSave}
      />
      <UserStats
        postsCount={userProfile.postsCount}
        followersCount={userProfile.followersCount}
        followingCount={userProfile.followingCount}
        onViewFollowers={() => openUserListModal('followers')}
        onViewFollowing={() => openUserListModal('following')}
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
            <h2 className="text-2xl font-headline text-primary" id="my-posts-section">My Posts</h2>
            {myProfilePosts.length > 0 ? (
              myProfilePosts.map(post => <FeedItemCard key={post.id} {...post} />) 
            ) : (
              <p className="text-muted-foreground font-body">You haven't made any posts yet. Create one in the Community Feed!</p>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {modalOpenFor && (
        <UserListModal
          isOpen={!!modalOpenFor}
          onOpenChange={() => setModalOpenFor(null)}
          title={modalTitle}
          users={modalUsers}
          actionButtonLabel={modalActionButtonLabel}
          onActionButtonClick={handleModalActionClick}
          emptyStateMessage={modalOpenFor === 'followers' ? "You don't have any followers yet." : "You are not following anyone yet."}
        />
      )}
    </div>
  );
}
