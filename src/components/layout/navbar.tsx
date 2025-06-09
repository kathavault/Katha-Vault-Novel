
"use client"; 

import Link from 'next/link';
import { Menu, Moon, UserPlus, Home, Library, Edit3, Bot, LogIn, Sun, MessageSquareText, Shield, LayoutGrid, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import React from 'react';
import { isUserAdmin, isUserLoggedIn, getKathaExplorerUser, KRITIKA_EMAIL, KATHAVAULT_OWNER_EMAIL } from '@/lib/mock-data'; 
import { auth } from '@/lib/firebase'; // Import auth directly

export function Navbar() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showAdminLink, setShowAdminLink] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  // currentEmail state might not be strictly needed for admin link visibility with onAuthStateChanged

  useEffect(() => {
    setMounted(true); // For theme toggling

    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        setLoggedIn(true);
        // isUserAdmin internally checks auth.currentUser which is now firebaseUser
        setShowAdminLink(isUserAdmin()); 
        // Ensure the localStorage profile is up-to-date.
        // getKathaExplorerUser will use firebaseUser (via auth.currentUser)
        // and apply special admin names if applicable.
        getKathaExplorerUser(); 
      } else {
        // User is signed out
        setLoggedIn(false);
        setShowAdminLink(false);
      }
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []); // Empty dependency array for one-time setup


  const navLinks = [
    { href: '/', label: 'Home', icon: <Home size={20} /> },
    { href: '/library', label: 'My Library', icon: <Library size={20} /> },
    { href: '/create', label: 'Create Story', icon: <Edit3 size={20} /> },
    { href: '/forum', label: 'Community Feed', icon: <MessageSquareText size={20} /> },
    { href: '/write', label: 'AI Writer', icon: <Bot size={20} /> },
    { href: '/about', label: 'About Us', icon: <Info size={20} /> },
  ];

  const adminSpecificLinks = [
     { href: '/admin', label: 'Admin Panel', icon: <Shield size={20} /> },
     { href: '/admin/home-layout', label: 'Home Layout', icon: <LayoutGrid size={18} />, isSubLink: true },
     { href: '/admin/about-editor', label: 'About Editor', icon: <Edit3 size={18} />, isSubLink: true },
  ];


  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <nav className="bg-background border-b border-border shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          <div className="flex items-center space-x-3">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <button
                  aria-label="Open menu"
                  className="text-foreground hover:text-primary transition-colors lg:hidden"
                >
                  <Menu size={24} />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] sm:w-[320px] bg-card">
                <SheetHeader className="mb-6">
                  <SheetTitle className="text-2xl font-headline text-primary flex items-center">
                     <div className="h-8 w-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-lg font-bold mr-2">
                        K
                      </div>
                    Katha Vault Menu
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col space-y-1">
                  {navLinks.map((link) => (
                    <Button
                      key={link.href}
                      variant="ghost"
                      className="justify-start text-md py-3 px-3"
                      asChild
                      onClick={() => setIsSheetOpen(false)}
                    >
                      <Link href={link.href} className="flex items-center">
                        {link.icon}
                        <span className="ml-3">{link.label}</span>
                      </Link>
                    </Button>
                  ))}
                  {showAdminLink && adminSpecificLinks.map((link) => (
                     <Button
                        key={link.href}
                        variant="ghost"
                        className={`justify-start text-md py-3 px-3 ${link.isSubLink ? "pl-10 text-sm" : ""}`}
                        asChild
                        onClick={() => setIsSheetOpen(false)}
                      >
                        <Link href={link.href} className="flex items-center">
                          {link.icon}
                          <span className="ml-3">{link.label}</span>
                        </Link>
                      </Button>
                  ))}
                  <hr className="my-3 border-border" />
                  {loggedIn ? (
                     <Button
                        variant="ghost"
                        className="justify-start text-md py-3 px-3"
                        asChild
                        onClick={() => setIsSheetOpen(false)} 
                      >
                        <Link href="/profile" className="flex items-center">
                          <Shield size={20} />
                          <span className="ml-3">My Account</span>
                        </Link>
                      </Button>
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        className="justify-start text-md py-3 px-3"
                        asChild
                        onClick={() => setIsSheetOpen(false)}
                      >
                        <Link href="/login" className="flex items-center">
                          <LogIn size={20} />
                          <span className="ml-3">Login</span>
                        </Link>
                      </Button>
                       <Button
                        variant="default"
                        className="justify-start text-md py-3 px-3 mt-2"
                        asChild
                        onClick={() => setIsSheetOpen(false)}
                      >
                        <Link href="/signup" className="flex items-center">
                          <UserPlus size={20} />
                          <span className="ml-3">Sign Up</span>
                        </Link>
                      </Button>
                    </>
                  )}
                </nav>
              </SheetContent>
            </Sheet>

            <Link href="/" className="flex items-center">
              <div className="h-10 w-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold">
                K
              </div>
            </Link>
          </div>
          
          <nav className="hidden lg:flex flex-wrap items-center justify-center gap-x-1">
            {navLinks.map((link) => (
              <Button key={link.href} variant="ghost" asChild>
                <Link href={link.href} className="flex items-center text-sm font-medium px-2 py-1">
                  {link.icon} <span className="ml-2">{link.label}</span>
                </Link>
              </Button>
            ))}
            {showAdminLink && adminSpecificLinks.filter(l => !l.isSubLink).map((link) => (
               <Button key={link.href} variant="ghost" asChild>
                <Link href={link.href} className="flex items-center text-sm font-medium px-2 py-1">
                  {link.icon} <span className="ml-2">{link.label}</span>
                </Link>
              </Button>
            ))}
          </nav>
          
          <div className="flex-grow lg:hidden"></div>

          <div className="flex items-center space-x-3 sm:space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={!mounted ? undefined : toggleTheme}
              aria-label={
                !mounted
                  ? "Loading theme preference"
                  : theme === "dark"
                  ? "Switch to light theme"
                  : "Switch to dark theme"
              }
              title={
                !mounted
                  ? "Loading theme preference"
                  : theme === "dark"
                  ? "Switch to light theme"
                  : "Switch to dark theme"
              }
              disabled={!mounted}
              className="text-foreground hover:text-primary transition-colors"
            >
              {!mounted ? (
                <Moon size={22} />
              ) : theme === "dark" ? (
                <Sun size={22} />
              ) : (
                <Moon size={22} />
              )}
            </Button>
            {!loggedIn && (
                <Button asChild size="sm" className="hidden sm:inline-flex px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm">
                <Link href="/signup">
                    <UserPlus size={18} className="mr-1 sm:mr-2" />
                    Sign Up
                </Link>
                </Button>
            )}
             {loggedIn && (
                <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm">
                    <Link href="/profile">
                        <Shield size={18} className="mr-1 sm:mr-2" />
                         Account
                    </Link>
                </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
