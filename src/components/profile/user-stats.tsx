
interface UserStatsProps {
  postsCount: number;
  followersCount: number;
  followingCount: number;
}

export function UserStats({ postsCount, followersCount, followingCount }: UserStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-4 text-center p-4 rounded-lg bg-card shadow-md">
      <div>
        <p className="text-2xl font-bold text-primary">{postsCount}</p>
        <p className="text-sm text-muted-foreground font-body">Posts</p>
      </div>
      <div>
        <p className="text-2xl font-bold text-primary">{followersCount}</p>
        <p className="text-sm text-muted-foreground font-body">Followers</p>
      </div>
      <div>
        <p className="text-2xl font-bold text-primary">{followingCount}</p>
        <p className="text-sm text-muted-foreground font-body">Following</p>
      </div>
    </div>
  );
}
