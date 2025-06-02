
import Link from 'next/link';
import { Menu, Moon, UserPlus, X } from 'lucide-react'; 
import { Button } from '@/components/ui/button';

export function Navbar() {
  return (
    <nav className="bg-background border-b border-border shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Left: Hamburger Menu */}
          <button aria-label="Open menu" className="text-foreground hover:text-primary transition-colors lg:hidden">
            <Menu size={24} />
          </button>
          {/* Invisible placeholder for desktop to balance center logo when hamburger is hidden */}
          <div className="hidden lg:flex w-10"></div>


          {/* Center: Logo */}
          <Link href="/" className="flex items-center justify-center flex-grow lg:flex-grow-0">
            <div className="h-10 w-10 bg-primary text-background rounded-full flex items-center justify-center">
              {/* Using X icon as placeholder for the abstract logo from image */}
              <X size={24} strokeWidth={3} />
            </div>
          </Link>
          
          {/* Right: Icons & Sign Up Button */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <button aria-label="Toggle theme" className="text-foreground hover:text-primary transition-colors">
              <Moon size={22} />
            </button>
            <Button asChild size="sm" className="px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm">
              <Link href="/signup">
                <UserPlus size={18} className="mr-1 sm:mr-2" />
                Sign Up
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
