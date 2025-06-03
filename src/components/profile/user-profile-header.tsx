
"use client";

import type React from 'react';
import { useRef } from 'react';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Edit, Camera } from 'lucide-react'; // Added Camera icon
import { useToast } from "@/hooks/use-toast";


interface UserProfileHeaderProps {
  name: string;
  username: string;
  avatarUrl: string;
  bio: string;
  onAvatarChange: (newAvatarUrl: string) => void;
}

export function UserProfileHeader({ name, username, avatarUrl, bio, onAvatarChange }: UserProfileHeaderProps) {
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleAvatarClick = () => {
    avatarInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // Max 2MB
        toast({
          title: "Image Too Large",
          description: "Please select an image smaller than 2MB.",
          variant: "destructive",
        });
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please select an image (JPEG, PNG, WEBP, GIF).",
          variant: "destructive",
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        onAvatarChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
     // Reset file input value to allow re-uploading the same file
    if (event.target) {
      event.target.value = '';
    }
  };
  
  const handleEditProfileClick = () => {
    toast({
      title: "Edit Profile",
      description: "Editing name and bio will be available soon!",
    });
  };

  return (
    <div className="flex flex-col items-center space-y-4 text-center md:flex-row md:items-start md:space-y-0 md:space-x-6 md:text-left p-4 rounded-lg bg-card shadow-md">
      <div className="relative group">
        <Avatar
          className="h-24 w-24 md:h-32 md:w-32 border-4 border-primary cursor-pointer"
          onClick={handleAvatarClick}
        >
          <AvatarImage src={avatarUrl} alt={name} data-ai-hint="person portrait" />
          <AvatarFallback>{name.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div 
          className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          onClick={handleAvatarClick}
        >
          <Camera className="h-8 w-8 text-white" />
        </div>
      </div>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        ref={avatarInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      <div className="flex-grow space-y-2">
        <h1 className="text-3xl md:text-4xl font-headline text-primary">{name}</h1>
        <p className="text-lg text-muted-foreground font-body">{username}</p>
        <p className="font-body text-foreground/80 max-w-md">{bio}</p>
         <Button variant="outline" size="sm" className="mt-2" onClick={handleEditProfileClick}>
          <Edit className="mr-2 h-4 w-4" /> Edit Profile
        </Button>
      </div>
    </div>
  );
}
