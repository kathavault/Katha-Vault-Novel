
"use client";

import type React from 'react';
import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Edit, Save, XCircle, Mail, UserSquare2, Camera, UserPlus, UserMinus, MessageSquare, Settings, LogOut, MoreVertical } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import type { EditableUserProfileData } from '@/app/profile/page';

interface UserProfileHeaderProps extends Partial<EditableUserProfileData> {
  userId: string;
  name: string;
  username: string;
  avatarUrl: string;
  bio?: string;
  email?: string;
  emailVisible?: boolean;
  gender?: string;
  isViewingOwnProfile: boolean;
  isFollowing?: boolean;
  onAvatarChange?: (newAvatarUrl: string) => void;
  onProfileSave?: (updatedProfile: EditableUserProfileData) => void;
  onFollowToggle?: () => void;
}

const genderOptions = ["Male", "Female", "Other", "Prefer not to say"];

export function UserProfileHeader({
  userId,
  name: initialName,
  username: initialUsername,
  avatarUrl: initialAvatarUrl,
  bio: initialBio = '',
  email: initialEmail = '',
  emailVisible: initialEmailVisible = false,
  gender: initialGender = 'Prefer not to say',
  isViewingOwnProfile,
  isFollowing,
  onAvatarChange,
  onProfileSave,
  onFollowToggle,
}: UserProfileHeaderProps) {
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);

  const [editableName, setEditableName] = useState(initialName);
  const [editableUsername, setEditableUsername] = useState(initialUsername);
  const [editableBio, setEditableBio] = useState(initialBio);
  const [editableEmail, setEditableEmail] = useState(initialEmail);
  const [editableEmailVisible, setEditableEmailVisible] = useState(initialEmailVisible);
  const [editableGender, setEditableGender] = useState(initialGender);
  const [editableAvatarUrl, setEditableAvatarUrl] = useState(initialAvatarUrl);

  useEffect(() => {
    if (!isEditing || !isViewingOwnProfile) {
      setEditableName(initialName);
      setEditableUsername(initialUsername);
      setEditableBio(initialBio);
      setEditableEmail(initialEmail);
      setEditableEmailVisible(initialEmailVisible);
      setEditableGender(initialGender);
      setEditableAvatarUrl(initialAvatarUrl);
    } else {
      setEditableAvatarUrl(initialAvatarUrl);
    }
  }, [initialName, initialUsername, initialBio, initialEmail, initialEmailVisible, initialGender, initialAvatarUrl, isEditing, isViewingOwnProfile]);

  const handleAvatarInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isViewingOwnProfile || !onAvatarChange) return;
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({ title: "Image Too Large", description: "Please select an image smaller than 2MB.", variant: "destructive" });
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
        toast({ title: "Invalid File Type", description: "Please select an image (JPEG, PNG, WEBP, GIF).", variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const newAvatarDataUrl = reader.result as string;
        setEditableAvatarUrl(newAvatarDataUrl);
      };
      reader.readAsDataURL(file);
    }
    if (event.target) event.target.value = '';
  };
  
  const handleSaveChanges = () => {
    if (!isViewingOwnProfile || !onProfileSave) return;
    onProfileSave({ 
      name: editableName, 
      username: editableUsername,
      bio: editableBio,
      email: editableEmail,
      emailVisible: editableEmailVisible,
      gender: editableGender,
    });
    if (editableAvatarUrl !== initialAvatarUrl && onAvatarChange) {
        onAvatarChange(editableAvatarUrl);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditableName(initialName); 
    setEditableUsername(initialUsername);
    setEditableBio(initialBio);
    setEditableEmail(initialEmail);
    setEditableEmailVisible(initialEmailVisible);
    setEditableGender(initialGender);
    setEditableAvatarUrl(initialAvatarUrl);
    setIsEditing(false);
  };

  const handleLogout = () => {
    toast({ title: "Logged Out", description: "You have been successfully logged out (simulation)." });
    router.push('/login');
  };

  const currentName = isViewingOwnProfile && isEditing ? editableName : initialName;
  const currentUsername = isViewingOwnProfile && isEditing ? editableUsername : initialUsername;
  const currentAvatarUrl = isViewingOwnProfile && isEditing ? editableAvatarUrl : initialAvatarUrl;
  const currentBio = isViewingOwnProfile && isEditing ? editableBio : initialBio;
  const currentEmail = isViewingOwnProfile && isEditing ? editableEmail : initialEmail;
  const currentEmailVisible = isViewingOwnProfile && isEditing ? editableEmailVisible : initialEmailVisible;
  const currentGender = isViewingOwnProfile && isEditing ? editableGender : initialGender;

  return (
    <div className="p-4 md:p-6 rounded-lg bg-card shadow-md">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        <div className="flex flex-col items-center md:items-start gap-3 flex-shrink-0">
          <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-primary">
            <AvatarImage src={currentAvatarUrl} alt={currentName} data-ai-hint="person portrait" />
            <AvatarFallback>{currentName.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          {isViewingOwnProfile && isEditing && (
            <>
              <Button variant="outline" size="sm" onClick={() => avatarInputRef.current?.click()} className="w-full md:w-auto">
                <Camera className="mr-2 h-4 w-4" /> Change Photo
              </Button>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                ref={avatarInputRef}
                onChange={handleAvatarInputChange}
                className="hidden"
              />
            </>
          )}
        </div>

        <div className="flex-grow space-y-3 w-full">
          {isViewingOwnProfile && isEditing ? (
            <div className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="profileName" className="font-semibold">Name</Label>
                <Input id="profileName" value={editableName} onChange={(e) => setEditableName(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="profileUsername" className="font-semibold">Username</Label>
                <Input id="profileUsername" value={editableUsername} onChange={(e) => setEditableUsername(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="profileBio" className="font-semibold">Bio</Label>
                <Textarea id="profileBio" value={editableBio} onChange={(e) => setEditableBio(e.target.value)} rows={3} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="profileEmail" className="font-semibold">Email</Label>
                <Input id="profileEmail" type="email" value={editableEmail} onChange={(e) => setEditableEmail(e.target.value)} />
              </div>
              <div className="flex items-center space-x-2 pt-1">
                <Switch id="emailVisible" checked={editableEmailVisible} onCheckedChange={setEditableEmailVisible} />
                <Label htmlFor="emailVisible" className="font-body text-sm">
                  {editableEmailVisible ? "Email visible on profile" : "Email hidden on profile"}
                </Label>
              </div>
              <div className="space-y-1">
                <Label htmlFor="profileGender" className="font-semibold">Gender</Label>
                <Select value={editableGender} onValueChange={setEditableGender}>
                  <SelectTrigger id="profileGender"><SelectValue placeholder="Select gender" /></SelectTrigger>
                  <SelectContent>
                    {genderOptions.map(option => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <div className="space-y-1 md:space-y-2">
              <div className="flex flex-col md:flex-row md:items-center md:gap-4">
                <h1 className="text-2xl md:text-3xl font-headline text-foreground">{currentName}</h1>
                <p className="text-md md:text-lg text-muted-foreground font-body">@{currentUsername}</p>
              </div>
              {!isEditing && isViewingOwnProfile && (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="w-full md:w-auto md:hidden mt-3">
                    <Edit className="mr-2 h-4 w-4" /> Edit Profile
                </Button>
              )}
              <p className="font-body text-foreground/90 max-w-md whitespace-pre-wrap pt-1">{currentBio}</p>
              {currentEmail && (
                <div className="flex items-center text-sm text-muted-foreground font-body pt-2 gap-1">
                  <Mail className="h-4 w-4" />
                  <span>{currentEmailVisible ? currentEmail : "Email hidden"}</span>
                </div>
              )}
              {currentGender && (
                <div className="flex items-center text-sm text-muted-foreground font-body gap-1">
                  <UserSquare2 className="h-4 w-4" />
                  <span>Gender: {currentGender}</span>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="md:ml-auto flex-shrink-0 self-start">
            {isViewingOwnProfile && !isEditing && (
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9">
                            <MoreVertical className="h-5 w-5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuItem onSelect={() => setIsEditing(true)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => router.push('/profile/settings')}>
                            <Settings className="mr-2 h-4 w-4" />
                            Account Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={handleLogout} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </div>


        {!isViewingOwnProfile && onFollowToggle && (
          <div className="flex flex-col sm:flex-row gap-2 self-start md:self-center mt-3 md:mt-0">
            <Button onClick={onFollowToggle} variant={isFollowing ? "outline" : "default"} size="sm">
              {isFollowing ? <UserMinus className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
              {isFollowing ? 'Unfollow' : 'Follow'}
            </Button>
            {isFollowing && (
              <Button variant="default" size="sm" asChild>
                <Link href={`/chat?userId=${userId}`}>
                  <MessageSquare className="mr-2 h-4 w-4" /> Message
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>

      {isViewingOwnProfile && isEditing && (
        <div className="flex gap-3 mt-6 justify-end">
          <Button variant="ghost" onClick={handleCancelEdit}>
            <XCircle className="mr-2 h-4 w-4" /> Cancel
          </Button>
          <Button onClick={handleSaveChanges}>
            <Save className="mr-2 h-4 w-4" /> Save Changes
          </Button>
        </div>
      )}
    </div>
  );
}
