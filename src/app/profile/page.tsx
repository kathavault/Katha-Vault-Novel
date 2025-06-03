
"use client";

import { useState, useEffect } from 'react';
import { UserProfileHeader } from '@/components/profile/user-profile-header';
import { UserStats } from '@/components/profile/user-stats';
import { ReadingProgressItem } from '@/components/profile/reading-progress-item';
import { FeedItemCard, type FeedItemCardProps, type FeedItemComment } from '@/components/forum-post-card'; 
import { UserListModal, type ModalUser as ProfileModalUser } from '@/components/profile/user-list-modal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpenText, Edit2, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { 
  allMockUsers, 
  getInitialFollowingIds, 
  getKathaExplorerFollowersList, 
  CURRENT_USER_ID, 
  // CURRENT_USER_NAME, // No longer directly used, fetched from getKathaExplorerUser
  updateFollowingIds, 
  type MockUser,
  getKathaExplorerUser,
  saveKathaExplorerUser
} from '@/lib/mock-data';

const USER_POSTS_STORAGE_KEY = 'currentUserKathaVaultPosts';
const SOCIAL_FEED_POSTS_STORAGE_KEY = 'kathaVaultSocialFeedPosts'; 

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

export type UserProfileData = MockUser & { postsCount: number, followersCount: number, followingCount: number };
export type EditableUserProfileData = Pick<UserProfileData, 'name' | 'username' | 'bio' | 'email' | 'emailVisible' | 'gender'>;

