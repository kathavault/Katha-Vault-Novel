import { StoryCard } from '@/components/story-card';
import { BookOpen } from 'lucide-react';

const placeholderStories = [
  { id: '1', title: 'The Last Nebula', author: 'Aria Vale', genre: 'Sci-Fi', snippet: 'In a dying galaxy, a lone explorer seeks the fabled Last Nebula, said to hold the key to cosmic rebirth.', coverImageUrl: 'https://placehold.co/600x400.png', aiHint: 'nebula space' },
  { id: '2', title: 'Whispers of the Old Wood', author: 'Elara Moonwhisper', genre: 'Fantasy', snippet: 'An ancient forest guards secrets darker than its deepest shadows, and only a cursed princess can unveil them.', coverImageUrl: 'https://placehold.co/600x400.png', aiHint: 'enchanted forest' },
  { id: '3', title: 'Chronicles of the Clockwork City', author: 'Victor Cogsworth', genre: 'Steampunk', snippet: 'In a city powered by steam and gears, a brilliant inventor uncovers a conspiracy that threatens to unwind their world.', coverImageUrl: 'https://placehold.co/600x400.png', aiHint: 'steampunk city' },
  { id: '4', title: 'Echoes in the Silence', author: 'Lena Petrova', genre: 'Mystery', snippet: 'A detective haunted by her past must solve a murder in a remote, snowbound village where everyone has a secret.', coverImageUrl: 'https://placehold.co/600x400.png', aiHint: 'snowy village' },
  { id: '5', title: 'The Sunken Star', author: 'Kai Moreno', genre: 'Adventure', snippet: 'A treasure map leads a group of unlikely heroes to a legendary pirate hoard, guarded by mythical creatures and treacherous traps.', coverImageUrl: 'https://placehold.co/600x400.png', aiHint: 'pirate ship' },
  { id: '6', title: 'Love in the Time of Pixels', author: 'Nina Chen', genre: 'Romance', snippet: 'Two gamers find love in a virtual world, but can their digital romance survive the challenges of reality?', coverImageUrl: 'https://placehold.co/600x400.png', aiHint: 'virtual reality' },
];

export default function StoryDiscoveryPage() {
  return (
    <div className="space-y-8">
      <header className="text-center space-y-2">
        <BookOpen className="mx-auto h-16 w-16 text-primary" />
        <h1 className="text-5xl font-headline tracking-tight text-primary">Discover Stories</h1>
        <p className="text-xl text-muted-foreground font-body">
          Explore a universe of original tales from talented writers.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {placeholderStories.map(story => (
          <StoryCard key={story.id} {...story} />
        ))}
      </div>
    </div>
  );
}
