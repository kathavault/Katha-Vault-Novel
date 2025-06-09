
"use client"; 

import Link from 'next/link';
import { Home, Library, PlusSquare, MessageCircle, UserCircle, LogIn, Info } from 'lucide-react';
import { useState, useEffect } from 'react'; 
import { isUserLoggedIn } from '@/lib/mock-data'; 

export function Footer() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(isUserLoggedIn());

    const handleStorageChange = () => {
      setLoggedIn(isUserLoggedIn());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);


  const footerNavItemsBase = [
    { href: '/', label: 'Home', icon: <Home size={24} />, requiresLogin: false },
    { href: '/library', label: 'Library', icon: <Library size={24} />, requiresLogin: false },
    { href: '/forum', label: 'Post', icon: <PlusSquare size={24} />, requiresLogin: true },
    { href: '/chat', label: 'Chat', icon: <MessageCircle size={24} />, requiresLogin: true },
  ];
  
  const accountNavItem = loggedIn
    ? { href: '/profile', label: 'Account', icon: <UserCircle size={24} />, requiresLogin: true }
    : { href: '/login', label: 'Login', icon: <LogIn size={24} />, requiresLogin: false };

  // About Nav Item (can be used if space allows, or in main menu)
  // const aboutNavItem = { href: '/about', label: 'About', icon: <Info size={24} />, requiresLogin: false };

  // Mobile Footer: Home, Library, Post, Chat, Account (or Login)
  const mobileFooterNavItems = [
    footerNavItemsBase[0], // Home
    footerNavItemsBase[1], // Library
    footerNavItemsBase[2], // Post
    footerNavItemsBase[3], // Chat
    accountNavItem         // Account or Login
  ];


  return (
    <>
      <footer className="hidden lg:flex bg-card border-t border-border text-sm text-muted-foreground py-8 px-4">
        <div className="container mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold text-foreground mb-3">Katha Vault</h3>
            <nav className="space-y-2">
              <Link href="/about" className="block hover:text-primary transition-colors">About Us</Link>
              <Link href="/forum" className="block hover:text-primary transition-colors">Community</Link>
              <Link href="/create" className="block hover:text-primary transition-colors">Write a Story</Link>
            </nav>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-3">Discover</h3>
            <nav className="space-y-2">
              <Link href="/library" className="block hover:text-primary transition-colors">Library</Link>
              <Link href="/recommendations" className="block hover:text-primary transition-colors">Recommendations</Link>
            </nav>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-3">Connect</h3>
            <nav className="space-y-2">
              <Link href="/chat" className="block hover:text-primary transition-colors">Chat</Link>
            </nav>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-3">Account</h3>
            <nav className="space-y-2">
              {loggedIn ? (
                <>
                  <Link href="/profile" className="block hover:text-primary transition-colors">My Profile</Link>
                  <Link href="/profile/settings" className="block hover:text-primary transition-colors">Settings</Link>
                </>
              ) : (
                <>
                  <Link href="/login" className="block hover:text-primary transition-colors">Login</Link>
                  <Link href="/signup" className="block hover:text-primary transition-colors">Sign Up</Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </footer>
      <div className="hidden lg:block text-center py-4 border-t border-border text-xs text-muted-foreground bg-card">
        © {new Date().getFullYear()} Katha Vault. All rights reserved.
      </div>

      <footer className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg z-40 lg:hidden">
        <div className="container mx-auto px-2 sm:px-4">
          <nav className="flex justify-around items-center h-16">
            {mobileFooterNavItems.map((item) => {
              const isLinkDisabled = item.requiresLogin && !loggedIn;
              const effectiveHref = isLinkDisabled ? (item.href === '/profile' ? '/login' : item.href) : item.href; 

              return (
                <Link
                  key={item.label} 
                  href={isLinkDisabled && item.href !== '/login' ? `/login?redirect=${encodeURIComponent(item.href)}` : effectiveHref}
                  className={`flex flex-col items-center text-xs font-medium  hover:text-primary transition-colors group ${isLinkDisabled && item.href !== '/login' ? 'text-muted-foreground/50 cursor-not-allowed' : 'text-muted-foreground'}`}
                  onClick={(e) => {
                    if (isLinkDisabled && item.href !== '/login') {
                      e.preventDefault(); 
                    }
                  }}
                  aria-disabled={isLinkDisabled && item.href !== '/login'}
                >
                  <div className="p-2 rounded-full group-hover:bg-primary/10 transition-colors">
                    {item.icon}
                  </div>
                  <span className="mt-0.5">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </footer>
    </>
  );
}