export default function ProfilePage() {
  const { toast } = useToast();
  const [currentUserProfileData, setCurrentUserProfileData] = useState<UserProfileData | null>(null);
  const [myProfilePosts, setMyProfilePosts] = useState<FeedItemCardProps[]>([]);
  
  const [followers, setFollowers] = useState<ProfileModalUser[]>([]);
  const [following, setFollowing] = useState<ProfileModalUser[]>([]);

  const [modalOpenFor, setModalOpenFor] = useState<'followers' | 'following' | null>(null);
  const [modalUsers, setModalUsers] = useState<ProfileModalUser[]>([]);
  const [modalTitle, setModalTitle] = useState("");
  const [modalActionButtonLabel, setModalActionButtonLabel] = useState("");
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const loadUserProfile = () => {
    const user = getKathaExplorerUser();
    // Counts will be updated after posts and follow lists are loaded
    setCurrentUserProfileData({
        ...user,
        postsCount: myProfilePosts.length, 
        followersCount: followers.length, 
        followingCount: following.length 
    });
    setIsLoadingProfile(false);
  };
  
  const loadUserPosts = () => {
    try {
      const storedPostsRaw = localStorage.getItem(USER_POSTS_STORAGE_KEY);
      const storedPosts: FeedItemCardProps[] = storedPostsRaw ? JSON.parse(storedPostsRaw) : [];
      setMyProfilePosts(storedPosts);
      setCurrentUserProfileData(prev => prev ? ({ ...prev, postsCount: storedPosts.length }) : null);
    } catch (error) {
      console.error("Error loading posts from localStorage:", error);
      toast({
        title: "Load Error",
        description: "Could not load your posts for the profile page.",
        variant: "destructive",
      });
       setMyProfilePosts([]);
       setCurrentUserProfileData(prev => prev ? ({ ...prev, postsCount: 0 }) : null);
    }
  };

  const refreshFollowCountsAndLists = () => {
     const currentFollowingIds = getInitialFollowingIds();
     const actualFollowingUsers = allMockUsers.filter(u => currentFollowingIds.includes(u.id) && u.id !== CURRENT_USER_ID);
     setFollowing(mapMockUsersToProfileModalUsers(actualFollowingUsers));
     
     // Simulate followers - can be more dynamic if we store followers per user
     const simulatedFollowers = getKathaExplorerFollowersList(5); 
     setFollowers(mapMockUsersToProfileModalUsers(simulatedFollowers));

     setCurrentUserProfileData(prev => prev ? ({
        ...prev,
        followersCount: simulatedFollowers.length,
        followingCount: actualFollowingUsers.length,
      }) : null);
  };

  useEffect(() => {
    loadUserProfile();
    loadUserPosts();
    refreshFollowCountsAndLists();
  }, []); 

  useEffect(() => { // Update profile data counts when posts or follow lists change
    if(currentUserProfileData){
        setCurrentUserProfileData(prev => prev ? ({
            ...prev,
            postsCount: myProfilePosts.length,
            followersCount: followers.length,
            followingCount: following.length,
        }): null);
    }
  }, [myProfilePosts, followers, following]);


  const handleAvatarChange = (newAvatarUrl: string) => {
    const currentUser = getKathaExplorerUser();
    const updatedUser = { ...currentUser, avatarUrl: newAvatarUrl };
    saveKathaExplorerUser(updatedUser);
    setCurrentUserProfileData(prev => prev ? ({ ...prev, avatarUrl: newAvatarUrl }) : null);
    toast({ title: "Avatar Updated", description: "Your avatar has been changed." });
  };

  const handleProfileSave = (updatedProfileData: EditableUserProfileData) => {
    const currentUser = getKathaExplorerUser();
    const updatedUser = {
      ...currentUser,
      ...updatedProfileData,
    };
    saveKathaExplorerUser(updatedUser);
    setCurrentUserProfileData(prev => prev ? ({ ...prev, ...updatedProfileData }) : null);
    toast({
      title: "Profile Updated",
      description: "Your profile details have been updated.",
    });
  };

  const openUserListModal = (type: 'followers' | 'following') => {
    if (type === 'followers') {
      setModalUsers(followers);
      setModalTitle("Followers");
      setModalActionButtonLabel("View Profile"); 
    } else {
      setModalUsers(following);
      setModalTitle("Following");
      setModalActionButtonLabel("Unfollow");
    }
    setModalOpenFor(type);
  };

  const handleModalActionClick = (userId: string) => {
    if (modalOpenFor === 'followers') {
      // Navigate to profile or show toast
      toast({ title: "View Profile Action", description: `Navigating to profile of user ${userId} (or would in a real app).` });
      // router.push(`/profile/${userId}`); // If you want actual navigation
    } else if (modalOpenFor === 'following') {
      const currentFollowingIds = getInitialFollowingIds();
      const updatedFollowingIds = currentFollowingIds.filter(id => id !== userId);
      updateFollowingIds(updatedFollowingIds);
      refreshFollowCountsAndLists(); 
      toast({ title: "User Unfollowed", description: "You are no longer following this user." });
    }
    setModalOpenFor(null); 
  };

  const handleDeleteMyPost = (postId: string) => {
    const updatedPosts = myProfilePosts.filter(post => post.id !== postId);
    setMyProfilePosts(updatedPosts);
    localStorage.setItem(USER_POSTS_STORAGE_KEY, JSON.stringify(updatedPosts));
    setCurrentUserProfileData(prev => prev ? ({ ...prev, postsCount: updatedPosts.length }) : null);
    
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

const readingProgress = [
  { id: 'story1', title: 'The Last Nebula', progress: 75, coverImageUrl: 'https://placehold.co/360x510.png', aiHint: 'nebula space' },
  { id: 'story2', title: 'Echoes in the Silence', progress: 30, coverImageUrl: 'https://placehold.co/360x510.png', aiHint: 'snowy village' },
];

  if (isLoadingProfile || !currentUserProfileData) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary"/> Loading profile...</div>;
  }

  return (
    <div className="space-y-8">
      <UserProfileHeader
        userId={CURRENT_USER_ID}
        name={currentUserProfileData.name}
        username={currentUserProfileData.username}
        avatarUrl={currentUserProfileData.avatarUrl}
        bio={currentUserProfileData.bio}
        email={currentUserProfileData.email}
        emailVisible={currentUserProfileData.emailVisible}
        gender={currentUserProfileData.gender}
        isViewingOwnProfile={true}
        onAvatarChange={handleAvatarChange}
        onProfileSave={handleProfileSave}
      />
      <UserStats
        postsCount={currentUserProfileData.postsCount}
        followersCount={currentUserProfileData.followersCount}
        followingCount={currentUserProfileData.followingCount}
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
                  currentUserName={currentUserProfileData.name} // Use persisted name
                  currentUserId={CURRENT_USER_ID}
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
          currentUserId={CURRENT_USER_ID}
        />
      )}
    </div>
  );
}
