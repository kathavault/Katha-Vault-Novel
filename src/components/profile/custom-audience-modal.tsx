
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { MockUser } from '@/lib/mock-data';
import { Users } from 'lucide-react';

interface CustomAudienceModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  allUsers: MockUser[];
  followingUserIds: string[];
  initialSelectedUserIds: string[];
  onConfirm: (selectedUserIds: string[]) => void;
  postTitlePreview: string;
}

export function CustomAudienceModal({
  isOpen,
  onOpenChange,
  allUsers,
  followingUserIds,
  initialSelectedUserIds,
  onConfirm,
  postTitlePreview
}: CustomAudienceModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set(initialSelectedUserIds));

  useEffect(() => {
    setSelectedUserIds(new Set(initialSelectedUserIds));
  }, [initialSelectedUserIds, isOpen]); // Reset selection when modal is re-opened or initial IDs change

  const handleToggleUserSelection = (userId: string) => {
    setSelectedUserIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const handleConfirmSelection = () => {
    onConfirm(Array.from(selectedUserIds));
    onOpenChange(false);
  };

  const displayedUsers = useMemo(() => {
    if (searchTerm.trim() === "") {
      // Show following users first, then others, ensuring no duplicates and excluding current user (if applicable, though handled by allUsers source)
      const followingUsers = allUsers.filter(u => followingUserIds.includes(u.id));
      const otherUsers = allUsers.filter(u => !followingUserIds.includes(u.id));
      return [...followingUsers, ...otherUsers];
    }
    return allUsers.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, allUsers, followingUserIds]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md md:max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-headline text-primary flex items-center">
            <Users className="mr-2 h-6 w-6" /> Select Audience
          </DialogTitle>
          <DialogDescription className="font-body">
            Choose who can see your post: "{postTitlePreview.substring(0, 50)}{postTitlePreview.length > 50 ? '...' : ''}"
          </DialogDescription>
        </DialogHeader>

        <Input
          type="search"
          placeholder="Search by name or username..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="my-3 font-body"
        />

        <ScrollArea className="flex-grow pr-2 -mr-2 my-2 min-h-[200px] max-h-[calc(85vh-280px)]">
          {displayedUsers.length === 0 && (
            <p className="text-center text-muted-foreground py-4 font-body">No users found.</p>
          )}
          <div className="space-y-2">
            {displayedUsers.map((user) => (
              <Label
                key={user.id}
                htmlFor={`user-audience-${user.id}`}
                className="flex items-center space-x-3 p-2.5 rounded-md border border-border hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <Checkbox
                  id={`user-audience-${user.id}`}
                  checked={selectedUserIds.has(user.id)}
                  onCheckedChange={() => handleToggleUserSelection(user.id)}
                  className="h-5 w-5"
                />
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint={user.dataAiHint || "person avatar"} />
                  <AvatarFallback>{user.avatarFallback}</AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                  <p className="text-sm font-semibold text-foreground">{user.name}</p>
                  <p className="text-xs text-muted-foreground">@{user.username}</p>
                </div>
              </Label>
            ))}
          </div>
        </ScrollArea>

        <DialogFooter className="mt-auto pt-4">
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button onClick={handleConfirmSelection}>
            Done ({selectedUserIds.size} selected)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
