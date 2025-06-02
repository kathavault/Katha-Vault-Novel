import Link from 'next/link';
import { Feather } from 'lucide-react'; // Using Feather as a placeholder logo icon

export function Navbar() {
  const navItems = [
    { href: '/', label: 'Discover' },
    { href: '/recommendations', label: 'Recommendations' },
    { href: '/library', label: 'My Library' },
    { href: '/create', label: 'Create Story' },
    { href: '/forum', label: 'Forum' },
    { href: '/write', label: 'AI Writer' },
  ];

  return (
    <nav className="bg-card border-b border-border shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors">
            <Feather size={32} />
            <span className="text-3xl font-headline">Katha Vault</span>
          </Link>
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-foreground hover:text-primary transition-colors font-medium text-lg"
              >
                {item.label}
              </Link>
            ))}
          </div>
          {/* Mobile Menu Button (optional, can be added later) */}
        </div>
      </div>
    </nav>
  );
}
