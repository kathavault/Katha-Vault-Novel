import Link from 'next/link';
import { Home, LayoutGrid, Search, UserCircle, PencilLine } from 'lucide-react'; // Added PencilLine for Create

export function Footer() {
  const footerNavItems = [
    { href: '/', label: 'Home', icon: <Home size={24} /> },
    { href: '/create', label: 'Create', icon: <PencilLine size={24} /> }, // Changed from Menu to Create
    { href: '/forum', label: 'Forum', icon: <LayoutGrid size={24} /> }, // Changed from Search to Forum
    { href: '/library', label: 'Library', icon: <Search size={24} /> }, // Changed to Library for Search icon
    { href: '/recommendations', label: 'Profile', icon: <UserCircle size={24} /> }, // Changed to Recommendations for Profile icon
  ];

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg z-40 lg:hidden">
      <div className="container mx-auto px-2 sm:px-4">
        <nav className="flex justify-around items-center h-16">
          {footerNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center text-xs font-medium text-muted-foreground hover:text-primary transition-colors group"
            >
              <div className="p-2 rounded-full group-hover:bg-primary/10 transition-colors">
                {item.icon}
              </div>
              <span className="mt-0.5">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
