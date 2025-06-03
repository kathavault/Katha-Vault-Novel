
"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

// Directly importing for client-side simulation
// In a real app, this would come from a shared state/context or props
const placeholderUserChatsForModal = [
  { id: 'user1', name: 'Elara Reads', username: '@elara', avatarUrl: 'https://placehold.co/40x40.png', avatarFallback: 'ER' },
  { id: 'user2', name: 'Marcus Writes', username: '@marcus_w', avatarUrl: 'https://placehold.co/40x40.png', avatarFallback: 'MW' },
  { id: 'user3', name: 'SciFiFanatic', username: '@scifi_guru', avatarUrl: 'https://placehold.co/40x40.png', avatarFallback: 'SF' },
];

export interface FriendForModal {
  id: string;
  name: string;
  avatarUrl: string;
  avatarFallback: string;
}

interface SharePostModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  postTitle: string;
  postId: string;
  // friendsList: FriendForModal[]; // Keeping this for potential future use if data is passed differently
}

export function SharePostModal({
  isOpen,
  onOpenChange,
  postTitle,
  postId,
}: SharePostModalProps) {
  const { toast } = useToast();
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
  const friendsList = placeholderUserChatsForModal; // Using imported data

  const handleShareConfirm = () => {
    if (!selectedFriendId) {
      toast({ title: "Select a friend", description: "Please select a friend to share the post with.", variant: "destructive" });
      return;
    }
    const selectedFriend = friendsList.find(f => f.id === selectedFriendId);
    if (selectedFriend) {
      toast({
        title: "Post Shared (Simulated)",
        description: `The post "${postTitle}" has been shared with ${selectedFriend.name}. They would see this in their chat.`,
      });
      // Here you would typically call a function to actually send the post/message
      // For now, we just close the modal and show a toast.
      onOpenChange(false);
      setSelectedFriendId(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) setSelectedFriendId(null); // Reset selection on close
    }}>
      <DialogContent className="sm:max-w-[425px] md:sm:max-w-[500px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-headline text-primary">Share Post</DialogTitle>
          <DialogDescription className="font-body">Share "{postTitle}" with a friend.</DialogDescription>
        </DialogHeader>
        {friendsList.length > 0 ? (
          <ScrollArea className="flex-grow pr-4 -mr-4 my-4 max-h-[calc(80vh-220px)]">
            <RadioGroup value={selectedFriendId ?? ""} onValueChange={setSelectedFriendId}>
              <div className="space-y-3">
                {friendsList.map((friend) => (
                  <Label
                    key={friend.id}
                    htmlFor={`friend-${friend.id}`}
                    className={`flex items-center space-x-3 p-3 rounded-md border cursor-pointer hover:bg-muted/50 transition-colors ${selectedFriendId === friend.id ? 'bg-muted border-primary ring-2 ring-primary' : 'border-border'}`}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={friend.avatarUrl} alt={friend.name} data-ai-hint="person avatar" />
                      <AvatarFallback>{friend.avatarFallback}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow">
                      <p className="text-sm font-semibold text-foreground">{friend.name}</p>
                      <p className="text-xs text-muted-foreground">@{friend.username}</p>
                    </div>
                    <RadioGroupItem value={friend.id} id={`friend-${friend.id}`} className="h-5 w-5" />
                  </Label>
                ))}
              </div>
            </RadioGroup>
          </ScrollArea>
        ) : (
          <p className="text-muted-foreground font-body py-4">You have no friends to share with yet. (Placeholder)</p>
        )}
        <DialogFooter className="mt-auto pt-4">
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button onClick={handleShareConfirm} disabled={!selectedFriendId}>
            Send to Friend
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
