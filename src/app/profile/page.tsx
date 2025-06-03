
"use client";

import { useState, useEffect } from 'react';
import { UserProfileHeader } from '@/components/profile/user-profile-header';
import { UserStats } from '@/components/profile/user-stats';
import { ReadingProgressItem } from '@/components/profile/reading-progress-item';
import { FeedItemCard, type FeedItemCardProps, type FeedItemComment } from '@/components/forum-post-card'; 
import { UserListModal, type ModalUser as ProfileModalUser } from '@/components/profile/user-list-modal'; // Renamed to avoid conflict
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpenText, Edit2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { kathaExplorerUser, allMockUsers, kathaExplorerFollowingIds, MockUser } from '@/lib/mock-data';

const USER_POSTS_STORAGE_KEY = 'currentUserKathaVaultPosts';
const SOCIAL_FEED_POSTS_STORAGE_KEY = 'kathaVaultSocialFeedPosts'; 


const initialUserProfileData = { // Renamed from initialUserProfile to avoid conflict if any
  name: kathaExplorerUser.name,
  username: kathaExplorerUser.username,
  avatarUrl: kathaExplorerUser.avatarUrl,
  bio: 'Avid reader and aspiring writer. Exploring worlds one story at a time.',
  email: 'katha.explorer@example.com',
  emailVisible: true,
  gender: 'Prefer not to say',
  postsCount: 0, 
  followersCount: 0, // Will be updated from mock data
  followingCount: 0, // Will be updated from mock data
};

const readingProgress = [
  { id: 'story1', title: 'The Last Nebula', progress: 75, coverImageUrl: 'https://placehold.co/600x400.png', aiHint: 'nebula space' },
  { id: 'story2', title: 'Echoes in the Silence', progress: 30, coverImageUrl: 'https://placehold.co/600x400.png', aiHint: 'snowy village' },
];

// Convert MockUser to ProfileModalUser for the modal
const mapMockUsersToProfileModalUsers = (mockUsers: MockUser[]): ProfileModalUser[] => {
  return mockUsers.map(u => ({
    id: u.id,
    name: u.name,
    username: u.username,
    avatarUrl: u.avatarUrl,
    avatarFallback: u.avatarFallback,
    dataAiHint: u.dataAiHint,
  }));
};

// Simulated followers/following lists derived from allMockUsers and kathaExplorerFollowingIds
const initialFollowersList: ProfileModalUser[] = mapMockUsersToProfileModalUsers(
  allMockUsers.filter(u => u.id !== kathaExplorerUser.id && !kathaExplorerFollowingIds.includes(u.id)).slice(0, 3) // Example: first 3 non-following users
); 
const initialFollowingList: ProfileModalUser[] = mapMockUsersToProfileModalUsers(
  allMockUsers.filter(u => kathaExplorerFollowingIds.includes(u.id))
);


export type UserProfileData = typeof initialUserProfileData;
export type EditableUserProfileData = Pick<UserProfileData, 'name' | 'username' | 'bio' | 'email' | 'emailVisible' | 'gender'>;

