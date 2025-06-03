
"use client";

import Link from 'next/link';
import { StoryCard } from '@/components/story-card';
import { Button } from '@/components/ui/button';
import { ArrowRight, TrendingUp, Grid, ChevronRight, Sparkles } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { getNovelsFromStorage, getHomeSectionsConfig, type Novel, type HomeLayoutConfig } from '@/lib/mock-data';

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
  const [homeConfig, setHomeConfig] = useState<HomeLayoutConfig>({ selectedGenres: [], showMoreNovelsSection: true });

  useEffect(() => {
    setAllNovels(getNovelsFromStorage());
    setHomeConfig(getHomeSectionsConfig());
  }, []);

  const publishedNovels = useMemo(() => allNovels.filter(novel => novel.status === 'published'), [allNovels]);

  const trendingNovels = useMemo(() => publishedNovels.filter(novel => novel.isTrending).slice(0, 5), [publishedNovels]);

  const renderSection = (
    title: string,
    icon: React.ReactNode,
    stories: Novel[],
    seeAllLink?: string,
    layout: "grid" | "horizontal" = "horizontal",
    gridCols: string = "md:grid-cols-2 lg:grid-cols-3"
  ) => (
    <section className="mb-12"> {/* Added margin-bottom for spacing between sections */}
      <SectionHeader title={title} icon={icon} seeAllLink={seeAllLink} />
      {stories.length > 0 ? (
        layout === "horizontal" ? (
          <div className="flex overflow-x-auto space-x-4 lg:space-x-6 pb-4 -mx-4 px-4">
            {stories.map(story => (
              <div key={story.id} className="flex-shrink-0 w-[280px] sm:w-[300px] md:w-[320px]">
                <StoryCard {...story} />
              </div>
            ))}
            {seeAllLink && stories.length >= 5 && (
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
         <p className="text-muted-foreground">No stories in this section yet. Check back soon or add some published novels in the Admin Panel!</p>
      )}
    </section>
  );

  const displayedNovelIds = new Set<string>();
  trendingNovels.forEach(n => displayedNovelIds.add(n.id));

  const genreSections = homeConfig.selectedGenres.map(genre => {
    const storiesForGenre = publishedNovels.filter(
      novel => novel.genres.includes(genre) && !displayedNovelIds.has(novel.id)
    ).slice(0, 5);
    storiesForGenre.forEach(n => displayedNovelIds.add(n.id));
    return {
      title: `${genre} Stories`,
      icon: <Sparkles className="h-7 w-7 text-primary" />,
      stories: storiesForGenre,
      seeAllLink: `/library?genre=${encodeURIComponent(genre)}`
    };
  });

  const moreStories = publishedNovels.filter(novel => !displayedNovelIds.has(novel.id)).slice(0, 10);


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

      {/* 1. Trending Section (Always at the top) */}
      {renderSection("Trending Now", <TrendingUp className="h-7 w-7 text-primary" />, trendingNovels, "/library?filter=trending", "horizontal")}
      
      {/* 2. Admin-configured Genre Sections */}
      {genreSections.map(section => 
        section.stories.length > 0 && renderSection(section.title, section.icon, section.stories, section.seeAllLink, "horizontal")
      )}
      
      {/* 3. "More Stories to Explore" Section (If enabled and at the bottom) */}
      {homeConfig.showMoreNovelsSection && moreStories.length > 0 && renderSection("More Stories to Explore", <Grid className="h-7 w-7 text-primary" />, moreStories, "/library", "horizontal")}
    </div>
  );
}

