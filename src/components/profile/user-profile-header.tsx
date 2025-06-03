
"use client";

import type React from 'react';
import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Edit, Camera, Save, XCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";


interface UserProfileHeaderProps {
  name: string;
  username: string;
  avatarUrl: string;
  bio: string;
  onAvatarChange: (newAvatarUrl: string) => void;
  onProfileSave: (updatedProfile: { name: string; bio: string }) => void;
}

export function UserProfileHeader({ name, username, avatarUrl, bio, onAvatarChange, onProfileSave }: UserProfileHeaderProps) {
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editableName, setEditableName] = useState(name);
  const [editableBio, setEditableBio] = useState(bio);

  useEffect(() => {
    setEditableName(name);
    setEditableBio(bio);
  }, [name, bio]);

  const handleAvatarClick = () => {
    if (!isEditing) {
      avatarInputRef.current?.click();
    }
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
    if (event.target) {
      event.target.value = '';
    }
  };
  
  const handleEditToggle = () => {
    if (isEditing) { // Current action is "Save"
      onProfileSave({ name: editableName, bio: editableBio });
    } else { // Current action is "Edit"
      // Reset editable fields to current profile values when entering edit mode
      setEditableName(name);
      setEditableBio(bio);
    }
    setIsEditing(!isEditing);
  };

  const handleCancelEdit = () => {
    setEditableName(name); // Reset to original props
    setEditableBio(bio);
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col items-center space-y-4 text-center md:flex-row md:items-start md:space-y-0 md:space-x-6 md:text-left p-4 rounded-lg bg-card shadow-md">
      <div className="relative group">
        <Avatar
          className={`h-24 w-24 md:h-32 md:w-32 border-4 border-primary ${!isEditing ? 'cursor-pointer' : 'cursor-default'}`}
          onClick={handleAvatarClick}
        >
          <AvatarImage src={avatarUrl} alt={name} data-ai-hint="person portrait" />
          <AvatarFallback>{name.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        {!isEditing && (
          <div 
            className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            onClick={handleAvatarClick}
          >
            <Camera className="h-8 w-8 text-white" />
          </div>
        )}
      </div>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        ref={avatarInputRef}
        onChange={handleFileChange}
        className="hidden"
        disabled={isEditing}
      />
      <div className="flex-grow space-y-2 w-full">
        {isEditing ? (
          <>
            <Input
              value={editableName}
              onChange={(e) => setEditableName(e.target.value)}
              className="text-3xl md:text-4xl font-headline text-primary mb-2"
              aria-label="Edit name"
            />
            <Textarea
              value={editableBio}
              onChange={(e) => setEditableBio(e.target.value)}
              className="font-body text-foreground/80 max-w-md w-full min-h-[80px]"
              aria-label="Edit bio"
              rows={3}
            />
          </>
        ) : (
          <>
            <h1 className="text-3xl md:text-4xl font-headline text-primary">{name}</h1>
            <p className="text-lg text-muted-foreground font-body">{username}</p>
            <p className="font-body text-foreground/80 max-w-md whitespace-pre-wrap">{bio}</p>
          </>
        )}
         <div className="flex gap-2 mt-3 justify-center md:justify-start">
            <Button variant={isEditing ? "default" : "outline"} size="sm" onClick={handleEditToggle}>
              {isEditing ? <Save className="mr-2 h-4 w-4" /> : <Edit className="mr-2 h-4 w-4" />}
              {isEditing ? "Save Changes" : "Edit Profile"}
            </Button>
            {isEditing && (
              <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                <XCircle className="mr-2 h-4 w-4" /> Cancel
              </Button>
            )}
        </div>
      </div>
    </div>
  );
}
