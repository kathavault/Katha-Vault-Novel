import { StoryForm } from '@/components/story-form';
import { Edit3 } from 'lucide-react'; // Using Edit3 for creation

export default function CreateStoryPage() {
  return (
    <div className="space-y-8">
      <header className="text-center space-y-2">
        <Edit3 className="mx-auto h-16 w-16 text-primary" />
        <h1 className="text-5xl font-headline tracking-tight text-primary">Create a New Story</h1>
        <p className="text-xl text-muted-foreground font-body">
          Bring your imagination to life and share your tale with the world.
        </p>
      </header>
      
      <StoryForm />
    </div>
  );
}
