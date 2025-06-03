
"use client";

import type React from 'react';
import { useRef, useState, useEffect } from 'react';
import Image from 'next/image'; // Not strictly needed if using AvatarImage with src
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, Camera, Save, XCircle, Mail, Eye, EyeOff, UserSquare2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import type { EditableUserProfileData } from '@/app/profile/page';


interface UserProfileHeaderProps extends EditableUserProfileData {
  username: string;
  avatarUrl: string;
  onAvatarChange: (newAvatarUrl: string) => void;
  onProfileSave: (updatedProfile: EditableUserProfileData) => void;
}

const genderOptions = ["Male", "Female", "Other", "Prefer not to say"];

export function UserProfileHeader({
  name,
  username,
  avatarUrl,
  bio,
  email,
  emailVisible,
  gender,
  onAvatarChange,
  onProfileSave
}: UserProfileHeaderProps) {
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const [editableName, setEditableName] = useState(name);
  const [editableBio, setEditableBio] = useState(bio);
  const [editableEmail, setEditableEmail] = useState(email);
  const [editableEmailVisible, setEditableEmailVisible] = useState(emailVisible);
  const [editableGender, setEditableGender] = useState(gender);

  useEffect(() => {
    if (!isEditing) {
      setEditableName(name);
      setEditableBio(bio);
      setEditableEmail(email);
      setEditableEmailVisible(emailVisible);
      setEditableGender(gender);
    }
  }, [name, bio, email, emailVisible, gender, isEditing]);

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
    if (isEditing) { 
      onProfileSave({ 
        name: editableName, 
        bio: editableBio,
        email: editableEmail,
        emailVisible: editableEmailVisible,
        gender: editableGender
      });
    }
    setIsEditing(!isEditing);
  };

  const handleCancelEdit = () => {
    setEditableName(name); 
    setEditableBio(bio);
    setEditableEmail(email);
    setEditableEmailVisible(emailVisible);
    setEditableGender(gender);
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col items-center space-y-4 text-center md:flex-row md:items-start md:space-y-0 md:space-x-6 md:text-left p-4 md:p-6 rounded-lg bg-card shadow-md">
      <div className="relative group flex-shrink-0">
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
      <div className="flex-grow space-y-3 w-full">
        {isEditing ? (
          <>
            <div className="space-y-1">
              <Label htmlFor="profileName" className="text-left font-semibold">Name</Label>
              <Input
                id="profileName"
                value={editableName}
                onChange={(e) => setEditableName(e.target.value)}
                className="text-xl font-headline text-primary"
                aria-label="Edit name"
              />
            </div>
             <p className="text-md text-muted-foreground font-body text-left">{username} (Username cannot be changed)</p>
            <div className="space-y-1">
              <Label htmlFor="profileBio" className="text-left font-semibold">Bio</Label>
              <Textarea
                id="profileBio"
                value={editableBio}
                onChange={(e) => setEditableBio(e.target.value)}
                className="font-body text-foreground/80 w-full min-h-[80px]"
                aria-label="Edit bio"
                rows={3}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="profileEmail" className="text-left font-semibold">Email</Label>
              <Input
                id="profileEmail"
                type="email"
                value={editableEmail}
                onChange={(e) => setEditableEmail(e.target.value)}
                className="font-body"
                aria-label="Edit email"
              />
            </div>
            <div className="flex items-center space-x-2 pt-1">
              <Switch
                id="emailVisible"
                checked={editableEmailVisible}
                onCheckedChange={setEditableEmailVisible}
                aria-label="Toggle email visibility"
              />
              <Label htmlFor="emailVisible" className="font-body text-sm text-muted-foreground">
                {editableEmailVisible ? "Email visible on profile" : "Email hidden on profile"}
              </Label>
            </div>
            <div className="space-y-1">
              <Label htmlFor="profileGender" className="text-left font-semibold">Gender</Label>
              <Select value={editableGender} onValueChange={setEditableGender}>
                <SelectTrigger id="profileGender" className="w-full font-body" aria-label="Select gender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  {genderOptions.map(option => (
                    <SelectItem key={option} value={option} className="font-body">{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-3xl md:text-4xl font-headline text-primary">{name}</h1>
            <p className="text-lg text-muted-foreground font-body">{username}</p>
            <p className="font-body text-foreground/80 max-w-md whitespace-pre-wrap">{bio}</p>
            <div className="flex items-center text-sm text-muted-foreground font-body">
              <Mail className="mr-2 h-4 w-4" />
              {emailVisible ? email : "Email hidden"}
            </div>
            <div className="flex items-center text-sm text-muted-foreground font-body">
              <UserSquare2 className="mr-2 h-4 w-4" /> {/* Using a generic user icon for gender */}
              Gender: {gender}
            </div>
          </>
        )}
         <div className="flex gap-2 mt-4 justify-center md:justify-start">
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
