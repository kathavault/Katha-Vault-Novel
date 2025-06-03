
"use client";

import Link from 'next/link';
import { StoryCard } from '@/components/story-card';
import { Button } from '@/components/ui/button';
import { ArrowRight, TrendingUp, Grid, ChevronRight, Sparkles, Loader2 } from 'lucide-react';
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = () => {
      setAllNovels(getNovelsFromStorage());
      setHomeConfig(getHomeSectionsConfig());
      setIsLoading(false);
    };
    loadData();
  }, []);

  const publishedNovels = useMemo(() => {
    if (isLoading) return [];
    return allNovels.filter(novel => novel.status === 'published');
  }, [allNovels, isLoading]);
  
  const displayedNovelIdsInSections = useMemo(() => new Set<string>(), []);

  // Recalculate displayedNovelIds whenever relevant data changes
  useEffect(() => {
    displayedNovelIdsInSections.clear();
    if (!isLoading) {
      // Populate with trending novels first
      publishedNovels
        .filter(novel => novel.isTrending)
        .sort((a,b) => (b.views || 0) - (a.views || 0))
        .slice(0, 5)
        .forEach(novel => displayedNovelIdsInSections.add(novel.id));

      // Then populate with admin-configured genre sections
      if (homeConfig.selectedGenres) {
        homeConfig.selectedGenres.forEach(genre => {
          publishedNovels
            .filter(novel => novel.homePageFeaturedGenre === genre && !displayedNovelIdsInSections.has(novel.id))
            .slice(0, 5) // Limit per section
            .forEach(novel => displayedNovelIdsInSections.add(novel.id));
        });
      }
    }
  }, [isLoading, publishedNovels, homeConfig.selectedGenres, displayedNovelIdsInSections]);


  const trendingNovels = useMemo(() => {
    if (isLoading) return [];
    // No need to add to displayedNovelIdsInSections here, as it's done in the useEffect
    return publishedNovels
      .filter(novel => novel.isTrending)
      .sort((a,b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5);
  }, [publishedNovels, isLoading]);


  const genreSections = useMemo(() => {
    if (isLoading || !homeConfig.selectedGenres) return [];
    
    const sections = homeConfig.selectedGenres.map(genre => {
      const storiesForGenre = publishedNovels.filter(
        // Ensure we only pick stories specifically assigned to this genre for home page
        // AND not already shown in trending (handled by displayedNovelIdsInSections from useEffect)
        novel => novel.homePageFeaturedGenre === genre && !displayedNovelIdsInSections.has(novel.id) 
      ).slice(0, 5); // Limit to 5 stories per genre section AFTER trending is considered
      
      // Add these to displayedNovelIds to prevent them from appearing in "More Stories"
      // This was previously done inside, but better to do it after filtering based on the effect
      // For clarity, this is now handled by the primary useEffect for displayedNovelIdsInSections
      
      return {
        title: `${genre} Stories`,
        icon: <Sparkles className="h-7 w-7 text-primary" />,
        stories: storiesForGenre,
        seeAllLink: `/library?genre=${encodeURIComponent(genre)}` 
      };
    });
    return sections.filter(section => section.stories.length > 0);
  }, [isLoading, homeConfig.selectedGenres, publishedNovels, displayedNovelIdsInSections]);


  const moreStories = useMemo(() => {
    if (isLoading || !homeConfig.showMoreNovelsSection) return [];
    // Stories not in trending AND not in any specifically configured genre section
    return publishedNovels.filter(novel => !displayedNovelIdsInSections.has(novel.id)).slice(0, 10);
  }, [isLoading, homeConfig.showMoreNovelsSection, publishedNovels, displayedNovelIdsInSections]);


  const renderSection = (
    title: string,
    icon: React.ReactNode,
    stories: Novel[],
    seeAllLink?: string,
    layout: "grid" | "horizontal" = "horizontal",
    gridCols: string = "md:grid-cols-2 lg:grid-cols-3"
  ) => (
    <section className="mb-12"> 
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

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><Loader2 className="h-12 w-12 animate-spin text-primary"/> Loading home page...</div>;
  }

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

      {trendingNovels.length > 0 && renderSection("Trending Now", <TrendingUp className="h-7 w-7 text-primary" />, trendingNovels, "/library?filter=trending", "horizontal")}
      
      {genreSections.map(section => 
         renderSection(section.title, section.icon, section.stories, section.seeAllLink, "horizontal")
      )}
      
      {homeConfig.showMoreNovelsSection && moreStories.length > 0 && renderSection("More Stories to Explore", <Grid className="h-7 w-7 text-primary" />, moreStories, "/library", "horizontal")}
    
      {!trendingNovels.length && genreSections.length === 0 && !(homeConfig.showMoreNovelsSection && moreStories.length > 0) && (
         <div className="text-center py-12">
            <p className="text-lg text-muted-foreground font-body">
                The home page is looking a bit empty! Add some published novels and configure sections in the Admin Panel.
            </p>
         </div>
      )}
    </div>
  );
}
