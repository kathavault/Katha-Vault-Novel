
"use client";

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn, UserPlus, Mail, KeyRound, Loader2, HelpCircle, Info } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useState, type FormEvent, Suspense, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { setLoggedInStatus, defaultKathaExplorerUser, SPECIAL_ACCOUNT_DETAILS } from '@/lib/mock-data';

// Google Icon SVG as a React component
const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="20" height="20" {...props}>
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    <path d="M1 1h22v22H1z" fill="none"/>
  </svg>
);


function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email || !password) {
        toast({ title: "Fields Required", description: "Please enter both email and password.", variant: "destructive"});
        return;
    }
    setIsSubmitting(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);
      let displayNameForProfile = user.displayName || email.split('@')[0] || defaultKathaExplorerUser.name;
      let photoURLForProfile = user.photoURL;

      if (userDocSnap.exists()) {
        const existingData = userDocSnap.data();
        displayNameForProfile = existingData.name || displayNameForProfile;
        photoURLForProfile = existingData.avatarUrl || photoURLForProfile;
      } else {
         // This case should be rare for login, more common for first Google sign-in
         // If user exists in Auth but not Firestore (e.g. imported user), create a basic profile
         const specialAccountInfo = SPECIAL_ACCOUNT_DETAILS[email.toLowerCase()];
         if (specialAccountInfo) {
            displayNameForProfile = specialAccountInfo.fixedName;
         }
         await setDoc(userDocRef, {
            uid: user.uid,
            email: user.email,
            name: displayNameForProfile,
            username: displayNameForProfile.replace(/\s+/g, '_').toLowerCase() || user.email?.split('@')[0] || `user_${user.uid.substring(0,6)}`,
            avatarUrl: photoURLForProfile || defaultKathaExplorerUser.avatarUrl,
            avatarFallback: (displayNameForProfile || user.email || 'KU').substring(0, 2).toUpperCase(),
            bio: defaultKathaExplorerUser.bio,
            emailVisible: defaultKathaExplorerUser.emailVisible,
            gender: defaultKathaExplorerUser.gender,
            isActive: true,
            createdAt: new Date().toISOString(),
            signInMethod: "email",
         }, { merge: true });
      }
      
      setLoggedInStatus(true, { uid: user.uid, email: user.email, displayName: displayNameForProfile, photoURL: photoURLForProfile });
      
      toast({ title: "Login Successful!", description: `Welcome back, ${displayNameForProfile}!` });
      
      const redirectUrl = searchParams.get('redirect');
      router.push(redirectUrl || '/profile');

    } catch (error: any) {
      console.error("Firebase Login Error:", error);
      let errorMessage = "Failed to login. Please check your credentials and try again.";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMessage = "Invalid email or password.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "The email address is not valid.";
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = "Network error. Please check your internet connection and try again.";
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or you can try again later.";
      }
      toast({ title: "Login Failed", description: errorMessage, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleSubmitting(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);
      let profileName = user.displayName || user.email?.split('@')[0] || 'Katha User';
      let profileUsername = user.displayName?.replace(/\s+/g, '_').toLowerCase() || user.email?.split('@')[0] || `user_${user.uid.substring(0,6)}`;
      let profileAvatarFallback = (user.displayName || user.email || 'KU').substring(0, 2).toUpperCase();

      const lowerCaseUserEmail = user.email?.toLowerCase();
      if (lowerCaseUserEmail && SPECIAL_ACCOUNT_DETAILS[lowerCaseUserEmail]) {
          const specialInfo = SPECIAL_ACCOUNT_DETAILS[lowerCaseUserEmail];
          profileName = specialInfo.fixedName;
          profileUsername = specialInfo.fixedUsername;
          profileAvatarFallback = specialInfo.fixedName.substring(0,2).toUpperCase();
      }

      if (!userDocSnap.exists()) {
        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          name: profileName,
          username: profileUsername,
          avatarUrl: user.photoURL || defaultKathaExplorerUser.avatarUrl,
          avatarFallback: profileAvatarFallback,
          bio: defaultKathaExplorerUser.bio,
          emailVisible: defaultKathaExplorerUser.emailVisible,
          gender: defaultKathaExplorerUser.gender,
          isActive: true,
          createdAt: new Date().toISOString(),
          signInMethod: "google",
        });
      } else {
        // If user doc exists, ensure name/avatar might be updated from Google if they changed it
        await setDoc(userDocRef, {
            name: profileName, // Use potentially special name
            avatarUrl: user.photoURL || userDocSnap.data().avatarUrl, // Prefer Google's new photo, fallback to existing
            avatarFallback: profileAvatarFallback, // Use potentially special fallback
            // Optionally update username if it's a special account and needs fixing
            ...(lowerCaseUserEmail && SPECIAL_ACCOUNT_DETAILS[lowerCaseUserEmail] && { username: profileUsername }),
        }, { merge: true });
      }
      
      setLoggedInStatus(true, { uid: user.uid, email: user.email, displayName: profileName, photoURL: user.photoURL });
      toast({ title: "Signed in with Google!", description: `Welcome, ${profileName}!` });
      
      const redirectUrl = searchParams.get('redirect');
      router.push(redirectUrl || '/profile');

    } catch (error: any) {
      console.error("Google Sign-In Error:", error);
      let errorMessage = "Could not sign in with Google. Please try again.";
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = "Google Sign-In popup was closed. Please try again.";
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        errorMessage = "An account already exists with this email address using a different sign-in method.";
      }
      toast({ title: "Google Sign-In Failed", description: errorMessage, variant: "destructive" });
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    let emailToReset = email.trim();
    if (!emailToReset) {
        const promptedEmail = prompt("Please enter your email address to reset your password:");
        if (!promptedEmail || !promptedEmail.trim()) {
            toast({ title: "Email Required", description: "Please enter an email address.", variant: "destructive" });
            return;
        }
        emailToReset = promptedEmail.trim();
    }

    try {
        await sendPasswordResetEmail(auth, emailToReset);
        toast({ title: "Password Reset Email Sent", description: `If an account exists for ${emailToReset}, you will receive an email with instructions.` });
    } catch (error: any) {
        console.error("Forgot Password Error:", error);
        let errorMessage = "Could not send password reset email. Please try again.";
         if (error.code === 'auth/user-not-found') {
             errorMessage = "No user found with this email address.";
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = "The email address is not valid.";
        }
        toast({ title: "Password Reset Failed", description: errorMessage, variant: "destructive" });
    }
  };


  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] py-12">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <LogIn className="mx-auto h-16 w-16 text-primary mb-4" />
          <CardTitle className="text-3xl font-headline text-primary">Welcome Back!</CardTitle>
          <CardDescription className="font-body">
            Sign in to continue your Katha Vault journey.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input 
                      id="email" 
                      name="email" 
                      type="email" 
                      placeholder="you@example.com" 
                      required 
                      className="pl-10" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isSubmitting || isGoogleSubmitting}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input 
                      id="password" 
                      name="password" 
                      type="password" 
                      placeholder="••••••••" 
                      required 
                      className="pl-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isSubmitting || isGoogleSubmitting}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Button type="button" variant="link" onClick={handleForgotPassword} className="text-sm text-primary hover:underline font-body p-0 h-auto" disabled={isSubmitting || isGoogleSubmitting}>
                  <HelpCircle className="mr-1 h-4 w-4"/> Forgot password?
                </Button>
              </div>
              <Button type="submit" className="w-full text-lg py-3" disabled={isSubmitting || isGoogleSubmitting || !email || !password}>
                {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <LogIn className="mr-2 h-5 w-5" />}
                 Login with Email
              </Button>
            </form>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>
            <Button variant="outline" className="w-full text-md py-3" onClick={handleGoogleSignIn} disabled={isSubmitting || isGoogleSubmitting}>
              {isGoogleSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <GoogleIcon className="mr-2" />}
              Sign in with Google
            </Button>
             <div className="mt-4 text-xs text-muted-foreground text-center flex items-start justify-center">
                <Info size={16} className="mr-1.5 mt-px flex-shrink-0"/>
                <span>For special accounts (Kritika, Katha Vault Owner), please use their designated email and password for full admin privileges.</span>
            </div>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2 mt-4">
          <p className="text-sm text-muted-foreground font-body">
            Don't have an account yet?
          </p>
          <Button variant="link" asChild className="text-primary font-body" disabled={isSubmitting || isGoogleSubmitting}>
            <Link href="/signup">
              <UserPlus className="mr-2 h-4 w-4" /> Create One Now
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    // Suspense fallback for useSearchParams
    <Suspense fallback={<div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary"/> Loading Login Page...</div>}>
      <LoginPageContent />
    </Suspense>
  )
}
