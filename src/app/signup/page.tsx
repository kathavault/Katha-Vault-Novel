
"use client";

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, LogIn, Mail, KeyRound } from 'lucide-react';

export default function SignupPage() {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Placeholder for actual signup logic
    console.log("Signup form submitted");
    alert("Signup functionality is not yet implemented.");
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
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="email" type="email" placeholder="you@example.com" required className="pl-10" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
               <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="password" type="password" placeholder="••••••••" required className="pl-10" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="confirm-password" type="password" placeholder="••••••••" required className="pl-10" />
              </div>
            </div>
            <Button type="submit" className="w-full text-lg py-6">
              <UserPlus className="mr-2 h-5 w-5" /> Create Account
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2">
          <p className="text-sm text-muted-foreground font-body">
            Already have an account?
          </p>
          <Button variant="link" asChild className="text-primary font-body">
            <Link href="/login">
              <LogIn className="mr-2 h-4 w-4" /> Login Here
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
