
"use client"; // Add "use client"

import Link from 'next/link';
import { Home, Library, PlusSquare, MessageCircle, UserCircle, LogIn } from 'lucide-react';
import { useState, useEffect } from 'react'; // Import hooks
import { isUserLoggedIn } from '@/lib/mock-data'; // Import isUserLoggedIn

export function Footer() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    // This effect runs only on the client after hydration
    setLoggedIn(isUserLoggedIn());

    const handleStorageChange = () => {
      setLoggedIn(isUserLoggedIn());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);


  const footerNavItems = [
    { href: '/', label: 'Home', icon: <Home size={24} />, requiresLogin: false },
    { href: '/library', label: 'Library', icon: <Library size={24} />, requiresLogin: false },
    { href: '/forum', label: 'Post', icon: <PlusSquare size={24} />, requiresLogin: true }, // Assuming posting requires login
    { href: '/chat', label: 'Chat', icon: <MessageCircle size={24} />, requiresLogin: true },
  ];
  
  const accountNavItem = loggedIn
    ? { href: '/profile', label: 'Account', icon: <UserCircle size={24} />, requiresLogin: true }
    : { href: '/login', label: 'Login', icon: <LogIn size={24} />, requiresLogin: false };

  const allNavItems = [...footerNavItems, accountNavItem];


  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg z-40 lg:hidden">
      <div className="container mx-auto px-2 sm:px-4">
        <nav className="flex justify-around items-center h-16">
          {allNavItems.map((item) => {
            const isLinkDisabled = item.requiresLogin && !loggedIn;
            const effectiveHref = isLinkDisabled ? (item.href === '/profile' ? '/login' : item.href) : item.href; // Redirect profile to login if not logged in

            return (
              <Link
                key={item.label} // Use label as key if href can change
                href={isLinkDisabled && item.href !== '/login' ? `/login?redirect=${encodeURIComponent(item.href)}` : effectiveHref}
                className={`flex flex-col items-center text-xs font-medium  hover:text-primary transition-colors group ${isLinkDisabled && item.href !== '/login' ? 'text-muted-foreground/50 cursor-not-allowed' : 'text-muted-foreground'}`}
                onClick={(e) => {
                  if (isLinkDisabled && item.href !== '/login') {
                    e.preventDefault(); // Prevent navigation if disabled and not the login link itself
                    // Optionally, show a toast message here to prompt login
                    // toast({ title: "Login Required", description: `Please login to access ${item.label}.`});
                    // For now, the link itself will point to login with redirect
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
  );
}
