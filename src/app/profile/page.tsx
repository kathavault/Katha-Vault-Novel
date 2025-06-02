import { UserCircle } from 'lucide-react';

export default function ProfilePage() {
  return (
    <div className="space-y-8 text-center">
      <UserCircle className="mx-auto h-16 w-16 text-primary" />
      <h1 className="text-5xl font-headline tracking-tight text-primary">Account Profile</h1>
      <p className="text-xl text-muted-foreground font-body">
        Manage your profile and settings. This feature is coming soon!
      </p>
    </div>
  );
}
