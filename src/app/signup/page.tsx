
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
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { setLoggedInStatus, defaultKathaExplorerUser, getKathaExplorerUser, saveKathaExplorerUser, KRITIKA_EMAIL, KATHAVAULT_OWNER_EMAIL } from '@/lib/mock-data';

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="20" height="20" {...props}>
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    <path d="M1 1h22v22H1z" fill="none"/>
  </svg>
);

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
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) { toast({ title: "Name Required", description: "Please enter your full name.", variant: "destructive" }); return; }
    if (!username.trim()) { toast({ title: "Username Required", description: "Please choose a username.", variant: "destructive" }); return; }
    if (password !== confirmPassword) { toast({ title: "Password Mismatch", description: "Passwords do not match.", variant: "destructive" }); return; }
    if (password.length < 6) { toast({ title: "Password Too Short", description: "Password must be at least 6 characters.", variant: "destructive" }); return; }

    setIsSubmitting(true);
    if (!auth) {
      toast({ title: "Firebase Auth Error", description: "Authentication service (auth) is not initialized. Check Firebase setup and console.", variant: "destructive" });
      console.error("Firebase Auth instance (auth) is not available in handleSubmit (Signup).");
      setIsSubmitting(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      setLoggedInStatus(true, { uid: firebaseUser.uid, email: firebaseUser.email, displayName: name, photoURL: null }, 'signup');
      toast({ title: "Signup successful! Creating profile & redirecting...", description: "Welcome to Katha Vault!" });

      const redirectUrl = searchParams.get('redirect');
      router.push(redirectUrl || '/profile');

      (async () => {
        try {
          if (!db) {
            console.warn("Signup: Database service (db) is not available for profile creation. Profile will be created when available.");
            return;
          }
          
          const userProfileData = {
            uid: firebaseUser.uid, email: firebaseUser.email, name: name, username: username,
            avatarUrl: defaultKathaExplorerUser.avatarUrl,
            avatarFallback: name.substring(0, 2).toUpperCase() || "KV",
            bio: defaultKathaExplorerUser.bio, emailVisible: defaultKathaExplorerUser.emailVisible,
            gender: defaultKathaExplorerUser.gender, isActive: true, createdAt: new Date().toISOString(),
            signInMethod: "email" as const,
            lastLogin: new Date().toISOString(),
          };
          
          saveKathaExplorerUser(userProfileData);
          console.log("Signup: New user profile creation process initiated for Firestore (post-navigation).");
        } catch (error) {
          console.error("Signup: Background Firestore profile creation failed:", error);
        }
      })();

    } catch (authError: any) {
      console.error("Firebase Signup Auth Error:", authError);
      let title = "Signup Failed";
      let errorMessage = "Failed to create account. Please try again.";

      if (authError.code) {
        switch (authError.code) {
          case 'auth/firebase-app-check-token-is-invalid':
            title = "App Check Token Invalid - Signup Failed";
            errorMessage = "IMPORTANT: Firebase App Check is blocking account creation. To fix, you MUST DISABLE App Check ENFORCEMENT for 'Authentication' in your Firebase Project Console (Firebase Console -> App Check -> Apps -> Your Web App -> Services).";
            break;
          case 'auth/email-already-in-use':
            errorMessage = "This email address is already in use by another account.";
            break;
          case 'auth/weak-password':
            errorMessage = "The password is too weak. Please choose a stronger password (at least 6 characters).";
            break;
          case 'auth/invalid-email':
            errorMessage = "The email address is not valid.";
            break;
          case 'auth/network-request-failed':
            errorMessage = "Network error. Check your internet connection. This could also be due to Firebase App Check ENFORCEMENT being ON in your Firebase project settings for 'Authentication'. If so, disable it.";
            break;
          case 'auth/unauthorized-domain':
            errorMessage = "This domain is not authorized for Firebase authentication. Contact support or check Firebase Console settings.";
            break;
          case 'auth/operation-not-allowed':
             errorMessage = "Email/password sign-up is not enabled for your Firebase project. Please check your Firebase console Authentication settings.";
             break;
          default:
            errorMessage = `${authError.message || 'An unexpected error occurred.'} (Code: ${authError.code}). If App Check enforcement is ON in your Firebase Console for 'Authentication', please disable it.`;
        }
      } else {
        errorMessage = `${authError.message || "An unexpected error occurred during signup."} If App Check enforcement is ON in your Firebase Console for 'Authentication', please disable it.`;
      }
      toast({ title: title, description: errorMessage, variant: "destructive", duration: 12000 });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleSubmitting(true);
    if (!auth) {
      toast({ title: "Firebase Auth Error", description: "Authentication service (auth) is not initialized. Check Firebase setup and console.", variant: "destructive" });
      console.error("Firebase Auth instance (auth) is not available in handleGoogleSignIn (Signup).");
      setIsGoogleSubmitting(false);
      return;
    }
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      const userEmail = firebaseUser.email?.toLowerCase();

      if (userEmail && (userEmail === KRITIKA_EMAIL.toLowerCase() || userEmail === KATHAVAULT_OWNER_EMAIL.toLowerCase())) {
        if (auth.currentUser) { await signOut(auth); }
        setLoggedInStatus(false);
        toast({ title: "Admin Signup Method", description: "Admin accounts should be created via email/password.", variant: "destructive", duration: 7000 });
        setIsGoogleSubmitting(false);
        return;
      }
      
      setLoggedInStatus(true, { uid: firebaseUser.uid, email: firebaseUser.email, displayName: firebaseUser.displayName, photoURL: firebaseUser.photoURL }, 'google');
      toast({ title: "Google Sign-Up successful! Finalizing profile & redirecting...", description: "Welcome to Katha Vault!" });

      const redirectUrl = searchParams.get('redirect');
      router.push(redirectUrl || '/profile');

      (async () => {
        try {
          if (!db) {
            console.warn("Google Sign-Up: Database service (db) is not available for profile sync. Profile will sync when available.");
            return;
          }
          
          const userDocRef = doc(db, "users", firebaseUser.uid);
          let profileName = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Katha User';
          let userProfileData;
          const userDocSnap = await getDoc(userDocRef);

          if (!userDocSnap.exists()) {
            console.log("Google Sign-Up: User document didn't exist in Firestore. Creating based on Auth data.");
            userProfileData = {
              uid: firebaseUser.uid, email: firebaseUser.email, name: profileName,
              username: firebaseUser.displayName?.replace(/\s+/g, '_').toLowerCase() || firebaseUser.email?.split('@')[0] || `user_${firebaseUser.uid.substring(0,6)}`,
              avatarUrl: firebaseUser.photoURL || defaultKathaExplorerUser.avatarUrl,
              avatarFallback: (profileName).substring(0, 2).toUpperCase(),
              bio: defaultKathaExplorerUser.bio, emailVisible: defaultKathaExplorerUser.emailVisible,
              gender: defaultKathaExplorerUser.gender, isActive: true, createdAt: new Date().toISOString(),
              signInMethod: "google" as const,
              lastLogin: new Date().toISOString(),
            };
          } else {
            userProfileData = userDocSnap.data();
            await setDoc(userDocRef, {
                name: profileName,
                avatarUrl: firebaseUser.photoURL || userProfileData.avatarUrl,
                avatarFallback: (profileName).substring(0, 2).toUpperCase(),
                signInMethod: userProfileData.signInMethod || ("google" as const),
                lastLogin: new Date().toISOString(),
            }, { merge: true });
            console.log("Google Sign-Up: Existing user profile updated in Firestore.");
          }
          saveKathaExplorerUser({ ...defaultKathaExplorerUser, ...userProfileData, id: firebaseUser.uid, email: firebaseUser.email });
        } catch (firestoreError: any) {
          console.error("Google Sign-Up: Firestore profile sync failed (post-navigation):", firestoreError);
        }
      })();

    } catch (authError: any) {
      console.error("Google Sign-Up Auth Error:", authError);
      let title = "Google Sign-Up Failed";
      let errorMessage = "Could not sign up with Google. Please try again.";

      if (authError.code) {
        switch (authError.code) {
          case 'auth/firebase-app-check-token-is-invalid':
            title = "App Check Token Invalid - Google Sign-Up Failed";
            errorMessage = "IMPORTANT: Firebase App Check is blocking account creation. To fix, you MUST DISABLE App Check ENFORCEMENT for 'Authentication' in your Firebase Project Console (Firebase Console -> App Check -> Apps -> Your Web App -> Services).";
            break;
          case 'auth/popup-closed-by-user':
            title = "Google Sign-Up Cancelled";
            errorMessage = "Google Sign-Up popup was closed before completion. Please try again.";
            break;
          case 'auth/account-exists-with-different-credential':
            title = "Account Exists";
            errorMessage = "An account already exists with this email address using a different sign-in method (e.g., email/password). Please login with that method.";
            break;
          case 'auth/network-request-failed':
            errorMessage = "Network error during Google Sign-Up. Check internet connection. This could also be due to App Check ENFORCEMENT being ON in your Firebase Project Console for 'Authentication'. If so, disable it.";
            break;
          case 'auth/cancelled-popup-request':
          case 'auth/popup-blocked':
            title = "Google Sign-Up Cancelled";
            errorMessage = "Google Sign-Up popup was blocked or cancelled. Please ensure popups are allowed and try again.";
            break;
          case 'auth/unauthorized-domain':
            errorMessage = "This domain is not authorized for Google Sign-Up. Contact support or check Firebase Console settings.";
            break;
          case 'auth/operation-not-allowed':
             errorMessage = "Google Sign-Up is not enabled for your Firebase project. Please check your Firebase console Authentication settings.";
             break;
          default:
            errorMessage = `Google Sign-Up Error: ${authError.message || 'An unexpected error occurred.'} (Code: ${authError.code}). If App Check enforcement is ON in your Firebase Console for 'Authentication', please disable it.`;
          }
      } else {
        errorMessage = `${authError.message || "An unexpected error occurred during Google Sign-Up."} If App Check enforcement is ON in your Firebase Console for 'Authentication', please disable it.`;
      }
      toast({ title: title, description: errorMessage, variant: "destructive", duration: 12000 });
    } finally {
      setIsGoogleSubmitting(false);
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
                <Input id="name" type="text" placeholder="e.g., Jane Doe" required className="pl-10" value={name} onChange={(e) => setName(e.target.value)} disabled={isSubmitting || isGoogleSubmitting} />
              </div>
            </div>
             <div className="space-y-1">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="username" type="text" placeholder="e.g., janedoe123" required className="pl-10" value={username} onChange={(e) => setUsername(e.target.value)} disabled={isSubmitting || isGoogleSubmitting} />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="email" type="email" placeholder="you@example.com" required className="pl-10" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isSubmitting || isGoogleSubmitting}/>
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">Password (min. 6 characters)</Label>
               <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="password" type="password" placeholder="••••••••" required className="pl-10" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isSubmitting || isGoogleSubmitting}/>
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="confirm-password" type="password" placeholder="••••••••" required className="pl-10" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={isSubmitting || isGoogleSubmitting}/>
              </div>
            </div>
            <Button type="submit" className="w-full text-lg py-3" disabled={isSubmitting || isGoogleSubmitting || !email || !password || !name || !username || password !== confirmPassword}>
              {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <UserPlus className="mr-2 h-5 w-5" />}
              Create Account with Email
            </Button>
          </form>
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or sign up with</span>
            </div>
          </div>
          <Button variant="outline" className="w-full text-md py-3" onClick={handleGoogleSignIn} disabled={isSubmitting || isGoogleSubmitting}>
            {isGoogleSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <GoogleIcon className="mr-2" />}
            Sign up with Google
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2 pt-4">
          <p className="text-sm text-muted-foreground font-body">
            Already have an account?
          </p>
          <Button variant="link" asChild className="text-primary font-body" disabled={isSubmitting || isGoogleSubmitting}>
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
