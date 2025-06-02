import { StoryCard } from '@/components/story-card';
import { Bookmark } from 'lucide-react';

// Placeholder data - in a real app, this would come from user data
const libraryStories = [
  { id: '1', title: 'The Last Nebula', author: 'Aria Vale', genres: ['Sci-Fi'], snippet: 'In a dying galaxy, a lone explorer seeks the fabled Last Nebula, said to hold the key to cosmic rebirth.', coverImageUrl: 'https://placehold.co/600x400.png', aiHint: 'nebula space' },
  { id: '4', title: 'Echoes in the Silence', author: 'Lena Petrova', genres: ['Mystery'], snippet: 'A detective haunted by her past must solve a murder in a remote, snowbound village where everyone has a secret.', coverImageUrl: 'https://placehold.co/600x400.png', aiHint: 'snowy village' },
];

export default function LibraryPage() {
  return (
    <div className="space-y-8">
      <header className="text-center space-y-2">
        <Bookmark className="mx-auto h-16 w-16 text-primary" />
        <h1 className="text-5xl font-headline tracking-tight text-primary">My Personal Library</h1>
        <p className="text-xl text-foreground font-body font-semibold">
          Your personal space for saved stories and reading progress.
        </p>
      </header>

      {libraryStories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {libraryStories.map(story => (
            <StoryCard key={story.id} {...story} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground font-body">
            Your library is empty. Start discovering and saving stories!
          </p>
        </div>
      )}
    </div>
  );
}
