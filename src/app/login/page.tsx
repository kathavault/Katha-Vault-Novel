
"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn, UserPlus, Mail, KeyRound, ShieldCheck } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { updateCurrentLoggedInUser } from '@/lib/mock-data'; // Import the new function

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    // const password = formData.get('password') as string; // Password not used in this mock

    if (!email) {
        toast({ title: "Login Failed", description: "Please enter an email address.", variant: "destructive"});
        return;
    }

    updateCurrentLoggedInUser(email);
    toast({ title: "Login Successful!", description: `Welcome back! Your profile has been updated with email: ${email}` });
    router.push('/profile'); // Redirect to profile page
  };

  const handleGoogleSignIn = () => {
    // Simulate Google Sign-In with Kritika's email for demonstration
    const googleUserEmail = "rajputkritika510@gmail.com";
    updateCurrentLoggedInUser(googleUserEmail);
    toast({ title: "Google Sign-In Successful!", description: "Welcome, Kritika! Your profile is updated." });
    router.push('/profile'); // Redirect to profile page
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
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="email" name="email" type="email" placeholder="you@example.com" required className="pl-10" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="password" name="password" type="password" placeholder="••••••••" required className="pl-10" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Link href="#" className="text-sm text-primary hover:underline font-body">
                Forgot password?
              </Link>
            </div>
            <Button type="submit" className="w-full text-lg py-6">
              <LogIn className="mr-2 h-5 w-5" /> Login
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">Or sign in with</p>
            <Button variant="outline" className="w-full text-lg py-6" onClick={handleGoogleSignIn}>
              <ShieldCheck className="mr-2 h-5 w-5 text-blue-500" /> Sign in with Google
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2 mt-4">
          <p className="text-sm text-muted-foreground font-body">
            Don't have an account yet?
          </p>
          <Button variant="link" asChild className="text-primary font-body">
            <Link href="/signup">
              <UserPlus className="mr-2 h-4 w-4" /> Create One Now
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
