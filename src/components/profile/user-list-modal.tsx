
"use client";

import type React from 'react';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { X } from 'lucide-react';

export interface ModalUser {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  avatarFallback: string;
  dataAiHint?: string;
}

interface UserListModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  title: string;
  users: ModalUser[];
  actionButtonLabel: string;
  onActionButtonClick: (userId: string) => void;
  emptyStateMessage?: string;
  currentUserId: string; // To avoid showing action button for self
}

export function UserListModal({
  isOpen,
  onOpenChange,
  title,
  users,
  actionButtonLabel,
  onActionButtonClick,
  emptyStateMessage = "No users to display.",
  currentUserId,
}: UserListModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] md:sm:max-w-[500px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-headline text-primary">{title}</DialogTitle>
          {users.length === 0 && (
            <DialogDescription className="font-body">{emptyStateMessage}</DialogDescription>
          )}
        </DialogHeader>
        {users.length > 0 && (
          <ScrollArea className="flex-grow pr-4 -mr-4 my-4 max-h-[calc(80vh-180px)]">
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between space-x-3">
                  <Link href={`/profile/${user.id}`} className="flex items-center space-x-3 hover:bg-muted/50 p-1 rounded-md flex-grow">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint={user.dataAiHint || "person avatar"} />
                      <AvatarFallback>{user.avatarFallback}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground">@{user.username}</p>
                    </div>
                  </Link>
                  {user.id !== currentUserId && ( // Only show button if not the current user
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onActionButtonClick(user.id)}
                    >
                      {actionButtonLabel}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
        <DialogFooter className="mt-auto pt-4">
          <DialogClose asChild>
            <Button variant="ghost">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
