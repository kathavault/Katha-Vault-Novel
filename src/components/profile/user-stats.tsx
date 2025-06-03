
"use client";

import { useToast } from "@/hooks/use-toast";

interface UserStatsProps {
  postsCount: number;
  followersCount: number;
  followingCount: number;
}

export function UserStats({ postsCount, followersCount, followingCount }: UserStatsProps) {
  const { toast } = useToast();

  const handleStatClick = (statName: string) => {
    toast({
      title: `Viewing ${statName}`,
      description: `Functionality to display actual ${statName.toLowerCase()} list is coming soon!`,
    });
  };

  return (
    <div className="grid grid-cols-3 gap-4 text-center p-4 rounded-lg bg-card shadow-md">
      <div 
        className="cursor-pointer hover:bg-muted/50 p-2 rounded-md transition-colors" 
        onClick={() => handleStatClick("Posts")}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleStatClick("Posts")}
      >
        <p className="text-2xl font-bold text-primary">{postsCount}</p>
        <p className="text-sm text-muted-foreground font-body">Posts</p>
      </div>
      <div 
        className="cursor-pointer hover:bg-muted/50 p-2 rounded-md transition-colors" 
        onClick={() => handleStatClick("Followers")}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleStatClick("Followers")}
      >
        <p className="text-2xl font-bold text-primary">{followersCount}</p>
        <p className="text-sm text-muted-foreground font-body">Followers</p>
      </div>
      <div 
        className="cursor-pointer hover:bg-muted/50 p-2 rounded-md transition-colors" 
        onClick={() => handleStatClick("Following")}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleStatClick("Following")}
      >
        <p className="text-2xl font-bold text-primary">{followingCount}</p>
        <p className="text-sm text-muted-foreground font-body">Following</p>
      </div>
    </div>
  );
}
