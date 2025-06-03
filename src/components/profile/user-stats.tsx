
"use client";

interface UserStatsProps {
  postsCount: number;
  followersCount: number;
  followingCount: number;
  onViewFollowers: () => void;
  onViewFollowing: () => void;
}

export function UserStats({ 
  postsCount, 
  followersCount, 
  followingCount,
  onViewFollowers,
  onViewFollowing
}: UserStatsProps) {

  // Placeholder for viewing posts, can be enhanced later
  const handleViewPosts = () => {
    // For now, maybe scroll to "My Posts" tab or link to a dedicated posts page if it exists
    console.log("View posts clicked - functionality can be expanded.");
     const postsTab = document.querySelector('button[data-state="inactive"][role="tab"][value="my-posts"]') as HTMLElement | null;
    if (postsTab) {
        postsTab.click();
         const postsSection = document.getElementById("my-posts-section"); // Assuming you add an ID to the section
        if (postsSection) {
            postsSection.scrollIntoView({ behavior: 'smooth' });
        }
    }
  };

  return (
    <div className="grid grid-cols-3 gap-px text-center p-4 rounded-lg bg-card shadow-md">
      <div 
        className="cursor-pointer hover:bg-muted/50 p-3 rounded-l-md transition-colors" 
        onClick={handleViewPosts}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleViewPosts()}
      >
        <p className="text-2xl font-bold text-primary">{postsCount}</p>
        <p className="text-sm text-muted-foreground font-body">Posts</p>
      </div>
      <div 
        className="cursor-pointer hover:bg-muted/50 p-3 transition-colors" 
        onClick={onViewFollowers}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onViewFollowers()}
      >
        <p className="text-2xl font-bold text-primary">{followersCount}</p>
        <p className="text-sm text-muted-foreground font-body">Followers</p>
      </div>
      <div 
        className="cursor-pointer hover:bg-muted/50 p-3 rounded-r-md transition-colors" 
        onClick={onViewFollowing}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onViewFollowing()}
      >
        <p className="text-2xl font-bold text-primary">{followingCount}</p>
        <p className="text-sm text-muted-foreground font-body">Following</p>
      </div>
    </div>
  );
}
