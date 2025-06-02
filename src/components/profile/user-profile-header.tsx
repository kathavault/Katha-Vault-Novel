
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';

interface UserProfileHeaderProps {
  name: string;
  username: string;
  avatarUrl: string;
  bio: string;
}

export function UserProfileHeader({ name, username, avatarUrl, bio }: UserProfileHeaderProps) {
  return (
    <div className="flex flex-col items-center space-y-4 text-center md:flex-row md:items-start md:space-y-0 md:space-x-6 md:text-left p-4 rounded-lg bg-card shadow-md">
      <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-primary">
        <AvatarImage src={avatarUrl} alt={name} data-ai-hint="person portrait" />
        <AvatarFallback>{name.substring(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex-grow space-y-2">
        <h1 className="text-3xl md:text-4xl font-headline text-primary">{name}</h1>
        <p className="text-lg text-muted-foreground font-body">{username}</p>
        <p className="font-body text-foreground/80 max-w-md">{bio}</p>
         <Button variant="outline" size="sm" className="mt-2">
          <Edit className="mr-2 h-4 w-4" /> Edit Profile
        </Button>
      </div>
    </div>
  );
}
