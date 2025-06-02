export function Footer() {
  return (
    <footer className="bg-card border-t border-border py-8 mt-12">
      <div className="container mx-auto px-4 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Katha Vault. All rights reserved.</p>
        <p className="text-sm mt-1">Crafted with creativity and code.</p>
      </div>
    </footer>
  );
}
