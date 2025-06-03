
"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { StoryCard } from '@/components/story-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bookmark, Search, FilterX, ListFilter, Users, ExternalLink } from 'lucide-react';
import { allMockUsers, type MockUser, getNovelsFromStorage, type Novel } from '@/lib/mock-data'; 
import { useToast } from "@/hooks/use-toast";

const ALL_AVAILABLE_GENRES_FOR_FILTER = ["Sci-Fi", "Adventure", "Mystery", "Thriller", "Fantasy", "Epic", "Cyberpunk", "Romance", "Historical", "Horror", "Cosmic Horror", "Contemporary", "Time Travel", "Steampunk", "Short Story", "Urban Fantasy", "Magic", "Space Opera", "Existential", "Dystopia", "Action", "General", "Reading", "Book"];

export default function LibraryPage() {
  const { toast } = useToast();
  const [allLibraryNovels, setAllLibraryNovels] = useState<Novel[]>([]);
  const [storySearchTerm, setStorySearchTerm] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [filteredStories, setFilteredStories] = useState<Novel[]>([]);

  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<MockUser[]>([]);

  useEffect(() => {
    const novels = getNovelsFromStorage();
    setAllLibraryNovels(novels);
    setFilteredStories(novels); // Initialize filtered stories with all novels
  }, []);

  useEffect(() => {
    let stories = allLibraryNovels;

    if (storySearchTerm.trim() !== "") {
      stories = stories.filter(story =>
        story.title.toLowerCase().includes(storySearchTerm.toLowerCase()) ||
        story.author.toLowerCase().includes(storySearchTerm.toLowerCase())
      );
    }

    if (selectedGenres.length > 0) {
      stories = stories.filter(story =>
        selectedGenres.every(selGenre => story.genres.includes(selGenre))
      );
    }
    setFilteredStories(stories);
  }, [storySearchTerm, selectedGenres, allLibraryNovels]);

  useEffect(() => {
    if (userSearchTerm.trim() === "") {
      setFilteredUsers([]);
      return;
    }
    const lowercasedTerm = userSearchTerm.toLowerCase();
    const found = allMockUsers.filter(user =>
      user.name.toLowerCase().includes(lowercasedTerm) ||
      user.username.toLowerCase().includes(lowercasedTerm)
    );
    setFilteredUsers(found);
  }, [userSearchTerm]);

  const handleGenreToggle = (genreToToggle: string) => {
    setSelectedGenres(prevSelectedGenres =>
      prevSelectedGenres.includes(genreToToggle)
        ? prevSelectedGenres.filter(g => g !== genreToToggle)
        : [...prevSelectedGenres, genreToToggle]
    );
  };

  const clearAllStoryFilters = () => {
    setSelectedGenres([]);
    setStorySearchTerm("");
  };
  
  const uniqueAvailableGenres = useMemo(() => {
    const genresFromStories = new Set<string>();
    allLibraryNovels.forEach(story => story.genres.forEach(genre => genresFromStories.add(genre)));
    // Combine predefined genres with those from actual stories to ensure all are filterable
    return Array.from(new Set([...ALL_AVAILABLE_GENRES_FOR_FILTER, ...Array.from(genresFromStories)])).sort();
  }, [allLibraryNovels]);


  return (
    <div className="space-y-8">
      <header className="text-center space-y-2">
        <Bookmark className="mx-auto h-16 w-16 text-primary" />
        <h1 className="text-5xl font-headline tracking-tight text-primary">My Personal Library</h1>
        <p className="text-xl text-foreground font-body font-semibold">
          Discover stories, find your favorites, and connect.
        </p>
      </header>

      <Card className="shadow-lg border-border">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-primary flex items-center">
            <Search className="mr-3 h-6 w-6" /> Find Your Next Read
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search stories by title or author..."
              value={storySearchTerm}
              onChange={(e) => setStorySearchTerm(e.target.value)}
              className="pl-10 text-base"
            />
          </div>
          <div>
            <div className="flex items-center mb-3">
              <ListFilter className="h-5 w-5 text-primary mr-2" />
              <h3 className="text-lg font-semibold text-foreground">Filter by Genre</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {uniqueAvailableGenres.map(genre => (
                <Button
                  key={genre}
                  variant={selectedGenres.includes(genre) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleGenreToggle(genre)}
                  className="font-body transition-all duration-150 ease-in-out"
                >
                  {genre}
                </Button>
              ))}
            </div>
          </div>
          {(selectedGenres.length > 0 || storySearchTerm) && (
            <Button variant="ghost" onClick={clearAllStoryFilters} className="text-primary hover:text-primary/80 mt-3 p-0 h-auto text-sm">
              <FilterX className="mr-2 h-4 w-4" /> Clear Story Filters & Search
            </Button>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-lg border-border">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-primary flex items-center">
            <Users className="mr-3 h-6 w-6" /> Find Friends & Authors
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search users by name or username..."
              value={userSearchTerm}
              onChange={(e) => setUserSearchTerm(e.target.value)}
              className="pl-10 text-base"
            />
          </div>
          {userSearchTerm && filteredUsers.length > 0 && (
            <ScrollArea className="h-60 w-full rounded-md border p-2">
              <div className="space-y-2">
                {filteredUsers.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md">
                    <Link href={`/profile/${user.id}`} className="flex items-center space-x-3 flex-grow">
                      <Avatar>
                        <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint={user.dataAiHint || "person avatar"} />
                        <AvatarFallback>{user.avatarFallback}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{user.name}</p>
                        <p className="text-xs text-muted-foreground">@{user.username}</p>
                      </div>
                    </Link>
                    <Button variant="outline" size="sm" asChild>
                       <Link href={`/profile/${user.id}`}>
                          <ExternalLink className="mr-2 h-3.5 w-3.5" /> View Profile
                       </Link>
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
           {userSearchTerm && filteredUsers.length === 0 && (
             <p className="text-sm text-muted-foreground text-center py-4">No users found matching "{userSearchTerm}".</p>
           )}
           {!userSearchTerm && (
             <p className="text-sm text-muted-foreground text-center py-4">Type above to search for users.</p>
           )}
        </CardContent>
      </Card>

      <h2 className="text-3xl font-headline text-primary mt-12 mb-6">Library Books</h2>
      {filteredStories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {filteredStories.map(story => (
            <StoryCard key={story.id} {...story} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground font-body">
            No stories match your criteria. Try adjusting your search or filters, or add more novels in the Admin Panel.
          </p>
        </div>
      )}
    </div>
  );
}
