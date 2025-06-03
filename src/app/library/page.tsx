
"use client";

import { useState, useEffect, useMemo } from 'react';
import { StoryCard } from '@/components/story-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Added Card components
import { Bookmark, Search, FilterX, ListFilter } from 'lucide-react';

// Expanded placeholder data
const initialLibraryStories = [
  { id: '1', title: 'The Last Nebula', author: 'Aria Vale', genres: ['Sci-Fi', 'Adventure'], snippet: 'In a dying galaxy, a lone explorer seeks the fabled Last Nebula, said to hold the key to cosmic rebirth.', coverImageUrl: 'https://placehold.co/600x400.png', aiHint: 'nebula space', views: 15000, chapters: 30, rating: 4.5 },
  { id: '4', title: 'Echoes in the Silence', author: 'Lena Petrova', genres: ['Mystery', 'Thriller'], snippet: 'A detective haunted by her past must solve a murder in a remote, snowbound village where everyone has a secret.', coverImageUrl: 'https://placehold.co/600x400.png', aiHint: 'snowy village', views: 9000, chapters: 22, rating: 4.2  },
  { id: '10', title: 'Chronicles of Eldoria', author: 'Marcus Stone', genres: ['Fantasy', 'Epic'], snippet: 'A young warrior discovers his destiny in a land of dragons and ancient magic.', coverImageUrl: 'https://placehold.co/600x400.png', aiHint: 'fantasy warrior dragon', views: 22000, chapters: 50, rating: 4.8 },
  { id: '11', title: 'Cybernetic Serenade', author: 'Jax Orion', genres: ['Sci-Fi', 'Cyberpunk', 'Romance'], snippet: 'In a neon-lit city, a hacker falls for an AI, blurring the lines between human and machine.', coverImageUrl: 'https://placehold.co/600x400.png', aiHint: 'cyberpunk city romance', views: 12000, chapters: 18, rating: 4.0  },
  { id: '12', title: 'The Crimson Rose', author: 'Isabella Dubois', genres: ['Historical', 'Romance'], snippet: 'A tale of forbidden love and courtly intrigue in 18th century France.', coverImageUrl: 'https://placehold.co/600x400.png', aiHint: 'historical romance france', views: 18000, chapters: 25, rating: 4.6  },
  { id: '13', title: 'Whispers from the Deep', author: 'H.P. Lovecraft Jr.', genres: ['Horror', 'Cosmic Horror'], snippet: 'An ancient entity awakens, and madness follows those who hear its call.', coverImageUrl: 'https://placehold.co/600x400.png', aiHint: 'cosmic horror tentacle', views: 7500, chapters: 12, rating: 3.9  },
];

const ALL_GENRES = ["Sci-Fi", "Adventure", "Mystery", "Thriller", "Fantasy", "Epic", "Cyberpunk", "Romance", "Historical", "Horror", "Cosmic Horror", "Contemporary"];

export default function LibraryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [filteredStories, setFilteredStories] = useState(initialLibraryStories);

  useEffect(() => {
    let stories = initialLibraryStories;

    // Filter by search term (title or author)
    if (searchTerm.trim() !== "") {
      stories = stories.filter(story =>
        story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        story.author.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by selected genres
    if (selectedGenres.length > 0) {
      stories = stories.filter(story =>
        story.genres.some(genre => selectedGenres.includes(genre))
      );
    }

    setFilteredStories(stories);
  }, [searchTerm, selectedGenres]);

  const handleGenreToggle = (genreToToggle: string) => {
    setSelectedGenres(prevSelectedGenres =>
      prevSelectedGenres.includes(genreToToggle)
        ? prevSelectedGenres.filter(g => g !== genreToToggle)
        : [...prevSelectedGenres, genreToToggle]
    );
  };

  const clearAllFilters = () => {
    setSelectedGenres([]);
    setSearchTerm("");
  };
  
  const uniqueAvailableGenres = useMemo(() => {
    const genresFromStories = new Set<string>();
    initialLibraryStories.forEach(story => story.genres.forEach(genre => genresFromStories.add(genre)));
    return Array.from(new Set([...ALL_GENRES, ...Array.from(genresFromStories)])).sort();
  }, []);


  return (
    <div className="space-y-8">
      <header className="text-center space-y-2">
        <Bookmark className="mx-auto h-16 w-16 text-primary" />
        <h1 className="text-5xl font-headline tracking-tight text-primary">My Personal Library</h1>
        <p className="text-xl text-foreground font-body font-semibold">
          Discover stories or find your saved favorites.
        </p>
      </header>

      {/* Search and Filter Section */}
      <Card className="shadow-lg border-border">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-primary flex items-center">
            <Search className="mr-3 h-6 w-6" /> Find Your Next Read
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-2"> {/* Adjusted pt for CardContent */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search stories by title or author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
          
          {(selectedGenres.length > 0 || searchTerm) && (
            <Button variant="ghost" onClick={clearAllFilters} className="text-primary hover:text-primary/80 mt-3 p-0 h-auto text-sm">
              <FilterX className="mr-2 h-4 w-4" /> Clear All Filters & Search
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Stories Grid */}
      {filteredStories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {filteredStories.map(story => (
            <StoryCard key={story.id} {...story} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground font-body">
            No stories match your criteria. Try adjusting your search or filters.
          </p>
        </div>
      )}
    </div>
  );
}
