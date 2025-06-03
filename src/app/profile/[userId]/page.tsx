
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { UserProfileHeader } from '@/components/profile/user-profile-header';
import { UserStats } from '@/components/profile/user-stats';
import { FeedItemCard, type FeedItemCardProps, type FeedItemComment } from '@/components/forum-post-card';
import { UserListModal, type ModalUser as ProfileModalUser } from '@/components/profile/user-list-modal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit2, Loader2, AlertTriangle } from 'lucide-react'; // Added AlertTriangle
import { useToast } from "@/hooks/use-toast";
import { 
  allMockUsers, 
  CURRENT_USER_ID, 
  getInitialFollowingIds, 
  updateFollowingIds, 
  type MockUser,
  getKathaExplorerUser,
  isUserLoggedIn // Import isUserLoggedIn
} from '@/lib/mock-data';
import { Button } from '@/components/ui/button';

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


export default function UserProfilePage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const viewedUserId = typeof params.userId === 'string' ? params.userId : '';
  
  const [loggedInUser, setLoggedInUser] = useState<MockUser | null>(null); // Initialize as null
  const [viewedUser, setViewedUser] = useState<MockUser | null>(null);
  const [userPosts, setUserPosts] = useState<FeedItemCardProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  
  const [followersList, setFollowersList] = useState<ProfileModalUser[]>([]);
  const [followingList, setFollowingList] = useState<ProfileModalUser[]>([]);
  const [modalOpenFor, setModalOpenFor] = useState<'followers' | 'following' | null>(null);
  const [modalUsers, setModalUsers] = useState<ProfileModalUser[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined' && !isUserLoggedIn()) {
      router.replace(`/login?redirect=/profile/${viewedUserId}`);
      return;
    }
    
    const currentLoggedInUser = getKathaExplorerUser();
    setLoggedInUser(currentLoggedInUser);

    if (viewedUserId === CURRENT_USER_ID) {
      router.replace('/profile'); 
      return;
    }

    const user = allMockUsers.find(u => u.id === viewedUserId);
    if (user) {
      setViewedUser(user);
      const currentFollowingIds = getInitialFollowingIds();
      setIsFollowing(currentFollowingIds.includes(viewedUserId));

      try {
        const allPostsRaw = typeof window !== 'undefined' ? localStorage.getItem(SOCIAL_FEED_POSTS_STORAGE_KEY) : null;
        if (allPostsRaw) {
          const allPosts: FeedItemCardProps[] = JSON.parse(allPostsRaw);
          const postsByThisUser = allPosts.filter(p => 
            p.authorId === viewedUserId && 
            (p.privacy === 'public' || 
             (p.privacy === 'custom' && p.customAudienceUserIds?.includes(currentLoggedInUser.id)))
          );
          setUserPosts(postsByThisUser);
        }
      } catch (e) {
        console.error("Error loading posts for viewed user", e);
        setUserPosts([]);
      }

      const simulatedFollowers = allMockUsers.filter(u => u.id !== viewedUserId && Math.random() > 0.5).slice(0, Math.floor(Math.random() * 5) + 1);
      setFollowersList(mapMockUsersToProfileModalUsers(simulatedFollowers));
      
      const simulatedFollowing = allMockUsers.filter(u => u.id !== viewedUserId && Math.random() > 0.3).slice(0, Math.floor(Math.random() * 4) + 2);
      setFollowingList(mapMockUsersToProfileModalUsers(simulatedFollowing));

    } else {
      toast({ title: "User Not Found", description: "This profile could not be loaded.", variant: "destructive" });
    }
    setIsLoading(false);
  }, [viewedUserId, router, toast]);

  const handleFollowToggle = () => {
    if (!viewedUser || !isUserLoggedIn()) { // Check if logged in
        toast({ title: "Login Required", description: "Please login to follow users.", variant: "destructive" });
        router.push(`/login?redirect=/profile/${viewedUserId}`);
        return;
    }
    const currentFollowingIds = getInitialFollowingIds();
    let updatedFollowingIds: string[];

    if (isFollowing) {
      updatedFollowingIds = currentFollowingIds.filter(id => id !== viewedUser.id);
      toast({ title: "Unfollowed", description: `You are no longer following ${viewedUser.name}.` });
    } else {
      updatedFollowingIds = [...currentFollowingIds, viewedUser.id];
      toast({ title: "Followed", description: `You are now following ${viewedUser.name}.` });
    }
    updateFollowingIds(updatedFollowingIds);
    setIsFollowing(!isFollowing);
  };
  
  const openUserListModal = (type: 'followers' | 'following') => {
    if (type === 'followers') {
      setModalUsers(followersList);
    } else {
      setModalUsers(followingList);
    }
    setModalOpenFor(type);
  };

  const handleModalActionClick = (userIdToListAction: string) => {
    if (modalOpenFor === 'followers') {
      router.push(`/profile/${userIdToListAction}`);
    } else if (modalOpenFor === 'following') {
      router.push(`/profile/${userIdToListAction}`);
    }
    setModalOpenFor(null);
  };


  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /> Loading profile...</div>;
  }

  if (!viewedUser) {
    return (
      <div className="text-center py-10 flex flex-col items-center">
        <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold">User Not Found</h1>
        <p className="text-muted-foreground">The profile you are looking for does not exist or could not be loaded.</p>
        <Button onClick={() => router.push('/forum')} className="mt-6">Go to Feed</Button>
      </div>
    );
  }
  
  if (!loggedInUser) { // Should be caught by useEffect, but as a fallback
      return <div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /> Redirecting to login...</div>;
  }


  return (
    <div className="space-y-8">
      <UserProfileHeader
        userId={viewedUser.id}
        name={viewedUser.name}
        username={viewedUser.username}
        avatarUrl={viewedUser.avatarUrl}
        bio={viewedUser.bio}
        email={viewedUser.email}
        emailVisible={viewedUser.emailVisible}
        gender={viewedUser.gender}
        isViewingOwnProfile={false}
        isFollowing={isFollowing}
        onFollowToggle={handleFollowToggle}
      />
      <UserStats
        postsCount={userPosts.length} 
        followersCount={followersList.length} 
        followingCount={followingList.length} 
        onViewFollowers={() => openUserListModal('followers')}
        onViewFollowing={() => openUserListModal('following')}
      />

      <Tabs defaultValue="user-posts" className="w-full">
        <TabsList className="grid w-full grid-cols-1"> 
           <TabsTrigger value="user-posts"> 
            <Edit2 className="mr-2 h-4 w-4" /> Posts by {viewedUser.name}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="user-posts" className="mt-6">
          <div className="space-y-6">
            {userPosts.length > 0 ? (
              userPosts.map(post => (
                <FeedItemCard 
                  key={post.id} 
                  {...post} 
                  onDeletePost={() => toast({ title: "Action Not Allowed", description: "You cannot delete another user's post."})}
                  onUpdateComments={() => { /* Placeholder, or disallow */ }}
                  isFullView={true} 
                  currentUserName={loggedInUser.name} 
                  currentUserId={loggedInUser.id}   
                />
              )) 
            ) : (
              <p className="text-muted-foreground font-body">{viewedUser.name} hasn't made any public posts yet, or no posts are visible to you.</p>
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
          title={`${modalOpenFor === 'followers' ? 'Followers' : 'Following'} of ${viewedUser.name}`}
          users={modalUsers}
          actionButtonLabel="View Profile"
          onActionButtonClick={handleModalActionClick}
          emptyStateMessage={`${viewedUser.name} is not ${modalOpenFor === 'followers' ? 'followed by anyone' : 'following anyone'} yet (simulated).`}
          currentUserId={loggedInUser.id} 
        />
      )}
    </div>
  );
}
