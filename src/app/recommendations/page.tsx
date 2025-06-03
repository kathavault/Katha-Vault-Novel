
import { StoryCard } from '@/components/story-card';
import { Lightbulb } from 'lucide-react'; // Using Lightbulb for recommendations

const recommendedStories = [
  { id: '7', title: 'Galaxy\'s Edge Drifter', author: 'Jax Orion', genres: ['Sci-Fi'], snippet: 'A lone mercenary takes on a dangerous job on a remote outpost, only to find something far more sinister.', coverImageUrl: 'https://placehold.co/480x680.png', aiHint: 'space station' },
  { id: '8', title: 'The Serpent Charmer\'s Apprentice', author: 'Zara Khan', genres: ['Fantasy'], snippet: 'In a desert kingdom, a young apprentice discovers she has a rare gift that could save her people or destroy them.', coverImageUrl: 'https://placehold.co/480x680.png', aiHint: 'desert fantasy' },
  { id: '9', title: 'Automated Hearts', author: 'Ada Lovelace II', genres: ['Steampunk Romance'], snippet: 'Can a sophisticated automaton and a skeptical engineer find love amidst political intrigue in a clockwork society?', coverImageUrl: 'https://placehold.co/480x680.png', aiHint: 'steampunk robot' },
];

export default function RecommendationsPage() {
  return (
    <div className="space-y-8">
      <header className="text-center space-y-2">
        <Lightbulb className="mx-auto h-16 w-16 text-primary" />
        <h1 className="text-5xl font-headline tracking-tight text-primary">Personalized Recommendations</h1>
        <p className="text-xl text-foreground font-body font-semibold">
          Discover stories selected just for you, based on your reading tastes.
        </p>
      </header>

      {recommendedStories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {recommendedStories.map(story => (
            <StoryCard key={story.id} {...story} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground font-body">
            Start reading to get personalized recommendations!
          </p>
        </div>
      )}
    </div>
  );
}
