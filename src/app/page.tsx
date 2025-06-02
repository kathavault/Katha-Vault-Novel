
import Link from 'next/link';
import { StoryCard } from '@/components/story-card';
import { Button } from '@/components/ui/button';
import { ArrowRight, TrendingUp, BookText, FileText, Heart, Rocket, Grid, Sparkles, PlayCircle, ChevronRight, Clock } from 'lucide-react';

interface Story {
  id: string;
  title: string;
  author: string;
  genres: string[];
  snippet: string;
  coverImageUrl?: string;
  aiHint?: string;
  views?: number;
  chapters?: number;
  rating?: number;
  isTrending?: boolean;
}

const trendingStories: Story[] = [
  {
    id: 'trend-1',
    title: 'The Whispers of Chronos',
    author: 'Eleanor Vance',
    genres: ['time travel', 'science fiction'],
    snippet: "A time-traveling journey through the eras in search of a missing chronomancer.",
    coverImageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'time machine',
    views: 26000,
    chapters: 25,
    rating: 4.8,
    isTrending: true,
  },
  {
    id: 'trend-2',
    title: 'Beneath the Emerald Canopy',
    author: 'Marcus Stone',
    genres: ['fantasy', 'exploration', 'magic'],
    snippet: 'Fantasy exploration into ancient rainforest magic.',
    coverImageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'jungle temple',
    views: 18000,
    chapters: 20,
    rating: 4.6,
    isTrending: true,
  },
];

const fullLengthNovels: Story[] = [
  {
    id: 'novel-1',
    title: 'The Alchemist of Moonhaven',
    author: 'Seraphina Gold',
    genres: ['steampunk', 'mystery', 'alchemy'],
    snippet: 'In a city powered by moonlight, a young alchemist seeks to break tradition.',
    coverImageUrl: 'https://placehold.co/800x500.png',
    aiHint: 'steampunk city moon',
    views: 12000,
    chapters: 50,
    rating: 4.2
  },
];

const shortStories: Story[] = [
  {
    id: 'short-1',
    title: 'A Stitch in Time',
    author: 'Penelope Weave',
    genres: ['short story', 'urban fantasy', 'magic'],
    snippet: 'A short story about a magical tailor who can alter time.',
    coverImageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'magic tailor',
    views: 9600,
    chapters: 1,
    rating: 4.3
  },
  {
    id: 'short-2',
    title: 'The Clockwork Heart',
    author: 'Cogsworth Throttleton',
    genres: ['short story', 'steampunk', 'romance'],
    snippet: 'A short tale of love and machinery in a steampunk universe.',
    coverImageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'steampunk heart',
    views: 15000,
    chapters: 1,
    rating: 4.7
  },
];

const romanceReads: Story[] = [
  {
    id: 'rom-1',
    title: 'Love in the Time of Stardust',
    author: 'Stella Astra',
    genres: ['romance', 'space opera', 'adventure'],
    snippet: 'Two starlit souls find their way toward each other across galaxies, their romance defying all odds.',
    coverImageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'galaxy couple romance',
    views: 28000,
    chapters: 30,
    rating: 4.9
  },
];

const scifiAdventures: Story[] = [
  {
    id: 'scifi-1',
    title: 'Echoes of the Void',
    author: 'Orion Nebula',
    genres: ['space opera', 'horror', 'existential'],
    snippet: 'A lone astronaut contemplates an ancient species, adrift at the edge of known space.',
    coverImageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'astronaut void space',
    views: 36000,
    chapters: 22,
    rating: 4.9
  },
  {
    id: 'scifi-2',
    title: 'The Last Cyberpunk',
    author: 'Nova Byte',
    genres: ['cyberpunk', 'dystopia', 'action'],
    snippet: 'In a ruined electric city, one last hacker fights for freedom.',
    coverImageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'cyberpunk hacker city',
    views: 22000,
    chapters: 18,
    rating: 4.6
  },
];

const moreStories: Story[] = [
   {
     id: 'more-1',
     title: 'General Thoughts on Reading',
     author: 'Marcus Stone',
     genres: ['general', 'reading', 'book'],
     snippet: 'A general story on the general complexity of books, the reader’s state of mind, and what defines a book.',
     coverImageUrl: 'https://placehold.co/600x400.png',
     aiHint: 'book thought',
     views: 10000,
     chapters: 5,
     rating: 4.0
    },
];


const SectionHeader = ({ title, icon, seeAllLink }: { title: string; icon: React.ReactNode; seeAllLink: string }) => (
  <div className="flex items-center justify-between mb-6">
    <h2 className="text-3xl font-headline font-bold text-primary flex items-center">
      {icon}
      <span className="ml-3">{title}</span>
    </h2>
    <Link href={seeAllLink} className="flex items-center text-sm text-primary hover:text-primary/80 transition-colors font-medium">
      See All <ChevronRight className="h-4 w-4 ml-1" />
    </Link>
  </div>
);

export default function HomePage() {
  const renderSection = (
    title: string,
    icon: React.ReactNode,
    stories: Story[],
    seeAllLink: string,
    layout: "grid" | "horizontal" = "grid",
    gridCols: string = "md:grid-cols-2"
  ) => (
    <section>
      <SectionHeader title={title} icon={icon} seeAllLink={seeAllLink} />
      {stories.length > 0 ? (
        layout === "horizontal" ? (
          <div className="flex overflow-x-auto space-x-4 lg:space-x-6 pb-4 -mx-4 px-4">
            {stories.map(story => (
              <div key={story.id} className="flex-shrink-0 w-[280px] sm:w-[300px] md:w-[320px]">
                <StoryCard {...story} />
              </div>
            ))}
          </div>
        ) : (
          <div className={`grid grid-cols-1 ${stories.length === 1 ? 'md:grid-cols-1 lg:grid-cols-1' : gridCols} gap-6 lg:gap-8`}>
            {stories.map(story => (
              <StoryCard key={story.id} {...story} />
            ))}
          </div>
        )
      ) : (
         <p className="text-muted-foreground">No stories in this section yet.</p>
      )}
    </section>
  );

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-16 md:py-24 px-6">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-headline tracking-tight font-bold text-primary mb-6">
          Your Next Obsession Awaits at Katha Vault
        </h1>
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-foreground font-body font-semibold mb-10">
          Join a global community of readers and writers. Discover original stories across all genres, or share your own voice with the world.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Button asChild size="lg" className="px-8 py-3 text-base">
            <Link href="/library">
              Start Reading
            </Link>
          </Button>
        </div>
      </section>

      {/* Story Sections */}
      {renderSection("Trending Now", <TrendingUp className="h-7 w-7 text-primary" />, trendingStories, "/trending", "horizontal")}
      {renderSection("Full-Length Novels", <BookText className="h-7 w-7 text-primary" />, fullLengthNovels, "/novels", "horizontal")}
      {renderSection("Short Stories & Quick Reads", <Clock className="h-7 w-7 text-primary" />, shortStories, "/shorts", "horizontal")}
      {renderSection("Romance Reads", <Heart className="h-7 w-7 text-primary" />, romanceReads, "/romance", "horizontal")}
      {renderSection("Sci-Fi Adventures", <Rocket className="h-7 w-7 text-primary" />, scifiAdventures, "/scifi", "horizontal")}
      {renderSection("More Stories", <Grid className="h-7 w-7 text-primary" />, moreStories, "/all", "horizontal")}
    </div>
  );
}
