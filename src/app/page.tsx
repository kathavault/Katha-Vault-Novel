
"use client";

import Link from 'next/link';
import { StoryCard } from '@/components/story-card';
import { Button } from '@/components/ui/button';
import { ArrowRight, TrendingUp, BookText, Clock, Heart, Rocket, Grid, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getNovelsFromStorage, type Novel } from '@/lib/mock-data';

const SectionHeader = ({ title, icon, seeAllLink }: { title: string; icon: React.ReactNode; seeAllLink?: string }) => (
  <div className="flex items-center justify-between mb-6">
    <h2 className="text-3xl font-headline font-bold text-primary flex items-center">
      {icon}
      <span className="ml-3">{title}</span>
    </h2>
    {seeAllLink && (
      <Link href={seeAllLink} className="flex items-center text-sm text-primary hover:text-primary/80 transition-colors font-medium">
        See All <ChevronRight className="h-4 w-4 ml-1" />
      </Link>
    )}
  </div>
);

export default function HomePage() {
  const [allNovels, setAllNovels] = useState<Novel[]>([]);

  useEffect(() => {
    setAllNovels(getNovelsFromStorage());
  }, []);

  const trendingNovels = allNovels.filter(novel => novel.isTrending).slice(0, 5);
  const fullLengthNovels = allNovels.filter(novel => (novel.chapters || 0) > 1 && !novel.genres.includes('Short Story')).slice(0, 5);
  const shortStories = allNovels.filter(novel => novel.genres.includes('Short Story')).slice(0, 5);
  const romanceReads = allNovels.filter(novel => novel.genres.map(g => g.toLowerCase()).includes('romance')).slice(0, 5);
  const scifiAdventures = allNovels.filter(novel => novel.genres.map(g => g.toLowerCase()).includes('sci-fi') || novel.genres.map(g => g.toLowerCase()).includes('science fiction') || novel.genres.map(g => g.toLowerCase()).includes('space opera')).slice(0, 5);
  const moreStories = allNovels.filter(novel => 
        !trendingNovels.find(tn => tn.id === novel.id) &&
        !fullLengthNovels.find(fln => fln.id === novel.id) &&
        !shortStories.find(ss => ss.id === novel.id) &&
        !romanceReads.find(rr => rr.id === novel.id) &&
        !scifiAdventures.find(sa => sa.id === novel.id)
    ).slice(0, 10);


  const renderSection = (
    title: string,
    icon: React.ReactNode,
    stories: Novel[],
    seeAllLink?: string, // Make seeAllLink optional
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
            {seeAllLink && stories.length >= 5 && ( // Show "See All" card if there are many items and a link
               <div className="flex-shrink-0 w-[280px] sm:w-[300px] md:w-[320px] flex items-center justify-center">
                <Button asChild variant="outline" className="h-full w-full text-lg">
                  <Link href={seeAllLink} className="flex flex-col items-center justify-center">
                    View More
                    <ArrowRight className="mt-2 h-6 w-6" />
                  </Link>
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className={`grid grid-cols-1 ${stories.length === 1 ? 'md:grid-cols-1 lg:grid-cols-1' : gridCols} gap-6 lg:gap-8`}>
            {stories.map(story => (
              <StoryCard key={story.id} {...story} />
            ))}
          </div>
        )
      ) : (
         <p className="text-muted-foreground">No stories in this section yet. Check back soon or add some in the Admin Panel!</p>
      )}
    </section>
  );

  return (
    <div className="space-y-16">
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

      {renderSection("Trending Now", <TrendingUp className="h-7 w-7 text-primary" />, trendingNovels, "/library?filter=trending", "horizontal")}
      {renderSection("Full-Length Novels", <BookText className="h-7 w-7 text-primary" />, fullLengthNovels, "/library?category=novels", "horizontal")}
      {renderSection("Short Stories & Quick Reads", <Clock className="h-7 w-7 text-primary" />, shortStories, "/library?category=shorts", "horizontal")}
      {renderSection("Romance Reads", <Heart className="h-7 w-7 text-primary" />, romanceReads, "/library?category=romance", "horizontal")}
      {renderSection("Sci-Fi Adventures", <Rocket className="h-7 w-7 text-primary" />, scifiAdventures, "/library?category=scifi", "horizontal")}
      {renderSection("More Stories to Explore", <Grid className="h-7 w-7 text-primary" />, moreStories, "/library", "horizontal")}
    </div>
  );
}
