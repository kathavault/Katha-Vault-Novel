
"use client";

import type React from 'react';
import { useRef, useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, Save, XCircle, Mail, UserSquare2, Camera, ShieldAlert, Info } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import type { EditableUserProfileData } from '@/app/profile/page';


interface UserProfileHeaderProps extends EditableUserProfileData {
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
  const [editableUsername, setEditableUsername] = useState(username);
  const [editableBio, setEditableBio] = useState(bio);
  const [editableEmail, setEditableEmail] = useState(email);
  const [editableEmailVisible, setEditableEmailVisible] = useState(emailVisible);
  const [editableGender, setEditableGender] = useState(gender);
  const [editableAvatarUrl, setEditableAvatarUrl] = useState(avatarUrl); // For preview in edit mode

  useEffect(() => {
    if (!isEditing) {
      setEditableName(name);
      setEditableUsername(username);
      setEditableBio(bio);
      setEditableEmail(email);
      setEditableEmailVisible(emailVisible);
      setEditableGender(gender);
      setEditableAvatarUrl(avatarUrl); // Reset preview on exiting edit mode
    } else {
      // When entering edit mode, ensure editableAvatarUrl is current
      setEditableAvatarUrl(avatarUrl);
    }
  }, [name, username, bio, email, emailVisible, gender, avatarUrl, isEditing]);

  const handleAvatarInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // Max 2MB
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
        setEditableAvatarUrl(newAvatarDataUrl); // Update preview in edit mode
        // onAvatarChange will be called on save
      };
      reader.readAsDataURL(file);
    }
    if (event.target) event.target.value = ''; // Reset file input
  };
  
  const handleSaveChanges = () => {
    onProfileSave({ 
      name: editableName, 
      username: editableUsername,
      bio: editableBio,
      email: editableEmail,
      emailVisible: editableEmailVisible,
      gender: editableGender
    });
    if (editableAvatarUrl !== avatarUrl) { // If avatar was changed during edit
        onAvatarChange(editableAvatarUrl);
    }
    setIsEditing(false);
    // Toast is handled by the parent onProfileSave or onAvatarChange
  };

  const handleCancelEdit = () => {
    // Reset all editable fields to original prop values
    setEditableName(name); 
    setEditableUsername(username);
    setEditableBio(bio);
    setEditableEmail(email);
    setEditableEmailVisible(emailVisible);
    setEditableGender(gender);
    setEditableAvatarUrl(avatarUrl); // Reset avatar preview
    setIsEditing(false);
  };

  return (
    <div className="p-4 md:p-6 rounded-lg bg-card shadow-md">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        {/* Avatar Section */}
        <div className="flex flex-col items-center md:items-start gap-3 flex-shrink-0">
          <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-primary">
            <AvatarImage src={isEditing ? editableAvatarUrl : avatarUrl} alt={name} data-ai-hint="person portrait" />
            <AvatarFallback>{(isEditing ? editableName : name).substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          {isEditing && (
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

        {/* Details Section */}
        <div className="flex-grow space-y-3 w-full">
          {isEditing ? (
            // EDITING MODE
            <div className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="profileName" className="font-semibold">Name</Label>
                <Input id="profileName" value={editableName} onChange={(e) => setEditableName(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="profileUsername" className="font-semibold">Username</Label>
                <Input id="profileUsername" value={editableUsername} onChange={(e) => setEditableUsername(e.target.value)} />
                 <p className="text-xs text-muted-foreground flex items-center gap-1 pt-1">
                  <Info className="h-3 w-3" /> Username changes are local. Real changes need server validation.
                </p>
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
            // VIEW MODE
            <div className="space-y-1 md:space-y-2">
              <div className="flex flex-col md:flex-row md:items-center md:gap-4">
                <h1 className="text-2xl md:text-3xl font-headline text-foreground">{name}</h1>
                <p className="text-md md:text-lg text-muted-foreground font-body">@{username}</p>
              </div>
               {!isEditing && (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="w-full md:w-auto md:hidden mt-3">
                    <Edit className="mr-2 h-4 w-4" /> Edit Profile
                </Button>
              )}
              <p className="font-body text-foreground/90 max-w-md whitespace-pre-wrap pt-1">{bio}</p>
              <div className="flex items-center text-sm text-muted-foreground font-body pt-2 gap-1">
                <Mail className="h-4 w-4" />
                <span>{emailVisible ? email : "Email hidden"}</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground font-body gap-1">
                <UserSquare2 className="h-4 w-4" />
                <span>Gender: {gender}</span>
              </div>
            </div>
          )}
        </div>
         {/* Edit Button for Desktop View - Placed outside the details flex grow to align it better */}
          {!isEditing && (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="hidden md:inline-flex self-start">
                <Edit className="mr-2 h-4 w-4" /> Edit Profile
            </Button>
          )}
      </div>

      {/* Save/Cancel buttons for Edit Mode - Placed at the bottom of the card */}
      {isEditing && (
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
