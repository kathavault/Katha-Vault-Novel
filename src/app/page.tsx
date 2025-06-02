import Link from 'next/link';
import { StoryCard } from '@/components/story-card';
import { Button } from '@/components/ui/button';
import { ArrowRight, TrendingUp, BookText, FileText, Heart, Rocket, Grid, Sparkles, PlayCircle, ChevronRight } from 'lucide-react';

interface Story {
  id: string;
  title: string;
  author: string;
  genres: string[];
  snippet: string;
  coverImageUrl?: string;
  aiHint?: string;
  likes?: number;
  views?: number;
  chapters?: number;
}

const trendingStories: Story[] = [
  { id: 'trend-1', title: 'The Whispers of Chronos', author: 'Nora Vincent', genres: ['Sci-Fi', 'Time Travel', 'Adventure'], snippet: 'A historian stumbles upon a device that warps time, leading her on a perilous journey through history\'s darkest secrets.', coverImageUrl: 'https://placehold.co/600x400.png', aiHint: 'time machine', likes: 4200, views: 15300, chapters: 25 },
  { id: 'trend-2', title: 'Beneath the Emerald Canopy', author: 'Liam Evergreen', genres: ['Fantasy', 'Mystery', 'Jungle'], snippet: 'In a lost jungle civilization, a young shaman must uncover the source of a spreading curse before it consumes his people.', coverImageUrl: 'https://placehold.co/600x400.png', aiHint: 'jungle temple', likes: 3800, views: 12100, chapters: 18 },
];

const fullLengthNovels: Story[] = [
  { id: 'novel-1', title: 'The Astral Alchemist', author: 'Seraphina Cole', genres: ['High Fantasy', 'Magic', 'Epic'], snippet: 'A grand tale of warring kingdoms, ancient prophecies, and an alchemist whose powers could reshape the very fabric of reality.', coverImageUrl: 'https://placehold.co/800x500.png', aiHint: 'fantasy alchemy', likes: 12500, views: 88000, chapters: 75 },
];

const shortStories: Story[] = [
  { id: 'short-1', title: 'A Stitch in Time', author: 'Penelope Quinn', genres: ['Sci-Fi', 'Short Story', 'Drama'], snippet: 'A brief encounter with a time-traveling tailor leads to unforeseen consequences for a lonely watchmaker.', coverImageUrl: 'https://placehold.co/600x400.png', aiHint: 'clock gears', likes: 1500, views: 5000, chapters: 1 },
  { id: 'short-2', title: 'The Clockwork Heart', author: 'Orville Tinkerton', genres: ['Steampunk', 'Romance', 'Short'], snippet: 'An inventor creates a mechanical companion, only to find it possesses more heart than he ever imagined.', coverImageUrl: 'https://placehold.co/600x400.png', aiHint: 'steampunk robot', likes: 2200, views: 7800, chapters: 1 },
];

const romanceReads: Story[] = [
  { id: 'rom-1', title: 'Love in the Time of Stardust', author: 'Noelle Skye', genres: ['Romance', 'Sci-Fi', 'Space Opera'], snippet: 'Two star-crossed lovers from rival empires find their destinies intertwined amidst a galactic war.', coverImageUrl: 'https://placehold.co/600x400.png', aiHint: 'space couple', likes: 7500, views: 32000, chapters: 40 },
];

const scifiAdventures: Story[] = [
  { id: 'scifi-1', title: 'Echoes of the Void', author: 'Captain Rex Nebula', genres: ['Space Opera', 'Action', 'Alien'], snippet: 'A rogue captain and his ragtag crew uncover an ancient alien artifact that could spell doom or salvation for the galaxy.', coverImageUrl: 'https://placehold.co/600x400.png', aiHint: 'spaceship battle', likes: 6800, views: 29000, chapters: 33 },
  { id: 'scifi-2', title: 'The Last Cyberpunk', author: 'Neon Ryder', genres: ['Cyberpunk', 'Dystopian', 'Tech'], snippet: 'In a neon-drenched metropolis, a lone hacker fights against a totalitarian AI regime.', coverImageUrl: 'https://placehold.co/600x400.png', aiHint: 'cyberpunk city', likes: 5300, views: 22000, chapters: 28 },
];

