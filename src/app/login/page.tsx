
"use client";

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn, UserPlus, Mail, KeyRound, ShieldCheck, CheckCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { updateCurrentLoggedInUser, KRITIKA_EMAIL, KATHAVAULT_OWNER_EMAIL, setLoggedInStatus } from '@/lib/mock-data';
import { useState, useEffect, type FormEvent } from 'react';

const DEMO_OTP = "123456"; // OTP for demonstration

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loginMethod, setLoginMethod] = useState<"email" | "google" | null>(null);

  const handleRequestOtp = (method: "email" | "google") => {
    if (!email) {
        toast({ title: "Email Required", description: "Please enter your email address to receive an OTP.", variant: "destructive"});
        return;
    }
    if (method === "email" && !password) {
        toast({ title: "Password Required", description: "Please enter your password for email login.", variant: "destructive"});
        return;
    }

    setLoginMethod(method);
    setOtpSent(true);
    toast({ 
        title: "OTP Sent (Simulated)", 
        description: `An OTP has been 'sent' to ${email}. For this demo, please use '${DEMO_OTP}'.`,
        duration: 7000 
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!otpSent) { // Stage 1: Request OTP
      if (!email) {
        toast({ title: "Login Failed", description: "Please enter an email address.", variant: "destructive"});
        return;
      }
      if (loginMethod === "email" && !password) { // Should be caught by button logic, but as a safeguard
        toast({ title: "Login Failed", description: "Please enter a password for email login.", variant: "destructive"});
        return;
      }
      // This case should ideally not be hit if buttons call handleRequestOtp directly
      // For safety, if we reach here without otpSent, treat as a request for email method
      handleRequestOtp("email"); 
      return;
    }

    // Stage 2: Verify OTP
    if (otp !== DEMO_OTP) {
      toast({ title: "Login Failed", description: "Invalid OTP. Please try again.", variant: "destructive" });
      setOtp(""); // Clear OTP field
      return;
    }

    updateCurrentLoggedInUser(email);
    toast({ title: "Login Successful!", description: `Welcome back! Your profile has been updated.` });
    
    const redirectUrl = searchParams.get('redirect');
    if (redirectUrl) {
      router.push(redirectUrl);
    } else {
      router.push('/profile');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] py-12">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <LogIn className="mx-auto h-16 w-16 text-primary mb-4" />
          <CardTitle className="text-3xl font-headline text-primary">
            {otpSent ? "Verify Your Identity" : "Welcome Back!"}
          </CardTitle>
          <CardDescription className="font-body">
            {otpSent 
              ? `Enter the OTP sent to ${email}.` 
              : "Sign in to continue your Katha Vault journey."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {!otpSent && (
              <>
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
                        placeholder="•••••••• (any for demo)" 
                        required 
                        className="pl-10"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Link href="#" className="text-sm text-primary hover:underline font-body">
                    Forgot password?
                  </Link>
                </div>
                <Button type="button" onClick={() => handleRequestOtp("email")} className="w-full text-lg py-6">
                  <LogIn className="mr-2 h-5 w-5" /> Login with Email
                </Button>
              </>
            )}

            {otpSent && (
              <div className="space-y-2">
                <Label htmlFor="otp">Enter 6-Digit OTP</Label>
                <div className="relative">
                  <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input 
                      id="otp" 
                      name="otp" 
                      type="text" 
                      placeholder="123456" 
                      required 
                      maxLength={6}
                      className="pl-10 tracking-widest text-center"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full text-lg py-6 mt-4">
                  <ShieldCheck className="mr-2 h-5 w-5" /> Verify OTP & Login
                </Button>
                 <Button variant="link" onClick={() => { setOtpSent(false); setOtp(""); setLoginMethod(null);}} className="w-full text-sm">
                    Back to Email/Password
                </Button>
              </div>
            )}
          </form>
          {!otpSent && (
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground mb-2">Or sign in with</p>
              <Button variant="outline" className="w-full text-lg py-6" onClick={() => handleRequestOtp("google")}>
                <ShieldCheck className="mr-2 h-5 w-5 text-blue-500" /> Sign in with Google
              </Button>
            </div>
          )}
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
