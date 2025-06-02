
import Link from 'next/link';
import { BookHeart, Search, Bell, UserCircle } from 'lucide-react'; 

export function Navbar() {
  const navItems = [
    { href: '/', label: 'Discover', icon: <BookHeart size={20} /> },
    { href: '/recommendations', label: 'Recommendations' },
    { href: '/library', label: 'My Library' },
    { href: '/create', label: 'Create Story' },
    { href: '/forum', label: 'Forum' },
    { href: '/write', label: 'AI Writer' },
  ];

  return (
    <nav className="bg-card border-b border-border shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href="/" className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors">
            <div className="h-10 w-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
              <span className="text-2xl font-headline font-bold">K</span>
            </div>
            {/* Optional: Keep a textual site name for accessibility or if design changes, but visually hidden or styled differently if K is primary */}
            {/* <span className="text-2xl font-headline ml-2">Katha Vault</span> */}
          </Link>
          
          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center space-x-5">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-foreground hover:text-primary transition-colors font-medium text-base"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <button aria-label="Search" className="text-foreground hover:text-primary transition-colors">
              <Search size={22} />
            </button>
            <button aria-label="Notifications" className="text-foreground hover:text-primary transition-colors">
              <Bell size={22} />
            </button>
            <button aria-label="User Account" className="text-foreground hover:text-primary transition-colors">
              <UserCircle size={24} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