const moreStories: Story[] = [
   { id: '1', title: 'The Last Nebula', author: 'Aria Vale', genres: ['Sci-Fi'], snippet: 'In a dying galaxy, a lone explorer seeks the fabled Last Nebula.', coverImageUrl: 'https://placehold.co/600x400.png', aiHint: 'nebula space', likes: 1000, views: 3000, chapters: 12 },
   { id: '2', title: 'Whispers of the Old Wood', author: 'Elara Moonwhisper', genres: ['Fantasy'], snippet: 'An ancient forest guards secrets darker than its deepest shadows.', coverImageUrl: 'https://placehold.co/600x400.png', aiHint: 'enchanted forest', likes: 1200, views: 3500, chapters: 15 },
];


const SectionHeader = ({ title, icon, seeAllLink }: { title: string; icon: React.ReactNode; seeAllLink: string }) => (
  <div className="flex items-center justify-between mb-6">
    <h2 className="text-3xl font-headline text-primary-foreground flex items-center">
      {icon}
      <span className="ml-3">{title}</span>
    </h2>
    <Link href={seeAllLink} className="flex items-center text-sm text-primary hover:text-primary/80 transition-colors font-medium">
      See All <ChevronRight className="h-4 w-4 ml-1" />
    </Link>
  </div>
);

export default function HomePage() {
  const renderSection = (title: string, icon: React.ReactNode, stories: Story[], seeAllLink: string, gridCols: string = "md:grid-cols-2") => (
    <section>
      <SectionHeader title={title} icon={icon} seeAllLink={seeAllLink} />
      {stories.length > 0 ? (
        <div className={`grid grid-cols-1 ${gridCols} gap-6 lg:gap-8`}>
          {stories.map(story => (
            <StoryCard key={story.id} {...story} />
          ))}
        </div>
      ) : (
         <p className="text-muted-foreground">No stories in this section yet.</p>
      )}
    </section>
  );

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-16 md:py-24 bg-card rounded-xl shadow-2xl px-6">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-headline tracking-tight text-primary mb-6">
          Your Next Obsession Awaits
          <span className="block text-primary-foreground opacity-90 mt-1 sm:mt-2">at Katha Vault</span>
        </h1>
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground font-body mb-10">
          Join a global community of readers and writers. Discover original stories across all genres, or share your own. Voice your stories with the world.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Button asChild size="lg" className="px-8 py-3 text-base">
            <Link href="/library">
              <PlayCircle className="mr-2 h-5 w-5" />
              Start Reading
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="px-8 py-3 text-base border-primary text-primary hover:bg-primary/10 hover:text-primary">
            <Link href="/write">
              <Sparkles className="mr-2 h-5 w-5" />
              Get AI Assistance
            </Link>
          </Button>
        </div>
      </section>

      {/* Story Sections */}
      {renderSection("Trending Now", <TrendingUp className="h-7 w-7 text-primary" />, trendingStories, "/trending")}
      {renderSection("Full-Length Novels", <BookText className="h-7 w-7 text-primary" />, fullLengthNovels, "/novels", "md:grid-cols-1 lg:grid-cols-1")}
      {renderSection("Short Stories & Quick Reads", <FileText className="h-7 w-7 text-primary" />, shortStories, "/shorts")}
      {renderSection("Romance Reads", <Heart className="h-7 w-7 text-primary" />, romanceReads, "/romance", "md:grid-cols-1 lg:grid-cols-1")}
      {renderSection("Sci-Fi Adventures", <Rocket className="h-7 w-7 text-primary" />, scifiAdventures, "/scifi")}
      {renderSection("More Stories", <Grid className="h-7 w-7 text-primary" />, moreStories, "/all")}
    </div>
  );
}
