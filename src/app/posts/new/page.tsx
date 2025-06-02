import { PlusSquare } from 'lucide-react';

export default function CreatePostPage() {
  return (
    <div className="space-y-8 text-center">
      <PlusSquare className="mx-auto h-16 w-16 text-primary" />
      <h1 className="text-5xl font-headline tracking-tight text-primary">Create New Post</h1>
      <p className="text-xl text-foreground font-body font-semibold">
        Share your thoughts with the community. This feature is coming soon!
      </p>
    </div>
  );
}
