import type {Metadata} from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: 'Katha Vault',
  description: 'Discover, create, and share original stories.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Belleza&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased flex flex-col min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8 pb-24 lg:pb-8"> {/* Added pb-24 for mobile to clear fixed footer */}
          {children}
        </main>
        <Footer /> {/* This is now the fixed bottom tab bar for mobile */}
        <Toaster />
      </body>
    </html>
  );
}
