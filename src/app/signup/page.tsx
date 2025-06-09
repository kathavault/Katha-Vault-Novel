
"use client";

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, LogIn, Mail, KeyRound, User as UserIcon, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useState, type FormEvent, Suspense } from 'react';
import { auth, db } from '@/lib/firebase'; // Import Firebase auth and db
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { setLoggedInStatus, defaultKathaExplorerUser } from '@/lib/mock-data';

function SignupPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) {
      toast({ title: "Name Required", description: "Please enter your full name.", variant: "destructive" });
      return;
    }
    if (!username.trim()) {
      toast({ title: "Username Required", description: "Please choose a username.", variant: "destructive" });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: "Password Mismatch", description: "Passwords do not match.", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Password Too Short", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create user document in Firestore
      const userProfileData = {
        uid: user.uid,
        email: user.email,
        name: name,
        username: username,
        avatarUrl: defaultKathaExplorerUser.avatarUrl, // Default avatar
        avatarFallback: name.substring(0, 2).toUpperCase() || defaultKathaExplorerUser.avatarFallback,
        bio: defaultKathaExplorerUser.bio,
        emailVisible: defaultKathaExplorerUser.emailVisible,
        gender: defaultKathaExplorerUser.gender,
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, "users", user.uid), userProfileData);
      
      // Update local auth state (transitional step)
      setLoggedInStatus(true, { uid: user.uid, email: user.email, displayName: name });

      toast({ title: "Signup Successful!", description: "Welcome to Katha Vault! You're now logged in." });
      
      const redirectUrl = searchParams.get('redirect');
      if (redirectUrl) {
        router.push(redirectUrl);
      } else {
        router.push('/profile'); // Redirect to profile page after signup
      }

    } catch (error: any) {
      console.error("Firebase Signup Error:", error);
      let errorMessage = "Failed to create account. Please try again.";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "This email address is already in use.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "The password is too weak. Please choose a stronger password.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "The email address is not valid.";
      }
      toast({ title: "Signup Failed", description: errorMessage, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] py-12">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <UserPlus className="mx-auto h-16 w-16 text-primary mb-4" />
          <CardTitle className="text-3xl font-headline text-primary">Create Your Account</CardTitle>
          <CardDescription className="font-body">
            Join Katha Vault to discover and share amazing stories.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="name" type="text" placeholder="e.g., Jane Doe" required className="pl-10" value={name} onChange={(e) => setName(e.target.value)} disabled={isSubmitting} />
              </div>
            </div>
             <div className="space-y-1">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="username" type="text" placeholder="e.g., janedoe123" required className="pl-10" value={username} onChange={(e) => setUsername(e.target.value)} disabled={isSubmitting} />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="email" type="email" placeholder="you@example.com" required className="pl-10" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isSubmitting}/>
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">Password (min. 6 characters)</Label>
               <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="password" type="password" placeholder="••••••••" required className="pl-10" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isSubmitting}/>
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="confirm-password" type="password" placeholder="••••••••" required className="pl-10" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={isSubmitting}/>
              </div>
            </div>
            <Button type="submit" className="w-full text-lg py-3" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <UserPlus className="mr-2 h-5 w-5" />}
              Create Account
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2 pt-4">
          <p className="text-sm text-muted-foreground font-body">
            Already have an account?
          </p>
          <Button variant="link" asChild className="text-primary font-body" disabled={isSubmitting}>
            <Link href="/login">
              <LogIn className="mr-2 h-4 w-4" /> Login Here
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary"/> Loading Signup Page...</div>}>
      <SignupPageContent />
    </Suspense>
  )
}
