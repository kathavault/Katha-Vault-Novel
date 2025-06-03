
"use client";

import { useState, useEffect, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from "@/hooks/use-toast";
import { kathaExplorerUser, allMockUsers, getBlockedUserIds, removeBlockedUserId, type MockUser } from '@/lib/mock-data';
import { ChevronLeft, Mail, KeyRound, UserX, ShieldAlert, SettingsIcon } from 'lucide-react';

export default function AccountSettingsPage() {
  const { toast } = useToast();
  const router = useRouter();

  // Email state
  const [currentEmail, setCurrentEmail] = useState(kathaExplorerUser.email || "");
  const [newEmail, setNewEmail] = useState("");

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // Blocked users state
  const [blockedUsers, setBlockedUsers] = useState<MockUser[]>([]);

  useEffect(() => {
    loadBlockedUsers();
  }, []);

  const loadBlockedUsers = () => {
    const blockedIds = getBlockedUserIds();
    const users = allMockUsers.filter(user => blockedIds.includes(user.id));
    setBlockedUsers(users);
  };

  const handleUpdateEmail = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newEmail.trim() || !/\S+@\S+\.\S+/.test(newEmail)) {
      toast({ title: "Invalid Email", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }
    // Simulate update
    kathaExplorerUser.email = newEmail; // This updates the mock in memory
    setCurrentEmail(newEmail);
    setNewEmail("");
    toast({ title: "Email Updated", description: `Your email has been changed to ${newEmail} (simulation).` });
  };

  const handleChangePassword = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      toast({ title: "Missing Fields", description: "Please fill in all password fields.", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast({ title: "Password Mismatch", description: "New password and confirmation do not match.", variant: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
       toast({ title: "Password Too Short", description: "New password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    // Simulate update
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    toast({ title: "Password Changed", description: "Your password has been updated (simulation)." });
  };

  const handleUnblockUser = (userId: string) => {
    removeBlockedUserId(userId);
    loadBlockedUsers(); // Refresh the list
    const user = allMockUsers.find(u => u.id === userId);
    toast({ title: "User Unblocked", description: `${user?.name || 'User'} has been unblocked.` });
  };

  return (
    <div className="space-y-8">
      <Button asChild variant="outline" className="mb-6 self-start">
        <Link href="/profile"><ChevronLeft className="mr-2 h-4 w-4" />Back to Profile</Link>
      </Button>

      <header className="text-center space-y-2">
        <SettingsIcon className="mx-auto h-16 w-16 text-primary" />
        <h1 className="text-4xl font-headline tracking-tight text-primary">Account Settings</h1>
        <p className="text-xl text-foreground font-body font-semibold">
          Manage your email, password, and blocked users.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary flex items-center">
            <Mail className="mr-3 h-6 w-6" /> Email Address
          </CardTitle>
          <CardDescription>Your current email is: {currentEmail}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateEmail} className="space-y-4">
            <div>
              <Label htmlFor="newEmail">New Email Address</Label>
              <Input
                id="newEmail"
                type="email"
                placeholder="Enter your new email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>
            <Button type="submit">Update Email</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary flex items-center">
            <KeyRound className="mr-3 h-6 w-6" /> Change Password
          </CardTitle>
          <CardDescription>Update your account password.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                placeholder="Enter your current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Enter your new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
              <Input
                id="confirmNewPassword"
                type="password"
                placeholder="Confirm your new password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
              />
            </div>
            <Button type="submit">Change Password</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary flex items-center">
            <ShieldAlert className="mr-3 h-6 w-6" /> Blocked Users
          </CardTitle>
          <CardDescription>Manage users you have blocked.</CardDescription>
        </CardHeader>
        <CardContent>
          {blockedUsers.length === 0 ? (
            <p className="text-muted-foreground">You haven't blocked any users.</p>
          ) : (
            <div className="space-y-3">
              {blockedUsers.map(user => (
                <div key={user.id} className="flex items-center justify-between p-3 border rounded-md bg-muted/30">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint={user.dataAiHint || "person avatar"} />
                      <AvatarFallback>{user.avatarFallback}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-foreground">{user.name}</p>
                      <p className="text-sm text-muted-foreground">@{user.username}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleUnblockUser(user.id)}>
                    <UserX className="mr-2 h-4 w-4" /> Unblock
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
