
"use client";

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn, UserPlus, Mail, KeyRound, Loader2, HelpCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useState, type FormEvent, Suspense, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { setLoggedInStatus, defaultKathaExplorerUser, getKathaExplorerUser, saveKathaExplorerUser, KRITIKA_EMAIL, KATHAVAULT_OWNER_EMAIL, isUserLoggedIn } from '@/lib/mock-data';

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
  const [isLoadingPage, setIsLoadingPage] = useState(true);

  useEffect(() => {
    if (isUserLoggedIn()) {
      const redirectUrl = searchParams.get('redirect');
      router.replace(redirectUrl || '/profile');
    } else {
      setIsLoadingPage(false);
    }
  }, [router, searchParams]);


  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email || !password) {
        toast({ title: "Fields Required", description: "Please enter both email and password.", variant: "destructive"});
        return;
    }
    setIsSubmitting(true);

    if (!auth) {
      toast({ title: "Firebase Auth Error", description: "Authentication service is not initialized. Please check console or contact support.", variant: "destructive" });
      console.error("Firebase Auth instance (auth) is not available in handleLogin.");
      setIsSubmitting(false);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      setLoggedInStatus(true, { uid: firebaseUser.uid, email: firebaseUser.email, displayName: firebaseUser.displayName, photoURL: firebaseUser.photoURL }, 'login');
      toast({ title: "Login successful! Redirecting...", description: "Please wait while we prepare your dashboard." });
      
      const redirectUrl = searchParams.get('redirect');
      router.push(redirectUrl || '/profile');

      (async () => {
        try {
          if (!db) {
            console.warn("Login: Database service (db) is not available for profile sync after login. Profile will sync when available.");
            return;
          }
          
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          let userProfileData;

          if (!userDocSnap.exists()) {
            console.log("Login: User document didn't exist in Firestore. Creating based on Auth data.");
            let profileName = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || defaultKathaExplorerUser.name;
            userProfileData = {
              uid: firebaseUser.uid, email: firebaseUser.email, name: profileName,
              username: firebaseUser.displayName?.replace(/\s+/g, '_').toLowerCase() || firebaseUser.email?.split('@')[0] || defaultKathaExplorerUser.username,
              avatarUrl: firebaseUser.photoURL || defaultKathaExplorerUser.avatarUrl,
              avatarFallback: (profileName).substring(0, 2).toUpperCase(),
              bio: defaultKathaExplorerUser.bio, emailVisible: defaultKathaExplorerUser.emailVisible,
              gender: defaultKathaExplorerUser.gender, isActive: true, createdAt: new Date().toISOString(),
              signInMethod: firebaseUser.providerData.some(p => p.providerId === 'google.com') ? "google" as const : "email" as const,
              lastLogin: new Date().toISOString(),
            };
          } else {
            userProfileData = userDocSnap.data();
            await setDoc(userDocRef, { lastLogin: new Date().toISOString() }, { merge: true });
            console.log("Login: Existing user profile found in Firestore. Updated last login.");
          }
          saveKathaExplorerUser({ ...defaultKathaExplorerUser, ...userProfileData, id: firebaseUser.uid, email: firebaseUser.email });
        } catch (firestoreError: any) {
          console.error("Login: Firestore profile sync failed (post-navigation):", firestoreError);
          let firestoreErrorMessage = "We had trouble syncing your full profile details from the server.";
           if (firestoreError.code === 'unavailable' || (firestoreError.message && firestoreError.message.toLowerCase().includes("client is offline"))) {
            firestoreErrorMessage = "Could not sync profile: Client is offline. Please check your internet connection. Your data will sync when connection is restored.";
          }
        }
      })();

    } catch (authError: any) {
      console.error("Firebase Login Auth Error:", authError);
      let title = "Login Failed";
      let errorMessage = "An unexpected error occurred. Please try again.";

      if (authError.code) {
        switch (authError.code) {
          case 'auth/invalid-credential':
          case 'auth/user-not-found':
          case 'auth/wrong-password':
            errorMessage = "Invalid email or password. Please check your credentials or use 'Forgot password?' if needed.";
            break;
          case 'auth/invalid-email':
            errorMessage = "The email address is not valid.";
            break;
          case 'auth/network-request-failed':
            errorMessage = "Network error. Please check your internet connection. This could also be due to Firebase App Check enforcement if active in your project console for Authentication.";
            break;
          case 'auth/too-many-requests':
            errorMessage = "Access to this account has been temporarily disabled due to many failed login attempts. You can reset your password or try again later.";
            break;
          case 'auth/user-disabled':
            errorMessage = "This user account has been disabled by an administrator.";
            break;
          case 'auth/unauthorized-domain':
            errorMessage = "This domain is not authorized for Firebase authentication. Contact support or check Firebase Console settings.";
            break;
          case 'auth/operation-not-allowed':
             errorMessage = "This sign-in method (e.g., email/password) is not enabled for your Firebase project. Please check your Firebase console Authentication settings.";
             break;
          default:
            if (authError.message?.toLowerCase().includes('app-check') || authError.message?.toLowerCase().includes('app check') || authError.message?.toLowerCase().includes('appcheck')) {
                errorMessage = "Authentication failed. This might be due to Firebase App Check enforcement. If you recently disabled App Check in the code, ensure it's also disabled or correctly configured in your Firebase project settings for Authentication.";
            } else {
                errorMessage = `${authError.message || 'An unexpected error occurred.'} (Code: ${authError.code})`;
            }
        }
      } else {
        if (authError.message?.toLowerCase().includes('app-check') || authError.message?.toLowerCase().includes('app check') || authError.message?.toLowerCase().includes('appcheck')) {
            errorMessage = "Authentication failed, possibly due to Firebase App Check. Please verify App Check settings in your Firebase console for the Authentication service.";
        } else {
            errorMessage = authError.message || "An unexpected error occurred during authentication.";
        }
      }
      toast({ title: title, description: errorMessage, variant: "destructive", duration: 7000 });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleSubmitting(true);
    if (!auth) {
      toast({ title: "Firebase Auth Error", description: "Authentication service is not initialized. Please check console or contact support.", variant: "destructive" });
      console.error("Firebase Auth instance (auth) is not available in handleGoogleSignIn.");
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
        toast({ title: "Admin Login Method", description: "Admin accounts should log in using their email and password.", variant: "destructive", duration: 7000 });
        setIsGoogleSubmitting(false);
        return;
      }
      
      setLoggedInStatus(true, { uid: firebaseUser.uid, email: firebaseUser.email, displayName: firebaseUser.displayName, photoURL: firebaseUser.photoURL }, 'google');
      toast({ title: "Google Sign-In successful! Redirecting...", description: "Please wait while we prepare your dashboard." });

      const redirectUrl = searchParams.get('redirect');
      router.push(redirectUrl || '/profile');

      (async () => {
        try {
          if (!db) {
            console.warn("Google Sign-In: Database service (db) is not available for profile sync. Profile will sync when available.");
            return;
          }

          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          let profileName = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Katha User';
          let userProfileData;

          if (!userDocSnap.exists()) {
            console.log("Google Sign-In: User document didn't exist in Firestore. Creating based on Auth data.");
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
            console.log("Google Sign-In: Existing user profile updated in Firestore.");
          }
          saveKathaExplorerUser({ ...defaultKathaExplorerUser, ...userProfileData, id: firebaseUser.uid, email: firebaseUser.email });
        } catch (firestoreError: any) {
          console.error("Google Sign-In: Firestore profile sync failed (post-navigation):", firestoreError);
        }
      })();

    } catch (authError: any)      {
      console.error("Google Sign-In Auth Error:", authError);
      let title = "Google Sign-In Failed";
      let errorMessage = "Could not sign in with Google. Please try again.";

      if (authError.code) {
        switch (authError.code) {
          case 'auth/popup-closed-by-user':
             title = "Google Sign-In Cancelled";
             errorMessage = "Google Sign-In popup was closed before completion. Please try again.";
            break;
          case 'auth/account-exists-with-different-credential':
             title = "Account Exists";
             errorMessage = "An account already exists with this email address using a different sign-in method (e.g., email/password). Please sign in with that method.";
            break;
          case 'auth/network-request-failed':
            errorMessage = "Network error during Google Sign-In. Please check your internet connection. This could also be due to Firebase App Check enforcement if active in your project console for Authentication.";
            break;
          case 'auth/cancelled-popup-request':
          case 'auth/popup-blocked':
            title = "Google Sign-In Cancelled";
            errorMessage = "Google Sign-In popup was blocked or cancelled. Please ensure popups are allowed and try again.";
            break;
          case 'auth/unauthorized-domain':
            errorMessage = "This domain is not authorized for Google Sign-In. Contact support or check Firebase Console settings.";
            break;
          case 'auth/operation-not-allowed':
             errorMessage = "Google Sign-In is not enabled for your Firebase project. Please check your Firebase console Authentication settings.";
             break;
          default:
            if (authError.message?.toLowerCase().includes('app-check') || authError.message?.toLowerCase().includes('app check') || authError.message?.toLowerCase().includes('appcheck')) {
                errorMessage = "Google Sign-In failed. This might be due to Firebase App Check enforcement. If you recently disabled App Check in the code, ensure it's also disabled or correctly configured in your Firebase project settings for Authentication.";
            } else {
                errorMessage = `Google Sign-In Error: ${authError.message || 'An unexpected error occurred.'} (Code: ${authError.code})`;
            }
        }
      } else {
         if (authError.message?.toLowerCase().includes('app-check') || authError.message?.toLowerCase().includes('app check') || authError.message?.toLowerCase().includes('appcheck')) {
            errorMessage = "Google Sign-In failed, possibly due to Firebase App Check. Please verify App Check settings in your Firebase console for the Authentication service.";
        } else {
            errorMessage = authError.message || "An unexpected error occurred during Google Sign-In.";
        }
      }
      toast({ title: title, description: errorMessage, variant: "destructive", duration: 7000 });
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

    const originalIsSubmitting = isSubmitting;
    setIsSubmitting(true);
    if (!auth) {
        toast({ title: "Firebase Auth Error", description: "Authentication service is not initialized. Please check console or contact support.", variant: "destructive" });
        console.error("Firebase Auth instance (auth) is not available in handleForgotPassword.");
        setIsSubmitting(originalIsSubmitting);
        return;
    }
    try {
        await sendPasswordResetEmail(auth, emailToReset);
        toast({ title: "Password Reset Email Sent", description: `If an account exists for ${emailToReset}, you will receive an email with instructions.` });
    } catch (error: any) {
        console.error("Forgot Password Error:", error);
        let errorMessage = "Could not send password reset email. Please try again.";
         if (error.code === 'auth/user-not-found') {
             errorMessage = `If an account exists for ${emailToReset}, a password reset email has been sent. Please also check your spam folder.`;
             toast({ title: "Password Reset Initiated", description: errorMessage });
             setIsSubmitting(originalIsSubmitting);
             return;
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = "The email address is not valid.";
        } else if (error.code === 'auth/network-request-failed' || error.code === 'auth/internal-error') {
            errorMessage = "Network error. Please check your internet connection and try again.";
        } else {
            errorMessage = `Password Reset Error: ${error.message || 'Unknown Error'} (Code: ${error.code})`;
        }
        toast({ title: "Password Reset Failed", description: errorMessage, variant: "destructive" });
    } finally {
        setIsSubmitting(originalIsSubmitting);
    }
  };
  
  if (isLoadingPage) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary"/> Loading...</div>;
  }


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
    <Suspense fallback={<div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary"/> Loading Login Page...</div>}>
      <LoginPageContent />
    </Suspense>
  )
}