export default function ProfilePage() {
  const { toast } = useToast();
  const [userProfile, setUserProfile] = useState<UserProfileData>(initialUserProfileData);
  const [myProfilePosts, setMyProfilePosts] = useState<FeedItemCardProps[]>([]);
  
  const [followers, setFollowers] = useState<ProfileModalUser[]>(initialFollowersList);
  const [following, setFollowing] = useState<ProfileModalUser[]>(initialFollowingList);

  const [modalOpenFor, setModalOpenFor] = useState<'followers' | 'following' | null>(null);
  const [modalUsers, setModalUsers] = useState<ProfileModalUser[]>([]);
  const [modalTitle, setModalTitle] = useState("");
  const [modalActionButtonLabel, setModalActionButtonLabel] = useState("");

  const loadUserPosts = () => {
    try {
      const storedPostsRaw = localStorage.getItem(USER_POSTS_STORAGE_KEY);
      if (storedPostsRaw) {
        const storedPosts: FeedItemCardProps[] = JSON.parse(storedPostsRaw);
        setMyProfilePosts(storedPosts);
        setUserProfile(prev => ({ ...prev, postsCount: storedPosts.length }));
      } else {
         setMyProfilePosts([]);
        setUserProfile(prev => ({ ...prev, postsCount: 0 }));
      }
    } catch (error) {
      console.error("Error loading posts from localStorage:", error);
      toast({
        title: "Load Error",
        description: "Could not load your posts for the profile page.",
        variant: "destructive",
      });
       setMyProfilePosts([]);
       setUserProfile(prev => ({ ...prev, postsCount: 0 }));
    }
  };

  useEffect(() => {
    loadUserPosts();
    setUserProfile(prev => ({
      ...prev,
      followersCount: followers.length,
      followingCount: following.length,
    }));
  }, []); // Initial load for posts and set counts from static follower/following lists


  useEffect(() => { // Update counts if followers/following lists change
    setUserProfile(prev => ({
      ...prev,
      followersCount: followers.length,
      followingCount: following.length,
    }));
  }, [followers, following]);

  const handleAvatarChange = (newAvatarUrl: string) => {
    setUserProfile(prevProfile => ({ ...prevProfile, avatarUrl: newAvatarUrl }));
     // In a real app, also update kathaExplorerUser in mock-data or backend
  };

  const handleProfileSave = (updatedProfile: EditableUserProfileData) => {
    setUserProfile(prevProfile => ({
      ...prevProfile,
      ...updatedProfile,
    }));
    // In a real app, also update kathaExplorerUser in mock-data or backend if name/username changed
    toast({
      title: "Profile Updated",
      description: "Your profile details have been updated (local changes).",
    });
  };

  const openUserListModal = (type: 'followers' | 'following') => {
    if (type === 'followers') {
      setModalUsers(followers);
      setModalTitle("Followers");
      setModalActionButtonLabel("Remove"); // Or "View Profile" if non-interactive
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
      toast({ title: "Follower Removed (Simulated)", description: "This change is local to your session."});
    } else if (modalOpenFor === 'following') {
      setFollowing(prev => {
        const updatedFollowing = prev.filter(user => user.id !== userId);
        // Also update kathaExplorerFollowingIds in mock-data for consistency if needed elsewhere
        // For now, this is a local simulation for the profile page display
        return updatedFollowing;
      });
      toast({ title: "User Unfollowed (Simulated)", description: "This change is local to your session."});
    }
    setModalOpenFor(null); // Close modal after action
  };

  const handleDeleteMyPost = (postId: string) => {
    const updatedPosts = myProfilePosts.filter(post => post.id !== postId);
    setMyProfilePosts(updatedPosts);
    localStorage.setItem(USER_POSTS_STORAGE_KEY, JSON.stringify(updatedPosts));
    setUserProfile(prev => ({ ...prev, postsCount: updatedPosts.length }));
    
    try {
        const socialFeedRaw = localStorage.getItem(SOCIAL_FEED_POSTS_STORAGE_KEY);
        if (socialFeedRaw) {
            let socialFeed: FeedItemCardProps[] = JSON.parse(socialFeedRaw);
            socialFeed = socialFeed.filter(p => p.id !== postId);
            localStorage.setItem(SOCIAL_FEED_POSTS_STORAGE_KEY, JSON.stringify(socialFeed));
        }
    } catch (e) {
        console.error("Error removing post from social feed localStorage", e);
    }
    toast({ title: "Post Deleted", description: "Your post has been removed." });
  };

  const handleUpdateMyPostComments = (postId: string, updatedComments: FeedItemComment[]) => {
    const updatedPosts = myProfilePosts.map(post => 
      post.id === postId ? { ...post, comments: updatedComments } : post
    );
    setMyProfilePosts(updatedPosts);
    localStorage.setItem(USER_POSTS_STORAGE_KEY, JSON.stringify(updatedPosts));

     try {
        const socialFeedRaw = localStorage.getItem(SOCIAL_FEED_POSTS_STORAGE_KEY);
        if (socialFeedRaw) {
            let socialFeed: FeedItemCardProps[] = JSON.parse(socialFeedRaw);
            socialFeed = socialFeed.map(p => p.id === postId ? { ...p, comments: updatedComments } : p);
            localStorage.setItem(SOCIAL_FEED_POSTS_STORAGE_KEY, JSON.stringify(socialFeed));
        }
    } catch (e) {
        console.error("Error updating comments in social feed localStorage", e);
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

      <Tabs defaultValue="my-posts" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
           <TabsTrigger value="my-posts" onClick={loadUserPosts}> 
            <Edit2 className="mr-2 h-4 w-4" /> My Posts
          </TabsTrigger>
          <TabsTrigger value="reading-progress">
            <BookOpenText className="mr-2 h-4 w-4" /> Reading Progress
          </TabsTrigger>
        </TabsList>
        <TabsContent value="my-posts" className="mt-6">
          <div className="space-y-6">
            <h2 className="text-2xl font-headline text-primary" id="my-posts-section">My Posts</h2>
            {myProfilePosts.length > 0 ? (
              myProfilePosts.map(post => (
                <FeedItemCard 
                  key={post.id} 
                  {...post} 
                  onDeletePost={handleDeleteMyPost}
                  onUpdateComments={handleUpdateMyPostComments}
                  isFullView={true} 
                  currentUserName={kathaExplorerUser.name}
                  currentUserId={kathaExplorerUser.id}
                />
              )) 
            ) : (
              <p className="text-muted-foreground font-body">You haven't made any posts yet. Create one in the Community Feed!</p>
            )}
          </div>
        </TabsContent>
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
      </Tabs>

      {modalOpenFor && (
        <UserListModal
          isOpen={!!modalOpenFor}
          onOpenChange={(isOpen) => {
            if (!isOpen) setModalOpenFor(null);
          }}
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
